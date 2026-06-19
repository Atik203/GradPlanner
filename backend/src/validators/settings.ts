/**
 * settings.ts — Zod schema for UserSettings updates.
 *
 * The UserSettings model has 3 mutable fields. All are optional in the PUT body — the
 * client only sends what it wants to change.
 */

import { z } from "zod";

export const strategyPreferenceEnum = z.enum(["PR speed", "AI Market", "No Tuition", "Scholarship"]);

export const settingsUpdateSchema = z
  .object({
    emailDeadlineAlerts: z.boolean().optional(),
    timelineNotifications: z.boolean().optional(),
    strategyPreference: strategyPreferenceEnum.optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.emailDeadlineAlerts !== undefined ||
      v.timelineNotifications !== undefined ||
      v.strategyPreference !== undefined,
    { message: "At least one setting must be provided" }
  );

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
