import { useEffect, useState } from "react";
import { Button } from "./ui/button";

type Day = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
} | null;

type ApiDay = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
};

type ApiResponse = {
	total: Record<string, number> & { lastYear?: number };
	contributions: ApiDay[];
};

const USER = "zeetec20";
const ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`;

const CELL = 11;
const GAP = 3;
const COL = CELL + GAP;
const LEFT_PAD = 30;
const TOP_PAD = 18;
const WEEKS_PER_YEAR = 53;

const MONTH_LABELS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = [
	{ row: 1, label: "Mon" },
	{ row: 3, label: "Wed" },
	{ row: 5, label: "Fri" },
];

async function fetchActivity(): Promise<ApiResponse> {
	const res = await fetch(ENDPOINT, { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
	return (await res.json()) as ApiResponse;
}

function toWeeks(days: ApiDay[]): Array<{ days: Day[] }> {
	if (!days.length) return [];
	const first = new Date(days[0].date);
	const firstWeekday = first.getUTCDay();
	const padded: Day[] = [
		...Array(firstWeekday).fill(null),
		...days,
	];
	while (padded.length % 7 !== 0) padded.push(null);
	const weeks: Array<{ days: Day[] }> = [];
	for (let i = 0; i < padded.length; i += 7) {
		weeks.push({ days: padded.slice(i, i + 7) });
	}
	return weeks;
}

function gridDimensions(weekCount: number) {
	const width = LEFT_PAD + weekCount * COL + 4;
	const height = TOP_PAD + 7 * COL + 4;
	return { width, height };
}

function formatFetched(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "JUST NOW";
	return d.toISOString().slice(0, 10).replace(/-/g, " · ");
}

type State =
	| { status: "loading" }
	| { status: "error"; error: string }
	| { status: "success"; data: ApiResponse; fetchedAt: string };

export function GithubActivity({ className = "" }: { className?: string }) {
	const [state, setState] = useState<State>({ status: "loading" });
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let cancelled = false;
		setState({ status: "loading" });
		fetchActivity()
			.then((data) => {
				if (cancelled) return;
				setState({
					status: "success",
					data,
					fetchedAt: new Date().toISOString(),
				});
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				const msg = err instanceof Error ? err.message : String(err);
				/* warn, not error — console.error fails Lighthouse best-practices
				   when the contributions API is unreachable (offline CI). */
				console.warn("[GithubActivity] fetch failed:", msg);
				setState({ status: "error", error: msg });
			});
		return () => {
			cancelled = true;
		};
	}, [attempt]);

	if (state.status === "loading") {
		return <ActivitySkeleton className={className} />;
	}

	if (state.status === "error") {
		return (
			<ActivityError
				className={className}
				onRetry={() => setAttempt((n) => n + 1)}
			/>
		);
	}

	const weeks = toWeeks(state.data.contributions);
	const totalLastYear =
		state.data.total.lastYear ??
		state.data.contributions.reduce((sum, d) => sum + d.count, 0);
	const { width, height } = gridDimensions(weeks.length);
	const fetchedAt = state.fetchedAt;

	const monthMarkers: Array<{ x: number; label: string }> = [];
	let lastMonth = -1;
	weeks.forEach((week, wi) => {
		const firstDated = week.days.find((d): d is ApiDay => d !== null);
		if (!firstDated) return;
		const m = new Date(firstDated.date).getUTCMonth();
		if (m !== lastMonth) {
			monthMarkers.push({ x: LEFT_PAD + wi * COL, label: MONTH_LABELS[m] });
			lastMonth = m;
		}
	});

	return (
		<section className={className} aria-label="GitHub contributions">
			<div className="gh-scroll">
			<svg
				className="gh-grid"
				viewBox={`0 0 ${width} ${height}`}
				role="img"
				aria-label={`${totalLastYear} contributions in the last year`}
			>
				<title>{`${totalLastYear} contributions in the last year`}</title>

				{monthMarkers.map((m) => (
					<text
						key={`${m.x}-${m.label}`}
						className="gh-axis-label"
						x={m.x}
						y={TOP_PAD - 6}
					>
						{m.label}
					</text>
				))}

				{DAY_LABELS.map((d) => (
					<text
						key={d.label}
						className="gh-axis-label"
						x={0}
						y={TOP_PAD + d.row * COL + CELL - 2}
					>
						{d.label}
					</text>
				))}

				{weeks.map((week, wi) =>
					week.days.map((day, di) => {
						if (!day) return null;
						const x = LEFT_PAD + wi * COL;
						const y = TOP_PAD + di * COL;
						return (
							<rect
								key={day.date}
								className={`gh-cell gh-cell-${day.level}`}
								x={x}
								y={y}
								width={CELL}
								height={CELL}
								rx={1.5}
								ry={1.5}
							>
								<title>{`${day.count} contributions on ${day.date}`}</title>
							</rect>
						);
					}),
				)}
			</svg>
			</div>

			<div className="flex items-baseline justify-between mt-3 small-caps text-xs text-fg-muted">
				<span>
					{totalLastYear.toLocaleString()} contributions, last 12 months
				</span>
				<span>SYNCED · {formatFetched(fetchedAt)}</span>
			</div>
		</section>
	);
}

function ActivitySkeleton({ className = "" }: { className?: string }) {
	const { width, height } = gridDimensions(WEEKS_PER_YEAR);

	return (
		<section
			className={className}
			aria-label="Loading GitHub contributions"
			aria-busy="true"
		>
			<div className="gh-scroll">
			<svg
				className="gh-grid gh-shimmer"
				viewBox={`0 0 ${width} ${height}`}
				role="img"
				aria-label="Loading contributions"
			>
				<title>Fetching contribution history…</title>

				{DAY_LABELS.map((d) => (
					<text
						key={d.label}
						className="gh-axis-label"
						x={0}
						y={TOP_PAD + d.row * COL + CELL - 2}
					>
						{d.label}
					</text>
				))}

				{Array.from({ length: WEEKS_PER_YEAR }).map((_, wi) =>
					Array.from({ length: 7 }).map((__, di) => {
						const x = LEFT_PAD + wi * COL;
						const y = TOP_PAD + di * COL;
						return (
							<rect
								key={`${wi}-${di}`}
								className="gh-cell gh-cell-skeleton"
								x={x}
								y={y}
								width={CELL}
								height={CELL}
								rx={1.5}
								ry={1.5}
							/>
						);
					}),
				)}
			</svg>
			</div>

			<div className="flex items-baseline justify-between mt-3 small-caps text-xs text-fg-muted">
				<span className="gh-shimmer-text">Counting the keystrokes…</span>
				<span className="gh-shimmer-text">SYNCING</span>
			</div>
		</section>
	);
}

function ActivityError({
	className = "",
	onRetry,
}: {
	className?: string;
	onRetry: () => void;
}) {
	return (
		<section
			className={`${className} text-center`}
			aria-label="Failed to load GitHub contributions"
		>
			<p className="font-serif text-fg-muted">
				The ledger could not be reached.
			</p>
			<Button
				type="button"
				onClick={onRetry}
				variant="link"
				size="sm"
				className="mt-3 h-auto p-0 small-caps text-xs text-rubric border-b border-current rounded-none hover:border-transparent hover:no-underline transition-[border-color] duration-[120ms]"
			>
				TRY AGAIN
			</Button>
		</section>
	);
}
