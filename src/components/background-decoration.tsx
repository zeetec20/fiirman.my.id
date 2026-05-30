/**
 * Fixed background atmosphere — paper grain + starry night + age stains +
 * candle glow + heliocentric orbits + embers. Decoration stays atmospheric
 * (texture + motion), never characters.
 *
 * Stars use three glyph variants (cross, diamond, dot) so the night sky
 * doesn't read as a uniform dot grid. Planets are differentiated by body —
 * Mercury (bare disc), Earth (disc + small moon), Saturn (disc + tilted
 * ring), Jupiter (banded disc). Sun is a rayed sunburst with halo ring.
 */

const EMBER_COUNT = 6;

type StarType = "cross" | "diamond" | "dot";
type Star = {
	x: number;
	y: number;
	size: number;
	rotate: number;
	delay: number;
	period: number;
	tint: "muted" | "rubric";
	type: StarType;
};

/* Deterministic star field — pre-baked positions, SSR-safe. Coordinates
   in a 100×100 viewBox (preserveAspectRatio=none stretches to viewport). */
const STARS: Star[] = [
	{ x: 7, y: 12, size: 1.3, rotate: 0, delay: 0, period: 5, tint: "muted", type: "cross" },
	{ x: 18, y: 5, size: 0.5, rotate: 0, delay: 1.2, period: 4, tint: "muted", type: "dot" },
	{ x: 28, y: 22, size: 1.6, rotate: 45, delay: 2.8, period: 6, tint: "rubric", type: "diamond" },
	{ x: 41, y: 8, size: 0.6, rotate: 0, delay: 0.6, period: 4.5, tint: "muted", type: "dot" },
	{ x: 52, y: 16, size: 1.4, rotate: 22, delay: 3.4, period: 5.5, tint: "muted", type: "cross" },
	{ x: 64, y: 4, size: 0.5, rotate: 0, delay: 1.8, period: 3.8, tint: "muted", type: "dot" },
	{ x: 73, y: 14, size: 1.3, rotate: 0, delay: 2.2, period: 6.2, tint: "muted", type: "diamond" },
	{ x: 85, y: 9, size: 1.5, rotate: 30, delay: 4.1, period: 4.2, tint: "rubric", type: "cross" },
	{ x: 94, y: 19, size: 0.6, rotate: 0, delay: 0.9, period: 5.0, tint: "muted", type: "dot" },
	{ x: 5, y: 31, size: 0.5, rotate: 0, delay: 3.0, period: 5.7, tint: "muted", type: "dot" },
	{ x: 14, y: 44, size: 1.4, rotate: 12, delay: 1.5, period: 4.4, tint: "muted", type: "cross" },
	{ x: 24, y: 58, size: 1.5, rotate: 45, delay: 4.8, period: 6.4, tint: "rubric", type: "diamond" },
	{ x: 36, y: 38, size: 0.6, rotate: 0, delay: 0.3, period: 4.9, tint: "muted", type: "dot" },
	{ x: 49, y: 65, size: 0.5, rotate: 0, delay: 2.6, period: 3.6, tint: "muted", type: "dot" },
	{ x: 60, y: 47, size: 1.5, rotate: 0, delay: 3.7, period: 6.0, tint: "muted", type: "cross" },
	{ x: 70, y: 71, size: 0.6, rotate: 0, delay: 1.0, period: 5.3, tint: "muted", type: "dot" },
	{ x: 81, y: 41, size: 1.4, rotate: 45, delay: 4.2, period: 4.6, tint: "rubric", type: "diamond" },
	{ x: 92, y: 62, size: 0.5, rotate: 0, delay: 2.0, period: 5.8, tint: "muted", type: "dot" },
	{ x: 8, y: 78, size: 1.3, rotate: 22, delay: 3.3, period: 4.8, tint: "muted", type: "diamond" },
	{ x: 20, y: 92, size: 0.6, rotate: 0, delay: 0.7, period: 5.2, tint: "muted", type: "dot" },
	{ x: 38, y: 84, size: 1.4, rotate: 0, delay: 4.5, period: 3.9, tint: "muted", type: "cross" },
	{ x: 55, y: 89, size: 0.5, rotate: 0, delay: 2.4, period: 6.6, tint: "muted", type: "dot" },
	{ x: 72, y: 96, size: 1.3, rotate: 36, delay: 1.7, period: 4.3, tint: "muted", type: "diamond" },
	{ x: 88, y: 81, size: 0.5, rotate: 0, delay: 3.9, period: 5.5, tint: "muted", type: "dot" },
];

/* Heliocentric orbits — concentric ellipses centered on a 1000×1000
   viewBox, sun at 500,500. Each planet group rotates around centre.
   Body shapes differ per orbit so they read as distinct celestial
   objects: Mercury / Earth / Saturn / Jupiter. */
/* Kepler — sun sits at one focus, ellipse centre is offset from sun
   by c = √(rx² − ry²). Each orbit's ring is drawn shifted right of
   sun so the diagram reads as proper orbital geometry, not a stack of
   concentric ellipses with sun dead-centre. */
const SUN_X = 500;
const SUN_Y = 500;
const focus = (rx: number, ry: number) => Math.round(Math.sqrt(rx * rx - ry * ry));

const ORBITS = [
	{ rx: 130, ry: 100, cx: SUN_X + focus(130, 100), cy: SUN_Y },
	{ rx: 220, ry: 175, cx: SUN_X + focus(220, 175), cy: SUN_Y },
	{ rx: 320, ry: 250, cx: SUN_X + focus(320, 250), cy: SUN_Y },
	{ rx: 425, ry: 330, cx: SUN_X + focus(425, 330), cy: SUN_Y },
];

function StarGlyph({ s }: { s: Star }) {
	if (s.type === "cross") {
		const r = s.size;
		return (
			<g>
				<line x1={-r} y1={0} x2={r} y2={0} className="star-stroke" />
				<line x1={0} y1={-r} x2={0} y2={r} className="star-stroke" />
				<circle r={r * 0.18} className="star-fill" />
			</g>
		);
	}
	if (s.type === "diamond") {
		const r = s.size;
		return (
			<g>
				<path
					d={`M0,${-r} L${r * 0.55},0 L0,${r} L${-r * 0.55},0 Z`}
					className="star-fill"
				/>
				<circle r={r * 0.15} className="star-fill star-halo" />
			</g>
		);
	}
	// dot
	return <circle r={s.size} className="star-fill" />;
}

function Sun() {
	const rays = Array.from({ length: 12 }, (_, i) => {
		const angle = (i * 30 * Math.PI) / 180;
		const inner = 16;
		const outer = i % 2 === 0 ? 24 : 21;
		return {
			x1: 500 + Math.cos(angle) * inner,
			y1: 500 + Math.sin(angle) * inner,
			x2: 500 + Math.cos(angle) * outer,
			y2: 500 + Math.sin(angle) * outer,
			key: i,
		};
	});
	return (
		<g className="orbit-sun-group">
			{/* Halo ring */}
			<circle
				cx="500"
				cy="500"
				r="20"
				fill="none"
				className="orbit-sun-halo"
			/>
			{/* 12 alternating rays — long/short, woodcut register */}
			{rays.map((r) => (
				<line
					key={r.key}
					x1={r.x1}
					y1={r.y1}
					x2={r.x2}
					y2={r.y2}
					className="orbit-sun-ray"
				/>
			))}
			{/* Central disc */}
			<circle cx="500" cy="500" r="10" className="orbit-sun" />
			{/* Inner pip */}
			<circle cx="500" cy="500" r="2.5" className="orbit-sun-pip" />
		</g>
	);
}

/* Planets — drawn at local origin (0,0). SVG <animateMotion> with
   <mpath> drives them along the actual orbit ellipse path so they
   ride the visible orbit line, not a separate circular path. */

function PlanetMercury() {
	return (
		<>
			<circle r="5" className="planet-disc" />
		</>
	);
}

function PlanetEarth() {
	return (
		<>
			<circle r="6.5" className="planet-disc" />
			<circle cx="13" cy="-8" r="2" className="planet-moon" />
		</>
	);
}

function PlanetSaturn() {
	return (
		<>
			<ellipse
				rx="14"
				ry="3.5"
				fill="none"
				className="planet-ring"
				transform="rotate(-22)"
			/>
			<circle r="6.5" className="planet-disc" />
		</>
	);
}

function PlanetJupiter() {
	return (
		<>
			<circle r="10" className="planet-disc" />
			<line x1="-9" y1="0" x2="9" y2="0" className="planet-band" />
			<line
				x1="-7"
				y1="-5"
				x2="7"
				y2="-5"
				className="planet-band planet-band-soft"
			/>
			<circle cx="17" cy="-12" r="1.6" className="planet-moon" />
		</>
	);
}

const PLANETS = [PlanetMercury, PlanetEarth, PlanetSaturn, PlanetJupiter] as const;
const PLANET_PERIODS = [58, 96, 152, 218] as const;
const PLANET_BEGINS = [-8, -34, -71, -52] as const;

/** SVG path d-string for a full ellipse — used by both the visible
 *  orbit ring and the planet's animateMotion path reference. */
const ellipsePathD = (cx: number, cy: number, rx: number, ry: number) =>
	`M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

export function BackgroundDecoration() {
	return (
		<>
			<svg
				aria-hidden="true"
				className="bg-paper-grain"
				xmlns="http://www.w3.org/2000/svg"
			>
				<filter id="paper-noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.9"
						numOctaves="3"
						stitchTiles="stitch"
					/>
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.55 0"
					/>
				</filter>
				<rect width="100%" height="100%" filter="url(#paper-noise)" />
			</svg>

			{/* Starry night — varied glyphs (cross / diamond / dot), twinkle */}
			<svg
				aria-hidden="true"
				className="bg-stars"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{STARS.map((s, i) => (
					<g
						key={`star-${i}`}
						className={`star star-${s.tint} star-${s.type}`}
						transform={`translate(${s.x} ${s.y}) rotate(${s.rotate})`}
						style={{
							animationDuration: `${s.period}s`,
							animationDelay: `${s.delay}s`,
						}}
					>
						<StarGlyph s={s} />
					</g>
				))}
			</svg>

			<div aria-hidden="true" className="bg-age-stains" />
			<div aria-hidden="true" className="bg-candle-glow" />

			{/* Heliocentric orbits — sun + 4 distinct planets */}
			<svg
				aria-hidden="true"
				className="bg-orbits"
				viewBox="0 0 1000 1000"
				preserveAspectRatio="xMidYMid meet"
				xmlns="http://www.w3.org/2000/svg"
			>
				{/* Off-center bias: shift the whole system to the right edge so
				    the sun sits well clear of the reading column — orbits bleed
				    softly into the right margin, never crossing prose width. */}
				<g transform="translate(220 -40) rotate(-6 500 500)">
					{ORBITS.map((o, i) => (
						<path
							key={`orbit-${i}`}
							id={`orbit-path-${i}`}
							className={`orbit-ring orbit-ring-${i + 1}`}
							d={ellipsePathD(o.cx, o.cy, o.rx, o.ry)}
						/>
					))}

					<Sun />

					{PLANETS.map((Planet, i) => (
						<g
							key={`planet-g-${i}`}
							className={`orbit-planet orbit-planet-${i + 1}`}
						>
							<Planet />
							<animateMotion
								dur={`${PLANET_PERIODS[i]}s`}
								repeatCount="indefinite"
								begin={`${PLANET_BEGINS[i]}s`}
								rotate="0"
							>
								<mpath href={`#orbit-path-${i}`} />
							</animateMotion>
						</g>
					))}
				</g>
			</svg>

			<div aria-hidden="true" className="bg-ember-field">
				{Array.from({ length: EMBER_COUNT }).map((_, i) => (
					<span key={i} className={`ember ember-${i + 1}`} />
				))}
			</div>
		</>
	);
}
