import { z } from "zod";

/**
 * Mirrors `src/common/types/Link.type.ts`.
 */
export const linkSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  link: z.string(),
});
