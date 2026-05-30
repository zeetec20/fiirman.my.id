import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-only Supabase client for client-side RPC calls (e.g. analytics).
 *
 * Env vars (Vite-exposed, inlined into the client bundle at build time):
 *   - `VITE_SUPABASE_URL`       — project URL
 *   - `VITE_SUPABASE_ANON_KEY`  — anon (public) key, safe to expose; RLS
 *                                  enforces access control on the database.
 *
 * Returns `null` if either env is missing or if called on the server.
 * Consumers MUST null-check before calling — analytics must never break the
 * page if the env isn't configured (preview deploys, local without `.env`).
 */

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
	if (cached !== undefined) return cached;

	if (typeof window === "undefined") {
		cached = null;
		return null;
	}

	const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
	const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

	if (!url || !anonKey) {
		cached = null;
		return null;
	}

	cached = createClient(url, anonKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return cached;
}
