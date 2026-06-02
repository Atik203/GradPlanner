// =====================================================================
// countries.json — Master country summary
// =====================================================================

export interface CountriesMetadata {
  version?: string;
  lastUpdated?: string;
  source?: string;
  targetUsers?: string;
  planningYears?: number[];
}

export interface CountrySummary {
  country: string;
  countryCode: string;
  continent: string;
  overallScore: number;
  admissionScore: number;
  scholarshipScore: number;
  researchScore: number;
  jobMarketScore: number;
  salaryScore: number;
  prScore: number;
  citizenshipScore: number;
  familyScore: number;
  housingScore: number;
  stabilityScore: number;
  futureProofScore: number;
  language: string[];
  population: number;
  medianSalary: number;
  medianSalaryCurrency: string;
  averageLivingCost: number;
  averageLivingCostCurrency: string;
  allowsSpouseWork: boolean;
  allowsDependentChildren: boolean;
  citizenshipYears: number;
  confidenceScore: number;
  evidenceSummary: string;
  futureOutlook2035?: string;
  futureOutlook2045?: string;
}

export interface CountriesFile {
  countries: CountrySummary[];
  metadata?: CountriesMetadata;
}
