import rehypeShiki from "@shikijs/rehype";

/**
 * Shared Shiki rehype plugin config. Used by the article renderer at SSR.
 * Themes: min-light (parchment) / min-dark (candlelight). Both restrained
 * enough not to clash with the rubric palette.
 */
export const shikiRehypePlugin = [
	rehypeShiki,
	{
		themes: {
			light: "min-light",
			dark: "min-dark",
		},
		defaultColor: false, // emits CSS variables; toggled by data-theme
	},
] as const;
