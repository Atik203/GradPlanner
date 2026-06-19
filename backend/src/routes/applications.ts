/**
 * applications.ts — Application tracking CRUD.
 *
 * Each University can have at most one non-deleted Application. Enforced via the
 * `@unique` on `universityId` in the schema, plus a defensive pre-check that
 * returns a friendly 404 / 409 instead of relying on Prisma's error code.
 */

import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  validateBody,
  validateParams,
  applicationCreateSchema,
  applicationUpdateSchema,
  applicationIdParamSchema,
} from "../validators/index.js";
import {
  ok,
  created,
  notFound,
  conflict,
  serverError,
} from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { toDateOrNull } from "../utils/parsers.js";

const router: Router = Router();

const APPLICATION_WITH_UNIVERSITY_SELECT = {
  id: true,
  userId: true,
  universityId: true,
  status: true,
  deadline: true,
  submittedAt: true,
  decisionDate: true,
  offerReceived: true,
  scholarshipAmt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  university: {
    select: {
      id: true,
      name: true,
      country: true,
      tier: true,
      program: true,
      deadline: true,
    },
  },
} satisfies Prisma.ApplicationSelect;

type ApplicationStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "OFFER_RECEIVED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

// ─── GET /api/v1/applications ────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const applications = await prisma.application.findMany({
      where: { userId, deletedAt: null },
      select: APPLICATION_WITH_UNIVERSITY_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return ok(res, applications);
  } catch (error) {
    logger.error("GET /applications error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch applications");
  }
});

// ─── POST /api/v1/applications ───────────────────────────────────────────────
router.post(
  "/",
  validateBody(applicationCreateSchema, "Invalid application data"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body as {
        universityId: string;
        status?: ApplicationStatus;
        deadline?: string | null;
        submittedAt?: string | null;
        decisionDate?: string | null;
        offerReceived?: boolean;
        scholarshipAmt?: string | null;
        notes?: string | null;
      };

      const university = await prisma.university.findFirst({
        where: { id: body.universityId, userId, deletedAt: null },
        select: { id: true },
      });
      if (!university) {
        return notFound(res, "University not found or unauthorized");
      }

      const existing = await prisma.application.findFirst({
        where: { universityId: body.universityId, userId, deletedAt: null },
        select: { id: true },
      });
      if (existing) {
        return conflict(res, "Application already tracked for this university");
      }

      const application = await prisma.application.create({
        data: {
          userId,
          universityId: body.universityId,
          status: body.status ?? "PLANNING",
          deadline: toDateOrNull(body.deadline),
          submittedAt: toDateOrNull(body.submittedAt),
          decisionDate: toDateOrNull(body.decisionDate),
          offerReceived: body.offerReceived ?? false,
          scholarshipAmt: body.scholarshipAmt ?? null,
          notes: body.notes ?? null,
        },
        select: APPLICATION_WITH_UNIVERSITY_SELECT,
      });

      return created(res, application);
    } catch (error) {
      logger.error("POST /applications error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to create application");
    }
  }
);

// ─── PUT /api/v1/applications/:id ────────────────────────────────────────────
router.put(
  "/:id",
  validateParams(applicationIdParamSchema, "Invalid application id"),
  validateBody(applicationUpdateSchema, "Invalid application update"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const body = req.body as {
        status?: ApplicationStatus;
        deadline?: string | null;
        submittedAt?: string | null;
        decisionDate?: string | null;
        offerReceived?: boolean;
        scholarshipAmt?: string | null;
        notes?: string | null;
      };

      const existing = await prisma.application.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Application tracker not found");
      }

      const updateData: Prisma.ApplicationUpdateInput = {};
      if (body.status !== undefined) updateData.status = body.status;
      if (body.deadline !== undefined) updateData.deadline = toDateOrNull(body.deadline);
      if (body.submittedAt !== undefined) updateData.submittedAt = toDateOrNull(body.submittedAt);
      if (body.decisionDate !== undefined) updateData.decisionDate = toDateOrNull(body.decisionDate);
      if (body.offerReceived !== undefined) updateData.offerReceived = body.offerReceived;
      if (body.scholarshipAmt !== undefined) updateData.scholarshipAmt = body.scholarshipAmt;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const updated = await prisma.application.update({
        where: { id },
        data: updateData,
        select: APPLICATION_WITH_UNIVERSITY_SELECT,
      });

      return ok(res, updated);
    } catch (error) {
      logger.error("PUT /applications/:id error", {
        userId: req.user?.id,
        applicationId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to update application");
    }
  }
);

// ─── DELETE /api/v1/applications/:id ─────────────────────────────────────────
router.delete(
  "/:id",
  validateParams(applicationIdParamSchema, "Invalid application id"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const existing = await prisma.application.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Application tracker not found");
      }

      await prisma.application.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return ok(res, { message: "Application deleted successfully" });
    } catch (error) {
      logger.error("DELETE /applications/:id error", {
        userId: req.user?.id,
        applicationId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to delete application");
    }
  }
);

export default router;
