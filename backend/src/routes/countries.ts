/**
 * countries.ts — Country intelligence reference data.
 *
 * Read-only, public-style data. No auth required (countries are not user-scoped).
 * 1-minute in-memory cache to reduce DB load.
 */

import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, notFound, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

// Simple in-memory cache to prevent database hits for country reference data
let cachedCountries: unknown[] | null = null;
let lastCachedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // Cache for 1 minute

// GET /api/v1/countries
router.get("/", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cachedCountries && now - lastCachedAt < CACHE_TTL_MS) {
      return ok(res, cachedCountries);
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
    return ok(res, list);
  } catch (error) {
    logger.error("GET /countries error", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch countries");
  }
});

// GET /api/v1/countries/:code
router.get("/:code", async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    let normalized = code.toLowerCase().trim().replace(/\s+/g, "-");

    const aliases: Record<string, string> = {
      "united-states-of-america": "us",
      "usa": "us",
      "united-states": "us",
      "united-arab-emirates": "ae",
      "uae": "ae",
      "south-korea": "kr",
      "korea": "kr",
      "republic-of-korea": "kr",
    };

    if (aliases[normalized]) {
      normalized = aliases[normalized];
    }

    const country = await prisma.countryIntelligence.findFirst({
      where: {
        OR: [
          { countryCode: { equals: normalized, mode: "insensitive" } },
          { country: { equals: normalized.replace(/-/g, " "), mode: "insensitive" } },
        ],
      },
    });

    if (!country) {
      return notFound(res, `Country not found for input: ${code}`);
    }

    return ok(res, country);
  } catch (error) {
    logger.error("GET /countries/:code error", {
      countryCode: req.params.code,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch country details");
  }
});

export default router;
