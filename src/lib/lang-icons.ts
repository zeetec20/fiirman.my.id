import type { Element } from "hast";

/**
 * Build-time line icons for code-block language badges. Pure hast (no React),
 * injected by `rehypeCopyButton` into the <figcaption> at SSR. Every glyph is
 * a Lucide line icon (MIT) on a 0 0 24 24 viewBox, `stroke="currentColor"`,
 * so it inherits the muted ink of `.code-block-title` and reads as part of the
 * typeset page — no brand fills, matching design.md.
 *
 * Languages share a generic glyph by category (the lowercase label beside the
 * icon disambiguates); anything unmapped falls back to file-text.
 */

type Child = [tag: string, attrs: Record<string, string>];

/** Lucide icon path-sets, keyed by glyph name. */
const GLYPHS: Record<string, Child[]> = {
	// file-text — prose / plain text / fallback
	"file-text": [
		["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
		["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
		["path", { d: "M10 9H8" }],
		["path", { d: "M16 13H8" }],
		["path", { d: "M16 17H8" }],
	],
	// file-code — programming languages
	"file-code": [
		["path", { d: "M10 12.5 8 15l2 2.5" }],
		["path", { d: "m14 12.5 2 2.5-2 2.5" }],
		["path", { d: "M15.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5z" }],
		["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
	],
	// square-terminal — shell
	terminal: [
		["path", { d: "m7 11 2-2-2-2" }],
		["path", { d: "M11 13h4" }],
		["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
	],
	// braces — json
	braces: [
		["path", {
			d: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1",
		}],
		["path", {
			d: "M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
		}],
	],
	// list — yaml
	list: [
		["path", { d: "M3 12h.01" }],
		["path", { d: "M3 18h.01" }],
		["path", { d: "M3 6h.01" }],
		["path", { d: "M8 12h13" }],
		["path", { d: "M8 18h13" }],
		["path", { d: "M8 6h13" }],
	],
	// database — sql
	database: [
		["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3" }],
		["path", { d: "M3 5V19A9 3 0 0 0 21 19V5" }],
		["path", { d: "M3 12A9 3 0 0 0 21 12" }],
	],
	// code-xml — markup (html/css)
	"code-xml": [
		["path", { d: "m18 16 4-4-4-4" }],
		["path", { d: "m6 8-4 4 4 4" }],
		["path", { d: "m14.5 4-5 16" }],
	],
	// hash — markdown
	hash: [
		["line", { x1: "4", x2: "20", y1: "9", y2: "9" }],
		["line", { x1: "4", x2: "20", y1: "15", y2: "15" }],
		["line", { x1: "10", x2: "8", y1: "3", y2: "21" }],
		["line", { x1: "16", x2: "14", y1: "3", y2: "21" }],
	],
	// diff
	diff: [
		["path", { d: "M12 3v14" }],
		["path", { d: "M5 10h14" }],
		["path", { d: "M5 21h14" }],
	],
};

/** Normalized language → glyph name. */
const LANG_GLYPH: Record<string, string> = {
	// shell family
	bash: "terminal",
	sh: "terminal",
	zsh: "terminal",
	shell: "terminal",
	console: "terminal",
	// data / markup
	json: "braces",
	yaml: "list",
	yml: "list",
	sql: "database",
	html: "code-xml",
	xml: "code-xml",
	css: "code-xml",
	scss: "code-xml",
	md: "hash",
	markdown: "hash",
	diff: "diff",
	patch: "diff",
	// programming languages
	ts: "file-code",
	tsx: "file-code",
	typescript: "file-code",
	js: "file-code",
	jsx: "file-code",
	javascript: "file-code",
	go: "file-code",
	golang: "file-code",
	dart: "file-code",
	python: "file-code",
	py: "file-code",
	// plain
	text: "file-text",
	plain: "file-text",
	plaintext: "file-text",
	txt: "file-text",
};

function svg(children: Child[]): Element {
	return {
		type: "element",
		tagName: "svg",
		properties: {
			xmlns: "http://www.w3.org/2000/svg",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": "true",
			focusable: "false",
		},
		children: children.map(([tagName, attrs]) => ({
			type: "element" as const,
			tagName,
			properties: attrs,
			children: [],
		})),
	};
}

/**
 * hast <svg> line icon for a code-block language. Falls back to file-text for
 * any unmapped language (including `text`).
 */
export function langIcon(lang: string): Element {
	const glyph = LANG_GLYPH[lang.toLowerCase()] ?? "file-text";
	return svg(GLYPHS[glyph] ?? GLYPHS["file-text"]);
}
