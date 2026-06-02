import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = Router();

// Simple in-memory cache to prevent database hits for country reference data
let cachedCountries: any[] | null = null;
let lastCachedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // Cache for 1 minute

// GET /api/v1/countries
// Returns: list of all seeded countries with basic summaries
router.get("/", async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cachedCountries && now - lastCachedAt < CACHE_TTL_MS) {
      return res.json(cachedCountries);
    }

    const list = await prisma.countryIntelligence.findMany({
      select: {
        id: true,
        country: true,
        countryCode: true,
        overallScore: true,
        summary: true,
      },
      orderBy: {
        country: "asc",
      },
    });

    cachedCountries = list;
    lastCachedAt = now;
    res.json(list);
  } catch (error) {
    console.error("GET /countries error:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

// GET /api/v1/countries/:code
// Returns: full intelligence dataset for a country
router.get("/:code", async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    let normalized = code.toLowerCase().trim().replace(/\s+/g, '-');
    
    // Map aliases
    const aliases: Record<string, string> = {
      'united-states-of-america': 'us',
      'usa': 'us',
      'united-states': 'us',
      'united-arab-emirates': 'ae',
      'uae': 'ae',
      'south-korea': 'kr',
      'korea': 'kr',
      'republic-of-korea': 'kr',
    };

    if (aliases[normalized]) {
      normalized = aliases[normalized];
    }

    const country = await prisma.countryIntelligence.findFirst({
      where: {
        OR: [
          { countryCode: { equals: normalized, mode: "insensitive" } },
          { country: { equals: normalized.replace(/-/g, ' '), mode: "insensitive" } }
        ]
      }
    });

    if (!country) {
      return res.status(404).json({ error: `Country not found for input: ${code}` });
    }

    res.json(country);
  } catch (error) {
    console.error("GET /countries/:code error:", error);
    res.status(500).json({ error: "Failed to fetch country details" });
  }
});

export default router;
