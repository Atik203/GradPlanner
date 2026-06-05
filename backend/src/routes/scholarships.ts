import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const router: Router = Router();

// Standard exchange rates relative to BDT
const BDT_RATES: Record<string, number> = {
  USD: 118, EUR: 128, CAD: 87, AUD: 78, GBP: 150, SEK: 11.2, NOK: 11.0, DKK: 17.2,
  CHF: 130, NZD: 72, JPY: 0.76, KRW: 0.086, SGD: 88, CNY: 16.3, AED: 32.1,
};

function convertToUSD(amount: number, currency: string): number {
  const rateInBDT = BDT_RATES[currency.toUpperCase()] || 1;
  const usdRateInBDT = BDT_RATES["USD"] || 118;
  return (amount * rateInBDT) / usdRateInBDT;
}

// ─── PARSING HELPERS ──────────────────────────────────────────────────────────

/**
 * Parses minimum and competitive CGPA from text like "Minimum 3.0/4.0; competitive 3.5+"
 */
function parseCgpaRequirement(gpaText?: string): { minGpa: number; competitiveGpa: number } {
  if (!gpaText) return { minGpa: 3.0, competitiveGpa: 3.5 };
  
  let minGpa = 3.0;
  let competitiveGpa = 3.5;

  // Find all float patterns
  const allNumbers = gpaText.match(/(\d\.\d+)/g);
  if (allNumbers && allNumbers.length > 0) {
    minGpa = parseFloat(allNumbers[0]);
    if (allNumbers.length > 1) {
      competitiveGpa = parseFloat(allNumbers[1]);
    } else {
      competitiveGpa = Math.min(4.0, minGpa + 0.3);
    }
  }

  // Refine if specific words suggest competitive bounds
  const compMatch = gpaText.match(/competitive\s*(?:applicants)?\s*(\d\.\d+)/i) || gpaText.match(/(\d\.\d+)\+?\s*competitive/i);
  if (compMatch) {
    competitiveGpa = parseFloat(compMatch[1]);
  }

  // Clamp limits to standard scale
  minGpa = Math.max(2.0, Math.min(4.0, minGpa));
  competitiveGpa = Math.max(minGpa, Math.min(4.0, competitiveGpa));

  return { minGpa, competitiveGpa };
}

/**
 * Parses minimum IELTS requirements from text description
 */
function parseIeltsRequirement(langText?: string): number {
  if (!langText) return 0;
  
  const lower = langText.toLowerCase();
  
  const ieltsMatch = langText.match(/ielts\s*(\d\.\d|\d)/i);
  if (ieltsMatch) {
    return parseFloat(ieltsMatch[1]);
  }
  
  const toeflMatch = langText.match(/toefl\s*(\d+)/i);
  if (toeflMatch) {
    const score = parseInt(toeflMatch[1], 10);
    if (score >= 100) return 7.5;
    if (score >= 90) return 7.0;
    if (score >= 80) return 6.5;
    if (score >= 70) return 6.0;
    return 5.5;
  }

  if (lower.includes("b2")) return 6.0;
  if (lower.includes("c1")) return 7.0;

  if (lower.includes("english") || lower.includes("ielts")) {
    return 6.5; // standard academic default
  }

  return 0;
}

/**
 * Parses work experience requirements (years and mandatory status)
 */
function parseWorkExperienceRequirement(workText?: string): { requiredYears: number; mandatory: boolean } {
  if (!workText) return { requiredYears: 0, mandatory: false };
  const lower = workText.toLowerCase();
  
  const isMandatory = lower.includes("required") || lower.includes("mandatory") || lower.includes("must have");
  
  const yearMatch = workText.match(/(\d+)\+?\s*years?/i) || workText.match(/(\d+)\s*years?/i);
  if (yearMatch) {
    return { requiredYears: parseInt(yearMatch[1], 10), mandatory: isMandatory };
  }

  if (lower.includes("3,000 hours") || lower.includes("3000 hours")) {
    return { requiredYears: 2, mandatory: isMandatory };
  }

  if (isMandatory) {
    return { requiredYears: 2, mandatory: true };
  }

  return { requiredYears: 0, mandatory: false };
}

/**
 * Parses annual tuition range to compute a reasonable average USD cost
 */
function parseTuitionCostUSD(tuitionObj: any, degreeLevel: string): number {
  if (!tuitionObj) return 15000;
  
  const isPhd = degreeLevel.toUpperCase() === "PHD";
  const tuitionField = isPhd ? tuitionObj.phd?.usd : tuitionObj.mscs?.usd;
  
  if (!tuitionField) {
    return isPhd ? 5000 : 15000;
  }
  
  if (typeof tuitionField === "number") return tuitionField;
  
  const rangeStr = String(tuitionField);
  const matchRange = rangeStr.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (matchRange) {
    const min = parseFloat(matchRange[1]);
    const max = parseFloat(matchRange[2]);
    return (min + max) / 2;
  }
  
  const matchSingle = rangeStr.match(/(\d+)/);
  if (matchSingle) {
    return parseFloat(matchSingle[1]);
  }
  
  return isPhd ? 5000 : 15000;
}

// ─── ROUTE IMPLEMENTATION ─────────────────────────────────────────────────────

// GET /api/v1/scholarships/checker
router.get("/checker", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // 1. Fetch User Profile
    let profile = null;
    if (userId) {
      profile = await prisma.userProfile.findUnique({
        where: { userId },
      });
    }

    // 2. Parse Query Parameters with Fallback to Profile Defaults
    const targetDegreeInput = (req.query.degreeLevel as string) || (profile?.targetDegree?.toLowerCase().includes("phd") ? "PhD" : "MSc");
    const cgpaInput = req.query.cgpa ? parseFloat(req.query.cgpa as string) : (profile?.cgpa ?? 3.5);
    const ieltsInput = req.query.ielts ? parseFloat(req.query.ielts as string) : (profile?.ieltsScore ?? 6.5);
    const workExpInput = req.query.workExp ? parseInt(req.query.workExp as string, 10) : 0;
    const publicationsInput = req.query.publications ? parseInt(req.query.publications as string, 10) : 0;

    // 3. Fetch Country Intelligence data containing scholarships & living costs
    const countries = await prisma.countryIntelligence.findMany({
      select: {
        country: true,
        countryCode: true,
        scholarships: true,
        livingCosts: true,
      },
    });

    const results: any[] = [];

    // Loop through each country and run calculations on all of its scholarships
    for (const country of countries) {
      const scholarships = (country.scholarships || []) as any[];
      const livingCostsObj = country.livingCosts as any;
      
      // Calculate average living costs
      const monthlyLivingUSD = livingCostsObj?.studentPhase?.totalMonthlyEstimate?.sharedAccommodation?.usd || 1200;
      const annualLivingUSD = monthlyLivingUSD * 12;

      // Calculate average tuition costs for user's level
      const tuitionCostUSD = parseTuitionCostUSD(livingCostsObj?.studentPhase?.annualTuitionRange, targetDegreeInput);

      for (const s of scholarships) {
        const degreeLevels = (s.degreeLevel || s.degreeLevels || []).map((d: string) => d.toUpperCase());
        const targetDegreeUpper = targetDegreeInput.toUpperCase();
        
        // 1. Degree Level constraint (Must overlap)
        const degreeMatch = degreeLevels.some((d: string) => d.includes(targetDegreeUpper) || targetDegreeUpper.includes(d));

        let totalScore = 0;
        const gaps: string[] = [];
        const strengths: string[] = [];

        // Check level match (20 points)
        if (degreeMatch) {
          totalScore += 20;
        } else {
          gaps.push(`Target degree level ${targetDegreeInput} is not covered by this scholarship.`);
        }

        // 2. CGPA Match (30 points)
        const { minGpa, competitiveGpa } = parseCgpaRequirement(s.eligibility?.gpa);
        if (cgpaInput >= competitiveGpa) {
          totalScore += 30;
          strengths.push(`Your CGPA of ${cgpaInput.toFixed(2)} exceeds the highly competitive threshold of ${competitiveGpa.toFixed(2)}.`);
        } else if (cgpaInput >= minGpa) {
          const range = competitiveGpa - minGpa;
          const userDiff = cgpaInput - minGpa;
          const points = 15 + (range > 0 ? (userDiff / range) * 15 : 15);
          totalScore += points;
          strengths.push(`Your CGPA of ${cgpaInput.toFixed(2)} meets the minimum required CGPA of ${minGpa.toFixed(2)}.`);
        } else {
          gaps.push(`Minimum CGPA requirement is ${minGpa.toFixed(2)} (your current CGPA is ${cgpaInput.toFixed(2)}).`);
        }

        // 3. IELTS Match (30 points)
        const reqIelts = parseIeltsRequirement(s.eligibility?.languageRequirement);
        if (reqIelts === 0 || ieltsInput >= reqIelts) {
          totalScore += 30;
          if (reqIelts > 0) {
            strengths.push(`Your IELTS band score of ${ieltsInput.toFixed(1)} meets the required ${reqIelts.toFixed(1)}.`);
          }
        } else {
          gaps.push(`Minimum IELTS score required is ${reqIelts.toFixed(1)} (your current score is ${ieltsInput.toFixed(1)}).`);
        }

        // 4. Work Experience Match (10 points)
        const { requiredYears, mandatory } = parseWorkExperienceRequirement(s.eligibility?.workExperience);
        if (workExpInput >= requiredYears) {
          totalScore += 10;
          if (requiredYears > 0) {
            strengths.push(`You satisfy the work experience requirement (${workExpInput} years vs ${requiredYears} required).`);
          }
        } else {
          if (mandatory) {
            gaps.push(`Requires at least ${requiredYears} years of work experience (you entered ${workExpInput} years).`);
          } else {
            totalScore += 5;
            gaps.push(`Prefers ${requiredYears} years of work experience (you entered ${workExpInput} years).`);
          }
        }

        // 5. Research/Publications Match (10 points)
        if (targetDegreeInput === "PhD") {
          if (publicationsInput >= 1) {
            totalScore += 10;
            strengths.push(`You have active publications, giving you a strong competitive edge for this PhD program.`);
          } else {
            gaps.push(`Publications are highly recommended to secure competitive PhD funding.`);
          }
        } else {
          totalScore += 10; // MSc gets default full marks
          if (publicationsInput >= 1) {
            strengths.push(`Your research publication makes your master's application stand out.`);
          }
        }

        // Force final match percentage to 0 if degree levels are completely mismatched
        const matchPercent = degreeMatch ? Math.round(totalScore) : 0;

        // ─── FUNDING GAP CALCULATIONS ───────────────────────────────────────
        
        const tuitionCoverageText = s.funding?.tuitionCoverage || "";
        const isFullyFundedTuition = 
          s.type === "FULL_FUNDING" || 
          tuitionCoverageText.toLowerCase().includes("full") || 
          tuitionCoverageText.toLowerCase().includes("100%");

        const tuitionCoverageUSD = isFullyFundedTuition ? tuitionCostUSD : 0;

        // Parse stipend coverage
        let monthlyStipendUSD = 0;
        const monthlyStipend = s.funding?.monthlyStipend;
        if (monthlyStipend?.usd && typeof monthlyStipend.usd === "number") {
          monthlyStipendUSD = monthlyStipend.usd;
        } else if (monthlyStipend?.amount && typeof monthlyStipend.amount === "number") {
          monthlyStipendUSD = convertToUSD(monthlyStipend.amount, monthlyStipend.currency || "USD");
        }

        let annualStipendUSD = monthlyStipendUSD * 12;

        // Fallback check on annual value if stipend isn't specified
        if (annualStipendUSD === 0 && s.funding?.totalAnnualValueUSD) {
          const valueStr = String(s.funding.totalAnnualValueUSD);
          const matchVal = valueStr.match(/(\d+)/);
          if (matchVal) {
            annualStipendUSD = parseFloat(matchVal[1]);
          }
        }

        const totalAnnualCostUSD = tuitionCostUSD + annualLivingUSD;
        const totalAnnualCoverageUSD = tuitionCoverageUSD + annualStipendUSD;
        
        const netAnnualGapUSD = Math.max(0, totalAnnualCostUSD - totalAnnualCoverageUSD);
        const netAnnualGapBDT = netAnnualGapUSD * (BDT_RATES["USD"] || 118);

        results.push({
          scholarship: {
            ...s,
            parsedMinGpa: minGpa,
            parsedReqIelts: reqIelts,
          },
          matchPercent,
          isEligible: degreeMatch && cgpaInput >= minGpa && ieltsInput >= reqIelts && (workExpInput >= requiredYears || !mandatory),
          gaps,
          strengths,
          financials: {
            annualTuitionCostUSD: tuitionCostUSD,
            annualLivingCostUSD: annualLivingUSD,
            annualTotalCostUSD: totalAnnualCostUSD,
            annualTuitionCoverageUSD: tuitionCoverageUSD,
            annualStipendCoverageUSD: annualStipendUSD,
            annualTotalCoverageUSD: totalAnnualCoverageUSD,
            netAnnualGapUSD,
            netAnnualGapBDT,
          },
        });
      }
    }

    // Sort results by match percentage descending
    results.sort((a, b) => b.matchPercent - a.matchPercent);

    res.json({
      inputs: {
        degreeLevel: targetDegreeInput,
        cgpa: cgpaInput,
        ielts: ieltsInput,
        workExp: workExpInput,
        publications: publicationsInput,
      },
      results,
    });
  } catch (error) {
    console.error("GET /scholarships/checker error:", error);
    res.status(500).json({ error: "Failed to run scholarship checker" });
  }
});

export default router;
