/**
 * Estimate reading time from a pre-rendered HTML body. Strips tags, counts
 * words, divides by an average prose reading speed (225 wpm — typical for
 * mixed-density technical writing). Always returns at least 1.
 */
export function estimateReadingMinutes(html: string): number {
	const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
	if (!text) return 1;
	const words = text.split(" ").length;
	return Math.max(1, Math.round(words / 225));
}
