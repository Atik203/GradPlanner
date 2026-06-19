/**
 * profile.ts — Zod schemas for the UserProfile model.
 *
 * The schema accepts "empty / null / stringified" inputs because the frontend may send
 * number inputs as strings. Strings are coerced to numbers where appropriate.
 *
 * All fields are optional on update — the route handler merges with `existing`.
 */

import { z } from "zod";

export const emptyStringToNull = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    return v;
  });

export const cgpaField = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() === "") return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().min(0).max(4).nullable());

export const ieltsField = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() === "") return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().min(0).max(9).nullable());

export const monthlyBudgetField = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (typeof v === "number") return Math.trunc(v);
    if (typeof v === "string" && v.trim() === "") return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().int().min(0).max(100000).nullable());

export const prPriorityField = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (typeof v === "number") return Math.trunc(v);
    if (typeof v === "string" && v.trim() === "") return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().int().min(1).max(5).nullable());

export const familyRelocationField = z
  .union([z.boolean(), z.null(), z.undefined()])
  .transform((v) => (v === undefined ? null : v))
  .pipe(z.boolean().nullable());

export const researchInterestsField = z
  .array(z.string().trim().min(1).max(80))
  .max(40)
  .default([]);

export const profileUpdateSchema = z.object({
  university: emptyStringToNull.pipe(z.string().max(200).nullable()),
  cgpa: cgpaField.optional(),
  targetIntake: emptyStringToNull.pipe(z.string().max(40).nullable()),
  graduationDate: emptyStringToNull.pipe(z.string().max(40).nullable()),
  targetDegree: emptyStringToNull.pipe(z.string().max(120).nullable()),
  ieltsScore: ieltsField.optional(),
  monthlyBudgetUSD: monthlyBudgetField.optional(),
  researchInterests: researchInterestsField.optional(),
  prPriority: prPriorityField.optional(),
  familyRelocation: familyRelocationField.optional(),
  isOnboarded: z.boolean().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
