import { z } from "zod";

/**
 * Build-time env reader. Validated with Zod so a missing required value
 * fails fast instead of silently returning `undefined`. Workers runtime
 * env is empty at MVP; everything here is build/scripts-only.
 *
 * Never read process.env / import.meta.env outside this module.
 */
const schema = z.object({});

const source = typeof process !== "undefined" ? process.env : {};

export const env = schema.parse(source);

export type Env = z.infer<typeof schema>;
