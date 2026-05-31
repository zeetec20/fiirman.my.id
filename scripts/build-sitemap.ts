#!/usr/bin/env bun
/**
 * Generate /public/sitemap.xml from the synced article snapshot.
 *
 * Reads src/data/articles.generated.json (produced by sync:content) and
 * emits a Google-spec sitemap covering the three static routes plus one
 * <url> per article. Runs as part of the prebuild chain, after sync:content
 * and optimize:images, before vite build.
 *
 * Failure does not block the build — a missing sitemap is recoverable;
 * a broken build is not.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://fiirman.my.id";
const ROOT = join(import.meta.dir, "..");
const ARTICLES_JSON = join(ROOT, "src/data/articles.generated.json");
const OUT = join(ROOT, "public/sitemap.xml");

type ArticleLite = {
	slug: string;
	createdAt: string; // DD-MM-YYYY
};

/** Convert DD-MM-YYYY → YYYY-MM-DD; fall back to today if input is malformed. */
function toIsoDate(ddmmyyyy: string): string {
	const m = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (!m) return new Date().toISOString().slice(0, 10);
	const [, dd, mm, yyyy] = m;
	return `${yyyy}-${mm}-${dd}`;
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function urlBlock(
	loc: string,
	lastmod: string,
	changefreq: "daily" | "weekly" | "monthly" | "yearly",
	priority: string,
): string {
	return [
		"  <url>",
		`    <loc>${escapeXml(loc)}</loc>`,
		`    <lastmod>${lastmod}</lastmod>`,
		`    <changefreq>${changefreq}</changefreq>`,
		`    <priority>${priority}</priority>`,
		"  </url>",
	].join("\n");
}

function build(): string {
	const articles: ArticleLite[] = existsSync(ARTICLES_JSON)
		? (JSON.parse(readFileSync(ARTICLES_JSON, "utf-8")) as ArticleLite[])
		: [];

	const today = new Date().toISOString().slice(0, 10);

	const blocks = [
		urlBlock(`${SITE_URL}/`, today, "weekly", "1.0"),
		urlBlock(`${SITE_URL}/articles`, today, "weekly", "0.8"),
		urlBlock(`${SITE_URL}/about`, today, "monthly", "0.6"),
		...articles.map((a) =>
			urlBlock(
				`${SITE_URL}/articles/${a.slug}`,
				toIsoDate(a.createdAt),
				"monthly",
				"0.7",
			),
		),
	];

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		blocks.join("\n"),
		"</urlset>",
		"",
	].join("\n");
}

try {
	const xml = build();
	writeFileSync(OUT, xml, "utf-8");
	const count = (xml.match(/<url>/g) || []).length;
	console.log(`[sitemap] wrote ${count} URLs → ${OUT}`);
} catch (err) {
	console.error("[sitemap] generation failed:", err);
}
