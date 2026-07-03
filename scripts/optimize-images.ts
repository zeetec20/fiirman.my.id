#!/usr/bin/env bun
/**
 * Build-time image optimizer. Walks `/public/article/<slug>/*` and
 * `/public/images/<slug>/*` for JPG / JPEG / PNG sources, emits a width
 * set of `.webp` siblings via sharp (libvips) at quality 80.
 *
 * Three variants per source:
 *   <name>.webp        — 1080w (canonical default `src` used by callers
 *                        that don't read srcset)
 *   <name>-480w.webp   — mobile card / list
 *   <name>-768w.webp   — tablet
 *
 * Idempotent — skips a variant when its `.webp` already exists and is
 * newer than the source. Per-image failures log and continue.
 *
 * Run manually: `bun run optimize:images`
 * Auto-wired into `prebuild` via package.json.
 */

import { existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const ROOTS = ["public/article", "public/images"];
const SOURCE_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const QUALITY = 80;

/* Widths to emit. 320w covers mobile hero (~378px css at DPR=1) and
   high-DPR small-card grids (~190px × 2). 672w matches the full-width
   mobile card at DPR≈1.75 (LH emulation: 380 css px × 1.75 ≈ 665) so
   Lighthouse's responsive-images audit doesn't flag the 768w jump.
   The canonical `<name>.webp` stays at 1080w for desktop hero. */
const VARIANTS: Array<{ suffix: string; width: number }> = [
	{ suffix: "", width: 1080 },
	{ suffix: "-320w", width: 320 },
	{ suffix: "-480w", width: 480 },
	{ suffix: "-672w", width: 672 },
	{ suffix: "-768w", width: 768 },
];

async function walk(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const out: string[] = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await walk(full)));
		else if (entry.isFile()) out.push(full);
	}
	return out;
}

function destPath(source: string, suffix: string): string {
	const { dir, name } = parse(source);
	return join(dir, `${name}${suffix}.webp`);
}

function shouldConvert(source: string, dest: string): boolean {
	if (!existsSync(dest)) return true;
	return statSync(source).mtimeMs > statSync(dest).mtimeMs;
}

async function convertVariant(
	source: string,
	dest: string,
	width: number,
): Promise<void> {
	const before = statSync(source).size;
	try {
		await sharp(source)
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toFile(dest);
		const after = statSync(dest).size;
		const pct = Math.round((1 - after / before) * 100);
		console.log(
			`  ✓ ${dest}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (-${pct}%, ${width}w)`,
		);
	} catch (err) {
		console.warn(`  ✗ ${dest} — ${(err as Error).message}`);
	}
}

async function main() {
	const start = Date.now();
	let scanned = 0;
	let converted = 0;
	let skipped = 0;

	for (const root of ROOTS) {
		if (!existsSync(root)) {
			console.log(`(skip ${root} — not present)`);
			continue;
		}
		console.log(`Walking ${root}…`);
		const files = await walk(root);
		for (const file of files) {
			const ext = parse(file).ext.toLowerCase();
			if (!SOURCE_EXTS.has(ext)) continue;
			scanned++;
			for (const v of VARIANTS) {
				const dest = destPath(file, v.suffix);
				if (!shouldConvert(file, dest)) {
					skipped++;
					continue;
				}
				await convertVariant(file, dest, v.width);
				converted++;
			}
		}
	}

	const elapsed = ((Date.now() - start) / 1000).toFixed(1);
	console.log(
		`\nOptimized images: ${converted} written, ${skipped} cached, ${scanned} sources (${elapsed}s)`,
	);
}

main().catch((err) => {
	console.error("optimize-images failed:", err);
	process.exit(1);
});
