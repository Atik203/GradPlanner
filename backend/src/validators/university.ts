/**
 * university.ts — Zod schemas for the University model.
 *
 * Create and Update are split because Update uses `.partial()` semantics so callers can
 * PATCH a single field without re-sending the entire university.
 */

import { z } from "zod";
import { idParamSchema } from "./common.js";

const tierEnum = z.enum(["DREAM", "MATCH", "SAFETY"]);

const optionalFloat = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().nullable());

const optionalBoolean = z
  .union([z.boolean(), z.string()])
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (v === "" || v === null || v === undefined) return false;
    return ["true", "1", "yes"].includes(String(v).toLowerCase());
  })
  .pipe(z.boolean());

const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    return typeof v === "string" ? v : null;
  })
  .pipe(z.string().max(2000).nullable());

const requiredString = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(200, "Name too long");

const countryString = z
  .string()
  .trim()
  .min(1, "Country is required")
  .max(120, "Country too long");

/**
 * CGPA / IELTS / acceptanceRate are bounded by common academic reality (0–4 for CGPA,
 * 0–9 for IELTS, 0–100% for acceptance). Backend should reject obviously bad data.
 */
const cgpaBounded = optionalFloat.pipe(
  z.number().min(0).max(4).nullable()
);
const ieltsBounded = optionalFloat.pipe(
  z.number().min(0).max(9).nullable()
);
const acceptanceBounded = optionalFloat.pipe(
  z.number().min(0).max(100).nullable()
);

export const universityCreateSchema = z
  .object({
    name: requiredString,
    country: countryString,
    tier: tierEnum,
    program: optionalString,
    tuitionPerYr: optionalString,
    livingCostPerYr: optionalString,
    scholarshipsAvailable: optionalBoolean.optional().default(false),
    minCgpa: cgpaBounded.optional(),
    minIelts: ieltsBounded.optional(),
    acceptanceRate: acceptanceBounded.optional(),
    fundingAvailable: optionalBoolean.optional().default(false),
    prPathwayQuality: optionalString,
    deadline: optionalString,
    intake: optionalString,
    website: optionalString,
    notes: optionalString,
  })
  .strict();

export type UniversityCreateInput = z.infer<typeof universityCreateSchema>;

export const universityUpdateSchema = z
  .object({
    name: requiredString.optional(),
    country: countryString.optional(),
    tier: tierEnum.optional(),
    program: optionalString.optional(),
    tuitionPerYr: optionalString.optional(),
    livingCostPerYr: optionalString.optional(),
    scholarshipsAvailable: optionalBoolean.optional(),
    minCgpa: cgpaBounded.optional(),
    minIelts: ieltsBounded.optional(),
    acceptanceRate: acceptanceBounded.optional(),
    fundingAvailable: optionalBoolean.optional(),
    prPathwayQuality: optionalString.optional(),
    deadline: optionalString.optional(),
    intake: optionalString.optional(),
    website: optionalString.optional(),
    notes: optionalString.optional(),
  })
  .strict();

export type UniversityUpdateInput = z.infer<typeof universityUpdateSchema>;

export const universityIdParamSchema = idParamSchema;
