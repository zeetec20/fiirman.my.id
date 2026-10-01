import { parseFrontmatter } from "./articles";

export interface Project {
  id: string;
  code: string;
  title: string;
  badge:
    | "PRODUCTION"
    | "ACTIVE R&D"
    | "OPEN SOURCE"
    | "ARCHIVED"
    | "DEVELOPER TOOLS"
    | string;
  year: string;
  category:
    | "Systems"
    | "Infrastructure"
    | "Database"
    | "Developer Tools"
    | string;
  image: string;
  imageAlt: string;
  summary: string;
  content: string;
  architecture?: string;
  techStack: string[];
  links: {
    repo?: string;
    demo?: string;
    docs?: string;
  };
  featured?: boolean;
  order?: number;
}

// Vite glob import of all project markdown files (eagerly bundled for synchronous rendering)
const rawProjectModules = import.meta.glob<string>(
  "../../content/projects/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

function extractSummary(content: string): string {
  const firstPara = content.split("\n\n")[0] || "";
  return firstPara
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .trim();
}

function loadProjects(): Project[] {
  const projects: Project[] = [];

  for (const [filePath, rawContent] of Object.entries(rawProjectModules)) {
    const filenameSlug = filePath.split("/").pop()?.replace(/\.md$/, "") || "";
    const { data, content } = parseFrontmatter(rawContent);

    const id = String(data.id || filenameSlug);
    const code = String(data.code || `PRJ-${id.toUpperCase()}`);
    const title = String(data.title || filenameSlug);
    const badge = String(data.badge || "PRODUCTION") as Project["badge"];
    const year = String(data.year || new Date().getFullYear().toString());
    const category = String(data.category || "Systems") as Project["category"];
    const image = String(data.image || "");
    const imageAlt = String(data.imageAlt || title);
    const architecture = String(data.architecture || "");
    const techStack = Array.isArray(data.techStack)
      ? (data.techStack as string[])
      : typeof data.techStack === "string"
        ? (data.techStack as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const demo =
      typeof data.demo === "string" && data.demo.trim()
        ? data.demo.trim()
        : undefined;
    const repo =
      typeof data.repo === "string" && data.repo.trim()
        ? data.repo.trim()
        : undefined;
    const docs =
      typeof data.docs === "string" && data.docs.trim()
        ? data.docs.trim()
        : undefined;

    const featured = data.featured === true || data.featured === "true";
    const rawOrder = data.order;
    const orderNum =
      typeof rawOrder === "number"
        ? rawOrder
        : Number.parseInt(String(rawOrder || 999), 10);
    const order = Number.isNaN(orderNum) ? 999 : orderNum;

    const summary =
      typeof data.summary === "string" && data.summary.trim()
        ? data.summary.trim()
        : extractSummary(content);

    projects.push({
      id,
      code,
      title,
      badge,
      year,
      category,
      image,
      imageAlt,
      summary,
      content,
      architecture,
      techStack,
      links: {
        demo,
        repo,
        docs,
      },
      featured,
      order,
    });
  }

  // Sort by order ascending, then by year descending
  projects.sort((a, b) => {
    if ((a.order ?? 999) !== (b.order ?? 999)) {
      return (a.order ?? 999) - (b.order ?? 999);
    }
    return b.year.localeCompare(a.year);
  });

  return projects;
}

export const projectsData: Project[] = loadProjects();
