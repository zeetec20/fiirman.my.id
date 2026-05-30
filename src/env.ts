import { z } from "zod";

/**
 * Build-time env reader. Validated with Zod so a missing required value
 * fails fast instead of silently returning `undefined`. Workers runtime
 * env is empty at MVP; everything here is build/scripts-only.
 *
 * Never read process.env / import.meta.env outside this module.
 */
const schema = z.object({
  UNSPLASH_ACCESS_KEY: z.string().min(1).optional(),
});

const source = typeof process !== "undefined" ? process.env : {};

export const env = schema.parse({
  UNSPLASH_ACCESS_KEY: source.UNSPLASH_ACCESS_KEY,
});

export type Env = z.infer<typeof schema>;
