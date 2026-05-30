#!/usr/bin/env bun
/**
 * Design-time helper. Searches Unsplash for an image, lets the operator
 * pick one, downloads it into /public/images/<slug>/cover.<ext>, and
 * writes a sibling credit.json. Never run at request-time.
 *
 * Usage:
 *   UNSPLASH_ACCESS_KEY=... bun run scripts/fetch-unsplash.ts "<query>" <slug>
 *
 * Get a free key: https://unsplash.com/developers (50 req/hr demo tier).
 */
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dir, "..");
const KEY = process.env.UNSPLASH_ACCESS_KEY;

function die(msg: string, code = 1): never {
	console.error(`fetch-unsplash: ${msg}`);
	process.exit(code);
}

if (!KEY) {
	die(
		"UNSPLASH_ACCESS_KEY is not set. Get a free key from https://unsplash.com/developers, then:\n  export UNSPLASH_ACCESS_KEY=<your key>",
	);
}

const [, , queryArg, slugArg] = process.argv;
if (!queryArg || !slugArg) {
	die(`Usage: bun run scripts/fetch-unsplash.ts "<query>" <slug>`);
}
const query = queryArg.trim();
const slug = slugArg.trim();
if (!/^[a-z0-9-]+$/.test(slug)) {
	die(`Slug must be lowercase letters/digits/dashes only. Got: ${slug}`);
}

type SearchHit = {
	id: string;
	width: number;
	height: number;
	description: string | null;
	alt_description: string | null;
	urls: { regular: string; raw: string };
	user: { name: string };
	links: { html: string };
};

type SearchResponse = { total: number; results: SearchHit[] };

async function search(): Promise<SearchHit[]> {
	const url = new URL("https://api.unsplash.com/search/photos");
	url.searchParams.set("query", query);
	url.searchParams.set("per_page", "10");
	url.searchParams.set("orientation", "landscape");
	const res = await fetch(url, {
		headers: {
			Authorization: `Client-ID ${KEY}`,
			"Accept-Version": "v1",
		},
	});
	if (!res.ok) {
		die(`Unsplash search failed: ${res.status} ${res.statusText}`);
	}
	const data = (await res.json()) as SearchResponse;
	return data.results;
}

async function promptIndex(max: number): Promise<number> {
	process.stdout.write(`\nPick an index (0-${max - 1}): `);
	const reader = Bun.stdin.stream().getReader();
	const { value } = await reader.read();
	reader.releaseLock();
	if (!value) die("No input.");
	const text = new TextDecoder().decode(value).trim();
	const n = Number(text);
	if (!Number.isInteger(n) || n < 0 || n >= max) {
		die(`Invalid index: ${text}`);
	}
	return n;
}

async function download(url: string, dest: string): Promise<number> {
	const res = await fetch(url);
	if (!res.ok) die(`Download failed: ${res.status} ${res.statusText}`);
	const buf = new Uint8Array(await res.arrayBuffer());
	await writeFile(dest, buf);
	return buf.byteLength;
}

async function main() {
	console.error(`Searching Unsplash for "${query}" …`);
	const hits = await search();
	if (hits.length === 0) die(`No results for "${query}".`);

	hits.forEach((hit, i) => {
		const desc = hit.description || hit.alt_description || "(no description)";
		console.error(
			`  [${i}] ${hit.id}  ${hit.width}x${hit.height}  by ${hit.user.name}\n      ${desc}\n      ${hit.links.html}`,
		);
	});

	const idx = await promptIndex(hits.length);
	const chosen = hits[idx];

	const outDir = path.join(ROOT, "public", "images", slug);
	await mkdir(outDir, { recursive: true });
	const outFile = path.join(outDir, "cover.jpg");
	const bytes = await download(chosen.urls.regular, outFile);
	console.error(`Downloaded ${bytes} bytes → ${outFile}`);

	if (bytes > 250 * 1024) {
		console.error(
			`WARN: file is ${(bytes / 1024).toFixed(0)}KB, design.md caps at 250KB. Compress before shipping.`,
		);
	}
	if (chosen.width > 1600) {
		console.error(
			`WARN: image is ${chosen.width}px wide, design.md caps at 1600px. Resize before shipping.`,
		);
	}

	const credit = {
		source: "unsplash",
		id: chosen.id,
		photographer: chosen.user.name,
		url: chosen.links.html,
	};
	await writeFile(
		path.join(outDir, "credit.json"),
		`${JSON.stringify(credit, null, 2)}\n`,
	);
	console.error(`Wrote ${path.join(outDir, "credit.json")}`);

	// Sanity: confirm file is on disk.
	await stat(outFile);
	console.error(
		`\nDone. Reference in your markdown frontmatter:\n  thumbnail: /images/${slug}/cover.jpg`,
	);
}

await main();
