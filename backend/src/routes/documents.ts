/**
 * documents.ts — Document tracking CRUD.
 *
 * Documents are hard-deleted (no soft-delete column on the model).
 * The `fileUrl` field stores an external URL (S3, Drive, etc.) — we do not
 * handle file uploads in this phase.
 */

import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  validateBody,
  validateParams,
  documentCreateSchema,
  documentUpdateSchema,
  documentIdParamSchema,
} from "../validators/index.js";
import { ok, created, notFound, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { toDateOrNull } from "../utils/parsers.js";

const router: Router = Router();

const DOCUMENT_SELECT = {
  id: true,
  userId: true,
  name: true,
  type: true,
  country: true,
  status: true,
  fileUrl: true,
  expiresAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

type DocumentType =
  | "TRANSCRIPT"
  | "DEGREE_CERTIFICATE"
  | "IELTS"
  | "TOEFL"
  | "GRE"
  | "LOR"
  | "SOP"
  | "CV"
  | "PASSPORT"
  | "POLICE_CLEARANCE"
  | "BANK_STATEMENT"
  | "MEDICAL"
  | "OTHER";

type DocumentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "OBTAINED"
  | "EXPIRED"
  | "NOT_REQUIRED";

// ─── GET /api/v1/documents ───────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const documents = await prisma.document.findMany({
      where: { userId },
      select: DOCUMENT_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return ok(res, documents);
  } catch (error) {
    logger.error("GET /documents error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch documents");
  }
});

// ─── POST /api/v1/documents ──────────────────────────────────────────────────
router.post(
  "/",
  validateBody(documentCreateSchema, "Invalid document data"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body as {
        name: string;
        type: DocumentType;
        country?: string | null;
        status?: DocumentStatus;
        fileUrl?: string | null;
        expiresAt?: string | null;
        notes?: string | null;
      };

      const document = await prisma.document.create({
        data: {
          userId,
          name: body.name,
          type: body.type,
          country: body.country ?? null,
          status: body.status ?? "PENDING",
          fileUrl: body.fileUrl ?? null,
          expiresAt: toDateOrNull(body.expiresAt),
          notes: body.notes ?? null,
        },
        select: DOCUMENT_SELECT,
      });

      return created(res, document);
    } catch (error) {
      logger.error("POST /documents error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to create document");
    }
  }
);

// ─── PUT /api/v1/documents/:id ───────────────────────────────────────────────
router.put(
  "/:id",
  validateParams(documentIdParamSchema, "Invalid document id"),
  validateBody(documentUpdateSchema, "Invalid document update"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const body = req.body as {
        name?: string;
        type?: DocumentType;
        country?: string | null;
        status?: DocumentStatus;
        fileUrl?: string | null;
        expiresAt?: string | null;
        notes?: string | null;
      };

      const existing = await prisma.document.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Document not found");
      }

      const updateData: Prisma.DocumentUpdateInput = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.country !== undefined) updateData.country = body.country;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl;
      if (body.expiresAt !== undefined) updateData.expiresAt = toDateOrNull(body.expiresAt);
      if (body.notes !== undefined) updateData.notes = body.notes;

      const updated = await prisma.document.update({
        where: { id },
        data: updateData,
        select: DOCUMENT_SELECT,
      });

      return ok(res, updated);
    } catch (error) {
      logger.error("PUT /documents/:id error", {
        userId: req.user?.id,
        documentId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to update document");
    }
  }
);

// ─── DELETE /api/v1/documents/:id ────────────────────────────────────────────
router.delete(
  "/:id",
  validateParams(documentIdParamSchema, "Invalid document id"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const existing = await prisma.document.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Document not found");
      }

      await prisma.document.delete({
        where: { id },
      });

      return ok(res, { message: "Document deleted successfully" });
    } catch (error) {
      logger.error("DELETE /documents/:id error", {
        userId: req.user?.id,
        documentId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to delete document");
    }
  }
);

export default router;
