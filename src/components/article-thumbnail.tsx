import { GlyphBookClosed, GlyphBookOpen } from "./glyphs";
import { thumbnailUrl, thumbnailSrcSet } from "../lib/articles";
import { hashSeed, pickSubset } from "../lib/random";
import { AspectRatio } from "./ui/aspect-ratio";
import { CornerCarving } from "./corner-carving";

/* Sizes hint paired with the 320/480/672/768/1080 width set. `feature`
   is the 3:2 card grid (home Latest-Stories + archive); `natural` is the
   full-bleed hero (home featured + article-detail header). Mobile stop
   subtracts the page gutter (px-4 → 2rem total) so the browser picks
   672w instead of over-fetching 768w; the desktop stop is the measured
   3-col grid column (~352px), not a viewport fraction. */
const SIZES_FEATURE =
	"(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 50vw, 352px";
const SIZES_NATURAL = "(max-width: 768px) 100vw, 720px";

const DUST_POOL = 5;
const SCRATCH_POOL = 5;
const GRAIN_PATTERNS = 4;
const VIGNETTE_LEVELS = 3;
const TILT_VARIANTS = 4;

/**
 * Article thumbnail with per-instance randomized aging:
 *
 *   - grain pattern    (1 of 4 pre-baked SVG noise textures)
 *   - dust blob subset (3 of 5 pre-positioned dust stains)
 *   - scratch subset   (2 of 5 pre-baked diagonal scratches)
 *   - vignette level   (light / medium / heavy edge darkening)
 *   - frame tilt       (4 micro-rotations, e.g. ±0.5°)
 *
 * Combination = 4 × C(5,3) × C(5,2) × 3 × 4  ≈ 4800 variants.
 *
 * Everything is keyed off `hashSeed(seed ?? alt)` so the same article
 * always renders with the same aging signature. No inline styles —
 * every choice is expressed as a className suffix or data attribute.
 *
 * `interactive` (used by ArticleCard) adds a group-hover affordance:
 * subtle scale + brightness on the image, plus a lock→lock-open
 * crossfade on the corner indicator.
 */
export function ArticleThumbnail({
	src,
	alt,
	caption,
	className = "",
	interactive = false,
	seed,
	aspect = "natural",
	priority = false,
	carved = false,
}: {
	src?: string | null;
	alt: string;
	caption?: string;
	className?: string;
	interactive?: boolean;
	seed?: string;
	/**
	 * `natural` preserves the source image's intrinsic ratio (article
	 * detail hero, single feature usage). `feature` locks to a 3:2
	 * newspaper-photo ratio with `object-cover` so a grid of cards reads
	 * as a tidy print sheet — no stretching, longer edges get cropped.
	 */
	aspect?: "natural" | "feature";
	/**
	 * Pass `priority` on the **above-fold LCP image** (typically the
	 * featured hero on the home page or the article detail header).
	 * Enables `loading="eager"` + `fetchpriority="high"` so the browser
	 * pulls the image in the first request wave instead of deferring.
	 */
	priority?: boolean;
	/**
	 * Render four-corner manuscript carving overlays. Reserved for the
	 * article-detail hero — list/card thumbnails stay clean so the
	 * detail page reads as a distinct destination.
	 */
	carved?: boolean;
}) {
	const resolved = thumbnailUrl(src);
	const isPlaceholder =
		!src || src.length === 0 || resolved === thumbnailUrl(null);
	const showCaption = caption !== undefined || isPlaceholder;

	const seedHash = hashSeed(seed ?? alt ?? resolved);

	const dustIndices = pickSubset(seedHash, 0, DUST_POOL, 3);
	const scratchIndices = pickSubset(seedHash, 100, SCRATCH_POOL, 2);
	const grainIdx = seedHash % GRAIN_PATTERNS;
	const vignetteIdx = (seedHash >> 7) % VIGNETTE_LEVELS;
	const tiltIdx = (seedHash >> 11) % TILT_VARIANTS;

	const imgHoverClasses = interactive
		? "group-hover/card:scale-[1.03] group-hover/card:brightness-110"
		: "";

	const isFeature = aspect === "feature";
	const imgFitClass = isFeature
		? "absolute inset-0 w-full h-full object-cover"
		: "w-full h-auto block";

	const frame = (
		<div
			className={`thumbnail-frame thumbnail-tilt-${tiltIdx} relative overflow-hidden border border-rule ${isFeature ? "size-full" : ""}`}
		>
				<img
					src={resolved}
					srcSet={thumbnailSrcSet(src)}
					sizes={isFeature ? SIZES_FEATURE : SIZES_NATURAL}
					alt={alt}
					loading={priority ? "eager" : "lazy"}
					fetchPriority={priority ? "high" : undefined}
					decoding="async"
					width={isFeature ? 720 : 1080}
					height={isFeature ? 480 : 720}
					className={`thumbnail-engraved transition-transform duration-300 ease-out ${imgFitClass} ${imgHoverClasses}`}
				/>

				{/* Grain — one of 4 SVG noise data URIs, blend-multiply. */}
				<span
					aria-hidden="true"
					className={`thumbnail-grain thumbnail-grain-${grainIdx}`}
				/>

				{/* Vignette — edge darkening via inset box-shadow. */}
				<span
					aria-hidden="true"
					className={`thumbnail-vignette thumbnail-vignette-${vignetteIdx}`}
				/>

				{/* Dust blobs — 3 of 5 pre-positioned stains. */}
				{dustIndices.map((i) => (
					<span
						key={`dust-${i}`}
						aria-hidden="true"
						className={`thumbnail-dust-blob thumbnail-dust-blob-${i}`}
					/>
				))}

				{/* Scratches — 2 of 5 pre-baked diagonals. */}
				{scratchIndices.map((i) => (
					<span
						key={`scratch-${i}`}
						aria-hidden="true"
						className={`thumbnail-scratch thumbnail-scratch-${i}`}
					/>
				))}

				{interactive ? (
					<span className="lock-indicator">
						<GlyphBookClosed
							size={16}
							className="lock-icon lock-icon-closed"
						/>
						<GlyphBookOpen
							size={16}
							className="lock-icon lock-icon-open"
						/>
					</span>
				) : null}
			</div>
	);

	/* Carving sits as a sibling of the frame, inside a relative wrapper,
	   so its negative-offset corner + edge ornaments overflow outward
	   without being clipped by .thumbnail-frame's overflow:hidden. */
	const framed = (
		<div className="relative">
			{isFeature ? <AspectRatio ratio={3 / 2}>{frame}</AspectRatio> : frame}
			{carved ? <CornerCarving /> : null}
		</div>
	);

	return (
		<figure className={className}>
			{framed}
			{showCaption ? (
				<figcaption className="small-caps text-xs text-fg-muted mt-2">
					{caption ?? "PHOTO · PLACEHOLDER"}
				</figcaption>
			) : null}
		</figure>
	);
}
