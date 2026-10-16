import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const IGNORED_EXTENSIONS: Record<string, true> = {
  ".jpg": true,
  ".jpeg": true,
  ".png": true,
  ".webp": true,
  ".gif": true,
  ".ico": true,
  ".woff": true,
  ".woff2": true,
  ".ttf": true,
  ".eot": true,
  ".pdf": true,
  ".zip": true,
};

let files = process.argv.slice(2).filter(Boolean);
if (files.length === 0) {
  try {
    const staged = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
    if (staged.length > 0) {
      files = staged;
    } else {
      files = execSync("git ls-files", { encoding: "utf-8" })
        .trim()
        .split("\n")
        .filter(Boolean);
    }
  } catch {
    files = [];
  }
}

let hasError = false;

for (const file of files) {
  if (file.startsWith(".agents/skills/") || file === "skills-lock.json")
    continue;
  const dotIdx = file.lastIndexOf(".");
  if (dotIdx !== -1 && IGNORED_EXTENSIONS[file.slice(dotIdx)]) continue;
  try {
    if (!statSync(file).isFile()) continue;
  } catch {
    continue;
  }

  let content: string;
  try {
    content = readFileSync(file, "utf-8");
  } catch {
    continue;
  }

  const lines = content.split("\n");
  let inNextjsBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (file === "AGENTS.md") {
      if (line.includes("<!-- BEGIN:nextjs-agent-rules -->")) {
        inNextjsBlock = true;
        continue;
      }
      if (line.includes("<!-- END:nextjs-agent-rules -->")) {
        inNextjsBlock = false;
        continue;
      }
      if (inNextjsBlock) continue;
    }

    if (line.includes("\u2014")) {
      console.error(
        `Error: Em dash (U+2014) detected in ${file}:${i + 1}\n  ${line.trim()}`,
      );
      hasError = true;
    }
  }
}

if (hasError) {
  console.error(
    "\nEm dashes are prohibited. Please use hyphens, colons, or commas.",
  );
  process.exit(1);
}

process.exit(0);
