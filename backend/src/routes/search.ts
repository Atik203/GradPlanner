import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router: Router = Router();

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 2) {
      return ok(res, {
        universityRankings: [],
        universities: [],
        professors: [],
        countries: [],
      });
    }

    const filter = { contains: q, mode: "insensitive" as const };

    const [universityRankings, countries, universities, professors] = await Promise.all([
      prisma.universityRanking.findMany({
        where: {
          OR: [
            { institutionName: filter },
            { country: filter },
          ],
        },
        select: {
          id: true,
          institutionName: true,
          country: true,
          inQs: true,
          inThe: true,
          inArwu: true,
        },
        take: 5,
        orderBy: { institutionName: "asc" },
      }),

      prisma.countryIntelligence.findMany({
        where: {
          OR: [
            { country: filter },
            { countryCode: filter },
          ],
        },
        select: {
          id: true,
          country: true,
          countryCode: true,
          overallScore: true,
        },
        take: 5,
        orderBy: { overallScore: "desc" },
      }),

      prisma.university.findMany({
        where: {
          userId: req.user!.id,
          deletedAt: null,
          OR: [
            { name: filter },
            { country: filter },
            { program: filter },
          ],
        },
        select: {
          id: true,
          name: true,
          country: true,
          program: true,
          tier: true,
        },
        take: 5,
        orderBy: { name: "asc" },
      }),

      prisma.professor.findMany({
        where: {
          userId: req.user!.id,
          deletedAt: null,
          OR: [
            { name: filter },
            { researchInterests: filter },
          ],
        },
        select: {
          id: true,
          name: true,
          researchInterests: true,
          researchFitScore: true,
          university: {
            select: { name: true },
          },
        },
        take: 5,
        orderBy: { name: "asc" },
      }),
    ]);

    return ok(res, {
      universityRankings,
      universities,
      professors,
      countries,
    });
  } catch (error) {
    logger.error("GET /search error", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Search failed");
  }
});

export default router;
