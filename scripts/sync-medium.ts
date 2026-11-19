#!/usr/bin/env bun
/**
 * Build-time Medium RSS Sync & Crawler.
 *
 * Automatically crawls https://medium.com/feed/@firmanlestari on build,
 * checks for newly published articles, downloads thumbnails & inline images,
 * generates WebP + responsive variants ([320, 480, 672, 768]w),
 * and writes each as a standalone Markdown file in content/articles/<slug>.md.
 *
 * Flags:
 *   --force        Force re-download and re-generation of all articles and images
 *   --slug <slug>  Only sync/repair a specific slug
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import sharp from "sharp";
import { detectCodeLanguage } from "../src/utils/code-detect";

const ROOT = path.resolve(import.meta.dir, "..");
const FEED_URL = "https://medium.com/feed/@firmanlestari";
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const PUBLIC_DIR = path.join(ROOT, "public", "article");
const RESPONSIVE_WIDTHS = [320, 480, 672, 768] as const;
const EMBEDS_MAP_PATH = path.join(ARTICLES_DIR, "medium-embeds.json");
const GISTS_CACHE_PATH = path.join(ROOT, "src", "data", "gists-cache.json");

const isForce = process.argv.includes("--force");
const targetSlugIdx = process.argv.indexOf("--slug");
const targetSlug =
  targetSlugIdx !== -1 ? process.argv[targetSlugIdx + 1] : undefined;

const loadMediumEmbedsMap = async (): Promise<Record<string, string>> => {
  if (!existsSync(EMBEDS_MAP_PATH)) return {};
  try {
    const raw = await readFile(EMBEDS_MAP_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveMediumEmbedsMap = async (
  map: Record<string, string>,
): Promise<void> => {
  try {
    await writeFile(
      EMBEDS_MAP_PATH,
      `${JSON.stringify(map, null, 2)}\n`,
      "utf-8",
    );
  } catch (err) {
    console.warn("  [sync-medium] Failed saving medium-embeds.json:", err);
  }
};

interface GistCacheFile {
  filename: string;
  language: string;
  content: string;
}

interface GistCacheEntry {
  id: string;
  description: string;
  owner: string;
  htmlUrl: string;
  files: GistCacheFile[];
}

const loadGistsCache = async (): Promise<Record<string, GistCacheEntry>> => {
  if (!existsSync(GISTS_CACHE_PATH)) return {};
  try {
    const raw = await readFile(GISTS_CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveGistsCache = async (
  cache: Record<string, GistCacheEntry>,
): Promise<void> => {
  try {
    await writeFile(
      GISTS_CACHE_PATH,
      `${JSON.stringify(cache, null, 2)}\n`,
      "utf-8",
    );
  } catch (err) {
    console.warn("  [sync-medium] Failed saving gists-cache.json:", err);
  }
};

const fetchAndCacheGitHubGist = async (gistUrl: string): Promise<void> => {
  const cleanUrl = gistUrl.trim().replace(/\/+$/, "");
  const gistId = cleanUrl.split("/").pop();
  if (!gistId) return;

  const currentCache = await loadGistsCache();
  if (currentCache[gistId] && !isForce) return;

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (fiirman-crawler/1.0)",
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!res.ok) {
      console.warn(
        `  [sync-medium] GitHub API HTTP ${res.status} for gist ${gistId}`,
      );
      return;
    }
    const data = (await res.json()) as {
      id: string;
      description?: string;
      html_url?: string;
      owner?: { login: string };
      files?: Record<
        string,
        { filename: string; language?: string; content?: string }
      >;
    };
    const files: GistCacheFile[] = Object.values(data.files || {}).map((f) => ({
      filename: f.filename,
      language: (f.language || "text").toLowerCase(),
      content: f.content || "",
    }));

    currentCache[gistId] = {
      id: data.id,
      description: data.description || "",
      owner: data.owner?.login || "zeetec20",
      htmlUrl: data.html_url || cleanUrl,
      files,
    };

    await saveGistsCache(currentCache);
    console.log(
      `  [sync-medium] Cached GitHub Gist ${gistId} (${files.length} file(s))`,
    );
  } catch (err) {
    console.warn(`  [sync-medium] Error caching gist ${gistId}:`, err);
  }
};

const resolveMediumEmbedUrl = async (
  mediaUrl: string,
  embedsMap: Record<string, string>,
): Promise<string> => {
  const cleanUrl = mediaUrl.trim();
  if (embedsMap[cleanUrl]) {
    return embedsMap[cleanUrl];
  }

  // 1. Try redirect resolution with manual redirect
  try {
    const res = await fetch(cleanUrl, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://medium.com/",
      },
    });
    const location = res.headers.get("location");
    if (location?.startsWith("http")) {
      embedsMap[cleanUrl] = location;
      await saveMediumEmbedsMap(embedsMap);
      console.log(
        `  [sync-medium] Resolved embed via redirect: ${cleanUrl} -> ${location}`,
      );
      return location;
    }
  } catch {
    // continue to fallback
  }

  // 2. Fallback: check zeetec20 public gists
  try {
    const gistsRes = await fetch(
      "https://api.github.com/users/zeetec20/gists",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (fiirman-crawler/1.0)",
          Accept: "application/vnd.github.v3+json",
        },
      },
    );
    if (gistsRes.ok) {
      const gists = (await gistsRes.json()) as Array<{
        id: string;
        html_url: string;
        description: string;
      }>;
      if (Array.isArray(gists) && gists.length > 0) {
        const mappedUrls = new Set(Object.values(embedsMap));
        const unmappedGist = gists.find((g) => !mappedUrls.has(g.html_url));
        if (unmappedGist) {
          embedsMap[cleanUrl] = unmappedGist.html_url;
          await saveMediumEmbedsMap(embedsMap);
          console.log(
            `  [sync-medium] Auto-matched Gist: ${cleanUrl} -> ${unmappedGist.html_url}`,
          );
          return unmappedGist.html_url;
        }
      }
    }
  } catch {
    // continue
  }

  console.warn(
    `  [sync-medium] Could not auto-resolve embed: ${cleanUrl}. Add mapping to content/articles/medium-embeds.json.`,
  );
  return cleanUrl;
};

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
  let md = html.replace(/\u00A0/g, " ").replace(/\u2014/g, " - ");

  // 1. Remove tracking pixel
  md = md.replace(/<img[^>]+stat\?event=[^>]+>/gi, "");

  // 2. Remove first hero figure (already captured in frontmatter thumbnail)
  md = md.replace(/^\s*<figure[^>]*>[\s\S]*?<\/figure>/i, "");

  // 3. Convert pre/code blocks BEFORE handling other tags
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    let cleanCode = code
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "$1")
      .replace(/<br\s*\/?>/gi, "\n");
    // Decode HTML entities
    cleanCode = decodeEntities(cleanCode);
    const lang = detectCodeLanguage(cleanCode.trim());
    const langTag = lang && lang !== "text" ? lang : "";
    return `\n\n\`\`\`${langTag}\n${cleanCode.trim()}\n\`\`\`\n\n`;
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
  md = md.replace(
    /<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi,
    (_, _t, text) => {
      const trimmed = text.trim();
      if (!trimmed) return "";
      const leading = text.startsWith(" ") ? " " : "";
      const trailing = text.endsWith(" ") ? " " : "";
      return `${leading}**${trimmed}**${trailing}`;
    },
  );
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

  // 6.5. Convert iframe embeds (such as Medium embeds or Gists) into standalone markdown links
  md = md.replace(
    /<iframe[^>]*>[\s\S]*?<a\s+[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/iframe>/gi,
    (_, href) => {
      const cleanHref = href.trim();
      return `\n\n[${cleanHref}](${cleanHref})\n\n`;
    },
  );
  md = md.replace(
    /<iframe[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/gi,
    (_, src) => {
      const cleanSrc = src.trim();
      if (!cleanSrc) return "";
      return `\n\n[${cleanSrc}](${cleanSrc})\n\n`;
    },
  );

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

  // 8. Remaining figures / images (preserve alt and figcaption)
  md = md.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (_, figContent) => {
    const srcMatch = figContent.match(/<img[^>]+src="([^">]+)"/i);
    if (!srcMatch) return "";
    const src = srcMatch[1];
    const altMatch = figContent.match(/<img[^>]+alt="([^"]*)"/i);
    const figcapMatch = figContent.match(
      /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
    );
    const rawAlt =
      (altMatch ? altMatch[1] : "") ||
      (figcapMatch ? stripHtml(figcapMatch[1]) : "");
    const altText = decodeEntities(rawAlt).trim();
    return `\n\n![${altText}](${src})\n\n`;
  });
  md = md.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (imgTag, src) => {
    const altMatch = imgTag.match(/alt="([^"]*)"/i);
    const altText = altMatch ? decodeEntities(altMatch[1]).trim() : "";
    return `\n\n![${altText}](${src})\n\n`;
  });

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

async function processImageVariants(
  buffer: Buffer,
  outputDir: string,
  baseName: string,
  preferredExt = "jpg",
): Promise<{ fileName: string; webpName: string }> {
  await mkdir(outputDir, { recursive: true });

  let ext = preferredExt;
  let isAnimated = false;
  try {
    const meta = await sharp(buffer).metadata();
    if (meta.format === "png") ext = "png";
    else if (meta.format === "jpeg") ext = "jpg";
    else if (meta.format === "webp") ext = "webp";
    else if (meta.format === "gif") {
      ext = "gif";
      isAnimated = true;
    }
  } catch {
    // fallback to preferredExt
  }

  const origFile = `${baseName}.${ext}`;
  const origPath = path.join(outputDir, origFile);
  if (!existsSync(origPath) || isForce) {
    await writeFile(origPath, buffer);
  }

  // Generate WebP full-size if not animated GIF
  const webpFile = `${baseName}.webp`;
  const webpPath = path.join(outputDir, webpFile);
  if ((!existsSync(webpPath) || isForce) && !isAnimated) {
    try {
      await sharp(buffer)
        .webp({ quality: 80, effort: 6, smartSubsample: true })
        .toFile(webpPath);
    } catch (err) {
      console.warn(`  [sync-medium] Could not generate ${webpFile}:`, err);
    }
  }

  // Generate responsive variants
  for (const width of RESPONSIVE_WIDTHS) {
    const variantFile = `${baseName}-${width}w.webp`;
    const variantPath = path.join(outputDir, variantFile);
    if ((!existsSync(variantPath) || isForce) && !isAnimated) {
      try {
        await sharp(buffer)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 78, effort: 6, smartSubsample: true })
          .toFile(variantPath);
      } catch (err) {
        console.warn(`  [sync-medium] Could not generate ${variantFile}:`, err);
      }
    }
  }

  return { fileName: origFile, webpName: webpFile };
}

async function downloadAndProcessImage(
  url: string,
  slug: string,
  baseName: string,
  preferredExt = "jpg",
): Promise<{ fileName: string; webpName: string } | null> {
  const dir = path.join(PUBLIC_DIR, slug);
  await mkdir(dir, { recursive: true });

  const possibleExts = ["jpg", "jpeg", "png", "webp", "gif"];
  const candidateNames = [
    baseName,
    baseName.replace(/^image(\d+)$/, "img-$1"),
    baseName.replace(/^image(\d+)$/, "image-$1"),
  ];

  let existingBuffer: Buffer | null = null;
  let existingExt = preferredExt;
  let matchedBaseName = baseName;

  for (const name of candidateNames) {
    for (const ext of possibleExts) {
      const candidate = path.join(dir, `${name}.${ext}`);
      if (existsSync(candidate)) {
        existingBuffer = await readFile(candidate);
        existingExt = ext;
        matchedBaseName = name;
        break;
      }
    }
    if (existingBuffer) break;
  }

  if (existingBuffer && !isForce) {
    return await processImageVariants(
      existingBuffer,
      dir,
      matchedBaseName,
      existingExt,
    );
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://medium.com/",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(
        `  [sync-medium] HTTP ${res.status} when downloading ${url}`,
      );
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return await processImageVariants(buffer, dir, baseName, preferredExt);
  } catch (err) {
    console.warn(`  [sync-medium] Error downloading image from ${url}:`, err);
    return null;
  }
}

async function repairExistingArticles(): Promise<void> {
  const files = (await readdir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    if (targetSlug && slug !== targetSlug) continue;

    const dir = path.join(PUBLIC_DIR, slug);
    if (!existsSync(dir)) continue;

    // 1. Repair thumbnail variants if thumbnail.* exists but webp variants do not
    const possibleExts = ["jpg", "jpeg", "png", "webp"];
    for (const ext of possibleExts) {
      const thumbPath = path.join(dir, `thumbnail.${ext}`);
      const webpPath = path.join(dir, "thumbnail.webp");
      const sampleVariant = path.join(dir, "thumbnail-320w.webp");

      if (
        existsSync(thumbPath) &&
        (!existsSync(webpPath) || !existsSync(sampleVariant) || isForce)
      ) {
        try {
          const buf = await readFile(thumbPath);
          await processImageVariants(buf, dir, "thumbnail", ext);
          console.log(
            `  [sync-medium] Repaired thumbnail variants for '${slug}'`,
          );
        } catch (err) {
          console.warn(
            `  [sync-medium] Failed repairing thumbnail for '${slug}':`,
            err,
          );
        }
        break;
      }
    }

    // 2. Check if the markdown file contains remote Medium CDN images and download them
    const mdPath = path.join(ARTICLES_DIR, file);
    let mdContent = await readFile(mdPath, "utf-8");
    const mediumImgRegex =
      /!\[(.*?)\]\((https:\/\/cdn-images-1\.medium\.com\/[^)]+)\)/g;
    const mediumImgMatches = [...mdContent.matchAll(mediumImgRegex)];

    if (mediumImgMatches.length > 0) {
      let idx = 1;
      let updated = false;
      for (const match of mediumImgMatches) {
        const fullMatch = match[0];
        const altText = match[1];
        const remoteUrl = match[2];
        const baseName = `image${idx++}`;

        const res = await downloadAndProcessImage(
          remoteUrl,
          slug,
          baseName,
          "png",
        );
        if (res) {
          const localPath = `/article/${slug}/${res.fileName}`;
          mdContent = mdContent.replace(
            fullMatch,
            `![${altText}](${localPath})`,
          );
          updated = true;
          console.log(
            `  [sync-medium] Repaired inline image in '${file}' -> ${localPath}`,
          );
        }
      }

      if (updated) {
        await writeFile(mdPath, mdContent, "utf-8");
      }
    }

    // 3. Check for untagged or text code blocks in existing markdown
    let codeUpdated = false;
    mdContent = mdContent.replace(
      /```([a-zA-Z0-9_\-:]*)\r?\n([\s\S]*?)```/g,
      (match, currentLang, code) => {
        const trimmedLang = currentLang.trim();
        if (!trimmedLang || trimmedLang === "text") {
          const detected = detectCodeLanguage(code.trim());
          if (detected && detected !== "text") {
            codeUpdated = true;
            return `\`\`\`${detected}\n${code}\`\`\``;
          }
        }
        return match;
      },
    );

    if (codeUpdated) {
      await writeFile(mdPath, mdContent, "utf-8");
      console.log(
        `  [sync-medium] Backfilled code block languages in '${file}'`,
      );
    }

    // 4. Check for medium.com/media links in existing markdown and resolve them
    const mediumMediaRegex =
      /\[(?:https?:\/\/[^\]]+)?\]\((https:\/\/medium\.com\/media\/[a-f0-9]+\/href)\)/g;
    const mediaMatches = [...mdContent.matchAll(mediumMediaRegex)];
    if (mediaMatches.length > 0) {
      let mediaUpdated = false;
      const embedsMap = await loadMediumEmbedsMap();
      for (const match of mediaMatches) {
        const fullMatch = match[0];
        const mediaUrl = match[1];
        const resolvedUrl = await resolveMediumEmbedUrl(mediaUrl, embedsMap);
        if (resolvedUrl && resolvedUrl !== mediaUrl) {
          mdContent = mdContent.replace(
            fullMatch,
            `[${resolvedUrl}](${resolvedUrl})`,
          );
          mediaUpdated = true;
          if (resolvedUrl.includes("gist.github.com/")) {
            await fetchAndCacheGitHubGist(resolvedUrl);
          }
          console.log(
            `  [sync-medium] Repaired media embed in '${file}' -> ${resolvedUrl}`,
          );
        }
      }
      if (mediaUpdated) {
        await writeFile(mdPath, mdContent, "utf-8");
      }
    }

    // 5. Pre-cache any GitHub Gists present in existing markdown
    const gistRegex =
      /https:\/\/gist\.github\.com\/[a-zA-Z0-9_-]+\/([a-f0-9]+)/g;
    const gistMatches = [...mdContent.matchAll(gistRegex)];
    for (const match of gistMatches) {
      await fetchAndCacheGitHubGist(match[0]);
    }
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
      await repairExistingArticles();
      await generateArticlesManifest();
      return;
    }
    xml = await res.text();
  } catch (err) {
    console.warn(
      "[sync-medium] Offline or network error while fetching Medium feed. Skipping sync:",
      err,
    );
    await repairExistingArticles();
    await generateArticlesManifest();
    return;
  }

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  if (items.length === 0) {
    console.log("[sync-medium] No articles found in Medium feed.");
    await repairExistingArticles();
    await generateArticlesManifest();
    return;
  }

  let newCount = 0;

  for (const item of items) {
    const rawLink = String(item.link || "").split("?")[0];
    const rawSlug = rawLink.split("/").pop() || "";
    const slug = rawSlug.replace(/-[a-f0-9]{12}$/i, "").toLowerCase();

    if (!slug) continue;
    if (targetSlug && slug !== targetSlug) continue;

    const mdPath = path.join(ARTICLES_DIR, `${slug}.md`);

    // Deduplication check: if markdown file already exists and not force, skip creation
    if (existsSync(mdPath) && !isForce) {
      console.log(
        `  [sync-medium] '${slug}.md' already indexed (verifying assets...)`,
      );
      continue;
    }

    console.log(
      `  [sync-medium] Processing article: "${item.title}" (${slug})`,
    );

    const contentEncoded = String(item["content:encoded"] || "");

    // 1. Process cover image
    const imgMatch = contentEncoded.match(/<img[^>]+src="([^">]+)"/);
    let coverImage = "";
    if (imgMatch && !imgMatch[1].includes("/_/stat")) {
      const res = await downloadAndProcessImage(
        imgMatch[1],
        slug,
        "thumbnail",
        "jpg",
      );
      if (res) {
        coverImage = `/article/${slug}/${res.fileName}`;
      } else {
        coverImage = imgMatch[1];
      }
    }

    // 2. Process inline images
    const processedHtml = contentEncoded;
    const heroFigMatch = processedHtml.match(/^\s*<figure>[\s\S]*?<\/figure>/i);
    const heroFig = heroFigMatch ? heroFigMatch[0] : "";
    let bodyHtml = heroFig
      ? processedHtml.slice(heroFig.length)
      : processedHtml;

    const inlineImgMatches = [
      ...bodyHtml.matchAll(/<img[^>]+src="([^">]+)"/gi),
    ];
    let inlineIdx = 1;
    for (const match of inlineImgMatches) {
      const imgUrl = match[1];
      if (imgUrl.includes("/_/stat")) continue;
      const baseName = `image${inlineIdx++}`;
      const res = await downloadAndProcessImage(imgUrl, slug, baseName, "png");
      if (res) {
        const localPath = `/article/${slug}/${res.fileName}`;
        bodyHtml = bodyHtml.replaceAll(imgUrl, localPath);
      }
    }

    // 3. Process Medium media embeds
    const embedsMap = await loadMediumEmbedsMap();
    const mediaMatches = [
      ...bodyHtml.matchAll(/https:\/\/medium\.com\/media\/[a-f0-9]+\/href/gi),
    ];
    for (const match of mediaMatches) {
      const mediaUrl = match[0];
      const resolvedUrl = await resolveMediumEmbedUrl(mediaUrl, embedsMap);
      if (resolvedUrl && resolvedUrl !== mediaUrl) {
        bodyHtml = bodyHtml.replaceAll(mediaUrl, resolvedUrl);
        if (resolvedUrl.includes("gist.github.com/")) {
          await fetchAndCacheGitHubGist(resolvedUrl);
        }
      }
    }

    const finalHtml = heroFig + bodyHtml;

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
    const markdownBody = htmlToMarkdown(finalHtml, item.title);

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
    console.log(`  [sync-medium] Created/Updated content/articles/${slug}.md`);
    newCount++;
  }

  // Repair any existing articles that are missing variants or have remote images
  await repairExistingArticles();

  if (newCount > 0) {
    console.log(
      `[sync-medium] Successfully synced ${newCount} article(s) to content/articles/.`,
    );
  } else {
    console.log(
      "[sync-medium] All Medium articles are indexed. Verified all asset variants.",
    );
  }

  await generateArticlesManifest();
}

async function generateArticlesManifest() {
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
    const slug =
      (typeof data.slug === "string" ? data.slug : filenameSlug) || "";
    const paragraphs = content.split("\n\n").map((p) => p.trim());
    const firstParagraph =
      paragraphs.find((p) => p && !p.startsWith("#") && !p.startsWith("!")) ||
      "";
    const lead = (
      firstParagraph || (typeof data.excerpt === "string" ? data.excerpt : "")
    )
      .replace(/\u00A0/g, " ")
      .replace(/\u2014/g, " - ");

    manifest.push({
      slug,
      docId:
        typeof data.docId === "string"
          ? data.docId
          : `FOLIO-${slug.toUpperCase()}`,
      title:
        typeof data.title === "string" ? data.title : "Untitled Manuscript",
      coverImage:
        typeof data.coverImage === "string"
          ? data.coverImage.replace(/\.(jpe?g|png)$/i, ".webp")
          : "",
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
  try {
    const { execSync } = await import("node:child_process");
    execSync(`bunx biome format --write "${manifestPath}"`, {
      stdio: "ignore",
    });
  } catch {
    // Ignore format errors if biome is not in environment
  }
  console.log(
    `[sync-medium] Generated lightweight articles manifest at ${manifestPath} (${manifest.length} articles).`,
  );
}

await main();
