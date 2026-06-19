/**
 * document.ts — Zod schemas for the Document model.
 */

import { z } from "zod";
import { idParamSchema } from "./common.js";

const documentTypeEnum = z.enum([
  "TRANSCRIPT",
  "DEGREE_CERTIFICATE",
  "IELTS",
  "TOEFL",
  "GRE",
  "LOR",
  "SOP",
  "CV",
  "PASSPORT",
  "POLICE_CLEARANCE",
  "BANK_STATEMENT",
  "MEDICAL",
  "OTHER",
]);

const documentStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "OBTAINED",
  "EXPIRED",
  "NOT_REQUIRED",
]);

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
      "fileUrl must be a valid http(s) URL"
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

export const documentCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    type: documentTypeEnum,
    country: optionalString.optional(),
    status: documentStatusEnum.optional(),
    fileUrl: optionalUrl.optional(),
    expiresAt: optionalDate.optional(),
    notes: optionalString.optional(),
  })
  .strict();

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;

export const documentUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    type: documentTypeEnum.optional(),
    country: optionalString.optional(),
    status: documentStatusEnum.optional(),
    fileUrl: optionalUrl.optional(),
    expiresAt: optionalDate.optional(),
    notes: optionalString.optional(),
  })
  .strict();

export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;

export const documentIdParamSchema = idParamSchema;
