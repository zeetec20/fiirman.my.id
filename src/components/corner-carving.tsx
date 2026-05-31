/**
 * Border ornament set for article thumbnails — manuscript-register
 * marginalia drawn AROUND the frame edges, not over the image. Modeled
 * on PortraitFrame's PortraitCorner ornaments and Fleuron flourishes.
 *
 * Composition:
 *   - 4 corner curls + diamond + dot (overflowing the corners)
 *   - 4 mid-edge fleuron pips (one per side, overlapping the rule)
 *
 * Designed to live as a sibling of the thumbnail-frame inside a
 * `position: relative` wrapper (a `<figure>` or div). The negative
 * offsets overflow outward; no `overflow: hidden` should clip them.
 */

function CornerOrnament() {
	return (
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
			{/* Outer L-bracket */}
			<path d="M3 14 L 3 3 L 14 3" />
			{/* Inner leaf curl */}
			<path d="M3 9 Q 5 5 9 3 Q 11 5 9 9 Q 5 11 3 9 Z" />
			{/* Short axis ticks */}
			<path d="M14 3 L 18 3" />
			<path d="M3 14 L 3 18" />
			{/* Diamond pip */}
			<path
				d="M19 8 L 22 11 L 19 14 L 16 11 Z"
				fill="currentColor"
				stroke="none"
			/>
			{/* Corner dot */}
			<circle cx="3" cy="3" r="1.4" fill="currentColor" stroke="none" />
		</svg>
	);
}

function EdgeFleuron() {
	return (
		<svg
			width="36"
			height="12"
			viewBox="0 0 36 12"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			{/* End-cap dots */}
			<circle cx="2" cy="6" r="1.1" />
			<circle cx="34" cy="6" r="1.1" />
			{/* Center lozenge */}
			<path d="M18 1 L 24 6 L 18 11 L 12 6 Z" />
			{/* Inset accent dots flanking lozenge */}
			<circle cx="8" cy="6" r="0.7" />
			<circle cx="28" cy="6" r="0.7" />
		</svg>
	);
}

export function CornerCarving() {
	return (
		<>
			{/* Four corner ornaments — overflow the frame edges */}
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-corner thumbnail-carving-tl"
			>
				<CornerOrnament />
			</span>
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-corner thumbnail-carving-tr"
			>
				<CornerOrnament />
			</span>
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-corner thumbnail-carving-br"
			>
				<CornerOrnament />
			</span>
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-corner thumbnail-carving-bl"
			>
				<CornerOrnament />
			</span>

			{/* Mid-edge fleurons — one per side, overlapping the rule */}
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-edge thumbnail-carving-top"
			>
				<EdgeFleuron />
			</span>
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-edge thumbnail-carving-bottom"
			>
				<EdgeFleuron />
			</span>
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-edge thumbnail-carving-left"
			>
				<EdgeFleuron />
			</span>
			<span
				aria-hidden="true"
				className="thumbnail-carving thumbnail-carving-edge thumbnail-carving-right"
			>
				<EdgeFleuron />
			</span>
		</>
	);
}
