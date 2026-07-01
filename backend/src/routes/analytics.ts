import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { ok, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { generateAllNotifications } from "../services/notificationService.js";

const router: Router = Router();

interface UnivBreakdown {
  name: string;
  country: string;
  tier: string;
  tuition: number;
  livingCost: number;
  scholarship: number;
}

interface AnalyticsResponse {
  profileCompleteness: number;
  applicationFunnel: Record<string, number>;
  financial: {
    totalEstimatedCost: number;
    scholarshipsTotal: number;
    fundingGap: number;
    avgPostGradSalary: number;
    roiScore: number;
    breakdownByUniversity: UnivBreakdown[];
  };
  professorOutreach: {
    total: number;
    contacted: number;
    repliedPositive: number;
    repliedNegative: number;
    noResponse: number;
    responseRate: number;
    averageFitScore: number;
    followUpEfficacy: number;
  };
  activityTimeline: Array<{ date: string; count: number }>;
}

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    const profileCompleteness = computeProfileCompleteness(profile);

    const [universities, applications, professors, countries] = await Promise.all([
      prisma.university.findMany({
        where: { userId, deletedAt: null },
        select: {
          name: true,
          country: true,
          tier: true,
          tuitionPerYr: true,
          livingCostPerYr: true,
          application: { select: { scholarshipAmt: true } },
        },
      }),
      prisma.application.findMany({
        where: { userId, deletedAt: null },
        select: { status: true, createdAt: true, deadline: true },
      }),
      prisma.professor.findMany({
        where: { userId, deletedAt: null },
        select: {
          status: true,
          replyReceived: true,
          researchFitScore: true,
          followUpCount: true,
          createdAt: true,
        },
      }),
      prisma.countryIntelligence.findMany({
        select: { country: true, salary: true },
      }),
    ]);

    const applicationFunnel = buildApplicationFunnel(applications);

    const financial = computeFinancialROI(universities, countries);

    const professorOutreach = computeProfessorOutreach(professors);

    const activityTimeline = await computeActivityTimeline(userId);

    generateAllNotifications(userId)
      .catch((err) => logger.warn("Failed to generate all notifications from analytics", { userId, error: String(err) }));

    const response: AnalyticsResponse = {
      profileCompleteness,
      applicationFunnel,
      financial,
      professorOutreach,
      activityTimeline,
    };

    return ok(res, response);
  } catch (error) {
    logger.error("GET /analytics error", {
      userId: req.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Failed to fetch analytics");
  }
});

function computeProfileCompleteness(profile: { university?: string | null; cgpa?: number | null; targetIntake?: string | null; graduationDate?: string | null; targetDegree?: string | null; ieltsScore?: number | null; monthlyBudgetUSD?: number | null; researchInterests?: string[]; prPriority?: number | null; familyRelocation?: boolean | null } | null): number {
  if (!profile) return 0;
  const fields = [
    profile.university,
    profile.cgpa,
    profile.targetIntake,
    profile.graduationDate,
    profile.targetDegree,
    profile.ieltsScore,
    profile.monthlyBudgetUSD,
    profile.researchInterests && profile.researchInterests.length > 0,
    profile.prPriority,
    profile.familyRelocation !== null && profile.familyRelocation !== undefined,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function buildApplicationFunnel(applications: { status: string }[]): Record<string, number> {
  const statuses = ["PLANNING", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "OFFER_RECEIVED", "ACCEPTED", "REJECTED", "WITHDRAWN"];
  const funnel: Record<string, number> = {};
  for (const s of statuses) funnel[s] = 0;
  for (const app of applications) {
    if (funnel[app.status] !== undefined) funnel[app.status]++;
  }
  return funnel;
}

function computeFinancialROI(
  universities: {
    name: string;
    country: string;
    tier: string;
    tuitionPerYr?: string | null;
    livingCostPerYr?: string | null;
    application?: { scholarshipAmt?: string | null } | null;
  }[],
  countries: { country: string; salary: unknown }[]
): AnalyticsResponse["financial"] {
  let totalEstimatedCost = 0;
  let scholarshipsTotal = 0;
  const breakdownByUniversity: UnivBreakdown[] = [];

  for (const uni of universities) {
    const tuition = parseFloat(uni.tuitionPerYr || "0");
    const living = parseFloat(uni.livingCostPerYr || "0");
    const cost = tuition + living;
    const scholarship = parseFloat(uni.application?.scholarshipAmt || "0");
    totalEstimatedCost += cost;
    scholarshipsTotal += scholarship;
    breakdownByUniversity.push({
      name: uni.name,
      country: uni.country,
      tier: uni.tier,
      tuition,
      livingCost: living,
      scholarship,
    });
  }

  const fundingGap = Math.max(0, totalEstimatedCost - scholarshipsTotal);

  const countryNames = [...new Set(universities.map((u) => u.country))];
  let avgPostGradSalary = 0;
  let salaryCount = 0;
  for (const c of countries) {
    if (countryNames.includes(c.country) && c.salary && typeof c.salary === "object") {
      const salaryData = c.salary as Record<string, unknown>;
      const avg = parseFloat(String(salaryData.avgAnnualSalary ?? 0));
      if (avg > 0) {
        avgPostGradSalary += avg;
        salaryCount++;
      }
    }
  }
  if (salaryCount > 0) avgPostGradSalary = Math.round(avgPostGradSalary / salaryCount);
  const roiScore = totalEstimatedCost > 0 ? parseFloat((avgPostGradSalary / totalEstimatedCost).toFixed(2)) : 0;

  return { totalEstimatedCost, scholarshipsTotal, fundingGap, avgPostGradSalary, roiScore, breakdownByUniversity };
}

function computeProfessorOutreach(
  professors: { status: string; replyReceived: boolean; researchFitScore?: number | null; followUpCount: number }[]
): AnalyticsResponse["professorOutreach"] {
  const total = professors.length;
  const contacted = professors.filter((p) => p.status !== "NOT_CONTACTED").length;
  const repliedPositive = professors.filter((p) => p.status === "REPLIED_POSITIVE").length;
  const repliedNegative = professors.filter((p) => p.status === "REPLIED_NEGATIVE").length;
  const noResponse = professors.filter((p) => p.status === "AWAITING_REPLY" || (p.status === "EMAILED" && !p.replyReceived)).length;
  const responseRate = contacted > 0 ? parseFloat((((repliedPositive + repliedNegative) / contacted) * 100).toFixed(1)) : 0;
  const fitScores = professors.filter((p) => p.researchFitScore != null).map((p) => p.researchFitScore!);
  const averageFitScore = fitScores.length > 0 ? parseFloat((fitScores.reduce((a, b) => a + b, 0) / fitScores.length).toFixed(1)) : 0;
  const withFollowUp = professors.filter((p) => p.followUpCount > 0);
  const repliedAfterFollowUp = withFollowUp.filter((p) => p.replyReceived).length;
  const followUpEfficacy = withFollowUp.length > 0 ? parseFloat(((repliedAfterFollowUp / withFollowUp.length) * 100).toFixed(1)) : 0;

  return { total, contacted, repliedPositive, repliedNegative, noResponse, responseRate, averageFitScore, followUpEfficacy };
}

async function computeActivityTimeline(userId: string): Promise<Array<{ date: string; count: number }>> {
  const threeSixtyFiveDaysAgo = new Date();
  threeSixtyFiveDaysAgo.setDate(threeSixtyFiveDaysAgo.getDate() - 365);

  const [appRecords, profRecords, docRecords] = await Promise.all([
    prisma.application.findMany({
      where: { userId, createdAt: { gte: threeSixtyFiveDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.professor.findMany({
      where: { userId, createdAt: { gte: threeSixtyFiveDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.document.findMany({
      where: { userId, createdAt: { gte: threeSixtyFiveDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const allRecords = [...appRecords, ...profRecords, ...docRecords];
  const dayCounts = new Map<string, number>();
  for (const r of allRecords) {
    const day = r.createdAt.toISOString().slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  }

  const timeline: Array<{ date: string; count: number }> = [];
  const start = new Date(threeSixtyFiveDaysAgo);
  const end = new Date();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    timeline.push({ date: key, count: dayCounts.get(key) || 0 });
  }
  return timeline;
}

export default router;
