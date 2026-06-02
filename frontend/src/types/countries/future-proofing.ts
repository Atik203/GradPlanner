// =====================================================================
// future-proofing.json
// =====================================================================

export interface FutureProofingMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
}

export interface ScoreWithDetail {
  score: number;
  [key: string]: unknown;
}

export interface FutureProofing {
  country: string;
  countryCode: string;
  futureProofScore?: number;
  overallFutureScore?: number;
  confidenceScore: number;
  agingPopulationNeed?: ScoreWithDetail & {
    medianAge2026?: number;
    projectedMedianAge2045?: number;
    laborShortageByField?: string;
    immigrationDependency?: string;
  };
  aiInvestment?: ScoreWithDetail & {
    annualPublicInvestment?: string;
    privateInvestment?: string;
    trend?: string;
    keyInitiatives?: string[];
  };
  demographicTrend?: ScoreWithDetail & {
    populationGrowth?: string;
    youthPopulation?: string;
    workforceChallenge?: string;
  };
  longTermImmigrationNeed?: ScoreWithDetail & {
    annualImmigrationTarget?: string;
    stemDemand?: string;
    policyStability?: string;
  };
  energySecurity?: ScoreWithDetail;
  technologyGrowth?: ScoreWithDetail & {
    sectors?: string[];
    rankGlobally?: string;
    weaknesses?: string;
  };
  globalCompetitiveness?: ScoreWithDetail & {
    worldEconomicForumRank?: number;
    innovationIndex?: number;
    tradeOpenness?: string;
    currencyStability?: string;
  };
  laborShortageOutlook?: ScoreWithDetail & {
    shortfallProjection2030?: string;
    techSpecific?: string;
    benefit?: string;
  };
  risks?: Record<string, string>;
  forecast2035?: string;
  forecast2045?: string;
  overallVerdict?: string;
}

export interface FutureProofingFile {
  futureProofing: FutureProofing[];
  metadata?: FutureProofingMetadata;
}
