# Content Sources — Ingestion

Two paths feed `/content`. Both write **normalized frontmatter** (see `content-schema.md`) so the renderer is source-agnostic.

```
/content
├── github/<slug>.md         ← one-shot manual import (run once, then forget)
└── medium/<slug>.md         ← sync:medium (cron, daily)

/public/article/<slug>/      ← article assets (both sources)
```

---

## Source A — GitHub repo (one-shot import, no script)

**Origin:** `https://github.com/zeetec20/zeetec20.github.io` (branch `master`)

- Markdown: `articles/<slug>.md`
- Assets: `article/<slug>/*` (images)

**Why one-shot:** The source repo is being decommissioned in favor of this portfolio. Once these articles land in `/content/github/`, the upstream will not change again. No script, no cron, no MCP, no automation — a documented manual procedure run once.

**Procedure (execute once, then never again):**

```bash
# 1. Shallow clone the source repo to a scratch directory.
git clone --depth=1 https://github.com/zeetec20/zeetec20.github.io.git /tmp/zeetec20-src

# 2. Copy markdown into /content/github/.
mkdir -p content/github
cp /tmp/zeetec20-src/articles/*.md content/github/

# 3. Copy article assets into /public/article/.
mkdir -p public/article
cp -R /tmp/zeetec20-src/article/* public/article/

# 4. Append `source: github` to each article's frontmatter.
#    Done by hand (5 files) or via a one-line sed — your call.
#    The other fields already match the normalized shape.

# 5. Sanity check.
ls content/github/   # should list 5 .md files
ls public/article/   # should list 5 sub-folders

# 6. Verify with `bun run typecheck` once the Zod loader exists.

# 7. Delete the scratch tree.
rm -rf /tmp/zeetec20-src
```

After step 7, the articles live permanently in this repo. The upstream is no longer relevant.

**No `bun run sync:github`. No GitHub MCP. No PAT. No GitHub Actions workflow for this source.**

---

## Source B — Medium RSS

**Origin:** `https://medium.com/feed/@jusles363`

- Returns latest ~10 posts as RSS 2.0 XML.
- Each item contains: `<title>`, `<link>`, `<pubDate>`, `<category>` (multiple), `<content:encoded>` (full HTML body).

**Script:** `scripts/sync-medium.ts` (to write)

**Deps:** `fast-xml-parser`, `turndown`, `turndown-plugin-gfm`, `gray-matter`. All dev deps — script runs at build/cron time, never in the Worker.

**Pipeline per item:**

1. Fetch RSS, parse with `fast-xml-parser`.
2. For each `<item>`:
   - `link` → strip Medium's trailing `-<8char-hash>` → `slug`.
   - `pubDate` (`Wed, 15 Mar 2023 10:23:11 GMT`) → `DD-MM-YYYY`.
   - `category[]` → `tag[]`.
3. Convert `<content:encoded>` HTML → Markdown via `turndown` (GFM plugin enabled).
   - Preserve `<pre><code class="language-…">` → fenced code blocks with lang tag.
   - Preserve `<blockquote>`, `<ul>`, `<ol>`, headings, inline `<code>`.
   - Strip Medium-injected tracking spans, share buttons, "Follow me" footers.
4. Image handling:
   - First `<img>` → download to `public/article/<slug>/thumbnail.<ext>` (extension from Content-Type).
   - Subsequent `<img>` → download to `public/article/<slug>/img-<N>.<ext>` (N starts at 1).
   - Rewrite all body image URLs to local paths.
   - Why download: Medium hot-linking is unreliable, breaks offline, and CDN URLs rotate.
5. Build normalized frontmatter (see `content-schema.md`).
6. Write `content/medium/<slug>.md` via `gray-matter`.
7. **Idempotency:**
   - If file doesn't exist → write.
   - If file exists AND `sourceUrl` matches AND upstream `pubDate` not newer than file → skip.
   - If upstream `pubDate` newer (Medium edit) → overwrite body + frontmatter, keep `createdAt` from original write.

**Trigger options:**

| Trigger | When |
|---|---|
| Manual: `bun run sync:medium` | Always available, local testing |
| **GitHub Actions cron daily** (recommended) | `.github/workflows/sync-medium.yml`. Runs `bun run sync:medium`, commits diff to `main` if any. Push triggers Cloudflare Workers deploy via Wrangler GitHub Action. |
| Pre-build hook | Optional: chain in `build` script. Rejected as default — slows deploys, fails build on Medium downtime. |

**Worker-side runtime fetch is explicitly rejected.** Reasons:
- Cold-start latency from blocking RSS fetch.
- Medium rate-limits on Worker IPs.
- Image hot-linking breaks.
- No streaming benefit — articles are static.

**Auth:** none. Public RSS.

**Limitation:** RSS caps at the latest ~10 posts. For backfill of older posts:
- Use Medium account export (Settings → Account → Download your information).
- Convert HTML to Markdown manually, drop in `content/medium/<slug>.md` with `source: medium` + correct `createdAt`.
- One-time operation, no recurring script needed.

---

## GitHub Actions workflow (sketch)

`.github/workflows/sync-medium.yml`:

```yaml
name: sync-medium
on:
  schedule:
    - cron: "0 6 * * *"  # 06:00 UTC daily
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run sync:medium
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content/medium public/article
          if git diff --cached --quiet; then
            echo "No new posts"
            exit 0
          fi
          git commit -m "chore(content): sync Medium"
          git push
```

CF Workers deploy runs on push to `main` via a separate workflow (out of scope here).

---

## Failure modes + handling

| Failure | Behavior |
|---|---|
| RSS fetch 5xx | Script exits non-zero, workflow fails, no commit. Next cron retries. |
| Image download fails | Log warning, skip that image, continue. Article still publishes without that image (renderer must handle missing `src`). |
| HTML → MD produces empty body | Skip item, log warning. Don't write a file. |
| Frontmatter validation fails (Zod) | Skip item, log warning. |
| GitHub commit fails (no diff) | Workflow exits 0 — that's the "no new posts" case. |

No silent failures — every skip logs to stdout and shows in Actions output.
