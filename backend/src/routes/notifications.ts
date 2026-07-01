import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { validateQuery, validateParams } from "../validators/index.js";
import { notificationQuerySchema, notificationIdParamSchema } from "../validators/notification.js";
import { ok, notFound, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { cleanupOldNotifications } from "../services/notificationService.js";

const router: Router = Router();

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  title: true,
  message: true,
  link: true,
  referenceId: true,
  isRead: true,
  createdAt: true,
} as const;

// GET /api/v1/notifications
router.get(
  "/",
  validateQuery(notificationQuerySchema, "Invalid notification query"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { limit, offset } = req.query as unknown as { limit: number; offset: number };

      cleanupOldNotifications(userId).catch((err) =>
        logger.warn("cleanupOldNotifications background error", { userId, error: String(err) })
      );

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          select: NOTIFICATION_SELECT,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      return ok(res, { notifications, total, limit, offset });
    } catch (error) {
      logger.error("GET /notifications error", {
        userId: req.user?.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to fetch notifications");
    }
  }
);

// GET /api/v1/notifications/unread-count
router.get("/unread-count", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return ok(res, { count });
  } catch (error) {
    logger.error("GET /notifications/unread-count error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch unread count");
  }
});

// PUT /api/v1/notifications/read-all
router.put("/read-all", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return ok(res, { message: "All notifications marked as read" });
  } catch (error) {
    logger.error("PUT /notifications/read-all error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to mark all as read");
  }
});

// PUT /api/v1/notifications/:id/read
router.put(
  "/:id/read",
  validateParams(notificationIdParamSchema, "Invalid notification id"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const existing = await prisma.notification.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Notification not found");
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return ok(res, { message: "Notification marked as read" });
    } catch (error) {
      logger.error("PUT /notifications/:id/read error", {
        userId: req.user?.id,
        notificationId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to mark notification as read");
    }
  }
);

// DELETE /api/v1/notifications/clear-all
router.delete("/clear-all", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await prisma.notification.deleteMany({ where: { userId } });
    return ok(res, { message: "All notifications cleared" });
  } catch (error) {
    logger.error("DELETE /notifications/clear-all error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to clear notifications");
  }
});

// DELETE /api/v1/notifications/:id
router.delete(
  "/:id",
  validateParams(notificationIdParamSchema, "Invalid notification id"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const existing = await prisma.notification.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) {
        return notFound(res, "Notification not found");
      }

      await prisma.notification.delete({ where: { id } });
      return ok(res, { message: "Notification deleted" });
    } catch (error) {
      logger.error("DELETE /notifications/:id error", {
        userId: req.user?.id,
        notificationId: req.params.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to delete notification");
    }
  }
);

export default router;
