/**
 * common.ts — Reusable Zod primitives shared across multiple route validators.
 *
 * Anything domain-agnostic goes here. Domain-specific schemas live in their own files.
 */

import { z } from "zod";

/**
 * CUID-shaped identifier. We don't enforce strict CUID format (Prisma would), but we
 * require a non-empty string of reasonable length.
 */
export const idParamSchema = z.object({
  id: z.string().min(1).max(64),
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Generic paginated query: `?page=1&limit=50`.
 * limit is capped at 100 to prevent over-fetching.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Search query `?q=...&country=...` for rankings / universities.
 * `country` can be a comma-separated list of country names.
 */
export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  country: z.string().trim().max(200).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Timeline query: `?intake=Sep 2028`. Free-form string, capped length.
 */
export const intakeQuerySchema = z.object({
  intake: z.string().trim().min(1).max(40).optional(),
});

export type IntakeQuery = z.infer<typeof intakeQuerySchema>;

/**
 * Scholarship checker query — all optional, all numeric.
 */
export const scholarshipQuerySchema = z.object({
  degreeLevel: z.enum(["MSc", "PhD"]).optional(),
  cgpa: z.coerce.number().min(0).max(4).optional(),
  ielts: z.coerce.number().min(0).max(9).optional(),
  workExp: z.coerce.number().int().min(0).max(50).optional(),
  publications: z.coerce.number().int().min(0).max(500).optional(),
});

export type ScholarshipQuery = z.infer<typeof scholarshipQuerySchema>;

/**
 * Country code path param: 2-3 letter alpha codes, with aliases normalized in route.
 */
export const countryCodeParamSchema = z.object({
  code: z.string().trim().min(2).max(60),
});

export type CountryCodeParam = z.infer<typeof countryCodeParamSchema>;

/**
 * Coerce a string-or-number query value to integer with a default + max.
 * Convenience helper for any route that just needs `?limit=N`.
 */
export const limitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type LimitQuery = z.infer<typeof limitQuerySchema>;
