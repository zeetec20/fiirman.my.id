import { Code2, Terminal } from "lucide-react";

interface LanguageIconProps {
  language: string;
  className?: string;
}

export function getLanguageDisplayName(lang: string): string {
  const normalized = (lang || "").toLowerCase().trim();
  switch (normalized) {
    case "go":
    case "golang":
      return "Go";
    case "rust":
    case "rs":
      return "Rust";
    case "typescript":
    case "ts":
      return "TypeScript";
    case "tsx":
      return "TypeScript (TSX)";
    case "javascript":
    case "js":
      return "JavaScript";
    case "jsx":
      return "JavaScript (JSX)";
    case "python":
    case "py":
      return "Python";
    case "cpp":
    case "c++":
      return "C++";
    case "c":
      return "C";
    case "sql":
    case "postgres":
    case "postgresql":
      return "PostgreSQL / SQL";
    case "mysql":
      return "MySQL";
    case "sqlite":
      return "SQLite";
    case "bash":
    case "sh":
    case "zsh":
    case "shell":
      return "Shell";
    case "json":
      return "JSON";
    case "yaml":
    case "yml":
      return "YAML";
    case "markdown":
    case "md":
      return "Markdown";
    case "html":
      return "HTML";
    case "css":
      return "CSS";
    case "docker":
    case "dockerfile":
      return "Dockerfile";
    case "graphql":
    case "gql":
      return "GraphQL";
    default:
      if (!lang) return "Code";
      return lang.length <= 4
        ? lang.toUpperCase()
        : lang.charAt(0).toUpperCase() + lang.slice(1);
  }
}

export function LanguageIcon({
  language,
  className = "w-3.5 h-3.5",
}: LanguageIconProps) {
  const normalized = (language || "").toLowerCase().trim();

  switch (normalized) {
    case "go":
    case "golang":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-[#00ADD8] dark:text-[#00ADD8]`}
          aria-hidden="true"
        >
          {/* Go Stylized Emblem */}
          <path
            fill="#00ADD8"
            d="M1.5 8.5h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5a1 1 0 011-1zm1.5 2v3h2v-3H3z"
          />
          <path
            fill="#00ADD8"
            d="M9 8.5h4.5a1 1 0 011 1v5a1 1 0 01-1 1H9a1 1 0 01-1-1v-5a1 1 0 011-1zm1.5 2v3h2v-1.5h-1v-1.5h2.5"
          />
          {/* Streamlines */}
          <path
            stroke="#00ADD8"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M16.5 9h6M15.5 12h7M17 15h5.5"
          />
        </svg>
      );

    case "rust":
    case "rs":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-[#DEA584] dark:text-[#DEA584]`}
          aria-hidden="true"
        >
          {/* Rust Gear / Cogwheel with R monogram */}
          <circle cx="12" cy="12" r="9.5" stroke="#DEA584" strokeWidth="1.6" />
          <circle
            cx="12"
            cy="12"
            r="7"
            stroke="#DEA584"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <path
            d="M9 7.5h3.5a2.5 2.5 0 012 4l2.5 5h-2l-2-4.5H10.8V16.5H9V7.5zm1.8 3.3h1.7a1.1 1.1 0 000-2.2h-1.7v2.2z"
            fill="#DEA584"
          />
        </svg>
      );

    case "typescript":
    case "ts":
    case "tsx":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${className} text-[#3178C6]`}
          aria-hidden="true"
        >
          <rect
            width="22"
            height="22"
            x="1"
            y="1"
            rx="3"
            fill="#3178C6"
            fillOpacity="0.18"
            stroke="#3178C6"
            strokeWidth="1.4"
          />
          <path
            fill="#3178C6"
            d="M5 9.5h6v1.8H8.8v6.2H7V11.3H5V9.5zm7.5 5.8c.4.5 1 .8 1.8.8.8 0 1.2-.4 1.2-.8 0-.5-.4-.7-1.4-1-1.3-.4-2.1-.9-2.1-2 0-1.2 1-2 2.4-2 1 0 1.8.4 2.3 1l-1 1.1c-.3-.4-.7-.6-1.3-.6-.6 0-1 .3-1 .7 0 .4.4.6 1.3.9 1.4.4 2.2.9 2.2 2.1 0 1.3-1 2.1-2.5 2.1-1.2 0-2.1-.5-2.6-1.3l1.1-1.1z"
          />
        </svg>
      );

    case "javascript":
    case "js":
    case "jsx":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${className} text-[#EAB308] dark:text-[#FACC15]`}
          aria-hidden="true"
        >
          <rect
            width="22"
            height="22"
            x="1"
            y="1"
            rx="3"
            fill="#FACC15"
            fillOpacity="0.18"
            stroke="#FACC15"
            strokeWidth="1.4"
          />
          <path
            fill="#EAB308"
            className="dark:fill-[#FACC15]"
            d="M8.5 9.5v5.3c0 1.2-.7 1.8-1.9 1.8-.7 0-1.3-.3-1.6-.7l1-1.1c.2.2.4.4.7.4.4 0 .6-.2.6-.7V9.5h1.2zm4.5 5.8c.4.5 1 .8 1.8.8.8 0 1.2-.4 1.2-.8 0-.5-.4-.7-1.4-1-1.3-.4-2.1-.9-2.1-2 0-1.2 1-2 2.4-2 1 0 1.8.4 2.3 1l-1 1.1c-.3-.4-.7-.6-1.3-.6-.6 0-1 .3-1 .7 0 .4.4.6 1.3.9 1.4.4 2.2.9 2.2 2.1 0 1.3-1 2.1-2.5 2.1-1.2 0-2.1-.5-2.6-1.3l1.1-1.1z"
          />
        </svg>
      );

    case "python":
    case "py":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Dual serpent motif */}
          <path
            d="M11.9 2c-3.1 0-4.9 1.3-4.9 3.8v2.2h5v.8H5.8c-2.5 0-4.3 1.6-4.3 4.2 0 2.7 1.7 4.2 4.3 4.2h1.6v-2.3c0-2.4 1.8-4.2 4.2-4.2h5v-.8c0-2.4-1.8-4.1-4.2-4.1h-.5zm-1.8 1.5a.8.8 0 110 1.6.8.8 0 010-1.6z"
            fill="#3776AB"
          />
          <path
            d="M12.1 22c3.1 0 4.9-1.3 4.9-3.8V16h-5v-.8h6.2c2.5 0 4.3-1.6 4.3-4.2 0-2.7-1.7-4.2-4.3-4.2h-1.6v2.3c0 2.4-1.8 4.2-4.2 4.2h-5v.8c0 2.4 1.8 4.1 4.2 4.1h.5zm1.8-1.5a.8.8 0 110-1.6.8.8 0 010 1.6z"
            fill="#FFD43B"
          />
        </svg>
      );

    case "cpp":
    case "c++":
    case "c":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-[#00599C] dark:text-[#60A5FA]`}
          aria-hidden="true"
        >
          {/* Hexagon shield with C++ text */}
          <path
            d="M12 2l8.5 4.9v9.8L12 21.6 3.5 16.7V6.9L12 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 9a3 3 0 00-3 3 3 3 0 003 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {normalized !== "c" && (
            <path
              d="M12.5 12h2.5M13.75 10.75v2.5M16.5 12h2.5M17.75 10.75v2.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )}
        </svg>
      );

    case "sql":
    case "postgres":
    case "postgresql":
    case "mysql":
    case "sqlite":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-[#336791] dark:text-[#38BDF8]`}
          aria-hidden="true"
        >
          {/* Database Stack Cylinder */}
          <ellipse
            cx="12"
            cy="5"
            rx="9"
            ry="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case "bash":
    case "sh":
    case "zsh":
    case "shell":
      return (
        <Terminal
          className={`${className} text-emerald-600 dark:text-emerald-400`}
          aria-hidden="true"
        />
      );

    case "json":
    case "yaml":
    case "yml":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-amber-600 dark:text-amber-400`}
          aria-hidden="true"
        >
          <path
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 4c-1.5 0-2.5 1-2.5 2.5V10c0 1-.8 1.8-1.5 2 0.7.2 1.5 1 1.5 2v3.5C5.5 19 6.5 20 8 20M16 4c1.5 0 2.5 1 2.5 2.5V10c0 1 .8 1.8 1.5 2-.7.2-1.5 1-1.5 2v3.5c0 1.5-1 2.5-2.5 2.5"
          />
        </svg>
      );

    case "markdown":
    case "md":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-stone-600 dark:text-stone-300`}
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="1.5" />
          <path
            d="M6 15V9l2.5 3L11 9v6M15 12l2 3 2-3M17 9v6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "docker":
    case "dockerfile":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${className} text-[#1D63ED] dark:text-[#60A5FA]`}
          aria-hidden="true"
        >
          <rect
            x="2"
            y="10"
            width="3"
            height="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="6"
            y="10"
            width="3"
            height="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="10"
            y="10"
            width="3"
            height="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="6"
            y="6"
            width="3"
            height="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="10"
            y="6"
            width="3"
            height="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M2 13.5c0 3.5 3 6.5 8 6.5 5.5 0 9-3 10-6.5-.5 0-2 .5-3 0 0-1 .5-2 1.5-2.5-1.5 0-3-.5-4-1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <Code2
          className={`${className} text-[var(--accent)]`}
          aria-hidden="true"
        />
      );
  }
}
