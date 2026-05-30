import { useId, type ReactNode } from "react";

/**
 * Classical manuscript portrait frame — wraps any image (or arbitrary
 * children) with a double-rule border + four ornamental SVG corner
 * pieces + an optional wax-seal stempel imprinted bottom-right.
 *
 * The shimmer overlay (gold-leaf sheen) lives inside the inner border;
 * the seal is positioned over the outer edge so it reads as pressed
 * onto the surrounding paper.
 */
export function PortraitFrame({
	children,
	className = "",
	accent = "rule",
	seal,
}: {
	children: ReactNode;
	className?: string;
	/** `rule` = ink-color ornaments; `rubric` = red illuminated ornaments. */
	accent?: "rule" | "rubric";
	/** Wax-seal stamp on bottom-right corner. Provide ring text + center monogram. */
	seal?: { text: string; monogram: string };
}) {
	const accentClass =
		accent === "rubric" ? "text-rubric" : "text-fg-muted";
	return (
		<div className={`portrait-frame relative ${className}`}>
			{/* Outer hairline frame */}
			<div className="relative border border-rule">
				{/* Inner hairline (double-rule effect) */}
				<div className="relative border border-rule/40 p-1 overflow-hidden">
					{children}
					<span
						aria-hidden="true"
						className="portrait-shimmer absolute inset-0 pointer-events-none"
					/>
				</div>
			</div>

			{/* Four manuscript corner ornaments — overflow the frame edges */}
			<PortraitCorner position="tl" className={accentClass} />
			<PortraitCorner position="tr" className={accentClass} />
			<PortraitCorner position="bl" className={accentClass} />
			<PortraitCorner position="br" className={accentClass} />

			{/* Wax-seal stempel — bottom-right, overhanging */}
			{seal ? (
				<PortraitSeal text={seal.text} monogram={seal.monogram} />
			) : null}
		</div>
	);
}

function PortraitCorner({
	position,
	className = "",
}: {
	position: "tl" | "tr" | "bl" | "br";
	className?: string;
}) {
	const placement = {
		tl: "-top-3 -left-3",
		tr: "-top-3 -right-3 rotate-90",
		br: "-bottom-3 -right-3 rotate-180",
		bl: "-bottom-3 -left-3 -rotate-90",
	}[position];

	return (
		<span
			aria-hidden="true"
			className={`absolute pointer-events-none ${placement} ${className}`}
		>
			<svg
				width="28"
				height="28"
				viewBox="0 0 32 32"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M3 14 L 3 3 L 14 3" />
				<path d="M3 9 Q 5 5 9 3 Q 11 5 9 9 Q 5 11 3 9 Z" />
				<path d="M14 3 L 18 3" />
				<path d="M3 14 L 3 18" />
				<path
					d="M19 8 L 22 11 L 19 14 L 16 11 Z"
					fill="currentColor"
					stroke="none"
				/>
				<circle cx="3" cy="3" r="1.4" fill="currentColor" stroke="none" />
			</svg>
		</span>
	);
}

/**
 * Cardinal alchemical glyph — drawn at the supplied (x, y).
 *   sun     → solar dot-in-circle (Sol / gold)
 *   moon    → waning crescent (Luna / silver)
 *   star    → six-point asterisk (Stella)
 *   cross   → equal-armed cross (manuscript fiat)
 */
function CardinalGlyph({
	x,
	y,
	kind,
}: {
	x: number;
	y: number;
	kind: "sun" | "moon" | "star" | "cross";
}) {
	if (kind === "sun") {
		return (
			<g transform={`translate(${x} ${y})`}>
				<circle r="2.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
				<circle r="0.9" fill="currentColor" />
			</g>
		);
	}
	if (kind === "moon") {
		return (
			<g transform={`translate(${x} ${y})`}>
				<path
					d="M -1.6 -2.4 A 2.6 2.6 0 1 0 -1.6 2.4 A 2 2 0 1 1 -1.6 -2.4 Z"
					fill="currentColor"
				/>
			</g>
		);
	}
	if (kind === "star") {
		return (
			<g transform={`translate(${x} ${y})`}>
				<line x1="-2.6" y1="0" x2="2.6" y2="0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
				<line x1="0" y1="-2.6" x2="0" y2="2.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
				<line x1="-1.8" y1="-1.8" x2="1.8" y2="1.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
				<line x1="-1.8" y1="1.8" x2="1.8" y2="-1.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
			</g>
		);
	}
	// cross
	return (
		<g transform={`translate(${x} ${y})`}>
			<line x1="-2.4" y1="0" x2="2.4" y2="0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
			<line x1="0" y1="-2.4" x2="0" y2="2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
		</g>
	);
}

function PortraitSeal({
	text,
	monogram,
}: {
	text: string;
	monogram: string;
}) {
	const uid = useId().replace(/:/g, "");
	const pathId = `seal-curve-${uid}`;
	// Repeat the inscription so it visually fills the ring even on short text.
	const inscription = ` · ${text} `;
	const ringText = inscription.repeat(2);

	// Cardinal glyphs at N / E / S / W on r=38 ring.
	const cardinals: Array<{ kind: "sun" | "moon" | "star" | "cross"; angle: number }> = [
		{ kind: "sun", angle: -Math.PI / 2 }, // N
		{ kind: "star", angle: 0 }, // E
		{ kind: "moon", angle: Math.PI / 2 }, // S
		{ kind: "cross", angle: Math.PI }, // W
	];
	const cardR = 38;

	// Hexagram (two overlapping equilateral triangles) — Solomon's seal,
	// drawn around the monogram. Vertices on a r=18 circle.
	const triR = 18;
	const triUp = [0, 1, 2]
		.map((i) => {
			const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
			return `${50 + Math.cos(a) * triR},${50 + Math.sin(a) * triR}`;
		})
		.join(" ");
	const triDown = [0, 1, 2]
		.map((i) => {
			const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
			return `${50 + Math.cos(a) * triR},${50 + Math.sin(a) * triR}`;
		})
		.join(" ");

	return (
		<span
			aria-hidden="true"
			className="portrait-seal absolute -bottom-6 -right-6 pointer-events-none text-rubric"
		>
			<svg
				width="96"
				height="96"
				viewBox="0 0 100 100"
				xmlns="http://www.w3.org/2000/svg"
				className="portrait-seal__svg"
			>
				<defs>
					{/* Outer circular path for the curved inscription */}
					<path
						id={pathId}
						d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
						fill="none"
					/>
				</defs>

				{/* Outer ring — drawn ink */}
				<circle
					cx="50"
					cy="50"
					r="46"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.4"
					opacity="1"
				/>
				{/* Second ring carries the inscription */}
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					stroke="currentColor"
					strokeWidth="0.8"
					opacity="0.9"
				/>
				{/* Inner sigil ring — bounds the hexagram */}
				<circle
					cx="50"
					cy="50"
					r="26"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					opacity="1"
				/>

				{/* Hexagram — overlapping triangles, hermetic register */}
				<polygon
					points={triUp}
					fill="none"
					stroke="currentColor"
					strokeWidth="1.1"
					strokeLinejoin="round"
					opacity="1"
				/>
				<polygon
					points={triDown}
					fill="none"
					stroke="currentColor"
					strokeWidth="1.1"
					strokeLinejoin="round"
					opacity="1"
				/>

				{/* Cardinal alchemical glyphs — N=sun · E=star · S=moon · W=cross */}
				{cardinals.map(({ kind, angle }, i) => (
					<CardinalGlyph
						key={`card-${i}`}
						x={50 + Math.cos(angle) * cardR}
						y={50 + Math.sin(angle) * cardR}
						kind={kind}
					/>
				))}

				{/* Ordinal dot accents — NE / SE / SW / NW */}
				{[-Math.PI / 4, Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4].map(
					(a, i) => (
						<circle
							key={`dot-${i}`}
							cx={50 + Math.cos(a) * cardR}
							cy={50 + Math.sin(a) * cardR}
							r="1.2"
							fill="currentColor"
							opacity="1"
						/>
					),
				)}

				{/* Curved inscription around the ring */}
				<text
					fill="currentColor"
					fontSize="6"
					letterSpacing="0.18em"
					opacity="1"
					fontWeight="500"
					style={{
						fontFamily: "var(--font-smallcaps)",
						fontVariantCaps: "all-small-caps",
					}}
				>
					<textPath href={`#${pathId}`} startOffset="0">
						{ringText}
					</textPath>
				</text>

				{/* Center monogram — smaller, sigil reads first */}
				<text
					x="50"
					y="50"
					textAnchor="middle"
					dominantBaseline="central"
					fill="currentColor"
					fontSize="14"
					fontStyle="italic"
					fontWeight="500"
					style={{ fontFamily: "var(--font-serif-display)" }}
				>
					{monogram}
				</text>
			</svg>
		</span>
	);
}
