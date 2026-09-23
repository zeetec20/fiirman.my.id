export interface Project {
  id: string;
  code: string;
  title: string;
  badge:
    | "PRODUCTION"
    | "ACTIVE R&D"
    | "OPEN SOURCE"
    | "ARCHIVED"
    | "DEVELOPER TOOLS";
  year: string;
  category: "Systems" | "Infrastructure" | "Database" | "Developer Tools";
  image: string;
  imageAlt: string;
  summary: string;
  architecture: string;
  techStack: string[];
  links: {
    repo?: string;
    demo?: string;
    docs?: string;
  };
  featured?: boolean;
}

export const projectsData: Project[] = [
  {
    id: "lorem-showcase",
    code: "PRJ-001-LREM",
    title: "Lorem Ipsum Dolor Sit Amet Consectetur",
    badge: "PRODUCTION",
    year: "2025 — 2026",
    category: "Systems",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Lorem ipsum dolor sit amet",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    architecture:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    techStack: ["Lorem", "Ipsum", "Dolor", "Sit", "Amet"],
    links: {
      repo: "https://github.com",
      demo: "https://example.com",
    },
  },
];
