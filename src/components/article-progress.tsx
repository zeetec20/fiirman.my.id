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
	const tipWidthRef = useRef<number>(0);

	useEffect(() => {
		if (tipRef.current) tipWidthRef.current = tipRef.current.offsetWidth;
	}, []);

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
				/* Position via calc() against 100vw so we don't read
				   window.innerWidth (forced layout) every frame. Tip width
				   is cached once on mount; 12px is the same right-edge gap
				   from the original implementation. */
				const reserve = tipWidthRef.current + 12;
				tipRef.current.style.transform = `translate3d(calc(${ratio} * (100vw - ${reserve}px)), 0, 0)`;
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
		/* No resize listener — Chrome mobile fires a resize storm during
		   URL-bar collapse/expand, and each tick forces extra layout reads
		   outside the rAF gate. Scroll already fires throughout URL-bar
		   transitions (scrollTop changes as viewport grows/shrinks), so
		   the rAF path already covers viewport changes. */
		return () => {
			window.removeEventListener("scroll", onScroll);
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
