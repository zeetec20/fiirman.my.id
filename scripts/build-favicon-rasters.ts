#!/usr/bin/env bun
/**
 * Rasterize public/favicon.svg → logo192.png, logo512.png,
 * apple-touch-icon.png (180×180). The PNG variants are what
 * Apple/Android/OpenGraph/Twitter Card actually fetch; the SVG alone
 * isn't enough. Run as part of the prebuild chain so the rasters
 * stay in sync with the source SVG.
 *
 * Idempotent (skip if PNG mtime is newer than SVG mtime).
 */
import { existsSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dir, "..");
const SVG = join(ROOT, "public/favicon.svg");
const ICO = join(ROOT, "public/favicon.ico");
const ICO_SIZES = [16, 32, 48] as const;
const TARGETS: Array<{ out: string; size: number }> = [
	{ out: join(ROOT, "public/logo192.png"), size: 192 },
	{ out: join(ROOT, "public/logo512.png"), size: 512 },
	{ out: join(ROOT, "public/apple-touch-icon.png"), size: 180 },
];

/**
 * Build a multi-image ICO file from PNG buffers. ICO format:
 *   - 6-byte ICONDIR header
 *   - 16-byte ICONDIRENTRY per image
 *   - PNG payloads concatenated
 * Browsers accept PNG-inside-ICO since IE11; modern browsers prefer the
 * SVG link anyway, this is the legacy fallback.
 */
function buildIco(pngs: Array<{ size: number; data: Buffer }>): Buffer {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); /* reserved */
	header.writeUInt16LE(1, 2); /* type: 1 = ICO */
	header.writeUInt16LE(pngs.length, 4); /* image count */

	const entries = Buffer.alloc(16 * pngs.length);
	let offset = 6 + 16 * pngs.length;
	pngs.forEach((p, i) => {
		const e = i * 16;
		entries.writeUInt8(p.size >= 256 ? 0 : p.size, e + 0); /* width */
		entries.writeUInt8(p.size >= 256 ? 0 : p.size, e + 1); /* height */
		entries.writeUInt8(0, e + 2); /* palette count (0 = no palette) */
		entries.writeUInt8(0, e + 3); /* reserved */
		entries.writeUInt16LE(1, e + 4); /* color planes */
		entries.writeUInt16LE(32, e + 6); /* bits per pixel */
		entries.writeUInt32LE(p.data.length, e + 8); /* image data size */
		entries.writeUInt32LE(offset, e + 12); /* image data offset */
		offset += p.data.length;
	});

	return Buffer.concat([header, entries, ...pngs.map((p) => p.data)]);
}

async function main() {
	if (!existsSync(SVG)) {
		console.error(`[favicon] source missing: ${SVG}`);
		return;
	}
	const svgMtime = statSync(SVG).mtimeMs;

	for (const { out, size } of TARGETS) {
		if (existsSync(out) && statSync(out).mtimeMs > svgMtime) {
			console.log(`[favicon] skip ${out} (up-to-date)`);
			continue;
		}
		try {
			await sharp(SVG, { density: 384 })
				.resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
				.png({ compressionLevel: 9 })
				.toFile(out);
			console.log(`[favicon] wrote ${out} (${size}×${size})`);
		} catch (err) {
			console.error(`[favicon] failed ${out}:`, err);
		}
	}

	/* Multi-resolution favicon.ico (16/32/48) embedded as PNG payloads. */
	if (existsSync(ICO) && statSync(ICO).mtimeMs > svgMtime) {
		console.log(`[favicon] skip ${ICO} (up-to-date)`);
	} else {
		try {
			const pngs = await Promise.all(
				ICO_SIZES.map(async (size) => ({
					size,
					data: await sharp(SVG, { density: 384 })
						.resize(size, size, {
							fit: "contain",
							background: { r: 0, g: 0, b: 0, alpha: 0 },
						})
						.png({ compressionLevel: 9 })
						.toBuffer(),
				})),
			);
			writeFileSync(ICO, buildIco(pngs));
			console.log(`[favicon] wrote ${ICO} (16/32/48 multi-res)`);
		} catch (err) {
			console.error(`[favicon] failed ${ICO}:`, err);
		}
	}
}

main();
