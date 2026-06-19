import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { unified } from "unified";
import { rehypeCopyButton } from "./rehype-copy-button";

/**
 * Async Markdown → HTML processor. Runs at module init (Vite SSR start /
 * build) inside Cloudflare's workerd, which blocks WebAssembly — so we
 * force Shiki onto its pure-JS regex engine instead of Oniguruma.
 *
 * Pipeline: parse MD → GFM → MDAST → HAST (allow raw HTML for legacy
 * GitHub posts) → rehype-raw to lift the HTML into the tree → Shiki
 * tokenization (min-light / min-dark with CSS var emission) → stringify.
 */
const highlighter = await createHighlighter({
	themes: ["min-light", "min-dark"],
	langs: [
		"ts",
		"tsx",
		"js",
		"jsx",
		"bash",
		"json",
		"yaml",
		"md",
		"html",
		"css",
		"go",
		"dart",
		"python",
		"diff",
		"sql",
		"text",
	],
	engine: createJavaScriptRegexEngine(),
});

/**
 * Sanitizer schema (GitHub's default + the one concession the pipeline
 * needs): keep `class="language-xx"` on <code> so rehypeCopyButton and
 * Shiki — both of which run AFTER this step — can still read the fence
 * language. Everything Shiki/rehypeCopyButton inject (inline styles,
 * data-* attrs, spans) is added downstream of the sanitizer, so it is
 * trusted pipeline output and never passes through the untrusted gate.
 */
const sanitizeSchema: typeof defaultSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		code: [
			...(defaultSchema.attributes?.code ?? []),
			["className", /^language-./],
		],
	},
};

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	/* Trust boundary: raw HTML from external sources (Medium RSS daily
	   sync, legacy GitHub posts) has just been lifted into the tree by
	   rehypeRaw. Sanitize it HERE — before any trusted transform runs —
	   so strings reaching dangerouslySetInnerHTML carry no script,
	   event handlers, or javascript: URLs. */
	.use(rehypeSanitize, sanitizeSchema)
	/* rehypeCopyButton MUST run before shiki — it reads the language
	   from <code class="language-xx">, which shiki strips during
	   tokenization. */
	.use(rehypeCopyButton)
	.use(rehypeShikiFromHighlighter, highlighter, {
		themes: {
			light: "min-light",
			dark: "min-dark",
		},
		defaultColor: false,
		fallbackLanguage: "text",
	})
	.use(rehypeStringify, { allowDangerousHtml: true });

export async function markdownToHtml(markdown: string): Promise<string> {
	const file = await processor.process(markdown);
	return String(file);
}
