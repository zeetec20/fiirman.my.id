/**
 * Hand-drawn manuscript-vibe glyphs. Engraving-style line art at
 * 24×24 viewBox, stroke = currentColor. Use in place of lucide icons
 * for chrome that should read as part of the typeset book vibe.
 *
 * Sizing — pass `size` prop (number or rem-aware). Default 18.
 */

type GlyphProps = {
	size?: number;
	className?: string;
};

const baseSvg = (size: number) =>
	({
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": "true",
		focusable: "false" as const,
	}) as const;

/** Fletched arrow pointing up — classical printer's mark for "to the top". */
export function GlyphArrowUp({ size = 18, className = "" }: GlyphProps) {
	return (
		<svg {...baseSvg(size)} className={`inline-block ${className}`}>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<line x1="12" y1="20" x2="12" y2="5" />
				<path d="M6 10 L 12 4 L 18 10" />
				<line x1="9" y1="16" x2="12" y2="13" />
				<line x1="15" y1="16" x2="12" y2="13" />
			</g>
		</svg>
	);
}

/** Woodcut sun — disc with inner ring, 8 rays alternating long/short,
 *  filigree dot accents between the long rays. Manuscript-illumination
 *  character (Sol Invictus / book-of-hours border sun). */
export function GlyphSun({ size = 18, className = "" }: GlyphProps) {
	return (
		<svg {...baseSvg(size)} className={`inline-block ${className}`}>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.3"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{/* outer disc + inner ring */}
				<circle cx="12" cy="12" r="4.2" />
				<circle cx="12" cy="12" r="2.4" />
				{/* 4 long cardinal rays — triangular pennants */}
				<path d="M12 1.5 L 11.2 5 L 12.8 5 Z" fill="currentColor" />
				<path d="M12 22.5 L 11.2 19 L 12.8 19 Z" fill="currentColor" />
				<path d="M1.5 12 L 5 11.2 L 5 12.8 Z" fill="currentColor" />
				<path d="M22.5 12 L 19 11.2 L 19 12.8 Z" fill="currentColor" />
				{/* 4 short diagonal rays */}
				<line x1="5" y1="5" x2="6.6" y2="6.6" />
				<line x1="17.4" y1="17.4" x2="19" y2="19" />
				<line x1="5" y1="19" x2="6.6" y2="17.4" />
				<line x1="17.4" y1="6.6" x2="19" y2="5" />
			</g>
			<g fill="currentColor">
				{/* center sol mark */}
				<circle cx="12" cy="12" r="0.9" />
			</g>
		</svg>
	);
}

/** Crescent moon with flanking stars — book-of-hours night.
 *  Crescent is solid; two small 4-point stars beside it. */
export function GlyphMoon({ size = 18, className = "" }: GlyphProps) {
	return (
		<svg {...baseSvg(size)} className={`inline-block ${className}`}>
			<g fill="currentColor">
				{/* solid crescent — outer arc minus inner arc */}
				<path
					d="M17 4 A 9 9 0 1 0 20 16 A 7 7 0 0 1 17 4 Z"
				/>
				{/* small 4-point star, upper right */}
				<path d="M21 6 L 21.4 7.6 L 23 8 L 21.4 8.4 L 21 10 L 20.6 8.4 L 19 8 L 20.6 7.6 Z" />
				{/* tiny 4-point star, lower right */}
				<path d="M22 14 L 22.25 14.9 L 23.2 15.2 L 22.25 15.5 L 22 16.4 L 21.75 15.5 L 20.8 15.2 L 21.75 14.9 Z" />
			</g>
		</svg>
	);
}

/** Astrolabe — concentric rings, cardinal tick marks at N/E/S/W,
 *  inscribed cross, center jewel. Real instrument character. */
export function GlyphAstrolabe({ size = 18, className = "" }: GlyphProps) {
	return (
		<svg {...baseSvg(size)} className={`inline-block ${className}`}>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.3"
				strokeLinecap="round"
			>
				{/* outer + inner rings */}
				<circle cx="12" cy="12" r="9" />
				<circle cx="12" cy="12" r="5.5" />
				{/* inscribed cross — short of the rings */}
				<line x1="12" y1="6.5" x2="12" y2="17.5" />
				<line x1="6.5" y1="12" x2="17.5" y2="12" />
				{/* cardinal tick marks just outside the outer ring */}
				<line x1="12" y1="1.5" x2="12" y2="3" />
				<line x1="12" y1="21" x2="12" y2="22.5" />
				<line x1="1.5" y1="12" x2="3" y2="12" />
				<line x1="21" y1="12" x2="22.5" y2="12" />
			</g>
			<g fill="currentColor">
				{/* center jewel */}
				<circle cx="12" cy="12" r="1.4" />
			</g>
		</svg>
	);
}

/** Closed book — sealed spine view. Default state on idle article cards. */
export function GlyphBookClosed({ size = 18, className = "" }: GlyphProps) {
	return (
		<svg {...baseSvg(size)} className={`inline-block ${className}`}>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinejoin="round"
				strokeLinecap="round"
			>
				<rect x="6" y="3.5" width="12" height="17" rx="0.6" />
				<line x1="9" y1="3.5" x2="9" y2="20.5" />
				<line x1="11.5" y1="8" x2="15.5" y2="8" />
				<line x1="11.5" y1="11" x2="15.5" y2="11" />
				<line x1="11.5" y1="14" x2="13.5" y2="14" />
			</g>
		</svg>
	);
}

/** Open book — V-shape with leaves. Hover state on interactive thumbnails. */
export function GlyphBookOpen({ size = 18, className = "" }: GlyphProps) {
	return (
		<svg {...baseSvg(size)} className={`inline-block ${className}`}>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinejoin="round"
				strokeLinecap="round"
			>
				<path d="M3 6 L 12 8 L 21 6 L 21 19 L 12 21 L 3 19 Z" />
				<line x1="12" y1="8" x2="12" y2="21" />
				<line x1="6" y1="10" x2="9.5" y2="10.5" />
				<line x1="14.5" y1="10.5" x2="18" y2="10" />
				<line x1="6" y1="13" x2="9.5" y2="13.5" />
				<line x1="14.5" y1="13.5" x2="18" y2="13" />
			</g>
		</svg>
	);
}
