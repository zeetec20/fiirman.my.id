import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dateline, toRoman } from "./dateline";
import { RuleDouble, RuleHair } from "./rules";

const TITLE = "Firman Lestari";
const CHAR_INTERVAL_MS = 110;
const CYCLE_MS = 15_000;
const CURSOR_HIDE_DELAY_MS = 900;
const VOLUME_EPOCH_YEAR = 2025;

function dayOfYear(d: Date): number {
	const start = Date.UTC(d.getUTCFullYear(), 0, 0);
	const now = Date.UTC(
		d.getUTCFullYear(),
		d.getUTCMonth(),
		d.getUTCDate(),
	);
	return Math.floor((now - start) / 86_400_000);
}

/**
 * Per-character typewriter that loops every CYCLE_MS. Server renders
 * full title (SSR-safe); on mount the text is cleared and re-typed
 * one character at a time, then restarts every 15s.
 */
function MastheadTitle() {
	const [shown, setShown] = useState(TITLE);
	const [done, setDone] = useState(false);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setDone(true);
			return;
		}

		let typeTimer: number | null = null;
		let cursorTimer: number | null = null;

		const animateOnce = () => {
			if (typeTimer != null) {
				window.clearInterval(typeTimer);
				typeTimer = null;
			}
			if (cursorTimer != null) {
				window.clearTimeout(cursorTimer);
				cursorTimer = null;
			}
			setShown("");
			setDone(false);
			let i = 0;
			typeTimer = window.setInterval(() => {
				i += 1;
				setShown(TITLE.slice(0, i));
				if (i >= TITLE.length) {
					if (typeTimer != null) window.clearInterval(typeTimer);
					typeTimer = null;
					cursorTimer = window.setTimeout(
						() => setDone(true),
						CURSOR_HIDE_DELAY_MS,
					);
				}
			}, CHAR_INTERVAL_MS);
		};

		animateOnce();
		const cycleTimer = window.setInterval(animateOnce, CYCLE_MS);

		return () => {
			window.clearInterval(cycleTimer);
			if (typeTimer != null) window.clearInterval(typeTimer);
			if (cursorTimer != null) window.clearTimeout(cursorTimer);
		};
	}, []);

	return (
		<span className="masthead-type" suppressHydrationWarning>
			{shown}
			{done ? null : <span className="masthead-cursor">▌</span>}
		</span>
	);
}

/**
 * Site masthead — UnifrakturCook title typed in on mount, dateline
 * below in small caps, double-rule beneath.
 */
export function Masthead() {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const yyyy = today.getFullYear();
	const todayKey = `${dd}-${mm}-${yyyy}`;
	const vol = toRoman(Math.max(1, yyyy - VOLUME_EPOCH_YEAR));
	const no = toRoman(dayOfYear(today));

	return (
		<header className="text-center pt-12 pb-6 px-4">
			<Link to="/" className="inline-block no-underline text-fg">
				<h1 className="masthead-title font-display tracking-tight leading-none">
					<MastheadTitle />
				</h1>
			</Link>
			<p className="font-serif-display italic text-fg-muted text-base sm:text-lg mt-3 tracking-wide">
				De Litteris et Codicibus
			</p>
			<RuleHair className="mt-4 max-w-[8rem] mx-auto" />
			<p className="small-caps text-xs text-fg-muted mt-3 tracking-wider">
				Vol. {vol} &middot; No. {no} &middot; <Dateline date={todayKey} />{" "}
				&middot; ZEETEC20
			</p>
			<RuleDouble className="mt-6 max-w-page mx-auto" />
		</header>
	);
}
