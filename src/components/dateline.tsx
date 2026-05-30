/**
 * Renders a "DD-MM-YYYY" frontmatter date as a small-caps newspaper dateline
 * like "15 MAR MMXXIII".
 */
const MONTHS = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
] as const;

export function toRoman(n: number): string {
	const table: Array<[number, string]> = [
		[1000, "M"],
		[900, "CM"],
		[500, "D"],
		[400, "CD"],
		[100, "C"],
		[90, "XC"],
		[50, "L"],
		[40, "XL"],
		[10, "X"],
		[9, "IX"],
		[5, "V"],
		[4, "IV"],
		[1, "I"],
	];
	let out = "";
	let remaining = n;
	for (const [value, glyph] of table) {
		while (remaining >= value) {
			out += glyph;
			remaining -= value;
		}
	}
	return out;
}

export function formatDateline(createdAt: string): string {
	const match = createdAt.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (!match) return createdAt;
	const [, dd, mm, yyyy] = match;
	const monthIdx = Number(mm) - 1;
	if (monthIdx < 0 || monthIdx > 11) return createdAt;
	return `${Number(dd)} ${MONTHS[monthIdx]} ${toRoman(Number(yyyy))}`;
}

export function Dateline({
	date,
	className = "",
}: {
	date: string;
	className?: string;
}) {
	return (
		<time
			dateTime={date}
			className={`small-caps text-xs text-fg-muted ${className}`}
		>
			{formatDateline(date)}
		</time>
	);
}
