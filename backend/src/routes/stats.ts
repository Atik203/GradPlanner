/**
 * stats.ts — Dashboard stats aggregation.
 *
 * Read-only endpoint. No body, no params. We just add explicit `select` clauses
 * to avoid fetching the full row (defense-in-depth) and wrap in the ApiResponse envelope.
 */

import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { ok, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { generateAllNotifications } from "../services/notificationService.js";

const router: Router = Router();

// GET /api/v1/dashboard/stats
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [universities, professors, applications, documents] = await Promise.all([
      prisma.university.findMany({
        where: { userId, deletedAt: null },
        select: { tier: true },
      }),
      prisma.professor.findMany({
        where: { userId, deletedAt: null },
        select: { status: true, replyReceived: true },
      }),
      prisma.application.findMany({
        where: { userId, deletedAt: null },
        select: { status: true },
      }),
      prisma.document.findMany({
        where: { userId },
        select: { status: true },
      }),
    ]);

    const uniStats = {
      total: universities.length,
      dream: universities.filter((u) => u.tier === "DREAM").length,
      match: universities.filter((u) => u.tier === "MATCH").length,
      safety: universities.filter((u) => u.tier === "SAFETY").length,
    };

    const profStats = {
      total: professors.length,
      notContacted: professors.filter((p) => p.status === "NOT_CONTACTED").length,
      emailed: professors.filter((p) => p.status === "EMAILED").length,
      awaitingReply: professors.filter((p) => p.status === "AWAITING_REPLY").length,
      repliedPositive: professors.filter((p) => p.status === "REPLIED_POSITIVE").length,
      repliedNegative: professors.filter((p) => p.status === "REPLIED_NEGATIVE").length,
      interviewed: professors.filter((p) => p.status === "INTERVIEWED").length,
      totalReplies: professors.filter((p) => p.replyReceived).length,
    };

    const appStats = {
      total: applications.length,
      planning: applications.filter((a) => a.status === "PLANNING").length,
      inProgress: applications.filter((a) => a.status === "IN_PROGRESS").length,
      submitted: applications.filter((a) => a.status === "SUBMITTED").length,
      underReview: applications.filter((a) => a.status === "UNDER_REVIEW").length,
      offerReceived: applications.filter((a) => a.status === "OFFER_RECEIVED").length,
      accepted: applications.filter((a) => a.status === "ACCEPTED").length,
      rejected: applications.filter((a) => a.status === "REJECTED").length,
      withdrawn: applications.filter((a) => a.status === "WITHDRAWN").length,
    };

    const docStats = {
      total: documents.length,
      pending: documents.filter((d) => d.status === "PENDING").length,
      inProgress: documents.filter((d) => d.status === "IN_PROGRESS").length,
      obtained: documents.filter((d) => d.status === "OBTAINED").length,
      expired: documents.filter((d) => d.status === "EXPIRED").length,
      notRequired: documents.filter((d) => d.status === "NOT_REQUIRED").length,
      progressPercentage: 0,
    };

    if (docStats.total > 0) {
      const completed = docStats.obtained + docStats.notRequired;
      docStats.progressPercentage = Math.round((completed / docStats.total) * 100);
    }

    generateAllNotifications(userId)
      .catch((err) => logger.warn("Failed to generate all notifications", { userId, error: String(err) }));
    return ok(res, {
      universities: uniStats,
      professors: profStats,
      applications: appStats,
      documents: docStats,
    });
  } catch (error) {
    logger.error("GET /dashboard/stats error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch stats");
  }
});

export default router;
