#!/usr/bin/env bun
/**
 * Build-time image optimizer. Walks `/public/article/<slug>/*` and
 * `/public/images/<slug>/*` for JPG / JPEG / PNG sources, emits a `.webp`
 * sibling per source via sharp (libvips) at quality 80, max-width 1200px.
 *
 * Idempotent — skips conversion when a sibling `.webp` already exists and
 * is newer than the source. Per-image failures log and continue; never
 * fails the build.
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
const MAX_WIDTH = 1200;
const QUALITY = 80;

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

function shouldConvert(source: string): boolean {
	const { dir, name } = parse(source);
	const webp = join(dir, `${name}.webp`);
	if (!existsSync(webp)) return true;
	return statSync(source).mtimeMs > statSync(webp).mtimeMs;
}

async function convert(source: string): Promise<void> {
	const { dir, name } = parse(source);
	const dest = join(dir, `${name}.webp`);
	const before = statSync(source).size;
	try {
		await sharp(source)
			.resize({ width: MAX_WIDTH, withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toFile(dest);
		const after = statSync(dest).size;
		const pct = Math.round((1 - after / before) * 100);
		console.log(
			`  ✓ ${source} → ${name}.webp  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (-${pct}%)`,
		);
	} catch (err) {
		console.warn(`  ✗ ${source} — ${(err as Error).message}`);
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
			if (!shouldConvert(file)) {
				skipped++;
				continue;
			}
			await convert(file);
			converted++;
		}
	}

	const elapsed = ((Date.now() - start) / 1000).toFixed(1);
	console.log(
		`\nOptimized images: ${converted} converted, ${skipped} cached, ${scanned} scanned (${elapsed}s)`,
	);
}

main().catch((err) => {
	console.error("optimize-images failed:", err);
	process.exit(1);
});
