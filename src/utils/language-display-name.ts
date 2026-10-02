/**
 * Human-readable label for a code fence language token.
 *
 * Lives outside `components/LanguageIcon.tsx` on purpose: a `.tsx` module that
 * exports both a component and a plain helper breaks Vite's Fast Refresh
 * boundary, so editing one forces a full reload and loses component state
 * (react-doctor/only-export-components).
 */
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