// =====================================================================
// scholarships.json — NOTE: Multiple entries per country (different scholarships)
// =====================================================================

export interface ScholarshipsMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
  scholarshipPhilosophy?: string;
  bangladeshSpecificNote?: string;
  applicationTimeline?: object;
}

export type FundingType =
  | 'FULL_FUNDING'
  | 'PARTIAL_FUNDING'
  | 'TUITION_ONLY'
  | 'STIPEND_ONLY'
  | 'TRAVEL_GRANT';

export type CompetitionLevel =
  | 'VERY_LOW'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'VERY_HIGH'
  | 'EXTREMELY_HIGH';

export interface ScholarshipStipend {
  amount: number;
  currency: string;
  usd?: number;
  note?: string;
}

export interface ScholarshipFunding {
  tuitionCoverage?: string;
  monthlyStipend?: ScholarshipStipend;
  healthInsurance?: string;
  travelAllowance?: string;
  familyAllowance?: string;
  researchAllowance?: string;
  totalAnnualValueUSD?: string;
}

export interface ScholarshipEligibility {
  gpa?: string;
  ageLimit?: string;
  languageRequirement?: string;
  researchExperience?: string;
  publicationRequired?: boolean;
  [key: string]: unknown;
}

export interface Scholarship {
  id?: string;
  scholarshipName: string;
  provider?: string;
  country: string;
  countryCode: string;
  type?: FundingType;
  fundingType?: string;
  degreeLevel?: string[];
  degreeLevels?: string[];
  fieldsCovered?: string[];
  bangladeshEligible?: boolean;
  eligibilityForBD?: boolean;
  annualAwards?: string;
  competitionLevel: CompetitionLevel | string;
  successRateEstimate?: string;
  funding?: ScholarshipFunding;
  coverageDetails?: { tuition?: boolean; stipend?: boolean; travel?: boolean };
  eligibility?: ScholarshipEligibility;
  applicationDeadline?: string;
  bondRequired?: boolean;
  websiteUrl?: string;
  description?: string;
  renewability?: string;
  probabilityAssessment?: string;
  confidenceScore?: number;
  recommendation?: string;
}

export interface ScholarshipsFile {
  scholarships: Scholarship[];
  metadata?: ScholarshipsMetadata;
}
