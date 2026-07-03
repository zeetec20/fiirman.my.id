import { createServerFn } from "@tanstack/react-start";

/**
 * Server-only access to rendered article bodies.
 *
 * Not named `*.server.ts` (the usual convention here) because routes must
 * import this module — Start's import-protection would reject that. The
 * `createServerFn` boundary is the framework's sanctioned split: the
 * compiler replaces the handler with an RPC stub in the client graph, and
 * the dynamic import below keeps article-bodies.generated.json (~100KB of
 * HTML) out of the client bundle entirely.
 */
export const fetchArticleBody = createServerFn({ method: "GET" })
	.inputValidator((slug: string) => slug)
	.handler(async ({ data }) => {
		const bodies = (await import("../data/article-bodies.generated.json"))
			.default as Record<string, string>;
		return bodies[data] ?? null;
	});
