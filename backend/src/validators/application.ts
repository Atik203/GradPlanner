/**
 * application.ts — Zod schemas for the Application model.
 */

import { z } from "zod";
import { idParamSchema } from "./common.js";

const applicationStatusEnum = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "OFFER_RECEIVED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
]);

const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    return typeof v === "string" ? v : null;
  })
  .pipe(z.string().max(2000).nullable());

const optionalDate = z
  .union([z.string(), z.date(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  })
  .pipe(z.string().nullable());

const optionalBoolean = z
  .union([z.boolean(), z.string()])
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (v === "" || v === null || v === undefined) return false;
    return ["true", "1", "yes"].includes(String(v).toLowerCase());
  })
  .pipe(z.boolean());

export const applicationCreateSchema = z
  .object({
    universityId: z.string().min(1).max(64),
    status: applicationStatusEnum.optional(),
    deadline: optionalDate.optional(),
    submittedAt: optionalDate.optional(),
    decisionDate: optionalDate.optional(),
    offerReceived: optionalBoolean.optional(),
    scholarshipAmt: optionalString.optional(),
    notes: optionalString.optional(),
  })
  .strict();

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;

export const applicationUpdateSchema = z
  .object({
    status: applicationStatusEnum.optional(),
    deadline: optionalDate.optional(),
    submittedAt: optionalDate.optional(),
    decisionDate: optionalDate.optional(),
    offerReceived: optionalBoolean.optional(),
    scholarshipAmt: optionalString.optional(),
    notes: optionalString.optional(),
  })
  .strict();

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

export const applicationIdParamSchema = idParamSchema;
