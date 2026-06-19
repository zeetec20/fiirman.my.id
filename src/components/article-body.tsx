import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "../lib/clipboard";

/**
 * Renders HTML produced by the build-time markdown pipeline.
 * Copy buttons are injected at SSR by rehypeCopyButton; here we wire one
 * delegated click listener on the container so route remounts don't strand
 * stale listeners on individual <pre> elements.
 *
 * Contract: `sanitizedMarkup` MUST be output of `markdownToHtml`, which
 * runs rehype-sanitize at the trust boundary. Never pass it raw/untrusted
 * HTML — sanitization is the caller's guarantee, not done again here.
 */
export function ArticleBody({
	sanitizedMarkup,
	withDropCap = true,
}: {
	sanitizedMarkup: string;
	withDropCap?: boolean;
}) {
	const ref = useRef<HTMLDivElement | null>(null);
	const className = `prose-article ${withDropCap ? "has-drop-cap" : ""}`;

	useEffect(() => {
		const root = ref.current;
		if (!root) return;
		let resetTimer: ReturnType<typeof setTimeout> | null = null;
		const onClick = async (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			const btn = target?.closest<HTMLButtonElement>("[data-copy-button]");
			if (!btn || !root.contains(btn)) return;
			event.preventDefault();
			const host = btn.closest<HTMLElement>("[data-code-block]");
			const pre = host?.querySelector<HTMLPreElement>("pre");
			const text = pre?.innerText ?? pre?.textContent ?? "";
			const ok = await copyToClipboard(text);
			if (ok) {
				btn.classList.add("copied");
				btn.textContent = "Copied";
				toast.success("Copied to clipboard");
			} else {
				btn.classList.remove("copied");
				btn.textContent = "Failed";
				toast.error("Copy failed");
			}
			if (resetTimer) clearTimeout(resetTimer);
			resetTimer = setTimeout(() => {
				btn.classList.remove("copied");
				btn.textContent = "Copy";
			}, 1200);
		};
		root.addEventListener("click", onClick);
		return () => {
			root.removeEventListener("click", onClick);
			if (resetTimer) clearTimeout(resetTimer);
		};
	}, []);

	return (
		<div
			ref={ref}
			className={className}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: build-time, rehype-sanitize'd markdown output (see markdownToHtml)
			dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
		/>
	);
}
