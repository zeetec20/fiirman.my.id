#!/usr/bin/env bun
/**
 * Pre-build content snapshot for both server and client consumption.
 *
 * Walks /content/{github,medium}/*.md and /content/bio.md, parses
 * frontmatter via gray-matter, renders bodies to HTML via the same
 * unified pipeline used at SSR (src/lib/markdown.ts), and writes:
 *
 *   src/data/articles-index.generated.json — ArticleMeta[] (sorted desc by createdAt)
 *   src/data/article-bodies.generated.json — Record<slug, html> (server-only)
 *   src/data/bio.generated.json            — { html: string }
 *
 * Bodies are split from the index so list pages (/, /articles, /about)
 * never carry rendered article HTML in their bundle or SSR payload.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import {
	type Article,
	articleFrontmatter,
	parseFrontmatterDate,
} from "../src/lib/article-schema";
import { markdownToHtml } from "../src/lib/markdown";

const ROOT_DIR = fileURLToPath(new URL("../", import.meta.url));
const CONTENT_DIR = join(ROOT_DIR, "content");
const OUT_INDEX = join(ROOT_DIR, "src/data/articles-index.generated.json");
const OUT_BODIES = join(ROOT_DIR, "src/data/article-bodies.generated.json");
const OUT_BIO = join(ROOT_DIR, "src/data/bio.generated.json");

/**
 * Strip the .md extension, anything after `?` (Medium RSS query suffix),
 * and a trailing -<12-hex> Medium post id.
 */
function slugFromFilename(filename: string): string {
	const noExt = filename.replace(/\.md$/, "");
	const noQuery = noExt.split("?")[0];
	return noQuery.replace(/-[a-f0-9]{12}$/i, "");
}

async function readMarkdownFiles(
	subdir: string,
): Promise<Array<{ filename: string; raw: string }>> {
	const dir = join(CONTENT_DIR, subdir);
	let entries: string[];
	try {
		entries = await readdir(dir);
	} catch {
		return [];
	}
	const files: Array<{ filename: string; raw: string }> = [];
	for (const filename of entries) {
		if (filename.startsWith(".")) continue;
		if (!filename.endsWith(".md")) continue;
		const raw = await Bun.file(join(dir, filename)).text();
		files.push({ filename, raw });
	}
	return files;
}

async function buildArticles(): Promise<Article[]> {
	const all: Article[] = [];
	for (const subdir of ["github", "medium"]) {
		const files = await readMarkdownFiles(subdir);
		for (const { filename, raw } of files) {
			const slug = slugFromFilename(filename);
			const parsed = matter(raw);
			const result = articleFrontmatter.safeParse(parsed.data);
			if (!result.success) {
				console.warn(
					`[build-content] Skipping ${subdir}/${filename} — frontmatter validation failed:`,
					result.error.flatten(),
				);
				continue;
			}
			const html = await markdownToHtml(parsed.content);
			all.push({
				...result.data,
				slug,
				body: html,
			});
		}
	}
	all.sort(
		(a, b) =>
			parseFrontmatterDate(b.createdAt).getTime() -
			parseFrontmatterDate(a.createdAt).getTime(),
	);
	return all;
}

async function buildBio(): Promise<{ html: string }> {
	const file = Bun.file(join(CONTENT_DIR, "bio.md"));
	let raw = "# About\n\nNothing here yet.";
	if (await file.exists()) {
		raw = await file.text();
	}
	const html = await markdownToHtml(raw);
	return { html };
}

async function main() {
	const start = Date.now();
	const [articles, bio] = await Promise.all([buildArticles(), buildBio()]);

	const index = articles.map(({ body: _body, ...meta }) => meta);
	const bodies = Object.fromEntries(articles.map((a) => [a.slug, a.body]));

	await Bun.write(OUT_INDEX, JSON.stringify(index, null, 2));
	await Bun.write(OUT_BODIES, JSON.stringify(bodies, null, 2));
	await Bun.write(OUT_BIO, JSON.stringify(bio, null, 2));

	const elapsed = Date.now() - start;
	console.log(
		`[build-content] ${articles.length} articles (index + bodies) + bio → src/data/*.generated.json (${elapsed}ms)`,
	);
}

main().catch((err) => {
	console.error("[build-content] failed:", err);
	process.exit(1);
});
