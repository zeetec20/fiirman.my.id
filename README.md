# Firman Lestari — Folios & Marginalia

Personal portfolio + writing notebook of Firman Lestari (`zeetec20`). Articles sourced from a GitHub repo and Medium RSS, rendered at build/SSR. Deployed on Cloudflare Workers via TanStack Start.

Live: [fiirman.my.id](https://fiirman.my.id)

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Bun ≥ 1.2 |
| Framework | TanStack Start (Nitro Cloudflare preset) |
| Router | TanStack Router (file-based, fully typed) |
| Server state | TanStack Query |
| Styling | Tailwind CSS v4 (CSS-first `@theme` block in `src/styles.css`) |
| Components | shadcn/ui (pulled via shadcn MCP — never pasted from memory) |
| Markdown | `react-markdown` + `rehype-raw` + `remark-gfm` |
| Syntax highlight | Shiki via `@shikijs/rehype` (build/SSR-time only) |
| Validation | Zod |
| Analytics | Supabase RPC (`track_analytic` / `get_analytics`) — dynamic-imported |
| Comments | giscus (GitHub Discussions backend, github-themed) |
| Image opt. | sharp (build-time WebP + responsive width set) |
| Deploy | Cloudflare Workers via Wrangler |

---

## Layout

```
content/
  github/<slug>.md           # essays authored in this repo
  medium/<slug>.md           # synced from Medium RSS
  bio.md                     # /about body
public/
  article/<slug>/            # per-article images (raw + WebP variants)
  fonts/                     # self-hosted woff2 (EB Garamond, Cormorant, UnifrakturCook)
  favicon.svg + favicon.ico + apple-touch-icon.png   # rasterized from SVG
  sitemap.xml                # build-time generated
scripts/
  build-content.ts           # markdown → src/data/articles.generated.json
  optimize-images.ts         # sharp → 320/480/768/1080w WebP siblings
  build-favicon-rasters.ts   # SVG → PNG + ICO multi-res
  build-sitemap.ts           # /sitemap.xml
  sync-medium.ts             # Medium RSS → content/medium/*.md
src/
  routes/                    # file-based routes (TanStack Router generated tree)
  components/                # bespoke editorial primitives + shadcn UI
  lib/                       # markdown pipeline, articles, supabase, utils
  styles.css                 # @theme tokens + utilities + component CSS
design.md                    # locked design system (parchment + ink + rubric)
content-schema.md            # article frontmatter contract
content-sources.md           # sync source contract
CLAUDE.md                    # contributor contract
```

---

## Commands

```bash
bun install              # deps
bun dev                  # dev server (port 3000)
bun run build            # production build (runs prebuild chain)
bun run preview          # local preview of built worker
bun run deploy           # wrangler deploy
bun run typecheck        # tsc --noEmit
bun run lint             # biome lint
bun run format           # biome format --write
bun run test             # vitest run

bun run sync:content     # rebuild src/data/articles.generated.json from content/
bun run sync:medium      # pull latest Medium posts via RSS
bun run optimize:images  # regenerate WebP width-set for /public/article/**
bun run build:favicons   # rasterize favicon.svg → PNG + ICO
bun run build:sitemap    # regenerate /public/sitemap.xml
```

`prebuild` chain: `sync:content && optimize:images && build:favicons && build:sitemap`. Runs automatically on `bun run build` and `bun run deploy`.

---

## Conventions

Read these alongside this file before touching the codebase:

- [`design.md`](./design.md) — locked design system. Tokens, typography, component voice, motion.
- [`content-schema.md`](./content-schema.md) — article frontmatter shape.
- [`content-sources.md`](./content-sources.md) — sync contract for github/medium.
- [`CLAUDE.md`](./CLAUDE.md) — contributor guardrails (stack lock, anti-slop rules, design vocabulary).

Highlights:
- **Routing** — file-based under `src/routes/`. Trust the generated `routeTree.gen.ts`.
- **Server functions** — only inside `*.server.ts` files.
- **Forms** — React Hook Form + Zod resolver. No raw `useState` form state.
- **Env** — every read through a Zod-validated `src/env.ts`. No bare `process.env` / `import.meta.env` in feature code.
- **Tailwind** — design tokens from `design.md` only. No arbitrary `text-[#hex]`, no off-scale spacing.
- **Components** — shadcn primitives first, hand-rolled when the manuscript register demands it.
- **Images** — per-article thumbnails under `public/images/<slug>/` (per `content-schema.md`). Missing → falls back to `/public/images/placeholder/sunflower.jpg`.
- **Design vocabulary** — masthead / kicker / dek / byline / dateline / rubric-link / rule-hair / rule-double / fleuron / portrait-frame. Never modern-web register (hero banner, card grid, CTA, pill).

---

## Deploy

1. `wrangler login` (one-time).
2. `bun run deploy` — runs the prebuild chain, builds the worker, ships to Cloudflare.
3. Secrets: `wrangler secret put <NAME>` per the entries in `.env.example`. Public vars go in `wrangler.jsonc`.

Bindings (KV / D1 / R2 / DO) live in `wrangler.jsonc`. Asset binding (`./dist/client`) is required for self-hosted fonts and `/public/*` routing.

---

## Performance

Build-time optimizations:

- Images → 320/480/768/1080w WebP siblings; `srcset` + `sizes` on every `<ArticleThumbnail>`; `<link rel="preload" as="image" imagesrcset>` on home + article-detail.
- Fonts → self-hosted woff2 (EB Garamond, Cormorant Garamond, UnifrakturCook) preloaded; `font-display: optional`; italic synthesized from variable face.
- JS → Supabase client dynamic-imported; devtools tree-shaken in production.
- Cache → `public/_headers` sets immutable 1y on `/assets/*`, 30d on `/article/*`, 7d on favicons.

---

## License

Personal portfolio — content (essays, copy, imagery) © Firman Lestari. Code is public reference; reuse with attribution.
