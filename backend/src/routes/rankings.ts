import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = Router();

// GET /api/v1/rankings
router.get("/", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    let rankings;

    if (q) {
      rankings = await prisma.universityRanking.findMany({
        where: {
          OR: [
            { institutionName: { contains: q, mode: "insensitive" } },
            { country: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: [
          { qs2026Rank: "asc" },
          { the2026Rank: "asc" },
          { arwu2025Rank: "asc" },
        ],
        take: limit,
      });
    } else {
      // Default: Return top-ranked universities in the database
      rankings = await prisma.universityRanking.findMany({
        orderBy: [
          { qs2026Rank: "asc" },
          { the2026Rank: "asc" },
          { arwu2025Rank: "asc" },
        ],
        take: limit,
      });
    }

    res.json(rankings);
  } catch (error) {
    console.error("GET /rankings error:", error);
    res.status(500).json({ error: "Failed to search rankings" });
  }
});

export default router;
