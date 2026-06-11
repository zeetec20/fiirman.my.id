/**
 * Generate public/lottie/orbits.json from the same geometry constants
 * the SVG version of <BackgroundDecoration> uses. Single source of truth:
 * if planet sizes / orbit ellipses change, regenerate via:
 *   bun run scripts/build-orbits-lottie.mjs
 *
 * Output: Bodymovin JSON v5.7.4 — 30fps, 320s loop. Loaded at runtime
 * by @lottiefiles/dotlottie-react (which also accepts plain .json).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/lottie/orbits.json");

const FR = 30;
const OP = 9600; // 320s — chosen so sun rotation closes cleanly
/* Comp deliberately smaller than the cover-fit lottie div on landscape
   so the CSS cover-fit upscales the geometry (~1.39× on 1920×1080).
   Aspect 1.8 preserved. Orbit-4 right clips at comp x=W, but that
   point maps to viewport pixel 1932 — off-screen on 1920-wide viewport.
   Hard floor: H ≥ 778 so sun_y world (≈358) stays above orbit-4 top
   delta (-356) without clipping orbit-4's top arc at comp y=0. */
const W = 1400;
const H = 778;

const K = 0.5522847498307933; // cubic-bezier ellipse constant

const SUN_X = 500;
const SUN_Y = 500;
const focus = (rx, ry) => Math.round(Math.sqrt(rx * rx - ry * ry));

const ORBITS = [
	{ rx: 130, ry: 100, cx: SUN_X + focus(130, 100), cy: SUN_Y },
	{ rx: 220, ry: 175, cx: SUN_X + focus(220, 175), cy: SUN_Y },
	{ rx: 320, ry: 250, cx: SUN_X + focus(320, 250), cy: SUN_Y },
	{ rx: 425, ry: 330, cx: SUN_X + focus(425, 330), cy: SUN_Y },
];

const PLANET_PERIODS = [58, 96, 152, 218];
const PLANET_BEGINS = [-8, -34, -71, -52];

/* Colors baked as light-theme tones — dark theme handled via CSS
   filter on the Lottie container (see .bg-orbits-lottie). */
const hex = (h) => {
	const n = parseInt(h.replace("#", ""), 16);
	return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255, 1];
};
const RUBRIC = hex("#a23a2d");
const RUBRIC_FG = hex("#efe6d2");
const FG_MUTED = hex("#6a615a");
/* Neutral warm-gray that reads as a muted hairline against parchment
   (light theme) and against dark bg (dark theme) without needing
   per-theme CSS color tricks. */
const RULE_HEAVY = hex("#7a7268");
const BG = hex("#f4eedc");

const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

const LIN_I = { x: [1], y: [1] };
const LIN_O = { x: [0], y: [0] };
const EASE_I = { x: [0.6], y: [1] };
const EASE_O = { x: [0.4], y: [0] };

const sc = (k) => ({ a: 0, k });

function identityTransform(opacity = 100) {
	return {
		o: sc(opacity),
		r: sc(0),
		p: sc([0, 0]),
		a: sc([0, 0]),
		s: sc([100, 100]),
		sk: sc(0),
		sa: sc(0),
	};
}

function layerTransform({ p = [0, 0, 0], a = [0, 0, 0], r = 0, s = [100, 100, 100], o = 100 }) {
	return {
		o: sc(o),
		r: sc(r),
		p: sc(p),
		a: sc(a),
		s: sc(s),
	};
}

/* --- Ellipse / line shape primitives ----------------------------------- */

function ellipseGroup({ cx, cy, rx, ry, fill, stroke, strokeWidth, opacity = 100 }) {
	const items = [
		{
			ty: "el",
			p: sc([cx, cy]),
			s: sc([rx * 2, ry * 2]),
			d: 1,
			nm: "Ellipse Path",
		},
	];
	if (fill) {
		items.push({
			ty: "fl",
			c: sc(fill),
			o: sc(100),
			r: 1,
			nm: "Fill",
		});
	}
	if (stroke) {
		items.push({
			ty: "st",
			c: sc(stroke),
			o: sc(100),
			w: sc(strokeWidth ?? 1),
			lc: 2,
			lj: 2,
			ml: 4,
			nm: "Stroke",
		});
	}
	items.push({ ty: "tr", ...identityTransform(opacity), nm: "Transform" });
	return { ty: "gr", it: items, nm: "Ellipse", np: items.length };
}

function lineGroup({ x1, y1, x2, y2, stroke, strokeWidth, opacity = 100 }) {
	return {
		ty: "gr",
		nm: "Line",
		np: 3,
		it: [
			{
				ty: "sh",
				ks: sc({
					i: [
						[0, 0],
						[0, 0],
					],
					o: [
						[0, 0],
						[0, 0],
					],
					v: [
						[x1, y1],
						[x2, y2],
					],
					c: false,
				}),
				nm: "Path",
			},
			{
				ty: "st",
				c: sc(stroke),
				o: sc(100),
				w: sc(strokeWidth),
				lc: 2,
				lj: 2,
				ml: 4,
				nm: "Stroke",
			},
			{ ty: "tr", ...identityTransform(opacity), nm: "Transform" },
		],
	};
}

/* --- Sun (rays + halo + disc + pip) ----------------------------------- */

function sunShapes() {
	const shapes = [];
	const halo = ellipseGroup({
		cx: 0,
		cy: 0,
		rx: 20,
		ry: 20,
		stroke: RUBRIC,
		strokeWidth: 1.5,
		opacity: 35,
	});
	halo.nm = "Halo";
	shapes.push(halo);

	for (let i = 0; i < 12; i++) {
		const angle = (i * 30 * Math.PI) / 180;
		const inner = 16;
		const outer = i % 2 === 0 ? 24 : 21;
		shapes.push(
			lineGroup({
				x1: r3(Math.cos(angle) * inner),
				y1: r3(Math.sin(angle) * inner),
				x2: r3(Math.cos(angle) * outer),
				y2: r3(Math.sin(angle) * outer),
				stroke: RUBRIC,
				strokeWidth: 2,
				opacity: 55,
			}),
		);
	}

	// Disc (pulses via animated fill opacity)
	shapes.push({
		ty: "gr",
		nm: "Disc",
		np: 3,
		it: [
			{ ty: "el", p: sc([0, 0]), s: sc([20, 20]), d: 1, nm: "Disc Path" },
			{
				ty: "fl",
				c: sc(RUBRIC),
				o: pulseOpacity(),
				r: 1,
				nm: "Disc Fill",
			},
			{ ty: "tr", ...identityTransform(100), nm: "Transform" },
		],
	});

	// Pip
	shapes.push({
		ty: "gr",
		nm: "Pip",
		np: 3,
		it: [
			{ ty: "el", p: sc([0, 0]), s: sc([5, 5]), d: 1, nm: "Pip Path" },
			{ ty: "fl", c: sc(RUBRIC_FG), o: sc(100), r: 1, nm: "Pip Fill" },
			{ ty: "tr", ...identityTransform(55), nm: "Transform" },
		],
	});

	return shapes;
}

/* Sun-disc pulse: 48 → 85 → 48 over 7s (210 frames). Keyframes
   generated across full OP so the property loops with the comp. */
function pulseOpacity() {
	const cycleFrames = 7 * FR;
	const kfs = [];
	let t = 0;
	let goingUp = true;
	while (t <= OP + cycleFrames) {
		kfs.push({
			t: r2(t),
			s: [goingUp ? 48 : 85],
			i: EASE_I,
			o: EASE_O,
		});
		t += cycleFrames / 2;
		goingUp = !goingUp;
	}
	return { a: 1, k: kfs };
}

/* --- Planet bodies --------------------------------------------------- */

function planetShapesMercury() {
	return [
		{
			ty: "gr",
			nm: "Mercury Disc",
			np: 3,
			it: [
				{ ty: "el", p: sc([0, 0]), s: sc([10, 10]), d: 1, nm: "Disc" },
				{ ty: "fl", c: sc(RUBRIC), o: sc(100), r: 1, nm: "Fill" },
				{ ty: "tr", ...identityTransform(65), nm: "Transform" },
			],
		},
	];
}

function planetShapesEarth() {
	return [
		{
			ty: "gr",
			nm: "Earth Moon",
			np: 3,
			it: [
				{ ty: "el", p: sc([13, -8]), s: sc([4, 4]), d: 1, nm: "Moon" },
				{ ty: "fl", c: sc(FG_MUTED), o: sc(100), r: 1, nm: "Fill" },
				{ ty: "tr", ...identityTransform(75), nm: "Transform" },
			],
		},
		{
			ty: "gr",
			nm: "Earth Disc",
			np: 3,
			it: [
				{ ty: "el", p: sc([0, 0]), s: sc([13, 13]), d: 1, nm: "Disc" },
				{ ty: "fl", c: sc(RUBRIC), o: sc(100), r: 1, nm: "Fill" },
				{ ty: "tr", ...identityTransform(65), nm: "Transform" },
			],
		},
	];
}

function planetShapesSaturn() {
	return [
		{
			ty: "gr",
			nm: "Saturn Ring",
			np: 3,
			it: [
				{ ty: "el", p: sc([0, 0]), s: sc([28, 7]), d: 1, nm: "Ring" },
				{
					ty: "st",
					c: sc(RUBRIC),
					o: sc(100),
					w: sc(1.8),
					lc: 2,
					lj: 2,
					ml: 4,
					nm: "Stroke",
				},
				{
					ty: "tr",
					...identityTransform(70),
					r: sc(-22),
					nm: "Transform",
				},
			],
		},
		{
			ty: "gr",
			nm: "Saturn Disc",
			np: 3,
			it: [
				{ ty: "el", p: sc([0, 0]), s: sc([13, 13]), d: 1, nm: "Disc" },
				{ ty: "fl", c: sc(RUBRIC), o: sc(100), r: 1, nm: "Fill" },
				{ ty: "tr", ...identityTransform(65), nm: "Transform" },
			],
		},
	];
}

function planetShapesJupiter() {
	return [
		{
			ty: "gr",
			nm: "Jupiter Disc",
			np: 3,
			it: [
				{ ty: "el", p: sc([0, 0]), s: sc([20, 20]), d: 1, nm: "Disc" },
				{ ty: "fl", c: sc(RUBRIC), o: sc(100), r: 1, nm: "Fill" },
				{ ty: "tr", ...identityTransform(65), nm: "Transform" },
			],
		},
		lineGroup({
			x1: -9,
			y1: 0,
			x2: 9,
			y2: 0,
			stroke: BG,
			strokeWidth: 1.6,
			opacity: 55,
		}),
		lineGroup({
			x1: -7,
			y1: -5,
			x2: 7,
			y2: -5,
			stroke: BG,
			strokeWidth: 1.6,
			opacity: 35,
		}),
		{
			ty: "gr",
			nm: "Jupiter Moon",
			np: 3,
			it: [
				{ ty: "el", p: sc([17, -12]), s: sc([3.2, 3.2]), d: 1, nm: "Moon" },
				{ ty: "fl", c: sc(FG_MUTED), o: sc(100), r: 1, nm: "Fill" },
				{ ty: "tr", ...identityTransform(75), nm: "Transform" },
			],
		},
	];
}

const PLANET_BUILDERS = [
	planetShapesMercury,
	planetShapesEarth,
	planetShapesSaturn,
	planetShapesJupiter,
];

/* --- Ellipse motion keyframes for planets ---------------------------- */

function quadPoint(o, q) {
	const { cx, cy, rx, ry } = o;
	switch (q % 4) {
		case 0:
			return [cx + rx, cy];
		case 1:
			return [cx, cy + ry];
		case 2:
			return [cx - rx, cy];
		case 3:
			return [cx, cy - ry];
	}
}
function quadOutTan(o, q) {
	const { rx, ry } = o;
	switch (q % 4) {
		case 0:
			return [0, ry * K];
		case 1:
			return [-rx * K, 0];
		case 2:
			return [0, -ry * K];
		case 3:
			return [rx * K, 0];
	}
}
function quadInTan(o, q) {
	// in-tangent vector arriving at quadrant q (going CW)
	const { rx, ry } = o;
	switch (q % 4) {
		case 0:
			return [0, -ry * K];
		case 1:
			return [rx * K, 0];
		case 2:
			return [0, ry * K];
		case 3:
			return [-rx * K, 0];
	}
}

function planetMotionKeyframes(orbit, periodSec, beginSec) {
	const periodFrames = periodSec * FR;
	const qf = periodFrames / 4;
	const phaseOffsetFrames = Math.abs(beginSec) * FR;
	const startFrame = -phaseOffsetFrames;
	const endFrame = OP + qf;
	const numKf = Math.ceil((endFrame - startFrame) / qf) + 1;
	const kfs = [];
	for (let i = 0; i < numKf; i++) {
		const t = startFrame + i * qf;
		const q = i % 4;
		const p = quadPoint(orbit, q);
		const tOut = quadOutTan(orbit, q);
		const tIn = quadInTan(orbit, (q + 1) % 4);
		kfs.push({
			t: r2(t),
			s: [r3(p[0]), r3(p[1]), 0],
			to: [r3(tOut[0]), r3(tOut[1]), 0],
			ti: [r3(tIn[0]), r3(tIn[1]), 0],
			i: LIN_I,
			o: LIN_O,
		});
	}
	return kfs;
}

/* --- Layer assembly --------------------------------------------------- */

const layers = [];
let nextInd = 1;
function pushLayer(layer) {
	layer.ind = nextInd++;
	layers.push(layer);
	return layer.ind;
}

// 1) Root null — anchored at local sun-center (SUN_X, SUN_Y); position
//    field names the world coords where the sun should land. Derived
//    from the original SVG desktop sun pixel target (1198, 497):
//    sun_world = (0.6224, 0.2557) × W to compensate for the cover-fit
//    upscale (1944/W on a 1920×1080 viewport). For W=1400 this is
//    (871, 358) — orbits read ~1.39× larger than addendum-2.
const rootInd = pushLayer({
	ty: 3,
	nm: "Root",
	sr: 1,
	ks: layerTransform({ p: [871, 358, 0], a: [SUN_X, SUN_Y, 0], r: -6 }),
	ao: 0,
	ip: 0,
	op: OP,
	st: 0,
	bm: 0,
});

// 2) Orbit ring layers — Lottie has no `vector-effect: non-scaling-stroke`,
//    so stroke width is in viewBox units. Bump to ~2.4 so the ring stays
//    visible after viewport downscale; soften via layer opacity instead.
for (let i = 0; i < ORBITS.length; i++) {
	const o = ORBITS[i];
	pushLayer({
		ty: 4,
		nm: `Orbit Ring ${i + 1}`,
		sr: 1,
		ks: layerTransform({ p: [0, 0, 0], a: [0, 0, 0], o: 30 }),
		ao: 0,
		shapes: [
			ellipseGroup({
				cx: o.cx,
				cy: o.cy,
				rx: o.rx,
				ry: o.ry,
				stroke: RULE_HEAVY,
				strokeWidth: 2.4,
				opacity: 100,
			}),
		],
		ip: 0,
		op: OP,
		st: 0,
		bm: 0,
		parent: rootInd,
	});
}

// 3) Sun — rotation animated 0 → 360 over OP
pushLayer({
	ty: 4,
	nm: "Sun",
	sr: 1,
	ks: {
		o: sc(100),
		r: {
			a: 1,
			k: [
				{ t: 0, s: [0], i: LIN_I, o: LIN_O },
				{ t: OP, s: [360] },
			],
		},
		p: sc([SUN_X, SUN_Y, 0]),
		a: sc([0, 0, 0]),
		s: sc([100, 100, 100]),
	},
	ao: 0,
	shapes: sunShapes(),
	ip: 0,
	op: OP,
	st: 0,
	bm: 0,
	parent: rootInd,
});

// 4) Planets — each as a shape layer with animated position
for (let i = 0; i < ORBITS.length; i++) {
	const builder = PLANET_BUILDERS[i];
	const kfs = planetMotionKeyframes(ORBITS[i], PLANET_PERIODS[i], PLANET_BEGINS[i]);
	pushLayer({
		ty: 4,
		nm: `Planet ${i + 1}`,
		sr: 1,
		ks: {
			o: sc(100),
			r: sc(0),
			p: { a: 1, k: kfs },
			a: sc([0, 0, 0]),
			s: sc([100, 100, 100]),
		},
		ao: 0,
		shapes: builder(),
		ip: 0,
		op: OP,
		st: 0,
		bm: 0,
		parent: rootInd,
	});
}

/* --- Final composition ------------------------------------------------ */

const lottie = {
	v: "5.7.4",
	fr: FR,
	ip: 0,
	op: OP,
	w: W,
	h: H,
	nm: "orbits",
	ddd: 0,
	assets: [],
	layers,
	meta: { g: "firmanlestari-orbits-builder" },
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(lottie));
const sizeKb = (JSON.stringify(lottie).length / 1024).toFixed(1);
console.log(`wrote ${OUT} (${sizeKb} KB, ${layers.length} layers)`);
