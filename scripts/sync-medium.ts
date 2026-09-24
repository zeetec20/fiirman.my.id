#!/usr/bin/env bun
/**
 * Build-time Medium RSS Sync & Crawler.
 *
 * Automatically crawls https://medium.com/feed/@firmanlestari on build,
 * checks for newly published articles, and writes each as a standalone
 * Markdown file in content/articles/<slug>.md.
 *
 * Strict Deduplication Guard:
 * If content/articles/<slug>.md already exists, it is strictly skipped
 * so existing files and edits are never overwritten.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const ROOT = path.resolve(import.meta.dir, "..");
const FEED_URL = "https://medium.com/feed/@firmanlestari";
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const PUBLIC_DIR = path.join(ROOT, "public", "article");

function decodeEntities(html: string): string {
  return html
    .replace(/\u00A0/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "").trim());
}

export function htmlToMarkdown(html: string, articleTitle: string): string {
  let md = html.replace(/\u00A0/g, " ");

  // 1. Remove tracking pixel
  md = md.replace(/<img[^>]+stat\?event=[^>]+>/gi, "");

  // 2. Remove first hero figure (already captured in frontmatter thumbnail)
  md = md.replace(/^\s*<figure>[\s\S]*?<\/figure>/i, "");

  // 3. Convert pre/code blocks BEFORE handling other tags
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    let cleanCode = code
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "$1")
      .replace(/<br\s*\/?>/gi, "\n");
    // Decode HTML entities
    cleanCode = decodeEntities(cleanCode);
    return `\n\n\`\`\`\n${cleanCode.trim()}\n\`\`\`\n\n`;
  });

  // 4. Convert headings
  md = md.replace(
    /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi,
    (_, h) => `\n\n## ${stripHtml(h)}\n\n`,
  );
  md = md.replace(
    /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    (_, h) => `\n\n## ${stripHtml(h)}\n\n`,
  );
  md = md.replace(
    /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    (_, h) => `\n\n### ${stripHtml(h)}\n\n`,
  );

  // 5. Convert lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, list) => {
    const items: string[] = [];
    const itemMatches = list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const match of itemMatches) {
      items.push(`- ${match[1].trim()}`);
    }
    return `\n\n${items.join("\n")}\n\n`;
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, list) => {
    const items: string[] = [];
    let idx = 1;
    const itemMatches = list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const match of itemMatches) {
      items.push(`${idx++}. ${match[1].trim()}`);
    }
    return `\n\n${items.join("\n")}\n\n`;
  });

  // 6. Convert inline elements (trimming inside delimiters for valid CommonMark)
  md = md.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (_, q) => `\n\n> ${q.trim()}\n\n`,
  );
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, (_, _t, text) => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    const leading = text.startsWith(" ") ? " " : "";
    const trailing = text.endsWith(" ") ? " " : "";
    return `${leading}**${trimmed}**${trailing}`;
  });
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, (_, _t, text) => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    const leading = text.startsWith(" ") ? " " : "";
    const trailing = text.endsWith(" ") ? " " : "";
    return `${leading}*${trimmed}*${trailing}`;
  });
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, text) => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    const leading = text.startsWith(" ") ? " " : "";
    const trailing = text.endsWith(" ") ? " " : "";
    return `${leading}\`${trimmed}\`${trailing}`;
  });

  // 7. Convert links with trailing dot cleanup
  md = md.replace(
    /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, text) => {
      let cleanHref = href.trim();
      if (cleanHref.endsWith(".") && !cleanHref.endsWith("..")) {
        cleanHref = cleanHref.slice(0, -1);
      }
      const cleanText = text.trim();
      return `[${cleanText}](${cleanHref})`;
    },
  );

  // 8. Remaining figures / images
  md = md.replace(
    /<figure[^>]*>[\s\S]*?<img\s+[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/figure>/gi,
    "\n\n![]($1)\n\n",
  );
  md = md.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, "\n\n![]($1)\n\n");

  // 9. Paragraphs and breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");

  // 10. Strip any remaining HTML tags and decode entities
  md = md.replace(/<[^>]+>/g, "");
  md = decodeEntities(md);

  // 11. Normalize newlines
  md = md.replace(/\n{3,}/g, "\n\n").trim();

  // 12. Remove repeated title if it is the first paragraph
  if (articleTitle) {
    const titleRegex = new RegExp(
      `^\\*\\*${articleTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*\\s*`,
      "i",
    );
    md = md.replace(titleRegex, "").trim();
  }

  return md;
}

async function downloadThumbnail(url: string, slug: string): Promise<string> {
  try {
    const dir = path.join(PUBLIC_DIR, slug);
    await mkdir(dir, { recursive: true });
    const dest = path.join(dir, "thumbnail.jpg");

    if (existsSync(dest)) {
      return `/article/${slug}/thumbnail.jpg`;
    }

    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return url;
    const buffer = await res.arrayBuffer();
    await writeFile(dest, Buffer.from(buffer));
    console.log(
      `  [sync-medium] Downloaded thumbnail -> /article/${slug}/thumbnail.jpg`,
    );
    return `/article/${slug}/thumbnail.jpg`;
  } catch (err) {
    console.warn(
      `  [sync-medium] Could not download thumbnail for ${slug}, using remote URL:`,
      err,
    );
    return url;
  }
}

async function main() {
  console.log(`[sync-medium] Checking Medium RSS feed (${FEED_URL})...`);
  await mkdir(ARTICLES_DIR, { recursive: true });

  let xml: string;
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (fiirman-crawler/1.0)" },
    });
    if (!res.ok) {
      console.warn(
        `[sync-medium] Warning: Feed returned HTTP ${res.status}. Skipping sync.`,
      );
      return;
    }
    xml = await res.text();
  } catch (err) {
    console.warn(
      "[sync-medium] Offline or network error while fetching Medium feed. Skipping sync:",
      err,
    );
    return;
  }

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items = Array.isArray(rawItems)
    ? rawItems
    : rawItems
      ? [rawItems]
      : [];

  if (items.length === 0) {
    console.log("[sync-medium] No articles found in Medium feed.");
    return;
  }

  let newCount = 0;

  for (const item of items) {
    const rawLink = String(item.link || "").split("?")[0];
    const rawSlug = rawLink.split("/").pop() || "";
    const slug = rawSlug.replace(/-[a-f0-9]{12}$/i, "").toLowerCase();

    if (!slug) continue;

    const mdPath = path.join(ARTICLES_DIR, `${slug}.md`);

    // Deduplication check: if markdown file already exists, skip!
    if (existsSync(mdPath)) {
      console.log(
        `  [sync-medium] '${slug}.md' already indexed (skipping to prevent duplicate)`,
      );
      continue;
    }

    console.log(`  [sync-medium] Found NEW article: "${item.title}" (${slug})`);

    const contentEncoded = String(item["content:encoded"] || "");
    const imgMatch = contentEncoded.match(/<img[^>]+src="([^">]+)"/);
    let coverImage = "";
    if (imgMatch && !imgMatch[1].includes("/_/stat")) {
      coverImage = await downloadThumbnail(imgMatch[1], slug);
    }

    // Parse categories
    const categories: string[] = Array.isArray(item.category)
      ? item.category.map(String)
      : item.category
        ? [String(item.category)]
        : ["Engineering"];

    // Date formatting
    const pubDate = new Date(item.pubDate);
    const dateFormatted = !Number.isNaN(pubDate.getTime())
      ? pubDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Recent";

    // Reading time calculation (200 wpm)
    const cleanText = stripHtml(contentEncoded);
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    const readingTime = `${Math.max(1, Math.ceil(words / 200))} min`;

    // Convert HTML to clean Markdown
    const markdownBody = htmlToMarkdown(contentEncoded, item.title);

    // Extract excerpt (first non-empty paragraph)
    const firstParagraph =
      markdownBody
        .split("\n\n")
        .map((p) => p.trim())
        .find((p) => p && !p.startsWith("#") && !p.startsWith("!")) ||
      item.title;
    const cleanExcerpt = firstParagraph.replace(/[*_`#]/g, "");

    const docId = `FOLIO-${pubDate.getFullYear() || "2026"}-M${String(Math.floor(Math.random() * 900) + 100)}`;

    const frontmatter = `---
slug: ${slug}
docId: ${docId}
title: "${item.title.replace(/"/g, '\\"')}"
coverImage: ${coverImage}
date: ${dateFormatted}
readingTime: ${readingTime}
tags:
${categories
  .slice(0, 5)
  .map((t) => `  - ${t}`)
  .join("\n")}
excerpt: "${cleanExcerpt.slice(0, 200).replace(/"/g, '\\"')}"
---

${markdownBody}
`;

    await writeFile(mdPath, frontmatter, "utf-8");
    console.log(`  [sync-medium] Created content/articles/${slug}.md`);
    newCount++;
  }

  if (newCount > 0) {
    console.log(
      `[sync-medium] Successfully synced ${newCount} new article(s) to content/articles/.`,
    );
  } else {
    console.log(
      "[sync-medium] All Medium articles are already synced as Markdown files. Zero duplicates.",
    );
  }

  await generateArticlesManifest();
}

async function generateArticlesManifest() {
  const { readdir, readFile } = await import("node:fs/promises");
  const files = (await readdir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));
  const manifest = [];

  for (const file of files) {
    const raw = await readFile(path.join(ARTICLES_DIR, file), "utf-8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) continue;

    const frontmatterStr = match[1];
    const content = match[2].trim();
    const data: Record<string, unknown> = {};

    const lines = frontmatterStr.split("\n");
    let currentKey = "";
    let isList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      if (trimmed.startsWith("- ") && currentKey && isList) {
        const arr = data[currentKey];
        if (Array.isArray(arr)) {
          arr.push(
            trimmed
              .slice(2)
              .trim()
              .replace(/^["']|["']$/g, ""),
          );
        }
        continue;
      }

      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();

        if (val === "" || val === "[]") {
          currentKey = key;
          data[key] = [];
          isList = true;
        } else if (val.startsWith("[") && val.endsWith("]")) {
          currentKey = key;
          isList = false;
          data[key] = val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        } else {
          currentKey = key;
          isList = false;
          data[key] = val.replace(/^["']|["']$/g, "");
        }
      }
    }

    const filenameSlug = file.replace(/\.md$/, "");
    const slug = (typeof data.slug === "string" ? data.slug : filenameSlug) || "";
    const paragraphs = content.split("\n\n").map((p) => p.trim());
    const firstParagraph =
      paragraphs.find((p) => p && !p.startsWith("#") && !p.startsWith("!")) ||
      "";
    const lead = (
      firstParagraph || (typeof data.excerpt === "string" ? data.excerpt : "")
    ).replace(/\u00A0/g, " ");

    manifest.push({
      slug,
      docId:
        typeof data.docId === "string"
          ? data.docId
          : `FOLIO-${slug.toUpperCase()}`,
      title:
        typeof data.title === "string" ? data.title : "Untitled Manuscript",
      coverImage: typeof data.coverImage === "string" ? data.coverImage : "",
      date: typeof data.date === "string" ? data.date : "Recent",
      readingTime:
        typeof data.readingTime === "string" ? data.readingTime : "3 min",
      tags: Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === "string")
        : [],
      excerpt:
        typeof data.excerpt === "string"
          ? data.excerpt
          : lead.replace(/[*_`#]/g, "").slice(0, 200),
      lead,
      content: "",
      headings: [],
    });
  }

  manifest.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
      return dateB - dateA;
    }
    return b.docId.localeCompare(a.docId);
  });

  const manifestPath = path.join(ROOT, "src", "data", "articles-manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(
    `[sync-medium] Generated lightweight articles manifest at ${manifestPath} (${manifest.length} articles).`,
  );
}

await main();
