import { hljs } from "@/utils/highlight";

const SUBSET_LANGUAGES = [
  "bash",
  "yaml",
  "typescript",
  "javascript",
  "json",
  "css",
  "html",
  "dart",
  "go",
  "python",
  "sql",
  "dockerfile",
];

export const detectLanguageFromFilename = (
  filename?: string,
): string | null => {
  if (!filename) return null;
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === filename.length - 1) return null;
  const ext = filename
    .slice(dotIndex + 1)
    .toLowerCase()
    .trim();

  switch (ext) {
    case "txt":
    case "text":
      return "text";
    case "ts":
      return "typescript";
    case "tsx":
      return "tsx";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "jsx":
      return "jsx";
    case "py":
      return "python";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "json":
      return "json";
    case "yaml":
    case "yml":
      return "yaml";
    case "sql":
      return "sql";
    case "sh":
    case "bash":
    case "zsh":
      return "bash";
    case "md":
    case "markdown":
      return "markdown";
    case "html":
      return "html";
    case "css":
      return "css";
    case "dart":
      return "dart";
    case "dockerfile":
      return "dockerfile";
    default:
      return null;
  }
};

export const detectCodeLanguage = (code: string): string => {
  const trimmed = (code || "").trim();
  if (!trimmed) return "text";

  // 0. ASCII tables or plain text box art (e.g. +---+ or | ... |)
  if (
    /^\s*\+[-+]+\+\s*$/m.test(trimmed) ||
    (/^\s*\|.*\|\s*$/m.test(trimmed) && /^\s*[-+|]{3,}\s*$/m.test(trimmed)) ||
    /^\s*[┌├└].*[┐┤┘]/m.test(trimmed)
  ) {
    return "text";
  }

  // 1. JavaScript / TypeScript
  if (
    /^(import\s+[\s\S]*?from|export\s+(default|const|let|function|interface|type)|const\s+\w+\s*=|let\s+\w+\s*=|function\s+\w+\s*\(|console\.(log|warn|error))/m.test(
      trimmed,
    )
  ) {
    if (
      trimmed.includes("interface ") ||
      trimmed.includes("type ") ||
      /:\s*(string|number|boolean|Record<|Array<|void|Promise<)/.test(trimmed)
    ) {
      return "typescript";
    }
    return "javascript";
  }

  // 2. YAML (key: value structure, list items)
  if (
    /^[a-zA-Z0-9_-]+:\s*(\n|$)/m.test(trimmed) &&
    (trimmed.includes("  ") || trimmed.includes("- "))
  ) {
    return "yaml";
  }

  // 3. JSON
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}
  }

  // 4. Shell / Bash / CLI
  if (
    /^(npm|bun|pnpm|yarn|brew|git|curl|wget|lazygit|docker|cargo|npx|bunx)\s/m.test(
      trimmed,
    )
  ) {
    return "bash";
  }
  if (/^[#$]\s+[a-z]/m.test(trimmed)) {
    return "bash";
  }
  if (
    /^\s*(if\s+\[|case\s+|while\s+|for\s+.*in|export\s+|chmod\s+|chown\s+|exit\s+\d)/m.test(
      trimmed,
    )
  ) {
    return "bash";
  }
  if (
    trimmed.includes("git config") ||
    trimmed.includes("--global") ||
    trimmed.includes("| less") ||
    trimmed.includes("lazygit --")
  ) {
    return "bash";
  }

  // 5. Dart
  if (
    trimmed.includes("Future<") ||
    trimmed.includes("Future.wait") ||
    trimmed.includes("Isolate.") ||
    trimmed.includes("void main()")
  ) {
    return "dart";
  }

  // 6. Highlight.js auto-detect on curated subset
  try {
    const res = hljs.highlightAuto(trimmed, SUBSET_LANGUAGES);
    if (res.relevance > 4 && res.language) {
      return res.language;
    }
  } catch {}

  return "text";
};
