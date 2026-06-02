// =====================================================================
// ranking-factors.json
// =====================================================================

export interface PhaseScore {
  score: number;
  rank: number;
  keyFactors: string[];
  keyRisks: string[];
}

export interface RankingPhaseScores {
  studyPhase: PhaseScore;
  postStudyWork: PhaseScore;
  prAcquisition: PhaseScore;
  citizenship: PhaseScore;
  familySettlement: PhaseScore;
  longTerm20to30Years: PhaseScore;
}

export interface RankingDimensionScores {
  admissionFeasibility: number;
  scholarshipFunding: number;
  researchQuality: number;
  jobMarketStrength: number;
  salaryPotential: number;
  prPathway: number;
  citizenshipAccess: number;
  familyRights: number;
  costOfLiving: number;
  housingAvailability: number;
  languageBarrier: number;
  stabilityScore: number;
  aiEcosystemScore: number;
  futureProofScore: number;
}

export interface BangladeshiSpecificFactors {
  communityPresence: string;
  halalFoodAccess: string;
  islamicFacilities: string;
  dtaaWithBangladesh: boolean;
  successProbability: string;
}

export interface CountryRanking {
  country: string;
  countryCode: string;
  overallBalancedScore: number;
  overallRank: number;
  confidenceScore: number;
  evidenceSummary: string;
  phaseScores: RankingPhaseScores;
  dimensionScores: RankingDimensionScores;
  bangladeshiSpecificFactors?: BangladeshiSpecificFactors;
  strategicNote?: string;
  notRecommendedFor?: string;
}

export interface RankingFactorsFile {
  countryRankings: CountryRanking[];
}
