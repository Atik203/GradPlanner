/**
 * settings.ts — User settings CRUD (Phase 1).
 *
 * Endpoints:
 *   GET  /api/v1/settings   — fetch current user's settings, upserting defaults if absent
 *   PUT  /api/v1/settings   — update one or more settings (partial update)
 *
 * The settings model has only 3 fields: emailDeadlineAlerts, timelineNotifications,
 * strategyPreference. All are optional in the PUT body.
 *
 * The GET upsert ensures every authenticated user always has a settings row,
 * which simplifies the frontend (no need to handle a 404 on first load).
 */

import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../validators/index.js";
import { settingsUpdateSchema } from "../validators/settings.js";
import { ok, validationError, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

/**
 * GET /api/v1/settings
 * Returns the current user's settings, creating a default row if none exists.
 */
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {}, // No-op if row exists; we just want to read.
      create: { userId },
    });
    return ok(res, settings);
  } catch (error) {
    logger.error("GET /settings error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch settings");
  }
});

/**
 * PUT /api/v1/settings
 * Body: { emailDeadlineAlerts?, timelineNotifications?, strategyPreference? }
 *
 * Upserts a row if it doesn't exist, otherwise applies a partial update.
 * The Zod schema rejects empty bodies (must provide at least one field).
 */
router.put(
  "/",
  validateBody(settingsUpdateSchema, "Invalid settings payload"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body as {
        emailDeadlineAlerts?: boolean;
        timelineNotifications?: boolean;
        strategyPreference?: "PR speed" | "AI Market" | "No Tuition" | "Scholarship";
      };

      // Build update payload with only the fields the client actually sent.
      const updateData: Record<string, unknown> = {};
      if (body.emailDeadlineAlerts !== undefined) {
        updateData.emailDeadlineAlerts = body.emailDeadlineAlerts;
      }
      if (body.timelineNotifications !== undefined) {
        updateData.timelineNotifications = body.timelineNotifications;
      }
      if (body.strategyPreference !== undefined) {
        updateData.strategyPreference = body.strategyPreference;
      }

      if (Object.keys(updateData).length === 0) {
        // Schema's .refine() catches this, but defensive check here in case the
        // schema is ever loosened.
        return validationError(res, "No settings provided to update");
      }

      const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: updateData,
        create: { userId, ...updateData },
      });

      return ok(res, settings);
    } catch (error) {
      logger.error("PUT /settings error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to update settings");
    }
  }
);

export default router;
