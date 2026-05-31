import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import rehypeRaw from "rehype-raw";
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

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
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
