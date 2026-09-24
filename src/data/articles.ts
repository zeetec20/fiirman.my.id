export interface ArticleHeading {
  id: string;
  title: string;
  level: number;
}

export interface Article {
  slug: string;
  docId: string;
  title: string;
  coverImage: string;
  date: string;
  readingTime: string;
  category?: "Systems" | "Architecture" | "DevOps" | "Reflections";
  tags: string[];
  excerpt: string;
  lead?: string;
  content: string;
  headings: ArticleHeading[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(markdown: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawTitle = match[2].trim();
      const title = rawTitle
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`#]/g, "")
        .trim();
      const id = slugify(title);
      headings.push({ id, title, level });
    }
  }
  return headings;
}

export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw.trim() };
  }

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

  return { data, content };
}

import articlesManifest from "./articles-manifest.json";

export const articlesData: Article[] = articlesManifest as Article[];

const rawArticleLoaders = import.meta.glob<string>(
  "../../content/articles/*.md",
  {
    query: "?raw",
    import: "default",
  },
);

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const summary = articlesData.find((a) => a.slug === slug);
  if (!summary) return undefined;

  for (const [filePath, loader] of Object.entries(rawArticleLoaders)) {
    const filenameSlug = filePath.split("/").pop()?.replace(/\.md$/, "");
    if (filenameSlug === slug) {
      const rawContent = await loader();
      const { content } = parseFrontmatter(rawContent);
      const headings = extractHeadings(content);
      return {
        ...summary,
        content,
        headings,
      };
    }
  }

  return summary;
}
