import { useEffect, useState } from "react";
import { GlyphAstrolabe, GlyphMoon, GlyphSun } from "./glyphs";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type ThemeMode = "light" | "dark" | "auto";

function readInitialMode(): ThemeMode {
	if (typeof window === "undefined") return "auto";
	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto")
		return stored;
	return "auto";
}

function applyMode(mode: ThemeMode) {
	if (typeof window === "undefined") return;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
	const root = document.documentElement;
	root.setAttribute("data-theme", mode);
	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.style.colorScheme = resolved;
}

const NEXT: Record<ThemeMode, ThemeMode> = {
	light: "dark",
	dark: "auto",
	auto: "light",
};

const TITLE: Record<ThemeMode, string> = {
	light: "Light mode (click for dark)",
	dark: "Dark mode (click for auto)",
	auto: "Auto mode (click for light)",
};

function ModeIcon({ mode }: { mode: ThemeMode }) {
	if (mode === "light") return <GlyphSun size={18} />;
	if (mode === "dark") return <GlyphMoon size={18} />;
	return <GlyphAstrolabe size={18} />;
}

export function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const initial = readInitialMode();
		setMode(initial);
		applyMode(initial);
		setMounted(true);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			if (mode === "auto") applyMode("auto");
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [mode]);

	function cycle() {
		const next = NEXT[mode];
		setMode(next);
		applyMode(next);
		window.localStorage.setItem("theme", next);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="hairline"
					size="icon"
					onClick={cycle}
					aria-label={TITLE[mode]}
					className="theme-toggle size-9 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
				>
					<span
						aria-hidden="true"
						suppressHydrationWarning
						className="size-full"
					>
						{mounted ? <ModeIcon mode={mode} /> : <ModeIcon mode="auto" />}
					</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="left" sideOffset={6} className="small-caps tracking-wider">
				{TITLE[mode]}
			</TooltipContent>
		</Tooltip>
	);
}
