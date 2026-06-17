import { getSupabase } from "./supabase";

/**
 * Web Vitals reporter — registers handlers for LCP, INP, CLS, FCP, TTFB and
 * forwards each measurement to Supabase via `track_vital(p_metric, p_value,
 * p_path, p_rating)`. RPC failures are swallowed; vitals reporting must never
 * break the page.
 *
 * Browser-only. Call once per page load from a `useEffect` in the root route.
 * The `web-vitals` library itself is loaded via dynamic import so the ~2KB
 * payload stays off the initial parse path.
 */

type Metric = {
	name: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
	value: number;
	rating: "good" | "needs-improvement" | "poor";
};

async function send(metric: Metric): Promise<void> {
	const supabase = await getSupabase();
	if (!supabase) return;
	try {
		await supabase.rpc("track_vital", {
			p_metric: metric.name,
			p_value: metric.value,
			p_path: window.location.pathname,
			p_rating: metric.rating,
		});
	} catch {
		/* swallow — vitals are non-critical */
	}
}

export async function reportWebVitals(): Promise<void> {
	if (typeof window === "undefined") return;
	const { onLCP, onINP, onCLS, onFCP, onTTFB } = await import("web-vitals");
	onLCP(send);
	onINP(send);
	onCLS(send);
	onFCP(send);
	onTTFB(send);
}
