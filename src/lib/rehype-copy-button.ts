import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

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

function extractLanguage(pre: Element): string | null {
	const code = pre.children.find(
		(c): c is Element => c.type === "element" && c.tagName === "code",
	);
	if (!code) return null;
	const cls = code.properties?.className;
	if (!Array.isArray(cls)) return null;
	for (const c of cls) {
		if (typeof c !== "string") continue;
		if (!c.startsWith("language-")) continue;
		const lang = c.slice("language-".length).toLowerCase();
		if (!lang || lang === "text" || lang === "plain" || lang === "plaintext") {
			return null;
		}
		return lang;
	}
	return null;
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

			const lang = extractLanguage(node);

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

			const figureChildren: Element[] = [];
			if (lang) {
				figureChildren.push({
					type: "element",
					tagName: "figcaption",
					properties: {
						className: ["code-block-title"],
						"data-lang": lang,
					},
					children: [{ type: "text", value: lang }],
				});
			}
			figureChildren.push(body);

			const wrapper: Element = {
				type: "element",
				tagName: "figure",
				properties: {
					className: ["code-block"],
					"data-code-block": true,
					...(lang ? { "data-lang": lang } : {}),
				},
				children: figureChildren,
			};
			parent.children[idx] = wrapper;
			return ["skip", idx + 1];
		});
	};
}
