/**
 * timeline.ts — Timeline planner.
 *
 * Read-only computation. Accepts `?intake=Sep 2028` query.
 * All timeline logic from the original is preserved; only the envelope + logger change.
 */

import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { ok, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

const parseIntake = (intakeStr: string) => {
  const parts = intakeStr.trim().split(/\s+/);
  if (parts.length !== 2) return { month: 8, year: 2028 };
  const monthStr = parts[0].toLowerCase();
  const year = parseInt(parts[1], 10) || 2028;
  let month = 8;
  if (monthStr.startsWith("jan")) month = 0;
  else if (monthStr.startsWith("feb")) month = 1;
  else if (monthStr.startsWith("mar")) month = 2;
  else if (monthStr.startsWith("apr")) month = 3;
  else if (monthStr.startsWith("may")) month = 4;
  else if (monthStr.startsWith("jun")) month = 5;
  else if (monthStr.startsWith("jul")) month = 6;
  else if (monthStr.startsWith("aug")) month = 7;
  else if (monthStr.startsWith("sep")) month = 8;
  else if (monthStr.startsWith("oct")) month = 9;
  else if (monthStr.startsWith("nov")) month = 10;
  else if (monthStr.startsWith("dec")) month = 11;
  return { month, year };
};

const getDateByOffset = (targetYear: number, targetMonth: number, offsetMonths: number, day = 1) => {
  return new Date(Date.UTC(targetYear, targetMonth - offsetMonths, day));
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const PROFILE_SELECT = {
  targetIntake: true,
  ieltsScore: true,
} as const;

const DOCUMENT_SELECT = { type: true, status: true } as const;
const PROFESSOR_SELECT = { status: true } as const;
const APPLICATION_SELECT = { status: true, offerReceived: true } as const;

type DbDocument = { type: string; status: string };
type DbProfessor = { status: string };
type DbApplication = { status: string; offerReceived: boolean };

router.get("/planner", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const queryIntake = (req.query.intake as string | undefined)?.trim();

    const [profile, documents, professors, applications] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId }, select: PROFILE_SELECT }),
      prisma.document.findMany({ where: { userId }, select: DOCUMENT_SELECT }),
      prisma.professor.findMany({ where: { userId, deletedAt: null }, select: PROFESSOR_SELECT }),
      prisma.application.findMany({ where: { userId, deletedAt: null }, select: APPLICATION_SELECT }),
    ]);

    const selectedIntake = queryIntake || profile?.targetIntake || "Sep 2028";
    const { month: targetMonth, year: targetYear } = parseIntake(selectedIntake);

    const serverTime = new Date();

    const ieltsStart = getDateByOffset(targetYear, targetMonth, 20);
    const ieltsEnd = getDateByOffset(targetYear, targetMonth, 14, 30);
    const contactStart = getDateByOffset(targetYear, targetMonth, 20);
    const contactEnd = getDateByOffset(targetYear, targetMonth, 10, 30);
    const draftingStart = getDateByOffset(targetYear, targetMonth, 14);
    const draftingEnd = getDateByOffset(targetYear, targetMonth, 11, 30);
    const gradStart = targetMonth === 0
      ? getDateByOffset(targetYear, targetMonth, 17)
      : getDateByOffset(targetYear, targetMonth, 13);
    const gradEnd = getDateByOffset(targetYear, targetMonth, 10, 30);
    const policeStart = getDateByOffset(targetYear, targetMonth, 13);
    const policeEnd = getDateByOffset(targetYear, targetMonth, 11, 30);
    const appStart = getDateByOffset(targetYear, targetMonth, 10);
    const appEnd = getDateByOffset(targetYear, targetMonth, 8, 30);
    const visaStart = getDateByOffset(targetYear, targetMonth, 5);
    const visaEnd = getDateByOffset(targetYear, targetMonth, 2, 30);
    const programStart = getDateByOffset(targetYear, targetMonth, 0);
    const programEnd = getDateByOffset(targetYear, targetMonth, -1, 30);

    const docs = documents as unknown as DbDocument[];
    const profs = professors as unknown as DbProfessor[];
    const apps = applications as unknown as DbApplication[];

    const hasIelts =
      docs.some((d) => d.type === "IELTS" && d.status === "OBTAINED") ||
      docs.some((d) => d.type === "TOEFL" && d.status === "OBTAINED") ||
      (profile?.ieltsScore != null && (profile.ieltsScore as number) >= 5.0);

    const contactedCount = profs.filter((p) => p.status !== "NOT_CONTACTED").length;
    const hasSop = docs.some((d) => d.type === "SOP" && d.status === "OBTAINED");
    const hasCv = docs.some((d) => d.type === "CV" && d.status === "OBTAINED");
    const hasLor = docs.some((d) => d.type === "LOR" && d.status === "OBTAINED");
    const hasTranscript =
      docs.some((d) => d.type === "TRANSCRIPT" && d.status === "OBTAINED") ||
      docs.some((d) => d.type === "DEGREE_CERTIFICATE" && d.status === "OBTAINED");
    const hasPcc = docs.some((d) => d.type === "POLICE_CLEARANCE" && d.status === "OBTAINED");
    const hasSubmittedApps = apps.some((a) =>
      ["SUBMITTED", "UNDER_REVIEW", "OFFER_RECEIVED", "ACCEPTED"].includes(a.status)
    );
    const hasVisaOrFinancials =
      docs.some((d) => d.type === "BANK_STATEMENT" && d.status === "OBTAINED") ||
      apps.some((a) => a.status === "ACCEPTED" || a.offerReceived);
    const hasAcceptedOffer = apps.some((a) => a.status === "ACCEPTED");

    const evaluateStatus = (completed: boolean, inProgress: boolean, start: Date, end: Date) => {
      if (completed) return "DONE";
      if (serverTime > end) return "OVERDUE";
      if (serverTime >= start && serverTime <= end) return "IN_PROGRESS";
      if (inProgress) return "IN_PROGRESS";
      return "UPCOMING";
    };

    const milestones = [
      {
        id: "ielts",
        label: "IELTS / GRE Preparation & Exam",
        startDate: formatDate(ieltsStart),
        endDate: formatDate(ieltsEnd),
        status: evaluateStatus(!!hasIelts, false, ieltsStart, ieltsEnd),
        description:
          "Complete preparation and exams. IELTS seats in Dhaka fill up 6–8 weeks ahead. A minimum band of 6.5 is recommended for STEM admissions.",
        icon: "ielts",
      },
      {
        id: "outreach",
        label: "Contact Professors (Outreach)",
        startDate: formatDate(contactStart),
        endDate: formatDate(contactEnd),
        status: evaluateStatus(contactedCount >= 3, contactedCount > 0, contactStart, contactEnd),
        description: `Contact supervisors for thesis support. Contacted: ${contactedCount} professor(s). Tuesdays through Thursdays mornings local time are optimal slots.`,
        icon: "outreach",
      },
      {
        id: "drafting",
        label: "SOP, CV & LOR Drafting",
        startDate: formatDate(draftingStart),
        endDate: formatDate(draftingEnd),
        status: evaluateStatus(
          !!(hasSop && hasCv && hasLor),
          !!(hasSop || hasCv || hasLor),
          draftingStart,
          draftingEnd
        ),
        description:
          "Draft your Statement of Purpose (SOP), Curriculum Vitae (CV), and request reference letters (LORs) from your university registrar / professors.",
        icon: "drafting",
      },
      {
        id: "documents",
        label: "Collect Graduation Documents",
        startDate: formatDate(gradStart),
        endDate: formatDate(gradEnd),
        status: evaluateStatus(!!hasTranscript, false, gradStart, gradEnd),
        description:
          "Collect official transcripts and degree certificates post-graduation. Processing times at local universities (like UIU) can take 3-7 days.",
        icon: "documents",
      },
      {
        id: "police",
        label: "Bangladesh Police Clearance",
        startDate: formatDate(policeStart),
        endDate: formatDate(policeEnd),
        status: evaluateStatus(!!hasPcc, false, policeStart, policeEnd),
        description:
          "Apply for a Police Clearance Certificate (PCC) online (pcc.police.gov.bd). Processing takes 2-6 weeks via Ramna HQ in Dhaka.",
        icon: "police",
      },
      {
        id: "applications",
        label: "Submit University Applications",
        startDate: formatDate(appStart),
        endDate: formatDate(appEnd),
        status: evaluateStatus(hasSubmittedApps, false, appStart, appEnd),
        description:
          "Submit all online applications before the priority deadline. Keep close track of hard deadlines like Sweden (Jan 15) or USA winter cuts.",
        icon: "applications",
      },
      {
        id: "visa",
        label: "Visa Processing & GIC / Blocked Account",
        startDate: formatDate(visaStart),
        endDate: formatDate(visaEnd),
        status: evaluateStatus(hasVisaOrFinancials, false, visaStart, visaEnd),
        description:
          "Set up Blocked Account (Germany Fintiba/Coracle) or wire GIC (Canada, takes 5-10 days). Submit visa file to VFS / embassy in Dhaka.",
        icon: "visa",
      },
      {
        id: "program",
        label: "Start Academic Program",
        startDate: formatDate(programStart),
        endDate: formatDate(programEnd),
        status: evaluateStatus(
          hasAcceptedOffer && serverTime >= programStart,
          false,
          programStart,
          programEnd
        ),
        description: `Fly to your destination and commence study. Welcome to your ${selectedIntake} intake!`,
        icon: "program",
      },
    ];

    return ok(res, {
      intake: selectedIntake,
      serverTime: serverTime.toISOString(),
      milestones,
    });
  } catch (error) {
    logger.error("GET /timeline/planner error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to generate timeline plan");
  }
});

export default router;
