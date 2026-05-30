export function RuleHair({ className = "" }: { className?: string }) {
	return <hr className={`rule-hair ${className}`} />;
}

import { Fleuron } from "./fleuron";

export function RuleDouble({ className = "" }: { className?: string }) {
	return (
		<div
			role="separator"
			aria-orientation="horizontal"
			className={`rule-double ${className}`}
		>
			<span className="rule-double__line" aria-hidden="true" />
			<span className="rule-double__glyph text-rubric">
				<Fleuron variant="flourish" />
			</span>
			<span className="rule-double__line" aria-hidden="true" />
		</div>
	);
}

export function RuleOrnament({
	glyph = "❦",
	className = "",
}: {
	glyph?: "❦" | "⁂";
	className?: string;
}) {
	return (
		<div className={`rule-ornament ${className}`} aria-hidden="true">
			{glyph}
		</div>
	);
}
