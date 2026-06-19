/**
 * universities.ts — University CRUD with validation, ApiResponse envelope,
 * structured logging, and explicit `select` projections.
 *
 * Each handler is wrapped in try/catch and uses the typed response helpers
 * (ok, created, notFound, conflict, serverError) so the envelope is consistent.
 *
 * Soft-delete is preserved: DELETE sets `deletedAt` and cascades to related
 * Application / Professor rows via updateMany.
 */

import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  validateBody,
  validateParams,
  universityCreateSchema,
  universityUpdateSchema,
  universityIdParamSchema,
} from "../validators/index.js";
import {
  ok,
  created,
  notFound,
  serverError,
} from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

/**
 * Explicit select for University + ranking + application + professors list.
 * Drops `deletedAt` from the API response (it stays in the DB for audit).
 */
const UNIVERSITY_WITH_RELATIONS_SELECT = {
  id: true,
  userId: true,
  name: true,
  country: true,
  tier: true,
  program: true,
  tuitionPerYr: true,
  livingCostPerYr: true,
  scholarshipsAvailable: true,
  minCgpa: true,
  minIelts: true,
  acceptanceRate: true,
  fundingAvailable: true,
  prPathwayQuality: true,
  deadline: true,
  intake: true,
  website: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  application: {
    select: {
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
    },
  },
  ranking: true,
  professors: {
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      status: true,
      email: true,
      profileUrl: true,
      researchInterests: true,
      fundingStatus: true,
      researchFitScore: true,
      replyReceived: true,
      nextFollowUp: true,
    },
  },
} satisfies Prisma.UniversitySelect;

// ─── GET /api/v1/universities ────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const universities = await prisma.university.findMany({
      where: { userId, deletedAt: null },
      select: UNIVERSITY_WITH_RELATIONS_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return ok(res, universities);
  } catch (error) {
    logger.error("GET /universities error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch universities");
  }
});

// ─── POST /api/v1/universities ───────────────────────────────────────────────
router.post(
  "/",
  validateBody(universityCreateSchema, "Invalid university data"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      // After Zod validation, body contains the whitelisted scalar fields.
      // We re-cast to the Prisma create input type at the call site for safety.
      const body = req.body as {
        name: string;
        country: string;
        tier: "DREAM" | "MATCH" | "SAFETY";
        program?: string | null;
        tuitionPerYr?: string | null;
        livingCostPerYr?: string | null;
        scholarshipsAvailable?: boolean;
        minCgpa?: number | null;
        minIelts?: number | null;
        acceptanceRate?: number | null;
        fundingAvailable?: boolean;
        prPathwayQuality?: string | null;
        deadline?: string | null;
        intake?: string | null;
        website?: string | null;
        notes?: string | null;
      };

      // Auto-link to ranking row by case-insensitive institution name.
      const ranking = await prisma.universityRanking.findFirst({
        where: {
          institutionName: { equals: body.name, mode: "insensitive" },
        },
        select: { id: true },
      });

      const university = await prisma.university.create({
        data: {
          userId,
          name: body.name,
          country: body.country,
          tier: body.tier,
          program: body.program ?? null,
          tuitionPerYr: body.tuitionPerYr ?? null,
          livingCostPerYr: body.livingCostPerYr ?? null,
          scholarshipsAvailable: body.scholarshipsAvailable ?? false,
          minCgpa: body.minCgpa ?? null,
          minIelts: body.minIelts ?? null,
          acceptanceRate: body.acceptanceRate ?? null,
          fundingAvailable: body.fundingAvailable ?? false,
          prPathwayQuality: body.prPathwayQuality ?? null,
          deadline: body.deadline ?? null,
          intake: body.intake ?? null,
          website: body.website ?? null,
          notes: body.notes ?? null,
          rankingId: ranking?.id ?? null,
        },
        select: UNIVERSITY_WITH_RELATIONS_SELECT,
      });

      return created(res, university);
    } catch (error) {
      logger.error("POST /universities error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to add university");
    }
  }
);

// ─── PUT /api/v1/universities/:id ────────────────────────────────────────────
router.put(
  "/:id",
  validateParams(universityIdParamSchema, "Invalid university id"),
  validateBody(universityUpdateSchema, "Invalid university update"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const body = req.body as {
        name?: string;
        country?: string;
        tier?: "DREAM" | "MATCH" | "SAFETY";
        program?: string | null;
        tuitionPerYr?: string | null;
        livingCostPerYr?: string | null;
        scholarshipsAvailable?: boolean;
        minCgpa?: number | null;
        minIelts?: number | null;
        acceptanceRate?: number | null;
        fundingAvailable?: boolean;
        prPathwayQuality?: string | null;
        deadline?: string | null;
        intake?: string | null;
        website?: string | null;
        notes?: string | null;
      };

      const existing = await prisma.university.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "University not found");
      }

      // Build update data: only set fields the client actually sent.
      // For nullable string fields, undefined = keep existing, null = clear, string = set.
      const updateData: Prisma.UniversityUpdateInput = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.country !== undefined) updateData.country = body.country;
      if (body.tier !== undefined) updateData.tier = body.tier;
      if (body.program !== undefined) updateData.program = body.program;
      if (body.tuitionPerYr !== undefined) updateData.tuitionPerYr = body.tuitionPerYr;
      if (body.livingCostPerYr !== undefined) updateData.livingCostPerYr = body.livingCostPerYr;
      if (body.scholarshipsAvailable !== undefined) updateData.scholarshipsAvailable = body.scholarshipsAvailable;
      if (body.minCgpa !== undefined) updateData.minCgpa = body.minCgpa;
      if (body.minIelts !== undefined) updateData.minIelts = body.minIelts;
      if (body.acceptanceRate !== undefined) updateData.acceptanceRate = body.acceptanceRate;
      if (body.fundingAvailable !== undefined) updateData.fundingAvailable = body.fundingAvailable;
      if (body.prPathwayQuality !== undefined) updateData.prPathwayQuality = body.prPathwayQuality;
      if (body.deadline !== undefined) updateData.deadline = body.deadline;
      if (body.intake !== undefined) updateData.intake = body.intake;
      if (body.website !== undefined) updateData.website = body.website;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const updated = await prisma.university.update({
        where: { id },
        data: updateData,
        select: UNIVERSITY_WITH_RELATIONS_SELECT,
      });

      return ok(res, updated);
    } catch (error) {
      logger.error("PUT /universities/:id error", {
        userId: req.user?.id,
        universityId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to update university");
    }
  }
);

// ─── DELETE /api/v1/universities/:id ─────────────────────────────────────────
router.delete(
  "/:id",
  validateParams(universityIdParamSchema, "Invalid university id"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const existing = await prisma.university.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "University not found");
      }

      // Soft-delete cascade: also mark related Application + Professor rows deleted.
      const now = new Date();
      await prisma.$transaction([
        prisma.university.update({
          where: { id },
          data: { deletedAt: now },
        }),
        prisma.application.updateMany({
          where: { universityId: id, userId },
          data: { deletedAt: now },
        }),
        prisma.professor.updateMany({
          where: { universityId: id, userId },
          data: { deletedAt: now },
        }),
      ]);

      return ok(res, { message: "University deleted successfully" });
    } catch (error) {
      logger.error("DELETE /universities/:id error", {
        userId: req.user?.id,
        universityId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to delete university");
    }
  }
);

// Reference kept to satisfy `noUnusedLocals` if the helper is ever removed.
export default router;
