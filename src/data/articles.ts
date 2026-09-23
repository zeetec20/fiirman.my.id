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

function loadAllArticles(): Article[] {
  const rawModules = import.meta.glob<string>("../../content/articles/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const articles: Article[] = [];

  for (const [filePath, rawContent] of Object.entries(rawModules)) {
    const { data, content } = parseFrontmatter(rawContent);

    // Fallback slug from filename
    const filenameSlug = filePath.split("/").pop()?.replace(/\.md$/, "");
    const slug =
      (typeof data.slug === "string" ? data.slug : filenameSlug) || "";

    // Extract lead (first non-empty paragraph before the first heading)
    const paragraphs = content.split("\n\n").map((p) => p.trim());
    const firstParagraph =
      paragraphs.find((p) => p && !p.startsWith("#") && !p.startsWith("!")) ||
      "";
    const lead =
      firstParagraph || (typeof data.excerpt === "string" ? data.excerpt : "");

    const headings = extractHeadings(content);

    const article: Article = {
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
      content,
      headings,
    };

    articles.push(article);
  }

  // Sort articles chronologically descending (newest first)
  articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
      return dateB - dateA;
    }
    return b.docId.localeCompare(a.docId);
  });

  return articles;
}

export const articlesData: Article[] = loadAllArticles();
