#!/usr/bin/env bun
/**
 * Build-time Medium RSS sync. Idempotent: existing files only get overwritten
 * if upstream pubDate is newer. See content-sources.md Source B for the spec.
 *
 * Usage:
 *   bun run scripts/sync-medium.ts
 */
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { XMLParser } from "fast-xml-parser";
import matter from "gray-matter";
import TurndownService from "turndown";
// @ts-expect-error — no types ship for the GFM plugin
import { gfm } from "turndown-plugin-gfm";

const ROOT = path.resolve(import.meta.dir, "..");
const CONTENT_DIR = path.join(ROOT, "content", "medium");
const ASSET_ROOT = path.join(ROOT, "public", "article");
const FEED_URL = "https://medium.com/feed/@firmanlestari";
const WRITER = "zeetec20";

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  "content:encoded": string;
  category?: string | string[];
};

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  hr: "---",
  bulletListMarker: "-",
});
turndown.use(gfm);

/**
 * Force every <pre> into a fenced code block regardless of inner structure.
 * Medium often emits <pre><span>…</span></pre> without a <code> child, so the
 * default GFM `fencedCodeBlock` rule never matches and code leaks out as a
 * regular paragraph. This rule runs last and overrides.
 */
/**
 * Best-effort language detection for Medium code blocks. Medium RSS does
 * not carry a language hint, so we sniff content. Falls back to "text".
 */
function detectLanguage(code: string): string {
  const head = code.trim().slice(0, 400);
  // ASCII / box-drawing art: keep monospaced, no syntax tokens.
  if (/[┌└├┤┬┴┼─│►▼◄▲]/.test(head)) return "text";
  // JSON-ish object: { "key": value }
  if (/^\s*\{[\s\S]*\}\s*$/.test(code) && /"[^"\\]+"\s*:/.test(head))
    return "json";
  // YAML
  if (/^\s*[A-Za-z_][\w-]*\s*:\s*\S/m.test(head) && /^---\s*$/m.test(head))
    return "yaml";
  // Bash / shell. Runs after the box-art guard above so ASCII diagrams that
  // happen to contain shell-looking words stay "text".
  if (/^#!\/(?:usr\/)?bin\/(?:bash|sh|zsh)/m.test(head)) return "bash";
  if (/^\s*\$\s+\S/m.test(head)) return "bash";
  // Shell control syntax (Medium RSS strips the lang, so these blocks would
  // otherwise fall through to "text").
  if (
    /\bif\s+\[|^\s*then\b|^\s*fi\b|^\s*done\b|^\s*esac\b|\bcase\s+.+\s+in\b|\bwhile\s+read\b|^\s*exit\s+\d/m.test(
      head,
    )
  )
    return "bash";
  // Lines starting with a common CLI command.
  if (
    /^\s*(?:git|bun|bunx|npm|npx|pnpm|yarn|cd|echo|export|source|curl|wget|sudo|apt|brew|chmod|chown|mkdir|rm|cp|mv|docker|kubectl)\s+\S/m.test(
      head,
    )
  )
    return "bash";
  // SQL
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i.test(head))
    return "sql";
  // Python
  if (
    /\bdef\s+\w+\s*\(|^\s*import\s+\w+|^\s*from\s+\w+\s+import\b|print\(/m.test(
      head,
    )
  )
    return "python";
  // Go
  if (/^\s*package\s+\w+|^\s*func\s+\w+\s*\(/m.test(head)) return "go";
  // Dart
  if (/\bvoid\s+main\s*\(\s*\)\s*\{|Widget\s+build\s*\(/.test(head))
    return "dart";
  // CSS — selector { prop: value; }
  if (
    /[.#]?\w+(?:\s*[.#:][\w-]+)*\s*\{[\s\S]*?[\w-]+\s*:\s*[^;}]+;[\s\S]*?\}/m.test(
      head,
    )
  )
    return "css";
  // TypeScript / JavaScript — broad net last
  if (
    /\b(const|let|var|function|=>|async|await|interface|type|export|import|class|extends)\b/.test(
      head,
    )
  )
    return "ts";
  return "text";
}

turndown.addRule("preBlock", {
  filter: "pre",
  replacement: (_content, node) => {
    const html = (node as HTMLElement).innerHTML ?? "";
    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>\s*<\1[^>]*>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/^\n+|\n+$/g, "");
    const lang = detectLanguage(text);
    return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
  },
});

function slugFromLink(link: string): string {
  // strip query + fragment first, then trailing slash, then take last segment
  const noQuery = link.split("?")[0].split("#")[0];
  const tail = noQuery.replace(/\/+$/, "").split("/").pop() ?? "";
  // strip Medium's trailing -<8-12 char hex hash>
  return tail.replace(/-[0-9a-f]{6,12}$/i, "");
}

function formatDate(rfc2822: string): string {
  const d = new Date(rfc2822);
  if (Number.isNaN(d.getTime())) return rfc2822;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function unwrap<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extFromContentType(ct: string | null, url: string): string {
  if (ct?.includes("png")) return "png";
  if (ct?.includes("gif")) return "gif";
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("jpeg")) return "jpg";
  const m = url.match(/\.(png|jpe?g|gif|webp)(?:\?|$)/i);
  if (m) return m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase();
  return "jpg";
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
  if (await Bun.file(dest).exists()) return true;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    console.warn(
      `  ! image download failed (${res.status}): ${url} → skipping`,
    );
    return false;
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  await writeFile(dest, buf);
  return true;
}

function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/g)) {
    const src = match[1];
    // Skip Medium's 1x1 view-tracking pixel that trails content:encoded.
    // Left in, it becomes a bogus img-N.jpg linked at the end of the body.
    if (/medium\.com\/_\/stat|\/_\/stat\b/.test(src)) continue;
    urls.push(src);
  }
  return urls;
}

async function processItem(item: RssItem) {
  const slug = slugFromLink(item.link);
  console.error(`\n→ ${slug}`);

  const assetDir = path.join(ASSET_ROOT, slug);
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);

  const newDate = formatDate(item.pubDate);

  await mkdir(assetDir, { recursive: true });

  let body = item["content:encoded"];
  // Drop Medium's trailing 1x1 view-tracking pixel <img> before anything else,
  // or turndown renders it as a remote ![](…/_/stat?…) at the end of the body.
  body = body.replace(/<img[^>]+src=["'][^"']*\/_\/stat[^"']*["'][^>]*>/g, "");
  const imgUrls = extractImageUrls(body);

  let thumbnail = "";

  // 1) Promote first image to thumbnail and strip it from body.
  if (imgUrls.length > 0) {
    const firstUrl = imgUrls[0];
    const probe = await fetch(firstUrl, { method: "HEAD" }).catch(() => null);
    const ct = probe?.headers.get("content-type") ?? null;
    const ext = extFromContentType(ct, firstUrl);
    const name = `thumbnail.${ext}`;
    const dest = path.join(assetDir, name);
    const ok = await downloadImage(firstUrl, dest);
    if (ok) thumbnail = `/article/${slug}/${name}`;

    // Remove the <img> tag for firstUrl from body (and any wrapping <figure>),
    // so the header <ArticleThumbnail> isn't duplicated by the body markdown.
    const escaped = firstUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body
      .replace(
        new RegExp(
          `<figure[^>]*>\\s*<img[^>]+src=["']${escaped}["'][^>]*>[\\s\\S]*?</figure>`,
          "g",
        ),
        "",
      )
      .replace(new RegExp(`<img[^>]+src=["']${escaped}["'][^>]*>`, "g"), "");
  }

  // 1b) Strip leading Medium boilerplate: photo credit + duplicate title
  //     repeated as heading or bold paragraph. Iterate until no more matches
  //     at the very top of the body.
  const STRIP_LEADING: RegExp[] = [
    /^\s*<figure[\s\S]*?<\/figure>/i,
    /^\s*<p[^>]*>\s*Photo by[\s\S]*?<\/p>/i,
    /^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i,
    /^\s*<p[^>]*>\s*<strong[^>]*>[\s\S]*?<\/strong>\s*<\/p>/i,
  ];
  {
    let changed = true;
    while (changed) {
      changed = false;
      for (const re of STRIP_LEADING) {
        const next = body.replace(re, "");
        if (next !== body) {
          body = next;
          changed = true;
        }
      }
    }
  }

  // 2) Localise the remaining image URLs in the body.
  for (let i = 1; i < imgUrls.length; i++) {
    const url = imgUrls[i];
    const probe = await fetch(url, { method: "HEAD" }).catch(() => null);
    const ct = probe?.headers.get("content-type") ?? null;
    const ext = extFromContentType(ct, url);
    const name = `img-${i}.${ext}`;
    const dest = path.join(assetDir, name);
    const ok = await downloadImage(url, dest);
    if (!ok) continue;
    body = body.split(url).join(`/article/${slug}/${name}`);
  }

  // HTML → Markdown
  const markdown = turndown.turndown(body).trim();
  if (markdown.length === 0) {
    console.warn(`  ! empty markdown body, skipping`);
    return;
  }

  const description = plainText(body).slice(0, 200);
  const tags = unwrap(item.category);

  const frontmatter = {
    title: item.title,
    description,
    thumbnail: thumbnail || "",
    createdAt: newDate,
    writer: WRITER,
    tag: tags,
    source: "medium",
    sourceUrl: item.link,
  };

  const fileContent = matter.stringify(`${markdown}\n`, frontmatter);
  await writeFile(mdPath, fileContent);
  console.error(`  ✓ wrote ${mdPath}`);
  await stat(mdPath);
}

async function main() {
  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(ASSET_ROOT, { recursive: true });

  console.error(`Fetching ${FEED_URL} …`);
  const res = await fetch(FEED_URL);
  if (!res.ok) {
    console.error(`Feed fetch failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);
  const items = unwrap(data?.rss?.channel?.item) as RssItem[];
  console.error(`Found ${items.length} items.`);
  for (const item of items) {
    await processItem(item);
  }
  console.error(`\nDone.`);
}

await main();
