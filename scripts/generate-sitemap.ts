import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Article } from "../src/data/articles";
import articlesManifest from "../src/data/articles-manifest.json";

const BASE_URL = "https://fiirman.my.id";

interface StaticRouteEntry {
  path: string;
  changefreq: "weekly" | "monthly";
  priority: string;
}

const STATIC_ROUTES: StaticRouteEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/articles", changefreq: "weekly", priority: "0.9" },
  { path: "/projects", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
];

const escapeXmlText = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const formatSitemapIsoDate = (dateString: string): string => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildSitemapXml = (articles: Article[]): string => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const staticUrlEntries = STATIC_ROUTES.map((route) => {
    const loc =
      route.path === "/" ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });
  const articleUrlEntries = articles.map((article) => {
    const articleLoc = `${BASE_URL}/articles/${article.slug}`;
    const lastmod = formatSitemapIsoDate(article.date);
    const ogImageLoc = `${BASE_URL}/og/articles/${article.slug}.png`;
    const escapedTitle = escapeXmlText(article.title);

    return `  <url>
    <loc>${articleLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${ogImageLoc}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticUrlEntries, ...articleUrlEntries].join("\n")}
</urlset>
`;
};

const generateSitemapFile = (): void => {
  const articles = articlesManifest as Article[];
  const sitemapXml = buildSitemapXml(articles);
  const outputPath = join(process.cwd(), "public", "sitemap.xml");

  writeFileSync(outputPath, sitemapXml, "utf-8");
  console.log(
    `Generated sitemap with ${STATIC_ROUTES.length + articles.length} URLs at ${outputPath}`,
  );
};

generateSitemapFile();
