/**
 * matchScore.ts — Profile-Based Country Match Scoring Engine
 *
 * Pure function. No API calls. No side effects.
 * Computes a personalised match score (0–100) for a country based on the
 * user's academic profile, budget, research focus, and life priorities.
 *
 * Scoring Dimensions (total = 100 pts):
 *  1. Funding Accessibility  — 25 pts
 *  2. Admission Chance       — 20 pts
 *  3. Research Fit           — 15 pts
 *  4. PR Pathway             — 20 pts
 *  5. IELTS Readiness        — 10 pts
 *  6. Family / Cost Fit      — 10 pts
 */

import { UserProfile } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MatchBreakdown {
  funding: number;      // /25
  admission: number;    // /20
  research: number;     // /15
  prPathway: number;    // /20
  ielts: number;        // /10
  family: number;       // /10
}

export interface BdWarning {
  type: "error" | "warning" | "info";
  title: string;
  body: string;
}

export interface MatchResult {
  score: number;            // 0–100
  breakdown: MatchBreakdown;
  totalMax: 100;
  reasons: string[];        // positive reasons
  cautions: string[];       // concerns / gaps
  bdWarnings: BdWarning[];  // BD-specific hard rules
  profileComplete: boolean; // false if too little data to score meaningfully
}

// ─── Country minimum IELTS requirements (BD reality data) ────────────────────

const COUNTRY_IELTS_MIN: Record<string, number> = {
  AU: 6.5, CA: 6.0, DE: 6.0, US: 6.5, NL: 6.5, SE: 6.5,
  FI: 6.0, NO: 6.0, DK: 6.5, CH: 6.5, IE: 6.0, JP: 5.5,
  KR: 5.5, CN: 5.5, AE: 5.5, SG: 6.5, NZ: 6.0,
};

// ─── Country average living cost in USD/month (for budget scoring) ────────────

const COUNTRY_LIVING_COST_USD: Record<string, number> = {
  AU: 2100, CA: 1900, DE: 1400, US: 2500, NL: 1700, SE: 1600,
  FI: 1400, NO: 2000, DK: 1900, CH: 2800, IE: 1900, JP: 1400,
  KR: 1200, CN: 900,  AE: 1800, SG: 2200, NZ: 1800,
};

// ─── Country research keywords map ───────────────────────────────────────────

const COUNTRY_RESEARCH_STRENGTH: Record<string, string[]> = {
  US:  ["NLP", "LLM", "deep learning", "reinforcement learning", "computer vision", "ML theory", "robotics", "AI safety", "healthcare AI", "quantum ML"],
  CA:  ["deep learning", "NLP", "reinforcement learning", "computer vision", "responsible AI", "ML for healthcare"],
  DE:  ["industrial AI", "robotics", "autonomous driving", "explainable AI", "probabilistic models", "federated learning"],
  CH:  ["ML theory", "optimization", "computer vision", "privacy-preserving ML", "NLP", "robotics"],
  NL:  ["deep learning", "computer vision", "reinforcement learning", "trustworthy AI", "explainable AI", "ML for healthcare"],
  SE:  ["autonomous systems", "robotics", "ML for telecom", "computer vision", "industrial AI"],
  FI:  ["probabilistic ML", "bayesian methods", "healthcare AI", "NLP", "gaming AI"],
  NO:  ["AI for energy", "maritime AI", "climate AI", "healthcare AI"],
  DK:  ["healthcare AI", "biotech AI", "generative models", "ML for drug discovery"],
  AU:  ["computer vision", "healthcare AI", "agricultural AI", "NLP", "trustworthy AI"],
  IE:  ["NLP", "data analytics", "healthcare AI", "edge AI"],
  JP:  ["robotics", "human-robot interaction", "computer vision", "healthcare AI", "manufacturing AI"],
  KR:  ["computer vision", "NLP", "generative AI", "semiconductor AI", "mobile AI"],
  CN:  ["computer vision", "LLM", "generative AI", "autonomous vehicles", "e-commerce AI"],
  AE:  ["NLP", "computer vision", "ML", "deep learning"],
  SG:  ["AI", "ML", "NLP", "computer vision"],
};

// ─── BD-specific hard warnings ────────────────────────────────────────────────

const BD_WARNINGS: Record<string, BdWarning[]> = {
  US: [
    {
      type: "error",
      title: "Green Card: Not viable for Bangladesh nationals",
      body: "EB-2/EB-3 Green Card has a 70–90 year backlog for Bangladesh nationals. USA is NOT a practical PR pathway. Factor this into your long-term plan.",
    },
    {
      type: "warning",
      title: "F-1 Visa: ~15% rejection rate for BD nationals",
      body: "A TA/RA funding letter dramatically reduces rejection risk. Apply only with confirmed funding.",
    },
  ],
  DE: [
    {
      type: "error",
      title: "APS Certificate: MANDATORY for Bangladesh nationals",
      body: "Academic Evaluation Centre (APS) certificate required before student visa. Processing time: 6–8 weeks at German Embassy Baridhara, Dhaka. Start immediately.",
    },
    {
      type: "warning",
      title: "Student visa appointment: 2.5+ year wait in Dhaka",
      body: "Book your visa appointment as early as possible. Consider applying from a third country if timeline is critical.",
    },
  ],
  AE: [
    {
      type: "info",
      title: "No traditional PR in UAE",
      body: "UAE does not offer permanent residency. Golden Visa (10yr renewable) ≠ PR. If PR is a priority, UAE should be a stepping-stone destination only.",
    },
  ],
  CN: [
    {
      type: "info",
      title: "No realistic PR pathway",
      body: "China has no practical immigration path to permanent residency. Best treated as a research training destination before relocating to EU/Canada.",
    },
  ],
  JP: [
    {
      type: "warning",
      title: "JLPT N2 required for long-term PR",
      body: "Permanent residency (5+ years) practically requires Japanese Language Proficiency Test N2. Factor language investment into your plan.",
    },
  ],
  KR: [
    {
      type: "warning",
      title: "PR requires TOPIK Level 4",
      body: "F-5 permanent residency after 5 years requires TOPIK Level 4 Korean proficiency. Long work hours and hierarchical culture — research carefully.",
    },
  ],
};

// ─── Main scoring function ────────────────────────────────────────────────────

export function computeCountryMatchScore(
  profile: Partial<UserProfile>,
  country: {
    countryCode: string;
    overallScore: number;
    summary?: {
      scholarshipScore?: number;
      admissionScore?: number;
      prScore?: number;
      jobMarketScore?: number;
      familyScore?: number;
      averageLivingCost?: number;
      averageLivingCostCurrency?: string;
    };
  }
): MatchResult {
  const code = country.countryCode?.toUpperCase();
  const sum = country.summary || {};

  const reasons: string[] = [];
  const cautions: string[] = [];
  const bdWarnings: BdWarning[] = BD_WARNINGS[code] || [];

  // Check if we have enough profile data to score meaningfully
  const profileComplete = !!(profile.cgpa || profile.ieltsScore || (profile.researchInterests?.length));

  // ── 1. FUNDING ACCESSIBILITY (25 pts) ────────────────────────────────────
  let funding = 0;
  const scholarshipScore = sum.scholarshipScore ?? 65;
  // Base: scholarship availability (0–15 pts)
  funding += Math.round((scholarshipScore / 100) * 15);

  // Budget vs living cost (0–10 pts)
  const livingCostUSD = COUNTRY_LIVING_COST_USD[code] ?? 1500;
  const budgetUSD = profile.monthlyBudgetUSD ?? 0;
  if (budgetUSD === 0) {
    // No budget set — use scholarship score as proxy
    funding += Math.round((scholarshipScore / 100) * 10);
  } else if (budgetUSD >= livingCostUSD) {
    funding += 10;
    reasons.push(`Your budget (${budgetUSD} USD/mo) covers living costs`);
  } else if (budgetUSD >= livingCostUSD * 0.7) {
    funding += 6;
    cautions.push(`Budget gap: ~${livingCostUSD - budgetUSD} USD/mo short — scholarship essential`);
  } else {
    funding += 2;
    cautions.push(`Significant funding gap: ${livingCostUSD - budgetUSD} USD/mo — only apply with full scholarship`);
  }
  funding = Math.min(25, funding);

  // ── 2. ADMISSION CHANCE (20 pts) ─────────────────────────────────────────
  let admission = 0;
  const admissionScore = sum.admissionScore ?? 65;
  // Base from country's admission ease (0–12 pts)
  admission += Math.round((admissionScore / 100) * 12);

  // CGPA bonus/penalty (0–8 pts)
  const cgpa = profile.cgpa ?? 0;
  if (cgpa === 0) {
    admission += 4; // neutral — no data
  } else if (cgpa >= 3.7) {
    admission += 8;
    reasons.push("CGPA 3.7+ opens top-tier programs");
  } else if (cgpa >= 3.3) {
    admission += 6;
    reasons.push("CGPA 3.3+ is competitive for most programs");
  } else if (cgpa >= 3.0) {
    admission += 4;
    cautions.push("CGPA 3.0–3.3: apply to match/safety tiers; strong SOP essential");
  } else {
    admission += 1;
    cautions.push("CGPA below 3.0: very limited options; consider post-grad work experience first");
  }
  admission = Math.min(20, admission);

  // ── 3. RESEARCH FIT (15 pts) ─────────────────────────────────────────────
  let research = 0;
  const userInterests = (profile.researchInterests ?? []).map(i => i.toLowerCase());
  const countryStrengths = (COUNTRY_RESEARCH_STRENGTH[code] ?? []).map(s => s.toLowerCase());

  if (userInterests.length === 0) {
    research = 8; // neutral default
  } else {
    const matches = userInterests.filter(interest =>
      countryStrengths.some(strength => strength.includes(interest) || interest.includes(strength))
    );
    const matchRatio = matches.length / userInterests.length;
    research = Math.round(matchRatio * 15);
    if (matches.length > 0) {
      reasons.push(`Research match: ${matches.slice(0, 2).map(m => m.toUpperCase()).join(", ")} active in this country`);
    } else {
      cautions.push("Your research interests have limited representation in this country's labs");
    }
  }
  research = Math.min(15, research);

  // ── 4. PR PATHWAY (20 pts) ───────────────────────────────────────────────
  let prPathway = 0;
  const prScore = sum.prScore ?? 50;
  const prPriority = profile.prPriority ?? 3; // default: high

  // Base PR quality (0–15 pts)
  prPathway += Math.round((prScore / 100) * 15);

  // Multiply by priority weight (0–5 pts)
  const priorityBonus = Math.round(((prPriority - 1) / 4) * 5);
  prPathway += priorityBonus;

  // Hard penalties for known bad-PR destinations when PR is high priority
  if (prPriority >= 3) {
    if (["US", "CN", "AE"].includes(code)) {
      prPathway = Math.max(0, prPathway - 8);
      cautions.push("Limited PR pathway — not recommended if long-term settlement is a priority");
    } else if (prScore >= 75) {
      reasons.push("Strong PR pathway for Bangladesh nationals");
    }
  }
  prPathway = Math.min(20, Math.max(0, prPathway));

  // ── 5. IELTS READINESS (10 pts) ──────────────────────────────────────────
  let ielts = 0;
  const minIelts = COUNTRY_IELTS_MIN[code] ?? 6.5;
  const userIelts = profile.ieltsScore ?? 0;

  if (userIelts === 0) {
    ielts = 5; // neutral — no data
  } else if (userIelts >= minIelts + 0.5) {
    ielts = 10;
    reasons.push(`IELTS ${userIelts} exceeds minimum (${minIelts}) — strong application`);
  } else if (userIelts >= minIelts) {
    ielts = 7;
    reasons.push(`IELTS ${userIelts} meets minimum requirement (${minIelts})`);
  } else if (userIelts >= minIelts - 0.5) {
    ielts = 3;
    cautions.push(`IELTS ${userIelts} is slightly below requirement (${minIelts}) — retake recommended`);
  } else {
    ielts = 0;
    cautions.push(`IELTS ${userIelts} well below requirement (${minIelts}) — significant barrier`);
  }
  ielts = Math.min(10, ielts);

  // ── 6. FAMILY / COST FIT (10 pts) ────────────────────────────────────────
  let family = 0;
  const familyScore = sum.familyScore ?? 65;
  const wantsFamily = profile.familyRelocation ?? false;

  if (!wantsFamily) {
    // No family plans — base on general cost fit
    const costRatio = budgetUSD > 0 ? Math.min(1, budgetUSD / livingCostUSD) : 0.6;
    family = Math.round(costRatio * 7) + 3;
  } else {
    // Has family plans — weight familyScore heavily
    family = Math.round((familyScore / 100) * 10);
    if (familyScore >= 75) {
      reasons.push("Spouse work rights + family settlement infrastructure strong");
    } else if (familyScore < 50) {
      cautions.push("Family settlement infrastructure limited in this destination");
    }
  }
  family = Math.min(10, Math.max(0, family));

  // ── Total ─────────────────────────────────────────────────────────────────
  const score = Math.min(100, Math.round(
    funding + admission + research + prPathway + ielts + family
  ));

  return {
    score,
    breakdown: { funding, admission, research, prPathway, ielts, family },
    totalMax: 100,
    reasons,
    cautions,
    bdWarnings,
    profileComplete,
  };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

export function matchScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 55) return "text-amber-400";
  return "text-red-400";
}

export function matchScoreBg(score: number): string {
  if (score >= 75) return "bg-emerald-400/10 border-emerald-400/30";
  if (score >= 55) return "bg-amber-400/10 border-amber-400/30";
  return "bg-red-400/10 border-red-400/30";
}

export function matchScoreLabel(score: number): string {
  if (score >= 80) return "Excellent Match";
  if (score >= 65) return "Good Match";
  if (score >= 50) return "Moderate Match";
  if (score >= 35) return "Weak Match";
  return "Poor Match";
}
