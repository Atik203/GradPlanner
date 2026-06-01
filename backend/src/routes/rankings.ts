import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = Router();

// GET /api/v1/rankings?q=...&page=1&limit=50
// Returns: { data: [...], total: number, page: number, totalPages: number }
router.get("/", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const countryFilter = (req.query.country as string) || "";
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (q) {
      where.OR = [
        { institutionName: { contains: q, mode: "insensitive" as const } },
        { country: { contains: q, mode: "insensitive" as const } },
      ];
    }

    if (countryFilter && countryFilter !== "all") {
      const countries = countryFilter.split(",").map(c => c.trim()).filter(Boolean);
      if (countries.length > 0) {
        where.country = { in: countries, mode: "insensitive" as const };
      }
    }

    const orderBy = [
      { qs2026Rank: "asc" as const },
      { the2026Rank: "asc" as const },
      { arwu2025Rank: "asc" as const },
    ];

    const [rankings, total] = await Promise.all([
      prisma.universityRanking.findMany({
        where,
        orderBy,
        take: limit,
        skip,
      }),
      prisma.universityRanking.count({ where }),
    ]);

    res.json({
      data: rankings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("GET /rankings error:", error);
    res.status(500).json({ error: "Failed to search rankings" });
  }
});

// GET /api/v1/rankings/countries — get unique list of countries
router.get("/countries", async (req: Request, res: Response) => {
  try {
    const countries = await prisma.universityRanking.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });
    
    // Extract just the strings
    const countryNames = countries.map(c => c.country).filter(Boolean);
    res.json(countryNames);
  } catch (error) {
    console.error("GET /rankings/countries error:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

// GET /api/v1/rankings/:id — single university detail
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const ranking = await prisma.universityRanking.findUnique({
      where: { id: req.params.id },
    });
    if (!ranking) {
      return res.status(404).json({ error: "University not found" });
    }
    res.json(ranking);
  } catch (error) {
    console.error("GET /rankings/:id error:", error);
    res.status(500).json({ error: "Failed to fetch university details" });
  }
});

export default router;

