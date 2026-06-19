/**
 * profile.ts — User profile GET / PUT.
 *
 * GET returns the current user's profile (or a synthesized default if none exists).
 * PUT upserts and applies a partial update from the validated body.
 *
 * Validation: profileUpdateSchema (see validators/profile.ts).
 * All numeric / date coercions happen in the schema, so the route handler
 * reads strongly-typed values from req.body.
 */

import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../validators/index.js";
import { profileUpdateSchema } from "../validators/profile.js";
import { ok, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

/**
 * The shape of a profile as returned by the API. Matches frontend UserProfile type.
 * Explicit select avoids leaking internal fields (none yet, but consistent pattern).
 */
const PROFILE_SELECT = {
  id: true,
  userId: true,
  university: true,
  cgpa: true,
  targetIntake: true,
  graduationDate: true,
  targetDegree: true,
  ieltsScore: true,
  monthlyBudgetUSD: true,
  researchInterests: true,
  prPriority: true,
  familyRelocation: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Default empty profile returned when the user has not yet created one.
 * Mirrors the selected shape so the frontend never has to handle two different types.
 */
const EMPTY_PROFILE = {
  id: null,
  userId: null,
  university: null,
  cgpa: null,
  targetIntake: null,
  graduationDate: null,
  targetDegree: null,
  ieltsScore: null,
  monthlyBudgetUSD: null,
  researchInterests: [],
  prPriority: null,
  familyRelocation: null,
  createdAt: null,
  updatedAt: null,
} as const;

// GET /api/v1/profile
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: PROFILE_SELECT,
    });

    if (!profile) {
      return ok(res, { ...EMPTY_PROFILE, userId });
    }

    return ok(res, profile);
  } catch (error) {
    logger.error("GET /profile error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch profile");
  }
});

// PUT /api/v1/profile
router.put(
  "/",
  validateBody(profileUpdateSchema, "Invalid profile data"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      // After validateBody, req.body is the parsed shape from profileUpdateSchema.
      const data = req.body as {
        university?: string | null;
        cgpa?: number | null;
        targetIntake?: string | null;
        graduationDate?: string | null;
        targetDegree?: string | null;
        ieltsScore?: number | null;
        monthlyBudgetUSD?: number | null;
        researchInterests?: string[];
        prPriority?: number | null;
        familyRelocation?: boolean | null;
      };

      const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
        select: PROFILE_SELECT,
      });

      return ok(res, profile);
    } catch (error) {
      logger.error("PUT /profile error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to update profile");
    }
  }
);

export default router;
