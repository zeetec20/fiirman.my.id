export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  dossierRef: string;
  summary: string;
  achievements: string[];
  techStack: string[];
}

export interface SkillCategory {
  title: string;
  classification: string;
  skills: { name: string; level: string; note?: string }[];
}

export interface SocialLinkItem {
  name: string;
  label: string;
  url: string;
  handle: string;
}

export interface BioData {
  name: string;
  role: string;
  specialization: string;
  dossierRef: string;
  status: string;
  location: string;
  pgpFingerprint: string;
  avatar: string;
  avatar240: string;
  monogram: string;
  sealText: string;
  dek: string;
  narrative: {
    intro: string;
    background: string;
    philosophy: string;
  };
  experience: ExperienceItem[];
  competencies: SkillCategory[];
  socials: SocialLinkItem[];
}

export const bioData: BioData = {
  name: "FIRMAN JUSTISIO LESTARI",
  role: "Software Engineer",
  specialization:
    "Full-Stack Development, Modern TypeScript, Runtimes & Tooling",
  dossierRef: "DOS-8804-ENG",
  status: "SYSTEMS OPERATIONAL // ACTIVE",
  location: "Banyuwangi, East Java, Indonesia (UTC+7)",
  pgpFingerprint: "8B4F 992A 1C03 EE72 63A0 78F1 D04B 5429 883E 007C",
  avatar: "https://avatars.githubusercontent.com/u/47957217?size=480",
  avatar240: "https://avatars.githubusercontent.com/u/47957217?size=240",
  monogram: "FL",
  sealText: "FIRMAN LESTARI · ZEETEC20",
  dek: "Firman Justisio Lestari is a curious person who became a software engineer, with interests far beyond tech and always exploring nerdy ideas and random deep dives.",
  narrative: {
    intro:
      "Four years at the trade. JavaScript and TypeScript across both ends of the wire, now mostly grounded in React and the modern frameworks built around it Vite and Next.js.",
    background:
      "On the backend, newer ground tends to win the attention: Strapi, Bun, Hono. The occasional excursion into Rust. Unopinionated frameworks suit better than rigid ones the freedom to reach for the right library for the right shape of work matters more than convention.",
    philosophy:
      "What draws the work forward: scalable, maintainable systems; a better developer experience for the next hands on the keys; and software that earns its place by what it lets people do.",
  },
  experience: [
    {
      period: "2022 — PRESENT",
      role: "Software Engineer",
      company: "Independent & Distributed Engineering",
      location: "Banyuwangi, Indonesia",
      dossierRef: "EXP-2022-01",
      summary:
        "Developing high-reliability web applications, APIs, and developer tooling across the modern JavaScript and TypeScript ecosystem.",
      achievements: [
        "Architected performant full-stack systems using React, Vite, TanStack Router, Bun, Hono, and Cloudflare Workers.",
        "Engineered idempotent event processing and job queues with BullMQ and Redis to eliminate duplicate executions.",
        "Automated branch protection rules and CI/CD pipelines with GitHub Actions without requiring enterprise plan upgrades.",
      ],
      techStack: [
        "TypeScript",
        "React",
        "TanStack Start",
        "Bun",
        "Hono",
        "Redis",
        "BullMQ",
        "PostgreSQL",
      ],
    },
    {
      period: "2020 — 2022",
      role: "Frontend & Mobile Developer",
      company: "Software Development Craft",
      location: "Indonesia",
      dossierRef: "EXP-2020-02",
      summary:
        "Built responsive web interfaces and cross-platform mobile applications focusing on asynchronous concurrency and fluid user interfaces.",
      achievements: [
        "Constructed concurrent task workflows in Flutter/Dart to optimize asynchronous UI rendering.",
        "Authored developer guides on CSS mathematical functions (min, max, clamp) and advanced TypeScript type manipulation.",
      ],
      techStack: [
        "Flutter",
        "Dart",
        "JavaScript",
        "HTML/CSS",
        "Git",
        "REST APIs",
      ],
    },
  ],
  competencies: [
    {
      title: "PROGRAMMING LANGUAGES",
      classification: "DOMAIN I",
      skills: [
        { name: "JavaScript", level: "Language", note: "ESNext / Modern Web" },
        {
          name: "TypeScript",
          level: "Language",
          note: "Type Systems & Generics",
        },
        { name: "PHP", level: "Language", note: "Backend & Modern PHP" },
        { name: "Dart", level: "Language", note: "Client & Mobile Engines" },
        { name: "Python", level: "Language", note: "Scripting & Automation" },
        { name: "Go", level: "Language", note: "Concurrency & Systems" },
        { name: "Kotlin", level: "Language", note: "Mobile & Modern JVM" },
      ],
    },
    {
      title: "FRAMEWORKS & LIBRARIES",
      classification: "DOMAIN II",
      skills: [
        { name: "Django", level: "Framework", note: "Python Web Framework" },
        { name: "Strapi", level: "Headless CMS", note: "Content APIs" },
        {
          name: "Next.js",
          level: "Framework",
          note: "React Server & App Router",
        },
        { name: "React.js", level: "Library", note: "Component Primitives" },
        { name: "Vite", level: "Tooling", note: "Bundler & Dev Server" },
        {
          name: "Laravel",
          level: "Framework",
          note: "PHP Application Framework",
        },
        {
          name: "Express.js",
          level: "Framework",
          note: "Node.js Microservices",
        },
        {
          name: "React Native",
          level: "Framework",
          note: "Cross-Platform Mobile",
        },
        {
          name: "Refine",
          level: "Framework",
          note: "Enterprise Internal Tools",
        },
      ],
    },
    {
      title: "DEVELOPMENT TOOLS",
      classification: "DOMAIN III",
      skills: [
        {
          name: "Neovim (NVim)",
          level: "Editor",
          note: "Terminal Workspace & Lua",
        },
        { name: "Kitty", level: "Terminal", note: "GPU-Accelerated Emulator" },
        {
          name: "Podman",
          level: "Containers",
          note: "Daemonless Containerization",
        },
        {
          name: "GitHub",
          level: "VCS & CI/CD",
          note: "Actions, Workflows & Registry",
        },
        {
          name: "Claude",
          level: "AI Agent",
          note: "Claude Code & Anthropic AI",
        },
        {
          name: "Antigravity",
          level: "AI Engine",
          note: "Agentic Engineering Platform",
        },
      ],
    },
  ],
  socials: [
    {
      name: "GitHub",
      label: "GitHub",
      url: "https://github.com/zeetec20",
      handle: "@zeetec20",
    },
    {
      name: "LinkedIn",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/firmanlestari",
      handle: "firmanlestari",
    },
    {
      name: "Medium",
      label: "Medium",
      url: "https://firmanlestari.medium.com",
      handle: "@firmanlestari",
    },
    {
      name: "Email",
      label: "Email",
      url: "mailto:jusles363@gmail.com",
      handle: "jusles363@gmail.com",
    },
  ],
};
