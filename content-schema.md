# Content Schema — Articles

All articles in `/content/**/*.md` share one normalized shape after sync. The runtime renderer only sees the normalized shape; sync scripts handle conversion.

---

## Normalized frontmatter (target shape)

```yaml
---
title: string                # required
description: string          # required, ≤160 chars, used for <meta description>
thumbnail: string            # required, path under /public, e.g. /article/<slug>/thumbnail.jpg
createdAt: string            # required, DD-MM-YYYY (non-ISO, parser must handle)
writer: string               # required, author slug (e.g. "zeetec20")
tag: string[]                # required, may be empty
source: "github" | "medium"  # required, where the article came from
sourceUrl?: string           # optional, original URL (Medium-only currently)
slug: string                 # derived from filename — not written, computed at load
---
```

Body: GitHub-flavored Markdown with inline HTML allowed (`<div>`, `<img>`, `<br/>`). Renderer must use `rehype-raw`.

---

## Source A — GitHub articles

Original shape at `zeetec20/zeetec20.github.io/articles/*.md`:

```yaml
---
title: What's git stash?
description: Git stash is one of features from Git Version Control...
thumbnail: /article/whats-git-stash/thumbnail.jpg
createdAt: 11-06-2023
writer: zeetec20
tag: [Git, Version Control, Tips and Trick]
---
```

Sync normalization (`scripts/sync-github.ts`):
- Pass through as-is.
- Add `source: github`.
- Asset paths already match `/article/<slug>/…` — no rewrite needed.

---

## Source B — Medium articles

Original: RSS at `https://medium.com/feed/@jusles363`. See `content-sources.md` for the full pipeline.

Normalization (`scripts/sync-medium.ts`):

| Normalized field | Derived from |
|---|---|
| `title` | `<title>` |
| `description` | First 160 plaintext chars of `<content:encoded>` |
| `thumbnail` | First `<img>` in body, downloaded to `/public/article/<slug>/thumbnail.<ext>` |
| `createdAt` | `<pubDate>` reformatted to `DD-MM-YYYY` |
| `writer` | Always `zeetec20` |
| `tag` | `<category>` elements |
| `source` | `"medium"` |
| `sourceUrl` | `<link>` |
| `slug` | Last path segment of `<link>`, minus Medium's trailing `-<hash>` |

Body: Medium HTML → Markdown via `turndown` + `turndown-plugin-gfm`. Inline images downloaded to `/public/article/<slug>/img-N.<ext>` and URLs rewritten.

---

## Zod schema (target)

To be written at `app/lib/article-schema.ts`. Single schema, union-friendly:

```ts
import { z } from "zod";

export const articleFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(220),
  thumbnail: z.string().startsWith("/"),
  createdAt: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
  writer: z.string().min(1),
  tag: z.array(z.string()).default([]),
  source: z.enum(["github", "medium"]),
  sourceUrl: z.string().url().optional(),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatter>;

export type Article = ArticleFrontmatter & {
  slug: string;
  body: string;
};
```

**Rule:** never duplicate this shape elsewhere. Always `z.infer` for TS types.

---

## Body conventions

- Code fences use language tags Shiki understands (`ts`, `tsx`, `bash`, `json`, `md`, `css`, `html`, `go`, `dart`, `yaml`, etc.).
- Images use HTML `<img>` (legacy GitHub articles) or Markdown `![]()` (Medium-derived). Both work via `rehype-raw`.
- Inline HTML wrappers (`<div align="middle">`) preserved as-is — styles target them via CSS, not by replacing them.
- No frontmatter beyond the fields above. Extra keys → drop in sync.

---

## What's NOT in scope

- No multilingual articles (no `lang`, no per-locale routing).
- No draft/published flag — if the file is in `/content`, it ships.
- No related-articles graph in frontmatter — derived from `tag` overlap at build time.
- No author table — single-author site, `writer` is metadata, not a route.
