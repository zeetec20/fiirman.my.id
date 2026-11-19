# fiirman.my.id - Long-Term Memory

## Repository Conventions

- **Gitflow**: `.agents/gitflow.yml`: `ticket_required: false`, `base_branches: [master]`, `commit_format: "{type}: {summary}"`, `commit_detail: "bulleted-list-with-emoji"`.
- **No em dashes**: The em dash character (U+2014) is strictly prohibited in source files, JSX/TS strings, markdown, frontmatter, comments, and commit messages. Rewrite using commas, colons, parentheses, or plain hyphens. Exceptions: verbatim quotes in `src/data/quotes.ts`, `.agents/skills/**`, generated manifests.
- The `scripts/check-em-dash.ts` hook and lefthook `no-em-dash` job were **removed**: enforcement is agent-rule-only, not automated hook-based.
- Use `const` arrow functions throughout; never use em dashes in any output.
- Avoid `bun run build` in offline environments: `prebuild` runs `scripts/sync-medium.ts` which requires network and environment variables. Use `bun run typecheck` (`tsc --noEmit`) for offline TS verification.

## Lefthook + Biome Pre-commit

- Lefthook v2 `jobs:` schema (not `commands:`).
- Pre-commit command: `bunx biome check --write --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}` with `stage_fixed: true`.
- `bun install` does not auto-run Lefthook's `postinstall`; add `"prepare": "lefthook install"` to `package.json` scripts.
- `"format": "biome format --write"` is redundant alongside `biome check --write` and can be dropped.

## Project Showcase (`content/projects/*.md`)

- Projects live in `content/projects/*.md`, parsed via `src/data/projects.ts` with a custom line-based frontmatter parser (not full YAML). Quoted scalars work; `techStack` must use `- item` list format.
- `src/data/projects.ts` globs dynamically at build time, sorted by `order`. No manifest file needed (unlike articles which use `articles-manifest.json`).
- Production demo URL for MonthExpense: `https://monthexpense.fiirman.my.id/`.
- Project images go in `public/images/` as WebP. Use `sharp` for WebP encoding (not macOS `sips`): `bun -e 'const sharp=require("sharp");await sharp(src).resize({width:1400}).webp({quality:82}).toFile(dest)'`.
- Guard image rendering in `src/routes/projects.tsx`: `proj.image ? (<button>...</button>) : (<div aria-hidden="true" className="relative w-full aspect-[16/10] rounded-xs overflow-hidden bg-black/40 shadow-smooth-lg border border-stone-300/40 dark:border-stone-800/60" />)` to prevent broken image tags on image-less projects.
- `DitherImage` returns early on empty `image` string but does not prevent the empty alt paint; the guard above is necessary.
- In production (Cloudflare Workers SPA routing), missing static assets return HTTP 200 `text/html`: verify `content-type` not just status code.
- To display the "LIVE DEPLOYMENT" button on a project card, specify the `demo` property in frontmatter.

## OG Image Generation

- Article OG image template: `src/og/article-og-image.tsx`.
- Generation script: `scripts/generate-og-images.tsx` (`bun run generate:og-images`), outputs to `public/og/articles/*.png`.
- Bottom cream glass card spacing: uniform `bottom: 40`, `left: 40`, `right: 40`, `padding: "40px 40px 40px"`.
- Verification: `npx biome check src/og/article-og-image.tsx`, `bun run typecheck`, `bun run generate:og-images`.

## README Preview Asset

- Asset path: `public/images/readme-preview.webp`.
- Compression: `cwebp -q 82 -m 6 -sharp_yuv -resize 1760 0` (targets 2x retina at ~880px GitHub render width).
- README section: `## 🖼️ Preview` near the top with `![fiirman.my.id UI preview](public/images/readme-preview.webp)`.

## GitHub Activity (`GitHubActivityBar.tsx`)

### Data Source & Sync Script

- User handle: `@zeetec20` (`https://github.com/zeetec20`).
- `scripts/sync-github.ts` (following `sync:medium` pattern) queries the GitHub GraphQL API and outputs `src/data/github-activity.json`.
- GraphQL queries: `user(login: "zeetec20")` -> `repositories(privacy: PUBLIC) { totalCount }` and `contributionsCollection` -> `totalContributions`, `weeks { contributionDays { date contributionCount contributionLevel } }`.
- Level mapping: `NONE`->0, `FIRST_QUARTILE`->1, `SECOND_QUARTILE`->2, `THIRD_QUARTILE`->3, `FOURTH_QUARTILE`->4.
- Derive `currentStreak` and `longestStreak` from authentic daily records.
- On auth/network failure, fall back gracefully to existing `src/data/github-activity.json` to avoid build breakage.
- Integrated into `package.json` as `sync:github` and wired into `prebuild`/`build`.
- Keep 100% visual styling (glassmorphism, swatches, focus rings).

### Dynamic Caching via TanStack Start + KV Namespace (Cloudflare Workers)

- Use `createServerFn` to keep GitHub token and server cache logic off the client bundle.
- In Cloudflare Workers runtime, access `GITHUB_ACTIVITY_KV` through `resolveGitHubActivityKV` using dynamic import of `"cloudflare:workers"` with `/* @vite-ignore */` to avoid bundling into client code.
- Cache structure: `kv.put(key, JSON.stringify(snapshot), { expirationTtl: 86400 })` (24-hour TTL).
- Fallback chain: KV hit -> GitHub GraphQL/scraper -> static `src/data/github-activity.json` (prevents 500s).
- Route integration: `createFileRoute('/about')({ loader: async () => getGitHubActivityServerFn() })`, consumed via `Route.useLoaderData()` for SSR hydration without layout shifts.
