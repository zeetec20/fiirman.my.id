/**
 * Fixed background atmosphere — paper grain + starry night + age stains +
 * candle glow + heliocentric orbits + embers. Decoration stays atmospheric
 * (texture + motion), never characters.
 *
 * Stars use three glyph variants (cross, diamond, dot) so the night sky
 * doesn't read as a uniform dot grid. The heliocentric orbits (sun + 4
 * planets) are rendered by a single Lottie animation — one canvas layer
 * replaces the SVG SMIL + parallel CSS keyframes that previously drove
 * sun rotation, sun pulse, and four <animateMotion> planets. dotlottie
 * pauses cleanly on tab visibility / reduced-motion / mobile, which the
 * old SMIL pipeline could not.
 */

import type { DotLottieReactProps } from "@lottiefiles/dotlottie-react";
import { type ComponentType, useEffect, useState } from "react";

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

/* dotlottie-react ships a WASM player — defer the import to the client.
   The component is mounted only after we've successfully loaded the
   module in the browser; on the server (or before hydration) the orbit
   layer stays empty, which is acceptable for a fixed decoration.

   Three early-exit gates before the WASM payload is requested:
     1. Save-Data header / `effectiveType` ≤ 3g — respect bandwidth budget.
     2. Viewport < 768px — CSS already pauses orbits at mobile; shipping
        the WASM serves no purpose there.
     3. `prefers-reduced-motion` — already honored for autoplay below;
        also skip the import entirely.
   The remaining defer-to-idle keeps the chunk off the LCP critical path
   even on desktop. */
type NetworkInformation = {
	saveData?: boolean;
	effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

function shouldSkipOrbits(): boolean {
	const conn = (
		navigator as Navigator & { connection?: NetworkInformation }
	).connection;
	if (conn?.saveData) return true;
	if (
		conn?.effectiveType === "slow-2g" ||
		conn?.effectiveType === "2g" ||
		conn?.effectiveType === "3g"
	)
		return true;
	if (window.matchMedia("(max-width: 768px)").matches) return true;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
		return true;
	return false;
}

function OrbitsLottie() {
	const [Player, setPlayer] = useState<ComponentType<DotLottieReactProps> | null>(null);
	const [shouldPlay, setShouldPlay] = useState(true);

	useEffect(() => {
		if (shouldSkipOrbits()) return;

		let cancelled = false;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setShouldPlay(!mq.matches);
		const onChange = () => setShouldPlay(!mq.matches);
		mq.addEventListener("change", onChange);

		const loadPlayer = () => {
			import("@lottiefiles/dotlottie-react").then((mod) => {
				if (!cancelled) setPlayer(() => mod.DotLottieReact);
			});
		};

		const win = window as Window & {
			requestIdleCallback?: (cb: () => void) => number;
			cancelIdleCallback?: (id: number) => void;
		};
		const hasIdle = typeof win.requestIdleCallback === "function";
		const handle = hasIdle
			? (win.requestIdleCallback as (cb: () => void) => number)(loadPlayer)
			: window.setTimeout(loadPlayer, 200);

		return () => {
			cancelled = true;
			mq.removeEventListener("change", onChange);
			if (hasIdle && typeof win.cancelIdleCallback === "function") {
				win.cancelIdleCallback(handle as number);
			} else {
				window.clearTimeout(handle as number);
			}
		};
	}, []);

	if (!Player) return null;
	return (
		<Player
			src="/lottie/orbits.json"
			autoplay={shouldPlay}
			loop
			renderConfig={{ autoResize: true }}
		/>
	);
}

export function BackgroundDecoration() {
	return (
		<>
			{/* Paper grain — small feTurbulence tile repeated via CSS (same
			    pattern as the thumbnail grains). The previous full-viewport
			    <svg><rect filter> forced Chrome to software-rasterize fractal
			    noise across the whole screen before first paint (~2s stall in
			    headless/low-end environments); a 240px tile rasters once and
			    repeats for free. */}
			<div aria-hidden="true" className="bg-paper-grain" />

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

			{/* Heliocentric orbits — sun + 4 planets via Lottie */}
			<div aria-hidden="true" className="bg-orbits-lottie">
				<OrbitsLottie />
			</div>

			<div aria-hidden="true" className="bg-ember-field">
				{Array.from({ length: EMBER_COUNT }).map((_, i) => (
					<span key={i} className={`ember ember-${i + 1}`} />
				))}
			</div>
		</>
	);
}
