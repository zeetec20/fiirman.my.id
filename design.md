# Design System — firmanlestari

**Newspaper × Medieval × Timeless.** Parchment + ink + rubric. Serif everything (sans-serif forbidden). Hairline rules, double-rule section breaks, drop caps, fleuron ornaments. Restrained motion. Decade-proof.

Source of truth for visual decisions. Code that violates this file fails review (see `.claude/agents/design-guard.md`).

---

## Principles

1. **Paper first** — type and ink, nothing else carries weight.
2. **Restraint** — every flourish earns its place.
3. **Read forever** — timeless means decade-proof; reject trend.

---

## Fonts

Self-hosted via `@fontsource-variable` packages (no Google Fonts runtime — Workers env, privacy, offline).

| Token | Family | Where |
|---|---|---|
| `font-display` | `UnifrakturCook` (blackletter) | Site masthead title **only**. Never body, never headings. |
| `font-serif` | `EB Garamond` (variable, 400/500/600/700, italic) | Body, headings, navigation. Default everything. |
| `font-serif-display` | `Cormorant Garamond` (300/400/500/600/700) | Article titles, hero, section headings ≥ `text-3xl`. |
| `font-smallcaps` | `EB Garamond SC` | Section labels, dateline, kicker, byline. |
| `font-mono` | `JetBrains Mono` (400/500) | Code only. |

Fallback stack: `"EB Garamond", Georgia, "Times New Roman", serif` for `font-serif`. Display falls back to `font-serif` if Cormorant fails. Mono falls back to `ui-monospace, SFMono-Regular, monospace`.

**Rule:** no other fonts. No system-ui, no sans-serif, no decorative scripts.

---

## Type scale

Line-heights tuned for serif. Body at 17px because Garamond's x-height runs small.

| Token | Size | Line-height | Use |
|---|---|---|---|
| `text-xs` | 12px | 16px | Dateline, captions, attribution |
| `text-sm` | 14px | 22px | Metadata, footnotes |
| `text-base` | 17px | 28px | Body — the Garamond sweet spot |
| `text-lg` | 19px | 30px | Lead paragraph (dek) |
| `text-xl` | 22px | 32px | Card titles |
| `text-2xl` | 28px | 36px | Sub-section headings |
| `text-3xl` | 36px | 44px | Section headings (Cormorant) |
| `text-4xl` | 48px | 56px | Article titles (Cormorant) |
| `text-headline` | 64px | 68px | Front-page lead (Cormorant) |
| `text-masthead` | 88px | 92px | Site title only (UnifrakturCook) |

Article body is **justified with hyphenation** (`text-justify hyphens-auto`). UI text stays left-aligned.

**Rule:** font-size must come from this scale. No `text-[17px]` arbitrary values.

---

## Color tokens

Parchment + ink + rubric. All declared in `oklch()` for perceptual uniformity.

| Token | Light (default) | Dark | Use |
|---|---|---|---|
| `--color-bg` | `oklch(94% 0.025 80)` | `oklch(15% 0.01 50)` | Page background — parchment / nighttime ink |
| `--color-bg-aged` | `oklch(90% 0.035 75)` | `oklch(20% 0.015 50)` | Cards, blockquote, code block |
| `--color-fg` | `oklch(20% 0.015 50)` | `oklch(89% 0.025 80)` | Ink |
| `--color-fg-muted` | `oklch(40% 0.020 50)` | `oklch(70% 0.020 70)` | Faded ink, metadata |
| `--color-rubric` | `oklch(38% 0.15 25)` | `oklch(60% 0.18 25)` | Illuminated red — links, drop caps, accents |
| `--color-rubric-fg` | `oklch(94% 0.025 80)` | `oklch(15% 0.01 50)` | Text on rubric backgrounds |
| `--color-rule` | `oklch(20% 0.015 50 / 0.85)` | `oklch(89% 0.025 80 / 0.85)` | Hairline rules, byline underline |
| `--color-rule-heavy` | `oklch(20% 0.015 50)` | `oklch(89% 0.025 80)` | Top of double-rule section break |

**Hard rule:** no other colors. No state-driven blue/green/yellow — success/warning conveyed via small-caps `fg-muted` or `rubric`, not chromatic alerts.

---

## Spacing

Tailwind default scale + newspaper rhythm tokens:

| Token | Value | Use |
|---|---|---|
| `18` | 4.5rem (72px) | Article hero vertical padding |
| `22` | 5.5rem (88px) | Section break vertical |
| `column-gap` | 2rem (32px) | Multi-column home grid |

**Rule:** no arbitrary spacing values (`p-[17px]`, `gap-[13px]`).

---

## Radii

Minimal — paper edges don't round.

| Token | Value |
|---|---|
| `radius-sm` | `2px` (code chips, badges) |
| `radius-md` | `4px` (cards — barely there) |
| Default | `0px` everywhere else |

No `radius-lg`, no `radius-full`. Buttons rectangular. Images rectangular.

---

## Shadows

Paper depth only.

| Token | Value |
|---|---|
| `shadow-paper` | `0 1px 0 var(--color-rule), 0 2px 4px oklch(0% 0 0 / 0.04)` |

No `shadow-md`, no `shadow-lg`. No glow. No drop-shadow filters.

---

## Rules (visual)

The workhorse of this design. Three styles:

- **`rule-hair`** — `1px solid var(--color-rule)`. Card dividers, byline underline.
- **`rule-double`** — broadsheet-classical section break. A horizontal flex strip: thin/heavy double-line on each side, separated in the middle by the `<Fleuron variant="flourish" />` SVG ornament (rendered in `--color-rubric`). Lines mirror the original double-rule (`2px solid var(--color-rule-heavy)` over `1px solid var(--color-rule)`, separated by a `4px` channel). DOM is `<div role="separator">` with two `.rule-double__line` flex-1 children flanking a `.rule-double__glyph` span containing the SVG. No glyph-prop override — the ornament is canonical.

### Fleuron ornament

Custom hand-drawn manuscript ornament rendered by `<Fleuron>` (see `src/components/fleuron.tsx`). Two variants, both inheriting `currentColor`:

- **`flourish`** (default) — `96×20` viewBox. Symmetric S-curve vines flanking a centered solid lozenge, end-cap dots, dot accents either side of the lozenge. Used for section-break ornaments (RuleDouble center, page-section headings: Colophon, Of Note).
- **`mark`** — `18×10` viewBox. Compact lozenge with two end-cap dots. Used inline (nav separators).

Unicode glyphs (`❧ ❦ ⁂`) are reserved for in-article rule-ornament breaks only; site chrome uses the SVG fleuron.
- **`rule-ornament`** — centered fleuron `❦` or three asterisks `⁂` between paragraphs in long-form articles. `text-fg-muted`.

---

## Motion

Restrained.

| Token | Duration | Easing |
|---|---|---|
| `motion-hover` | 120ms | `ease-out` (link underline, color shift) |
| `motion-page` | 200ms | `ease-out` (opacity-only page transition) |

No spring physics. No layout shifts. No bouncing. `framer-motion` allowed only for opacity entry and reduced-motion-aware shared layout. **Never animate body type.**

**Masthead typewriter.** `<Masthead>` reveals "Firman Lestari" on initial mount via a 1.6s `clip-path` reveal driven by `steps(14, end)`, with a blinking rubric cursor (`▌`) that hides at 1.8s. One-shot per cold load — does not re-run on in-app navigation. `prefers-reduced-motion: reduce` suppresses both the reveal and the cursor; full title renders immediately.

**Scroll percentage badge.** `<ArticleProgress>` (article-detail only) renders a hairline `XX%` badge (24×52, tabular-nums, small-caps) fixed top-left under the 5px scroll bar. Both elements share one `rAF`-coalesced scroll listener.

---

## Layout

- **Max content width:** `1200px` — exposed as Tailwind utility `max-w-page` (token `--container-page`).
- **Article prose measure:** `640px` — exposed as Tailwind utility `max-w-prose` (token `--container-prose`). ~66 characters per line in Garamond at 17px — classical typographic ideal.
- **Homepage grid:** 3 columns on `xl+`, 2 columns on `md+`, 1 column on mobile. Hairline vertical rules between columns.
- **Gutter:** 24px mobile, 40px tablet, 64px desktop.
- **Breakpoints:** Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536).

---

## Component patterns

### Masthead
Site title in UnifrakturCook, centered, `text-masthead`. Dateline below in small caps: `VOL. I · NO. 1 · 25 MAY MMXXVI · ZEETEC20`. Double-rule beneath the whole block.

### Section heading
Small-caps kicker centered above `rule-double`. Heading in Cormorant Garamond beneath.

### Article card
Kicker (small-caps tag) → Cormorant title → EB Garamond dek (lead) → byline + dateline → `rule-hair` divider beneath.

### Article body
Drop cap on first letter (3 lines tall, Cormorant, `rubric` color). Justified prose with hyphenation. `rule-ornament` between major sections instead of horizontal lines.

### Links (inline)
`color: rubric`, `border-bottom: 1px solid currentColor`, hover removes border. No underline-offset tricks. No animated underlines.

### Buttons
Rectangular. `border: 1px solid var(--color-fg)`. Label in small caps. Hover inverts: `bg: fg, color: bg`. No shadows.

### Code blocks
`bg-aged`, `rule-hair` border, mono `text-sm`. Shiki theme: `min-light` (light mode) / `min-dark` (dark) — restrained palettes that don't clash with parchment.

### Inline code
Chip: `bg-aged`, `radius-sm`, `font-mono` at `0.92em`.

### Blockquote
Left rubric rule `3px solid var(--color-rubric)`, italic Cormorant, indented `pl-6`.

### Navigation
Top nav: small-caps labels separated by middot `·`. No hamburger menu — links inline on mobile, wrap if needed.

---

## Article rendering specifics

- `h2` margin-top `22` (88px), preceded by `rule-double`.
- `h3` margin-top `12` (48px), preceded by `rule-hair`.
- Images full-bleed within `640px` prose, no radius, captions in small-caps `text-xs text-fg-muted`.
- `<hr>` renders as `rule-ornament` (fleuron), not a horizontal line.
- Footnotes (if present) appear at article end under a `rule-double`, in `text-sm`.

---

## Dark mode

"Candlelight read": ink background, parchment text, slightly hotter rubric. Toggle persists in `localStorage` under key `theme` (`"light" | "dark"`). Default = `light` (parchment).

Dual-theme commitment carries forward from the old portfolio — already a user-validated pattern. Only two themes; no per-section color drift.

---

## Imagery

Newspaper-broadsheet treatment, never modern marketing photography.

**Treatment:**
- Default style: desaturate to 0%, apply `filter: sepia(0.15) contrast(1.05)`. Photos look like engravings/lithographs on parchment.
- Border: `rule-hair`. No radius. No shadow.
- Color photos forbidden in chrome and articles by default. Exception: article frontmatter `imageStyle: color` opts the article into a color treatment.

**Source — manual asset placement:**

Per-article thumbnails are placed by hand under `/public/images/<slug>/`. The filename is referenced from the article's frontmatter `thumbnail` field. No API, no fetch script — drop the image in the folder and rebuild.

Render attribution (when applicable) in caption: small caps `text-xs text-fg-muted` → `PHOTO · <SOURCE>`.

**Placeholder fallback:**

If `frontmatter.thumbnail` is empty OR the referenced file does not exist on disk at build time, the loader rewrites the path to `/images/placeholder/sunflower.jpg`. Caption renders as `PHOTO · PLACEHOLDER`. The placeholder file ships at `/public/images/placeholder/sunflower.jpg` with a `credit.json` marking it `source: user-provided`. Never invent paths; never embed remote URLs as a substitute.

**Rules:**
- **No runtime fetches.** Site never fetches imagery in a Worker handler.
- **No remote URLs in source.** `<img src="https://…">` from any third-party host is forbidden — always local `/images/<slug>/…`.
- **No invented paths.** If an image is not yet placed, the loader uses the sunflower placeholder, not a guessed filename.
- **Format:** prefer JPG (smaller for photos). Build pipeline converts to WebP (separate plan).
- **Sizing:** ≤ 1600px wide, ≤ 250KB per image. Reject larger or compress first.

**Per-instance aging (`<ArticleThumbnail>`).** Every thumbnail is aged with a seeded combination of four layers (grain pattern, dust blobs, scratches, vignette, micro-tilt). Selection is deterministic per `seed` (defaults to `alt`) so the same article looks identical across reloads, but two different articles never share the same combination. Approximate variant count: 4 × C(5,3) × C(5,2) × 3 × 4 ≈ 4800. **No other component is allowed to declare grain, dust, scratch, or inset-vignette decoration on images.**

**Medium-source dedupe.** `scripts/sync-medium.ts` promotes the first body image to `frontmatter.thumbnail` and strips its `<img>` (and any wrapping `<figure>`) from `content:encoded` before the body is turned into markdown. The header `<ArticleThumbnail>` is the canonical render — the body never carries a duplicate cover.

---

## Background atmosphere

Six fixed-position layers compose a faintly aged page — no characters, no figural ornaments. All layers are pointer-events `none` and rendered by **`<BackgroundDecoration>`** mounted once at the top of `<body>` in `__root.tsx`. No other component is allowed to paint background imagery or textures.

| Layer | Mechanism | Opacity (light) | Opacity (dark) |
|---|---|---|---|
| Paper grain | Inline SVG `feTurbulence` noise filter, `position: fixed; z-index: -3` | 0.08 | 0.06 |
| Starry night | Fixed full-viewport SVG (`.bg-stars`, viewBox 100×100, z-index `-3`) with 24 deterministic `<circle>` pinpricks (`.star`); each twinkles via `star-twinkle` opacity animation (3–7s period, staggered). Subset of 4 tinted rubric; rest `--color-fg-muted`. Sits over the grain, under the age stains. | 0.12→0.5 | 0.28→0.85 |
| Thumbnail grain (per-card) | Two-pass turbulence SVG via `<ArticleThumbnail>` overlays. Light: `mix-blend-mode: multiply` @ 0.78. Dark: `mix-blend-mode: screen; filter: invert(1)` @ 0.55 (inverted dark noise reads as bright speckle on dark surfaces). | 0.78 | 0.55 |
| Age stains | Three CSS `radial-gradient` patches (TL warm + BR warm + bottom-center deep) | 0.18 | 0.18 |
| Candle glow | Centered warm radial gradient pulsing on `candle-glow-pulse` (6s) | 0.18→0.32 | 0.18→0.32 |
| Heliocentric orbits | Fixed full-viewport SVG (`.bg-orbits`, viewBox 1000×1000, z-index `-1`, painted in DOM after the candle glow so hairlines remain readable through the warm blur). Four concentric ellipses (`.orbit-ring`, `stroke: var(--color-rule-heavy)`, hairline via `vector-effect: non-scaling-stroke`) tilted −6°, a central rubric sun (`.orbit-sun`, pulsing 7s opacity), and one rubric planet per orbit rotating around centre via `orbit-spin` keyframes (periods 60s · 92s · 138s · 196s; staggered delays). | rings 0.10 · sun 0.42→0.78 · planets 0.42 | rings 0.22 · sun 0.78 · planets 0.7 |
| Embers | Six 3–5px dots drifting bottom→top on `ember-rise` (16–25s, staggered) | — | — |

**Article-detail chrome.** Two thin components on article-detail routes only: `<ArticleProgress>` paints a 2px rubric-red bar across the top edge that scales L→R with scroll progress, and `<BackToTop>` is a 36×36 hairline button that fades in past 60vh and smooth-scrolls to top on click. Neither is global chrome; both are mounted inside `src/routes/articles.$slug.tsx`. The OS scrollbar is hidden cosmetically (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`); wheel/touch/keyboard scrolling continues to work.

**Animation.** Candle-glow pulses on 6s. Embers drift 16–25s. All animations are disabled under `@media (prefers-reduced-motion: reduce)`.

**Dark mode flip.** Light mode uses warm sepia stains and warm candle glow; dark mode swaps in cold-ink-wash stains and a cooler glow via `[data-theme="dark"]` and `@media (prefers-color-scheme: dark) :root[data-theme="auto"]`.

**Forbidden:** any `background-image`, `background-size: cover`, decorative texture, or full-bleed image declared outside `<BackgroundDecoration>`. Per-article images go through `<ArticleThumbnail>` and the engraved sepia filter; nothing else.

---

## Activity heatmap (`<GithubActivity>`)

53-week × 7-day SVG grid rendered on the About page. Data is fetched at runtime client-side via TanStack Query against `https://github-contributions-api.jogruber.de/v4/zeetec20?y=last` (public, token-less, CORS-enabled). While loading, a shimmer skeleton grid (`.gh-cell-skeleton` with staggered `gh-shimmer-sweep` keyframe) holds the layout. Five-tone palette — **never GitHub greens**:

| Level | Fill |
|---|---|
| 0 | `var(--color-bg-aged)` |
| 1 | `oklch(from var(--color-rubric) l c h / 0.28)` |
| 2 | `oklch(from var(--color-rubric) l c h / 0.52)` |
| 3 | `oklch(from var(--color-rubric) l c h / 0.76)` |
| 4 | `var(--color-rubric)` |

Cells: 11×11 with 3px gap, hairline stroke at `--color-rule`. Month and weekday labels in small-caps `--color-fg-muted`. Caption: `"<N> contributions, last 12 months · SYNCED · <date>"`.

---

## Hard rules (design-guard enforces)

1. **No color outside the token table.** No hex/rgb/hsl/oklch literal outside `app/styles/app.css`. No `text-[#…]`, `bg-[#…]` in JSX.
2. **No font-family outside the five named families.** No `font-family: system-ui`, no Google Fonts URLs.
3. **No font-size outside the scale.** No `text-[17px]`, no `text-[1.1rem]`.
4. **No spacing outside the scale.** No `p-[17px]`, `gap-[13px]`.
5. **No `border-radius` ≥ `8px`** anywhere.
6. **No inline `style={{}}`** — exception: `transform` and/or `opacity` for animations only.
7. **No sans-serif font.** Ever. Only the five families above.
8. **No emoji icons in UI chrome.** Decorative ornaments `❦ ⁂` only as `rule-ornament` in long-form prose.
9. **No remote image URLs** in JSX. Local `/images/<slug>/…` only. *(Single carve-out in rule 13.)*
10. **No background images, textures, orbits, stars, or full-bleed decoration outside `<BackgroundDecoration>`.** No body `background-image`, `background: url(...)`, or full-bleed decoration in feature code. The six atmosphere layers — paper grain, starry night, age stains, candle glow, heliocentric orbits, embers — are owned exclusively by `<BackgroundDecoration>`. Per-article imagery flows through `<ArticleThumbnail>`; everything else lives in the central background component.
11. **Thumbnail aging layers are rendered only by `<ArticleThumbnail>`.** Feature code never declares scratch overlays, dust blobs, `box-shadow: inset` vignettes, or seeded turbulence filters on images elsewhere.
12. **`<ArticleProgress>` and `<BackToTop>` are article-detail-only chrome.** Neither component is mounted globally; they live inside `src/routes/articles.$slug.tsx` only.
13. **Remote image URLs are forbidden in JSX except for the GitHub avatar** rendered on the About page (`avatars.githubusercontent.com/u/<id>`). All other imagery is local under `/public/images/<slug>/…`.
14. **No third-party tracking scripts.** The only sanctioned third-party iframe is giscus (`https://giscus.app`), and only on `source: "github"` articles. Medium-sourced articles surface a "Continue the discussion on Medium →" link instead.

---

## Social links

Six inline-SVG icon links rendered by `<SocialLinks>` in the global footer (Facebook, Instagram, WhatsApp, GitHub, LinkedIn, Email). Each link is a shadcn `Button({ asChild, variant: "hairline", size: "icon" })` wrapping an `<a>` so it inherits the hairline chrome affordance (rubric border + lift on hover) used by `<ThemeToggle>` and `<BackToTop>`. Platform name surfaces via shadcn `Tooltip`. The bespoke `.social-link` CSS rule was removed when this component was migrated; do not reintroduce it.

## Component primitives (shadcn/ui)

Generic UI primitives come from shadcn/ui via the MCP server and are stored in `src/components/ui/`. The literary register stays bespoke — primitives are layered **under** the design vocabulary, not over it.

**Installed primitives (Tailwind v4 + radix-ui sources):**

| Primitive | Where used |
|---|---|
| `Button` | `<ThemeToggle>`, `<BackToTop>`, `<SocialLinks>`, `<GithubActivity>` retry, article CTA on `articles.$slug.tsx`. Hairline variant carries the parchment chrome look. |
| `Toggle`, `ToggleGroup` | reserved — not currently consumed |
| `Sonner` (`Toaster`) | mounted once in `__root.tsx`, voice keyed to parchment via `[data-sonner-toast*]` overrides in `styles.css` |
| `Tooltip`, `TooltipProvider` | wraps `__root.tsx`; consumed by `<ThemeToggle>`, `<BackToTop>`, `<SocialLinks>` |
| `Card`, `CardContent` | Spotify embed on `about.tsx`. Border-radius flattened via `rounded-sm` override; ring removed via `ring-0`. |
| `Separator` | reserved — `RuleHair`/`RuleDouble` remain bespoke because they carry ornaments |
| `Skeleton` | reserved — `<GithubActivity>` skeleton is SVG `<rect>`-based so the `<div>`-based primitive doesn't fit; `.gh-cell-skeleton` CSS stays |
| `AspectRatio` | `<ArticleThumbnail>` `aspect="feature"` mode |

**Rules:**

1. Future shadcn primitives are added via shadcn MCP (`get_add_command_for_items`) so the project's `radix-nova` style and `neutral` base color stay locked.
2. Every primitive consumes the shadcn token aliases declared in `styles.css` `@theme` (L135-158) — `bg-card`, `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, `rounded-md`. Inline OKLCH values are forbidden.
3. Default `rounded-lg`/`rounded-xl` on primitives must be overridden to `rounded-sm` (= 2px) or `rounded-md` (= 4px) per design.md rule on radius ≤ 4px.
4. Bespoke literary components are NEVER replaced by a primitive: `Masthead`, `Fleuron`, `RuleDouble`, `RuleHair`, `PortraitFrame`, `Dateline`, `Kicker`, `Glyph*`, `ArticleCard`, `ArticleThumbnail`, `RubricLink`, `ArticleProgress`, `BackgroundDecoration`.
5. When shadcn can't deliver (SVG-internal styling, full-bleed atmosphere, manuscript ornaments, prose-article cascading typography, scroll progress, portrait shimmer, seal animations, code-block parchment, masthead typewriter), fall back to CSS in `styles.css`. The token system is the bridge — primitives and bespoke CSS read the same tokens.

## Comments

GitHub-sourced articles render giscus under a "Reader Comments" heading. Medium-sourced articles render a single "Originally on Medium" link block. The standalone "Originally published on …" footer is removed — the post-article section carries exactly one CTA per article.

`<Comments>` mounts a single giscus iframe (`https://giscus.app/client.js`) keyed to the article slug (`data-mapping="specific"`). Theme tracks `data-theme` on `<html>` via `MutationObserver` and `setConfig` `postMessage`. Only mounted when `article.source === "github"`.

## Code-block copy button

`<ArticleBody>` augments each `<pre>` after hydration with a `.copy-code` small-caps button positioned top-right inside a `.code-block` wrapper. Button copies `pre.innerText` to the clipboard via `navigator.clipboard.writeText`, swaps label to "Copied" for 1.2s. Hover/focus fades it in; reduced-motion disables the transition.

## Hairline-button affordance (`.hairline-button`)

Shared chrome for `<ThemeToggle>` and `<BackToTop>`: 36×36, hairline `--color-rule` border, `--color-bg/0.78` backdrop-blur background. On hover: border + color → `--color-rubric`, `translateY(-2px)`, 2px rubric-tinted box-shadow. Theme toggle adds a `rotate(-10deg)` to the icon. Reduced-motion suppresses transform/box-shadow but keeps color shifts.

Exceptions require a new token added to this file and the `@theme` block first.
