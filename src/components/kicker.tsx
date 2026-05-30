import type { ReactNode } from "react";

export function Kicker({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<p className={`small-caps text-xs text-fg-muted ${className}`}>{children}</p>
	);
}
