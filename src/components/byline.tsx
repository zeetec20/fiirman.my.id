import { Dateline } from "./dateline";

export function Byline({
	writer,
	date,
	className = "",
}: {
	writer: string;
	date: string;
	className?: string;
}) {
	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<span className="small-caps text-xs text-fg">By {writer}</span>
			<span className="text-fg-muted" aria-hidden="true">
				·
			</span>
			<Dateline date={date} />
		</div>
	);
}
