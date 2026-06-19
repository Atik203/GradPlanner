/**
 * rankings.ts — University ranking search.
 *
 * Public read-only data (rankings are seeded by admin, not user-owned).
 * Supports `?q=`, `?country=`, `?page=`, `?limit=` query params.
 */

import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ok, notFound, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

const RANKING_SELECT = {
  id: true,
  institutionName: true,
  country: true,
  region: true,
  inQs: true,
  inThe: true,
  inArwu: true,
  qs2026Rank: true,
  qs2026RankDisplay: true,
  qs2026Score: true,
  qsArScore: true,
  qsErScore: true,
  qsFsrScore: true,
  qsCpfScore: true,
  qsIfrScore: true,
  qsIsrScore: true,
  qsEoScore: true,
  qsSusScore: true,
  the2026Rank: true,
  the2026RankDisplay: true,
  the2026Score: true,
  theTeaching: true,
  theResearchEnv: true,
  theResearchQuality: true,
  theIndustry: true,
  theInternational: true,
  arwu2025Rank: true,
  arwu2025Score: true,
  arwuAlumni: true,
  arwuAward: true,
  arwuHici: true,
  arwuNs: true,
  arwuPub: true,
  arwuPcp: true,
} satisfies Prisma.UniversityRankingSelect;

// GET /api/v1/rankings?q=...&page=1&limit=50&country=US,CA
router.get("/", async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    const countryFilter = ((req.query.country as string) || "").trim();
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.UniversityRankingWhereInput = {};

    if (q) {
      where.OR = [
        { institutionName: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
      ];
    }

    if (countryFilter && countryFilter !== "all") {
      const countries = countryFilter.split(",").map((c) => c.trim()).filter(Boolean);
      if (countries.length > 0) {
        where.country = { in: countries, mode: "insensitive" };
      }
    }

    const orderBy: Prisma.UniversityRankingOrderByWithRelationInput[] = [
      { qs2026Rank: "asc" },
      { the2026Rank: "asc" },
      { arwu2025Rank: "asc" },
    ];

    const [rankings, total] = await Promise.all([
      prisma.universityRanking.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        select: RANKING_SELECT,
      }),
      prisma.universityRanking.count({ where }),
    ]);

    return ok(res, {
      data: rankings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    logger.error("GET /rankings error", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to search rankings");
  }
});

// GET /api/v1/rankings/countries
router.get("/countries", async (_req: Request, res: Response) => {
  try {
    const countries = await prisma.universityRanking.findMany({
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    });
    const countryNames = countries.map((c) => c.country).filter(Boolean);
    return ok(res, countryNames);
  } catch (error) {
    logger.error("GET /rankings/countries error", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch countries");
  }
});

// GET /api/v1/rankings/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const ranking = await prisma.universityRanking.findUnique({
      where: { id: req.params.id as string },
      select: RANKING_SELECT,
    });
    if (!ranking) {
      return notFound(res, "University not found");
    }
    return ok(res, ranking);
  } catch (error) {
    logger.error("GET /rankings/:id error", {
      rankingId: req.params.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch university details");
  }
});

export default router;
