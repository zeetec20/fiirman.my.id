<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules

## No em dashes

NEVER use the em dash character (Unicode U+2014). Applies to everything authored here: source, JSX/TS strings, comments, markdown content, frontmatter, README, commit messages, and agent replies in this repo.

Replace with, in order of preference:

- Rewrite the sentence: split into two, or drop the aside.
- Comma, colon, or parentheses where the dash set off a phrase.
- Plain hyphen `-` when nothing else reads well; for ranges use `-` or the word "to".

Exceptions: verbatim quotations that already contain the character (e.g. `src/data/quotes.ts`), vendored `.agents/skills/**`, and generated files (e.g. `src/data/articles-manifest.json`).
