import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Wraps every <pre> in a <div class="code-block"> and appends a sibling
 * <button data-copy-button> so the copy affordance is part of the SSR HTML.
 * The actual click handler is wired up by ArticleBody via event delegation.
 */
export function rehypeCopyButton() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, idx, parent) => {
			if (node.tagName !== "pre" || !parent || idx == null) return;
			if (parent.type === "element" && parent.tagName === "div") {
				const cls = parent.properties?.className;
				if (Array.isArray(cls) && cls.includes("code-block")) return;
			}
			const wrapper: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: ["code-block"],
					"data-code-block": true,
				},
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
			parent.children[idx] = wrapper;
			return ["skip", idx + 1];
		});
	};
}
