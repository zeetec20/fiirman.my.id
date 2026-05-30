import { useEffect, useRef } from "react";
import { toRoman } from "./dateline";
import { Fleuron } from "./fleuron";

/**
 * Manuscript "reading thread" — a faint top-edge double-rule with a
 * rubric fill that grows left→right, capped by a travelling fleuron
 * marker and Roman-numeral folio label that tracks the reader's
 * progress through the article. One rAF-coalesced scroll listener.
 */
export function ArticleProgress() {
	const fillRef = useRef<HTMLSpanElement | null>(null);
	const tipRef = useRef<HTMLDivElement | null>(null);
	const labelRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		let ticking = false;
		const update = () => {
			const h = document.documentElement;
			const max = h.scrollHeight - h.clientHeight;
			const ratio = max > 0 ? Math.max(0, Math.min(1, h.scrollTop / max)) : 0;
			if (fillRef.current) {
				fillRef.current.style.transform = `scaleX(${ratio})`;
			}
			if (tipRef.current) {
				const w = window.innerWidth;
				// Keep the marker inside the viewport at both ends.
				const tipWidth = tipRef.current.offsetWidth;
				const travel = Math.max(0, w - tipWidth - 12);
				tipRef.current.style.transform = `translate3d(${Math.round(
					ratio * travel,
				)}px, 0, 0)`;
			}
			if (labelRef.current) {
				const pct = Math.round(ratio * 100);
				labelRef.current.textContent = pct > 0 ? toRoman(pct) : "·";
			}
			ticking = false;
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", update);
		};
	}, []);

	return (
		<>
			<div className="article-progress" role="presentation" aria-hidden="true">
				<span
					ref={fillRef}
					className="article-progress-fill"
					aria-hidden="true"
				/>
			</div>
			<div
				ref={tipRef}
				className="article-progress-marker"
				role="status"
				aria-label="Reading progress"
			>
				<span className="article-progress-marker-glyph" aria-hidden="true">
					<Fleuron variant="mark" />
				</span>
				<span ref={labelRef} className="article-progress-marker-folio">
					·
				</span>
			</div>
		</>
	);
}
