import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { langIcon } from "./lang-icons";

/**
 * Wraps every <pre> in a <figure class="code-block">. When the inner <code>
 * carries a `language-xx` className, a <figcaption class="code-block-title">
 * is prepended OUTSIDE the script window (above the <pre>). A copy <button>
 * is appended inside a positioned `.code-block-body` wrapper so it can sit
 * absolutely over the <pre> without colliding with the title strip.
 *
 * MUST run BEFORE the shiki rehype plugin — shiki strips `language-xx`
 * during tokenization.
 *
 * The click handler lives in ArticleBody (event delegation).
 */

/**
 * Resolve the fence language from <code class="language-xx">. Defaults to
 * "text" when the class is absent, empty, or already a plain-text alias — so
 * every code block carries a concrete language (and thus a title + icon).
 */
function resolveLanguage(pre: Element): string {
	const code = pre.children.find(
		(c): c is Element => c.type === "element" && c.tagName === "code",
	);
	const cls = code?.properties?.className;
	if (Array.isArray(cls)) {
		for (const c of cls) {
			if (typeof c !== "string" || !c.startsWith("language-")) continue;
			const lang = c.slice("language-".length).toLowerCase();
			if (lang && lang !== "plain" && lang !== "plaintext") return lang;
			break;
		}
	}
	return "text";
}

export function rehypeCopyButton() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, idx, parent) => {
			if (node.tagName !== "pre" || !parent || idx == null) return;
			/* Skip already-wrapped pres so we never double-wrap on a re-run. */
			if (parent.type === "element" && parent.tagName === "div") {
				const cls = parent.properties?.className;
				if (
					Array.isArray(cls) &&
					(cls.includes("code-block-body") || cls.includes("code-block"))
				) {
					return;
				}
			}

			const lang = resolveLanguage(node);

			const body: Element = {
				type: "element",
				tagName: "div",
				properties: { className: ["code-block-body"] },
				children: [
					node,
					{
						type: "element",
						tagName: "button",
						properties: {
							type: "button",
							className: ["copy-code"],
							"data-copy-button": true,
							"aria-label": "Copy code",
						},
						children: [{ type: "text", value: "Copy" }],
					},
				],
			};

			const title: Element = {
				type: "element",
				tagName: "figcaption",
				properties: {
					className: ["code-block-title"],
					"data-lang": lang,
				},
				children: [
					langIcon(lang),
					{
						type: "element",
						tagName: "span",
						properties: { className: ["code-block-lang"] },
						children: [{ type: "text", value: lang }],
					},
				],
			};

			const wrapper: Element = {
				type: "element",
				tagName: "figure",
				properties: {
					className: ["code-block"],
					"data-code-block": true,
					"data-lang": lang,
				},
				children: [title, body],
			};
			parent.children[idx] = wrapper;
			return ["skip", idx + 1];
		});
	};
}
