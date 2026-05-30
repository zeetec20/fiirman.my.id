import type { ReactNode } from "react";

export function Dek({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<p className={`font-serif text-lg text-fg-muted ${className}`}>
			{children}
		</p>
	);
}
