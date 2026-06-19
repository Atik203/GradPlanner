/**
 * onboarding.ts — Zod schema for the onboarding wizard submission.
 *
 * All fields are optional because users may skip any step in the wizard.
 * Reuses coercion transforms from profile.ts.
 * The `isOnboarded` flag is set server-side, not accepted from the client.
 */

import { z } from "zod";
import {
  emptyStringToNull,
  cgpaField,
  ieltsField,
  monthlyBudgetField,
  prPriorityField,
  familyRelocationField,
  researchInterestsField,
} from "./profile.js";

export const onboardingSchema = z.object({
  university: emptyStringToNull.pipe(z.string().max(200).nullable()).optional(),
  cgpa: cgpaField.optional(),
  targetIntake: emptyStringToNull.pipe(z.string().max(40).nullable()).optional(),
  graduationDate: emptyStringToNull.pipe(z.string().max(40).nullable()).optional(),
  targetDegree: emptyStringToNull.pipe(z.string().max(120).nullable()).optional(),
  ieltsScore: ieltsField.optional(),
  monthlyBudgetUSD: monthlyBudgetField.optional(),
  researchInterests: researchInterestsField.optional(),
  prPriority: prPriorityField.optional(),
  familyRelocation: familyRelocationField.optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
