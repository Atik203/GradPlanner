import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, notFound, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";
import { validateParams } from "../validators/index.js";

const router: Router = Router();

const countryParamSchema = z.object({
  country: z.string().min(1).max(50),
});

router.get(
  "/:country",
  validateParams(countryParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { country } = req.params as { country: string };
      const normalized = country.toLowerCase().trim();

      const aliases: Record<string, string> = {
        "united-states-of-america": "us",
        usa: "us",
        "united-states": "us",
        "united-arab-emirates": "ae",
        uae: "ae",
        "south-korea": "kr",
        korea: "kr",
        "republic-of-korea": "kr",
      };

      const code = aliases[normalized] ?? normalized;

      const ci = await prisma.countryIntelligence.findFirst({
        where: {
          OR: [
            { countryCode: { equals: code, mode: "insensitive" } },
            { country: { equals: code.replace(/-/g, " "), mode: "insensitive" } },
          ],
        },
      });

      if (!ci) {
        return notFound(res, `Pathway data not found for: ${country}`);
      }

      const visa = ci.visa as Record<string, unknown>;
      const prData = ci.prPathways as Record<string, unknown>;
      const timeline = ci.timeline as Record<string, unknown>;
      const risks = ci.risks as Record<string, unknown>;
      const citizenship = ci.citizenship as Record<string, unknown>;

      const visaSv = visa?.studentVisa as Record<string, unknown> | undefined;
      const visaPsw = visa?.postStudyVisa as Record<string, unknown> | undefined;

      const prOverview = prData
        ? {
            overallScore: (prData as Record<string, number>).overallPRScore ?? 0,
            averageYears: (prData as Record<string, number>).averageYearsToAcquire ?? 0,
            confidenceScore: (prData as Record<string, number>).confidenceScore ?? 0,
            keyRisks: (prData?.keyRisks as string[]) ?? [],
            keyAdvantages: (prData?.keyAdvantages as string[]) ?? [],
          }
        : null;

      const prPathwaysList = (prData?.pathways as Record<string, unknown>[]) ?? [];

      const timelineGlobal = timeline?.globalTimeline as Record<string, unknown> | undefined;
      const countryTimeline = (timeline?.countryTimelines as Record<string, unknown>[])?.find(
        (t) =>
          String(t.countryCode).toLowerCase() === ci.countryCode.toLowerCase(),
      ) as Record<string, unknown> | undefined;

      const timelinePhases = countryTimeline?.phases as Record<string, unknown> | undefined;
      const sampleTimeline = countryTimeline?.sampleTimeline_MSc as
        | { year: number; event: string }[]
        | undefined;

      const riskData = (risks?.countryRisks as Record<string, unknown>[])?.find(
        (r) =>
          String(r.countryCode).toLowerCase() === ci.countryCode.toLowerCase(),
      ) as Record<string, unknown> | undefined;

      const citizenshipData = (citizenship?.citizenshipRules as Record<string, unknown>[])?.find(
        (c) =>
          String(c.countryCode).toLowerCase() === ci.countryCode.toLowerCase(),
      ) as Record<string, unknown> | undefined;

      const costs: { item: string; amountUSD: number; notes: string }[] = [];
      if (visaSv?.applicationFee != null) {
        const fee = Number(visaSv.applicationFee);
        const currency = String(visaSv.applicationFeeCurrency ?? "USD");
        const usdEstimate = ["CAD", "AUD", "NZD"].includes(currency)
          ? Math.round(fee * 0.75)
          : ["EUR", "GBP"].includes(currency)
            ? Math.round(fee * 1.1)
            : fee;
        costs.push({
          item: `${String(visaSv.visaName ?? "Student Visa")} Application Fee`,
          amountUSD: usdEstimate,
          notes: `${currency} ${fee}`,
        });
      }

      costs.push({
        item: "Biometrics & Medical",
        amountUSD: 150,
        notes: "Estimated, varies by country",
      });

      if (prPathwaysList.length > 0) {
        const prCosts = prPathwaysList
          .filter((p) => p.costEstimate != null)
          .map((p) => ({
            item: `PR Application: ${String(p.pathwayName ?? "Pathway")}`,
            amountUSD: (() => {
              const fee = Number(p.costEstimate);
              const curr = String(p.costCurrency ?? "USD");
              return ["CAD", "AUD", "NZD"].includes(curr)
                ? Math.round(fee * 0.75)
                : ["EUR", "GBP"].includes(curr)
                  ? Math.round(fee * 1.1)
                  : fee;
            })(),
            notes: `${String(p.costCurrency ?? "USD")} ${p.costEstimate}`,
          }));
        costs.push(...prCosts);
      }

      if (citizenshipData?.applicationFee != null) {
        const fee = Number(citizenshipData.applicationFee);
        const curr = String(citizenshipData.applicationFeeCurrency ?? "USD");
        const usdEst = ["CAD", "AUD", "NZD"].includes(curr)
          ? Math.round(fee * 0.75)
          : ["EUR", "GBP"].includes(curr)
            ? Math.round(fee * 1.1)
            : fee;
        costs.push({
          item: "Citizenship Application Fee",
          amountUSD: usdEst,
          notes: `${curr} ${fee}`,
        });
      }

      const lastUpdated = (() => {
        const sources = [visa, prData, timeline, risks, citizenship];
        for (const src of sources) {
          const meta = (src as Record<string, unknown>)?.metadata as
            | Record<string, unknown>
            | undefined;
          if (meta?.lastUpdated) return String(meta.lastUpdated);
        }
        return "2026-06-01";
      })();

      const result = {
        country: ci.country,
        countryCode: ci.countryCode,
        studentVisa: visaSv
          ? {
              visaName: String(visaSv.visaName ?? ""),
              processingTime: String(visaSv.processingTime ?? ""),
              applicationFee: Number(visaSv.applicationFee ?? 0),
              feeCurrency: String(visaSv.applicationFeeCurrency ?? "USD"),
              difficulty: String(visaSv.difficultyLevel ?? ""),
              rejectionRiskBD: String(visaSv.rejectionRiskBangladesh ?? ""),
              tips: String(visaSv.tips ?? ""),
              officialUrl: String(visaSv.officialUrl ?? ""),
              workRights: String(visaSv.workRightsDuringStudy ?? ""),
            }
          : null,
        postStudyWork: visaPsw
          ? {
              visaName: String(visaPsw.visaName ?? ""),
              duration: String(visaPsw.duration ?? ""),
              pathwayToPR: visaPsw.pathwayToPR === true,
              difficulty: String(visaPsw.difficultyLevel ?? ""),
              notes: String(visaPsw.notes ?? ""),
            }
          : null,
        prOverview,
        prPathways: prPathwaysList.map((p) => ({
          pathwayName: String(p.pathwayName ?? ""),
          difficulty: String(p.difficulty ?? ""),
          estimatedYears: Number(p.estimatedYears ?? 0),
          description: String(p.description ?? ""),
          languageRequired: String(p.languageRequired ?? ""),
          jobRequired: p.jobRequired === true,
          costEstimate: p.costEstimate != null ? Number(p.costEstimate) : null,
          costCurrency: p.costCurrency != null ? String(p.costCurrency) : null,
          strengths: (p.strengths as string[]) ?? [],
          weaknesses: (p.weaknesses as string[]) ?? [],
          strategicAdvice: String(p.strategicAdvice ?? ""),
        })),
        timeline: (() => {
          if (!timelinePhases) return null;
          const tp = timelinePhases as Record<string, unknown>;
          const totalJourney = countryTimeline?.totalJourneyYears as
            | Record<string, string>
            | undefined;
          const p1 = tp.phase1_application as Record<string, unknown> | undefined;
          const p2 = tp.phase2_study as Record<string, unknown> | undefined;
          const p3 = tp.phase3_postStudyWork as Record<string, unknown> | undefined;
          const p4 = tp.phase4_pr as Record<string, unknown> | undefined;
          const p5 = tp.phase5_citizenship as Record<string, unknown> | undefined;
          return {
            totalJourneyYears: totalJourney?.mscPathway ?? "",
            phases: [
              {
                id: "application",
                name: "Application & Admission",
                duration: String(p1?.duration ?? ""),
                milestones: (p1?.keyMilestones as string[]) ?? [],
                riskLevel: "Moderate",
              },
              {
                id: "study",
                name: "Study",
                duration: String(p2?.mscDuration ?? ""),
                milestones: (p2?.keyMilestones as string[]) ?? [],
                riskLevel: "Low",
              },
              {
                id: "postStudyWork",
                name: "Post-Study Work",
                duration: String(p3?.duration ?? ""),
                milestones: (p3?.keyMilestones as string[]) ?? [],
                riskLevel: "Moderate",
              },
              {
                id: "pr",
                name: "Permanent Residency",
                duration: String(p4?.processingTime ?? ""),
                milestones: (p4?.eligibilityRequirements as string[]) ?? [],
                riskLevel: String(p4?.riskLevel ?? "High"),
              },
              {
                id: "citizenship",
                name: "Citizenship",
                duration: String(p5?.estimatedYearsFromGraduation ?? ""),
                milestones: [
                  `Residency: ${String(citizenshipData?.minimumResidencyYears ?? "?")} years`,
                  `Language: ${String(citizenshipData?.languageRequirement ?? "?")}`,
                  `Test: ${citizenshipData?.civicsTest ? "Required" : "Not required"}`,
                ],
                riskLevel: "Low",
              },
            ],
            sampleTimeline: sampleTimeline ?? [],
          };
        })(),
        risks: riskData
          ? {
              overallScore: Number(riskData.overallRiskScore ?? 0),
              riskLevel: String(riskData.riskLevel ?? ""),
              warnings: (riskData.keyWarnings as string[]) ?? [],
              dimensions: Object.entries(
                (riskData.risks as Record<string, unknown>) ?? {},
              ).map(([key, val]) => {
                const v = val as Record<string, unknown>;
                return {
                  name: key,
                  score: Number(v.score ?? 0),
                  level: String(v.level ?? ""),
                  summary: String(v.summary ?? ""),
                  trend: String(v.trend ?? "STABLE"),
                };
              }),
            }
          : null,
        citizenship: citizenshipData
          ? {
              yearsRequired: Number(citizenshipData.minimumResidencyYears ?? 0),
              difficulty: String(citizenshipData.difficulty ?? ""),
              dualAllowed: citizenshipData.dualCitizenshipAllowed === true,
              languageRequired: String(citizenshipData.languageRequirement ?? ""),
              passportStrength: String(citizenshipData.passportStrength ?? ""),
            }
          : null,
        costs,
        lastUpdated,
      };

      return ok(res, result);
    } catch (error) {
      logger.error("GET /pathways/:country error", {
        countryCode: req.params.country,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return serverError(res, "Failed to fetch pathway data");
    }
  },
);

export default router;
