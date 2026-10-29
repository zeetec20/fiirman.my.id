import type { Article } from "@/data/articles";
import { bioData } from "@/data/bio";
import type { Project } from "@/data/projects";

export const formatSeoIsoDate = (dateString: string): string => {
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

export const buildWebsiteSeoSchema = () => {
  const sameAs = bioData.socials
    .filter((item) => item.url.startsWith("http"))
    .map((item) => item.url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://fiirman.my.id/#website",
        url: "https://fiirman.my.id",
        name: "Firman Lestari",
        description:
          "Personal space for Firman Lestari's thoughts, notes, projects",
        publisher: {
          "@id": "https://fiirman.my.id/#person",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "Person",
        "@id": "https://fiirman.my.id/#person",
        name: "Firman Justisio Lestari",
        alternateName: "Firman Lestari",
        url: "https://fiirman.my.id",
        image: "https://fiirman.my.id/images/author/avatar-480.webp",
        jobTitle: bioData.role,
        description: bioData.dek,
        knowsAbout: [
          "Software Engineering",
          "Distributed Systems",
          "TypeScript",
          "React",
          "Cloudflare Workers",
          "Full-Stack Development",
        ],
        sameAs,
      },
    ],
  };
};

export const buildAuthorPersonSeoSchema = () => {
  const sameAs = bioData.socials
    .filter((item) => item.url.startsWith("http"))
    .map((item) => item.url);

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://fiirman.my.id/about#profile",
    url: "https://fiirman.my.id/about",
    name: "About Firman Justisio Lestari",
    mainEntity: {
      "@type": "Person",
      "@id": "https://fiirman.my.id/#person",
      name: "Firman Justisio Lestari",
      alternateName: "Firman Lestari",
      jobTitle: bioData.role,
      description: bioData.dek,
      url: "https://fiirman.my.id",
      image: "https://fiirman.my.id/images/author/avatar-480.webp",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Banyuwangi",
        addressRegion: "East Java",
        addressCountry: "Indonesia",
      },
      knowsAbout: [
        "Software Engineering",
        "Full-Stack Development",
        "Modern TypeScript",
        "Runtimes & Tooling",
        "React",
        "Next.js",
        "Bun",
        "Cloudflare Workers",
      ],
      sameAs,
    },
  };
};

export const buildProjectsCollectionSeoSchema = (projects: Project[]) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://fiirman.my.id/projects#collection",
  url: "https://fiirman.my.id/projects",
  name: "Projects // Firman Lestari",
  description:
    "Curated engineering projects, distributed systems, open-source utilities, and developer tooling by Firman Lestari.",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => {
      const isSourceCode = Boolean(project.links.repo);
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": isSourceCode ? "SoftwareSourceCode" : "SoftwareApplication",
          name: project.title,
          description: project.summary,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          codeRepository: project.links.repo,
          url:
            project.links.demo ??
            project.links.repo ??
            "https://fiirman.my.id/projects",
          programmingLanguage: project.techStack.join(", "),
        },
      };
    }),
  },
});

export const buildArticlesArchiveSeoSchema = (articles: Article[]) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://fiirman.my.id/articles#collection",
  url: "https://fiirman.my.id/articles",
  name: "Writings Archive // Firman Lestari",
  description:
    "Archive of technical manuscripts, system architecture notes, and software engineering deep dives by Firman Lestari.",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://fiirman.my.id/articles/${article.slug}`,
      name: article.title,
    })),
  },
});

export const buildArticleFolioSeoSchema = (article: Article) => {
  const publishedDate = formatSeoIsoDate(article.date);
  const articleUrl = `https://fiirman.my.id/articles/${article.slug}`;
  const ogImageUrl = `https://fiirman.my.id/og/articles/${article.slug}.png?v=2`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${articleUrl}#article`,
        isPartOf: {
          "@id": "https://fiirman.my.id/#website",
        },
        headline: article.title,
        description: article.excerpt,
        image: ogImageUrl,
        datePublished: publishedDate,
        dateModified: publishedDate,
        mainEntityOfPage: articleUrl,
        author: {
          "@type": "Person",
          name: "Firman Justisio Lestari",
          url: "https://fiirman.my.id/about",
        },
        publisher: {
          "@type": "Person",
          name: "Firman Justisio Lestari",
          url: "https://fiirman.my.id",
        },
        keywords: article.tags.join(", "),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://fiirman.my.id",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: "https://fiirman.my.id/articles",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };
};
