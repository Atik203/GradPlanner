// =====================================================================
// pr-pathways.json
// =====================================================================

export interface PrPathwaysMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
}

export interface PrPathway {
  pathwayName: string;
  difficulty: string;
  estimatedYears: number;
  description: string;
  languageRequired?: string;
  jobRequired: boolean;
  minimumWorkExperience?: string;
  pointsBased?: boolean;
  currentCRSRange?: string;
  familyEligible?: boolean;
  citizenshipEligible?: boolean;
  processingTime?: string;
  costEstimate?: number;
  costCurrency?: string;
  successRateForProfile?: string;
  strengths?: string[];
  weaknesses?: string[];
  strategicAdvice?: string;
}

export interface PrPathways {
  country: string;
  countryCode: string;
  pathways: PrPathway[];
  overallPRScore?: number;
  overallPRDifficulty?: string;
  bdNationalConsiderations?: string;
  recommendedPathway?: string;
  criticalWarnings?: string[];
}

export interface PrPathwaysFile {
  prPathways: PrPathways[];
  metadata?: PrPathwaysMetadata;
}
