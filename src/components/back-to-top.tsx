import { useEffect, useState } from "react";
import { GlyphArrowUp } from "./glyphs";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		let ticking = false;
		const update = () => {
			setVisible(window.scrollY > window.innerHeight * 0.6);
			ticking = false;
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const onClick = () => {
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="hairline"
					size="icon"
					onClick={onClick}
					aria-label="Back to top"
					className={`back-to-top size-9 ${visible ? "is-visible" : ""}`}
				>
					<GlyphArrowUp size={18} />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="left" sideOffset={6} className="small-caps tracking-wider">
				Return to top
			</TooltipContent>
		</Tooltip>
	);
}
