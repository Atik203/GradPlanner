import { z } from "zod";

export const notificationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const notificationIdParamSchema = z.object({
  id: z.string().min(1, "Notification id is required"),
});
