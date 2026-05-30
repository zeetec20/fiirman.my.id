import { z } from "zod";

/**
 * Source of truth for article frontmatter. See content-schema.md.
 * Never duplicate this shape — z.infer for TS types.
 */
export const articleFrontmatter = z.object({
	title: z.string().min(1),
	description: z.string().min(1).max(280),
	thumbnail: z.string().optional().default(""),
	createdAt: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
	writer: z.string().min(1),
	tag: z.array(z.string()).default([]),
	source: z.enum(["github", "medium"]),
	sourceUrl: z.string().url().optional(),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatter>;

export type Article = ArticleFrontmatter & {
	slug: string;
	body: string;
};

/** Parses a "DD-MM-YYYY" string into a Date (UTC). */
export function parseFrontmatterDate(s: string): Date {
	const [dd, mm, yyyy] = s.split("-").map(Number);
	return new Date(Date.UTC(yyyy ?? 1970, (mm ?? 1) - 1, dd ?? 1));
}
