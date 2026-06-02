// =====================================================================
// funding-opportunities.json
// =====================================================================

export interface FundingOpportunitiesMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
}

export interface GovernmentScholarship {
  name: string;
  amount: string;
  eligibility: string;
  applicationDeadline?: string;
  competitiveness?: string;
  bangladeshiSuccess?: string;
  bangladeshiEligible?: boolean;
}

export interface UniversityFundingPackage {
  phd: string;
  msc: string;
}

export interface UniversityFunding {
  availability: string;
  typicalPackage: UniversityFundingPackage;
  fundingSources: string[];
  topFundedUniversities: string[];
  fundingNote: string;
}

export interface ExternalFellowship {
  name: string;
  amount: string;
  eligibility: string;
  competitiveness: string;
  applicationWindow: string;
}

export interface SelfFundingCost {
  mscTotal: string;
  phdTotal: string;
}

export interface FundingOpportunity {
  country: string;
  countryCode: string;
  overallFundingScore: number;
  fundingAvailability: string;
  mscFundingChance: number;
  phdFundingChance: number;
  governmentScholarships: GovernmentScholarship[];
  universityFunding: UniversityFunding;
  externalFellowships: ExternalFellowship[];
  livingStipendAdequacy: string;
  averageMonthlyStipend: string;
  averageMonthlyCost: string;
  selfFundingCost: SelfFundingCost;
  workWhileStudying: string;
  realisticStrategy: string;
  confidenceScore: number;
}

export interface FundingOpportunitiesFile {
  fundingOpportunities: FundingOpportunity[];
  metadata?: FundingOpportunitiesMetadata;
}
