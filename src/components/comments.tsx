import { useEffect, useRef, useState } from "react";

const REPO = "zeetec20/fiirman.my.id";
const REPO_ID = "R_kgDOSoMitg";
const CATEGORY = "General";
const CATEGORY_ID = "DIC_kwDOSoMits4C-NcL";

type GiscusTheme = "light" | "dark";

function resolveTheme(): GiscusTheme {
	if (typeof document === "undefined") return "light";
	const attr = document.documentElement.getAttribute("data-theme");
	if (attr === "dark") return "dark";
	if (attr === "light") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function clearChildren(node: HTMLElement) {
	while (node.firstChild) node.removeChild(node.firstChild);
}

export function Comments() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [theme, setTheme] = useState<GiscusTheme>("light");

	useEffect(() => {
		setTheme(resolveTheme());
		const observer = new MutationObserver(() => setTheme(resolveTheme()));
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onMq = () => setTheme(resolveTheme());
		mq.addEventListener("change", onMq);
		return () => {
			observer.disconnect();
			mq.removeEventListener("change", onMq);
		};
	}, []);

	useEffect(() => {
		const host = ref.current;
		if (!host) return;
		clearChildren(host);
		const script = document.createElement("script");
		script.src = "https://giscus.app/client.js";
		script.async = true;
		script.crossOrigin = "anonymous";
		script.setAttribute("data-repo", REPO);
		script.setAttribute("data-repo-id", REPO_ID);
		script.setAttribute("data-category", CATEGORY);
		script.setAttribute("data-category-id", CATEGORY_ID);
		script.setAttribute("data-mapping", "pathname");
		script.setAttribute("data-strict", "0");
		script.setAttribute("data-reactions-enabled", "1");
		script.setAttribute("data-emit-metadata", "0");
		script.setAttribute("data-input-position", "bottom");
		script.setAttribute("data-theme", theme);
		script.setAttribute("data-lang", "en");
		script.setAttribute("data-loading", "lazy");
		host.appendChild(script);
		/* theme intentionally omitted from deps — script is mounted once;
		   theme changes flow through the postMessage effect below. */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const iframe = document.querySelector<HTMLIFrameElement>(
			"iframe.giscus-frame",
		);
		if (!iframe) return;
		iframe.contentWindow?.postMessage(
			{ giscus: { setConfig: { theme } } },
			"https://giscus.app",
		);
	}, [theme]);

	return <div ref={ref} className="giscus mt-6" />;
}
