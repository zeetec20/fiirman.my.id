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

export function detectCodeLanguage(code: string): string {
  const trimmed = (code || "").trim();
  if (!trimmed) return "text";

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
}
