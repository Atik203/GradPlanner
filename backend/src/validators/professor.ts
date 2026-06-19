/**
 * professor.ts — Zod schemas for the Professor model and email logging.
 *
 * Professor has many optional fields. Create is `.strict()` (rejects unknown keys).
 * Update uses `.partial()` semantics with the same strict policy.
 */

import { z } from "zod";
import { idParamSchema } from "./common.js";

const professorStatusEnum = z.enum([
  "NOT_CONTACTED",
  "EMAILED",
  "AWAITING_REPLY",
  "REPLIED_POSITIVE",
  "REPLIED_NEGATIVE",
  "INTERVIEWED",
]);

const fundingStatusEnum = z.enum(["FUNDED", "LIKELY", "UNLIKELY", "UNKNOWN"]);

const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    return typeof v === "string" ? v : null;
  })
  .pipe(z.string().max(2000).nullable());

const optionalUrl = optionalString.pipe(
  z
    .string()
    .max(500)
    .refine(
      (v) => v === null || /^https?:\/\/.+/i.test(v),
      "Must be a valid http(s) URL"
    )
    .nullable()
);

const optionalEmail = optionalString.pipe(
  z
    .string()
    .max(254)
    .refine(
      (v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Must be a valid email"
    )
    .nullable()
);

const optionalDate = z
  .union([z.string(), z.date(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  })
  .pipe(z.string().nullable());

const optionalInt = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().int().min(0).max(1000).nullable());

const optionalBoolean = z
  .union([z.boolean(), z.string()])
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (v === "" || v === null || v === undefined) return false;
    return ["true", "1", "yes"].includes(String(v).toLowerCase());
  })
  .pipe(z.boolean());

const researchFitScoreField = z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().int().min(1).max(10).nullable());

const customFieldsSchema = z.record(z.string(), z.unknown()).default({});

export const professorCreateSchema = z
  .object({
    universityId: optionalString,
    name: z.string().trim().min(1, "Name is required").max(200),
    email: optionalEmail.optional(),
    profileUrl: optionalUrl.optional(),
    researchInterests: optionalString.optional(),
    emailSentDate: optionalDate.optional(),
    emailSubject: optionalString.optional(),
    replyReceived: optionalBoolean.optional(),
    replyDate: optionalDate.optional(),
    status: professorStatusEnum.optional(),
    fundingStatus: fundingStatusEnum.optional(),
    researchFitScore: researchFitScoreField.optional(),
    lastFollowUp: optionalDate.optional(),
    nextFollowUp: optionalDate.optional(),
    interviewDate: optionalDate.optional(),
    suggestedContact: optionalString.optional(),
    futureFundingNote: optionalString.optional(),
    notes: optionalString.optional(),
    customFields: customFieldsSchema.optional(),
  })
  .strict();

export type ProfessorCreateInput = z.infer<typeof professorCreateSchema>;

export const professorUpdateSchema = z
  .object({
    universityId: optionalString.optional(),
    name: z.string().trim().min(1).max(200).optional(),
    email: optionalEmail.optional(),
    profileUrl: optionalUrl.optional(),
    researchInterests: optionalString.optional(),
    emailSentDate: optionalDate.optional(),
    emailSubject: optionalString.optional(),
    replyReceived: optionalBoolean.optional(),
    replyDate: optionalDate.optional(),
    status: professorStatusEnum.optional(),
    fundingStatus: fundingStatusEnum.optional(),
    researchFitScore: researchFitScoreField.optional(),
    lastFollowUp: optionalDate.optional(),
    nextFollowUp: optionalDate.optional(),
    interviewDate: optionalDate.optional(),
    suggestedContact: optionalString.optional(),
    futureFundingNote: optionalString.optional(),
    notes: optionalString.optional(),
    customFields: customFieldsSchema.optional(),
  })
  .strict();

export type ProfessorUpdateInput = z.infer<typeof professorUpdateSchema>;

export const logEmailSchema = z
  .object({
    subject: z.string().trim().min(1).max(300).optional(),
    body: z.string().max(20000).optional(),
  })
  .strict();

export type LogEmailInput = z.infer<typeof logEmailSchema>;

export const professorIdParamSchema = idParamSchema;
