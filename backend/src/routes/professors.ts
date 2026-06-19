/**
 * professors.ts — Professor CRUD with email-logging workflow.
 *
 * Endpoints:
 *   GET   /api/v1/professors
 *   POST  /api/v1/professors
 *   PUT   /api/v1/professors/:id
 *   POST  /api/v1/professors/:id/log-email
 *   DELETE /api/v1/professors/:id
 *
 * Validation: professorCreateSchema / professorUpdateSchema / logEmailSchema.
 * Date fields arrive as ISO strings (Zod-coerced); we convert with toDateOrNull
 * only when building Prisma input.
 *
 * The 14-day follow-up rule and 2-follow-up limit from the original code are
 * preserved as business logic.
 */

import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  validateBody,
  validateParams,
  professorCreateSchema,
  professorUpdateSchema,
  logEmailSchema,
  professorIdParamSchema,
} from "../validators/index.js";
import {
  ok,
  created,
  notFound,
  serverError,
  validationError as sendValidationError,
} from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { toDateOrNull } from "../utils/parsers.js";

const router: Router = Router();

const PROFESSOR_WITH_UNIVERSITY_SELECT = {
  id: true,
  userId: true,
  universityId: true,
  name: true,
  email: true,
  profileUrl: true,
  researchInterests: true,
  emailSentDate: true,
  emailSubject: true,
  replyReceived: true,
  replyDate: true,
  status: true,
  fundingStatus: true,
  researchFitScore: true,
  followUpCount: true,
  lastFollowUp: true,
  nextFollowUp: true,
  interviewDate: true,
  suggestedContact: true,
  futureFundingNote: true,
  notes: true,
  customFields: true,
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
} satisfies Prisma.ProfessorSelect;

const HARD_FOLLOWUP_LIMIT = 2;
const MIN_DAYS_BETWEEN_EMAILS = 14;

// ─── GET /api/v1/professors ──────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const professors = await prisma.professor.findMany({
      where: { userId, deletedAt: null },
      select: PROFESSOR_WITH_UNIVERSITY_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return ok(res, professors);
  } catch (error) {
    logger.error("GET /professors error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch professors");
  }
});

// ─── POST /api/v1/professors ─────────────────────────────────────────────────
router.post(
  "/",
  validateBody(professorCreateSchema, "Invalid professor data"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body as {
        name: string;
        universityId?: string | null;
        email?: string | null;
        profileUrl?: string | null;
        researchInterests?: string | null;
        emailSentDate?: string | null;
        emailSubject?: string | null;
        replyReceived?: boolean;
        replyDate?: string | null;
        status?: "NOT_CONTACTED" | "EMAILED" | "AWAITING_REPLY" | "REPLIED_POSITIVE" | "REPLIED_NEGATIVE" | "INTERVIEWED";
        fundingStatus?: "FUNDED" | "LIKELY" | "UNLIKELY" | "UNKNOWN";
        researchFitScore?: number | null;
        lastFollowUp?: string | null;
        nextFollowUp?: string | null;
        interviewDate?: string | null;
        suggestedContact?: string | null;
        futureFundingNote?: string | null;
        notes?: string | null;
        customFields?: Record<string, unknown>;
      };

      const professor = await prisma.professor.create({
        data: {
          userId,
          universityId: body.universityId ?? null,
          name: body.name,
          email: body.email ?? null,
          profileUrl: body.profileUrl ?? null,
          researchInterests: body.researchInterests ?? null,
          emailSentDate: toDateOrNull(body.emailSentDate),
          emailSubject: body.emailSubject ?? null,
          replyReceived: body.replyReceived ?? false,
          replyDate: toDateOrNull(body.replyDate),
          status: body.status ?? "NOT_CONTACTED",
          fundingStatus: body.fundingStatus ?? "UNKNOWN",
          researchFitScore: body.researchFitScore ?? null,
          lastFollowUp: toDateOrNull(body.lastFollowUp),
          nextFollowUp: toDateOrNull(body.nextFollowUp),
          interviewDate: toDateOrNull(body.interviewDate),
          suggestedContact: body.suggestedContact ?? null,
          futureFundingNote: body.futureFundingNote ?? null,
          notes: body.notes ?? null,
          customFields: (body.customFields ?? {}) as Prisma.InputJsonValue,
        },
        select: PROFESSOR_WITH_UNIVERSITY_SELECT,
      });

      return created(res, professor);
    } catch (error) {
      logger.error("POST /professors error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to add professor");
    }
  }
);

// ─── PUT /api/v1/professors/:id ──────────────────────────────────────────────
router.put(
  "/:id",
  validateParams(professorIdParamSchema, "Invalid professor id"),
  validateBody(professorUpdateSchema, "Invalid professor update"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const body = req.body as {
        universityId?: string | null;
        name?: string;
        email?: string | null;
        profileUrl?: string | null;
        researchInterests?: string | null;
        emailSentDate?: string | null;
        emailSubject?: string | null;
        replyReceived?: boolean;
        replyDate?: string | null;
        status?: "NOT_CONTACTED" | "EMAILED" | "AWAITING_REPLY" | "REPLIED_POSITIVE" | "REPLIED_NEGATIVE" | "INTERVIEWED";
        fundingStatus?: "FUNDED" | "LIKELY" | "UNLIKELY" | "UNKNOWN";
        researchFitScore?: number | null;
        lastFollowUp?: string | null;
        nextFollowUp?: string | null;
        interviewDate?: string | null;
        suggestedContact?: string | null;
        futureFundingNote?: string | null;
        notes?: string | null;
        customFields?: Record<string, unknown>;
      };

      const existing = await prisma.professor.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Professor not found");
      }

      const updateData: Prisma.ProfessorUpdateInput = {};
      if (body.universityId !== undefined) updateData.university = body.universityId ? { connect: { id: body.universityId } } : { disconnect: true };
      if (body.name !== undefined) updateData.name = body.name;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.profileUrl !== undefined) updateData.profileUrl = body.profileUrl;
      if (body.researchInterests !== undefined) updateData.researchInterests = body.researchInterests;
      if (body.emailSentDate !== undefined) updateData.emailSentDate = toDateOrNull(body.emailSentDate);
      if (body.emailSubject !== undefined) updateData.emailSubject = body.emailSubject;
      if (body.replyReceived !== undefined) updateData.replyReceived = body.replyReceived;
      if (body.replyDate !== undefined) updateData.replyDate = toDateOrNull(body.replyDate);
      if (body.status !== undefined) updateData.status = body.status;
      if (body.fundingStatus !== undefined) updateData.fundingStatus = body.fundingStatus;
      if (body.researchFitScore !== undefined) updateData.researchFitScore = body.researchFitScore;
      if (body.lastFollowUp !== undefined) updateData.lastFollowUp = toDateOrNull(body.lastFollowUp);
      if (body.nextFollowUp !== undefined) updateData.nextFollowUp = toDateOrNull(body.nextFollowUp);
      if (body.interviewDate !== undefined) updateData.interviewDate = toDateOrNull(body.interviewDate);
      if (body.suggestedContact !== undefined) updateData.suggestedContact = body.suggestedContact;
      if (body.futureFundingNote !== undefined) updateData.futureFundingNote = body.futureFundingNote;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.customFields !== undefined) updateData.customFields = body.customFields as Prisma.InputJsonValue;

      const updated = await prisma.professor.update({
        where: { id },
        data: updateData,
        select: PROFESSOR_WITH_UNIVERSITY_SELECT,
      });

      return ok(res, updated);
    } catch (error) {
      logger.error("PUT /professors/:id error", {
        userId: req.user?.id,
        professorId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to update professor");
    }
  }
);

// ─── POST /api/v1/professors/:id/log-email ───────────────────────────────────
router.post(
  "/:id/log-email",
  validateParams(professorIdParamSchema, "Invalid professor id"),
  validateBody(logEmailSchema, "Invalid email log payload"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const body = req.body as { subject?: string; body?: string };

      const existing = await prisma.professor.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true, emailSentDate: true, lastFollowUp: true, followUpCount: true, emailSubject: true },
      });
      if (!existing) {
        return notFound(res, "Professor not found");
      }

      const now = new Date();

      // First email: mark as EMAILED, schedule first follow-up 14 days out.
      if (existing.emailSentDate === null) {
        const nextFollowUp = new Date(now);
        nextFollowUp.setDate(nextFollowUp.getDate() + MIN_DAYS_BETWEEN_EMAILS);

        const updated = await prisma.professor.update({
          where: { id },
          data: {
            status: "EMAILED",
            emailSentDate: now,
            emailSubject: body.subject || "Graduate Research Assistant Opportunities",
            nextFollowUp,
            followUpCount: 0,
          },
          select: PROFESSOR_WITH_UNIVERSITY_SELECT,
        });
        return ok(res, updated);
      }

      // Follow-up email: enforce hard limit + 14-day cooldown.
      if (existing.followUpCount >= HARD_FOLLOWUP_LIMIT) {
        return sendValidationError(
          res,
          `Hard limit reached: Maximum of ${HARD_FOLLOWUP_LIMIT} follow-up emails allowed per professor.`
        );
      }

      const lastEmailDate = existing.lastFollowUp ?? existing.emailSentDate;
      if (lastEmailDate) {
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - MIN_DAYS_BETWEEN_EMAILS);
        if (new Date(lastEmailDate) > fourteenDaysAgo) {
          const diffTime = now.getTime() - new Date(lastEmailDate).getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return sendValidationError(
            res,
            `Minimum ${MIN_DAYS_BETWEEN_EMAILS} days required between follow-ups. Only ${diffDays} days have passed since your last email.`
          );
        }
      }

      const nextFollowUpCount = existing.followUpCount + 1;
      const nextFollowUp = new Date(now);
      nextFollowUp.setDate(nextFollowUp.getDate() + MIN_DAYS_BETWEEN_EMAILS);

      const updated = await prisma.professor.update({
        where: { id },
        data: {
          status: "AWAITING_REPLY",
          lastFollowUp: now,
          emailSubject: body.subject || existing.emailSubject,
          followUpCount: nextFollowUpCount,
          // No next follow-up after the second follow-up is sent.
          nextFollowUp: nextFollowUpCount >= HARD_FOLLOWUP_LIMIT ? null : nextFollowUp,
        },
        select: PROFESSOR_WITH_UNIVERSITY_SELECT,
      });

      return ok(res, updated);
    } catch (error) {
      logger.error("POST /professors/:id/log-email error", {
        userId: req.user?.id,
        professorId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to log email");
    }
  }
);

// ─── DELETE /api/v1/professors/:id ───────────────────────────────────────────
router.delete(
  "/:id",
  validateParams(professorIdParamSchema, "Invalid professor id"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const existing = await prisma.professor.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Professor not found");
      }

      await prisma.professor.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return ok(res, { message: "Professor deleted successfully" });
    } catch (error) {
      logger.error("DELETE /professors/:id error", {
        userId: req.user?.id,
        professorId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to delete professor");
    }
  }
);

export default router;
