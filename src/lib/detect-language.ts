/**
 * Smart Programming Language Detector
 *
 * Infers programming languages from code snippets based on structural syntax,
 * keywords, and signatures. Accurately distinguishes actual source code from
 * ASCII architecture diagrams, directory trees, and terminal output messages.
 */
export function detectCodeLanguage(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "text";

  // 1. Box drawing and directory trees -> Plain Text
  if (
    /[├└│─┌┐┘└┬┴▼▲◄►]/.test(trimmed) ||
    /^(src|dist|public|app)\/[\s\S]*?[/│]/.test(trimmed)
  ) {
    return "text";
  }

  // 2. Terminal error / CLI message outputs -> Plain Text
  if (/^[✖✔ℹ⚠]\s+[A-Z]/i.test(trimmed)) {
    return "text";
  }

  // 3. Shell / Terminal commands & scripts
  const shellCommands = [
    "bun",
    "bunx",
    "npm",
    "npx",
    "yarn",
    "pnpm",
    "git",
    "docker",
    "podman",
    "curl",
    "wget",
    "echo",
    "export",
    "chmod",
    "chown",
    "mkdir",
    "cd",
    "cat",
    "grep",
    "sed",
    "awk",
    "sudo",
    "systemctl",
    "wrangler",
    "cargo",
    "go",
  ];
  const firstWord = trimmed.split(/[\s\n]+/)[0]?.replace(/^[$#]\s*/, "");

  if (shellCommands.includes(firstWord)) {
    return "bash";
  }

  if (
    /^(#!\/bin\/(bash|sh|zsh)|protected=|branch=|\$\(|if\s*\[|while\s*read|case\s*\$|esac|done|echo\s*["'])/m.test(
      trimmed,
    )
  ) {
    return "bash";
  }

  // 4. JSON
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}
  }

  // 5. Dart / Flutter
  if (
    /import\s+['"]package:flutter|Future<|Widget\s+build|BuildContext|Isolate\.|compute\(/.test(
      trimmed,
    )
  ) {
    return "dart";
  }

  // 6. Go
  if (
    /package\s+\w+|func\s+\w+\(|func\s*\([^)]*\)\s*\w+\(|fmt\.Print/.test(
      trimmed,
    )
  ) {
    return "go";
  }

  // 7. Rust
  if (
    /fn\s+\w+\(|let\s+mut\s+|impl\s+|println!|pub\s+struct|use\s+std::/.test(
      trimmed,
    )
  ) {
    return "rust";
  }

  // 8. Python
  if (
    /def\s+\w+\s*\(|class\s+\w+\s*:|from\s+\w+\s+import|if\s+__name__\s*==\s*['"]__main__['"]|print\(/.test(
      trimmed,
    )
  ) {
    return "python";
  }

  // 9. SQL
  if (
    /\b(SELECT\s+.*?\s+FROM|INSERT\s+INTO|UPDATE\s+.*?\s+SET|DELETE\s+FROM|CREATE\s+TABLE)\b/i.test(
      trimmed,
    )
  ) {
    return "sql";
  }

  // 10. CSS
  if (
    /@import|@theme|@media|@keyframes|\.[a-zA-Z0-9_-]+\s*\{|[a-z-]+\s*:\s*[^;]+;/.test(
      trimmed,
    ) &&
    !/[=><;]/.test(firstWord)
  ) {
    return "css";
  }

  // 11. TypeScript vs JavaScript
  const hasTypeScriptKeywords =
    /\b(interface|type|enum|namespace|declare|as\s+[A-Z]\w*|:\s*(string|number|boolean|any|unknown|never|void|Record<|Array<|[A-Z]\w*\[\]))\b/.test(
      trimmed,
    );

  const hasJavaScriptKeywords =
    /\b(import\s+|export\s+|const\s+|let\s+|var\s+|function\s*\(?|async\s+|await\s+|return\s+|console\.(log|warn|error)|class\s+\w+|=>)\b/.test(
      trimmed,
    );

  if (hasTypeScriptKeywords) {
    return "typescript";
  }

  if (hasJavaScriptKeywords) {
    return "javascript";
  }

  return "text";
}
