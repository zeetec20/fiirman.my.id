---
id: obsidian-todo
code: PRJ-003-OTDO
title: "otodo: Obsidian Vault TODO Manager & Homebrew TUI"
badge: OPEN SOURCE
year: "2026"
category: Developer Tools
featured: false
image: "/images/obsidian-todo-mockup.webp"
imageAlt: "otodo terminal UI listing Obsidian TODO.md tasks grouped by category with status badges and due dates"
techStack:
  - TypeScript
  - Bun
  - OpenTUI
  - React 19
  - Homebrew
demo: "https://github.com/zeetec20/obsidian-todo/releases"
repo: "https://github.com/zeetec20/obsidian-todo"
docs: ""
order: 3
---

otodo is a terminal UI and CLI for the `TODO.md` files already sitting in an Obsidian vault. It walks the vault for `TODO.md` files, treats each parent folder as a category, and round-trips the tasks inside them, so create, edit, filter, and delete all rewrite the markdown in place and nothing lands in a separate database. Filters cover status, tag, category, and due date, tasks carry `backlog | todo | doing | review | done` states with due and created timestamps, and `otodo list --json` exposes the same data to scripts.

> **ARCHITECTURAL DISPATCH**
> The `TODO.md` file is the database: the parser round-trips markdown blocks with unknown metadata keys preserved, so manual Obsidian edits and TUI edits coexist. Homebrew ships a self-contained Bun binary per architecture, built on native runners in CI because OpenTUI loads per-platform FFI packages.
