import { getSupabase } from "./supabase";

/**
 * Fire-and-forget analytics RPC. Calls Supabase `track_analytic(p_path text)`.
 * Errors are swallowed — analytics must never break the page.
 *
 * Browser-only. No-op on the server or when Supabase env is unconfigured.
 */
export async function trackAnalytic(path: string): Promise<void> {
	const supabase = getSupabase();
	if (!supabase) return;
	try {
		await supabase.rpc("track_analytic", { p_path: path });
	} catch {
		/* swallow — analytics is non-critical */
	}
}

/**
 * Fetch view counts for a batch of paths via Supabase `get_analytics(paths)`.
 * Returns a Map of path → count. Empty Map on any failure or when Supabase is
 * unconfigured — callers MUST gracefully degrade (e.g., fall back to date sort).
 *
 * Tolerates two response shapes:
 *   - `[{ path: string, count: number }, ...]` (record-array)
 *   - `Record<string, number>` (path-keyed object)
 */
export async function getAnalytics(
	paths: string[],
): Promise<Map<string, number>> {
	const empty = new Map<string, number>();
	if (paths.length === 0) return empty;
	const supabase = getSupabase();
	if (!supabase) return empty;
	try {
		const { data, error } = await supabase.rpc("get_analytics", { paths });
		if (error || data == null) return empty;
		const out = new Map<string, number>();
		if (Array.isArray(data)) {
			for (const row of data) {
				if (row && typeof row === "object") {
					const r = row as Record<string, unknown>;
					const path = r.path ?? r.p_path ?? r.url;
					const count = r.counter ?? r.count ?? r.views ?? r.total ?? r.c;
					if (typeof path === "string") {
						out.set(path, Number(count) || 0);
					}
				}
			}
		} else if (typeof data === "object") {
			for (const [path, count] of Object.entries(data)) {
				out.set(path, Number(count) || 0);
			}
		}
		return out;
	} catch {
		return empty;
	}
}
