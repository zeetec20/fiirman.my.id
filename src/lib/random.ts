/**
 * Deterministic pseudo-random helpers. A single seed string produces a
 * stable hash; that hash plus an `index` produces a stable float in
 * [min, max). Used by `<ArticleThumbnail>` to pick a unique-but-stable
 * grain/dust/scratch combination per article.
 */

/** FNV-1a hash over UTF-16 code units. 32-bit unsigned int. */
export function hashSeed(s: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}

/** xorshift-mixed pseudo-random; same (seed, index) always returns same value. */
export function prng(
	seed: number,
	index: number,
	min: number,
	max: number,
): number {
	let x = (seed ^ ((index + 1) * 0x9e3779b1)) >>> 0;
	x ^= x << 13;
	x >>>= 0;
	x ^= x >> 17;
	x >>>= 0;
	x ^= x << 5;
	x >>>= 0;
	return min + ((x % 100000) / 100000) * (max - min);
}

/**
 * Pick `count` distinct indices from [0, pool). Deterministic given the
 * same (seed, pool, count). Skips duplicates without bias.
 */
export function pickSubset(
	seed: number,
	salt: number,
	pool: number,
	count: number,
): number[] {
	const out: number[] = [];
	let attempt = 0;
	while (out.length < count && attempt < pool * 4) {
		const candidate = Math.floor(prng(seed, salt + attempt, 0, pool));
		if (!out.includes(candidate)) out.push(candidate);
		attempt++;
	}
	return out;
}
