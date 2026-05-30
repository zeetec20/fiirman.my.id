/**
 * Hand-drawn manuscript fleuron — vine + lozenge ornament.
 * Two variants: `flourish` (full symmetric flourish, ~80×16) for centered
 * section breaks; `mark` (compact diamond + dots, ~16×10) for inline use.
 * Renders in currentColor — set color via Tailwind text-{color}.
 */
export function Fleuron({
	variant = "flourish",
	className = "",
}: {
	variant?: "flourish" | "mark";
	className?: string;
}) {
	if (variant === "mark") {
		return (
			<svg
				width="18"
				height="10"
				viewBox="0 0 18 10"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				focusable="false"
				className={`inline-block align-middle ${className}`}
			>
				<g fill="currentColor">
					<circle cx="1" cy="5" r="0.9" />
					<path d="M9 0.5 L 13 5 L 9 9.5 L 5 5 Z" />
					<circle cx="17" cy="5" r="0.9" />
				</g>
			</svg>
		);
	}

	return (
		<svg
			width="96"
			height="20"
			viewBox="0 0 96 20"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
			className={`inline-block align-middle ${className}`}
		>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{/* left serpentine vine */}
				<path d="M3 10 C 8 4, 14 16, 20 10 S 30 4, 34 10" />
				{/* left leaf bud */}
				<path d="M34 10 Q 38 7 41 10 Q 38 13 34 10 Z" />
				{/* right serpentine vine (mirror) */}
				<path d="M93 10 C 88 4, 82 16, 76 10 S 66 4, 62 10" />
				{/* right leaf bud */}
				<path d="M62 10 Q 58 7 55 10 Q 58 13 62 10 Z" />
			</g>
			<g fill="currentColor">
				{/* end caps */}
				<circle cx="3" cy="10" r="1.1" />
				<circle cx="93" cy="10" r="1.1" />
				{/* center lozenge */}
				<path d="M48 3.5 L 54 10 L 48 16.5 L 42 10 Z" />
			</g>
			<g fill="currentColor">
				{/* tiny dot inset accents flanking lozenge */}
				<circle cx="38" cy="10" r="0.7" />
				<circle cx="58" cy="10" r="0.7" />
			</g>
		</svg>
	);
}
