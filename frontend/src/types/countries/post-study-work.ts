// =====================================================================
// post-study-work.json
// =====================================================================

export interface WorkRestrictions {
  hoursPerWeek: string;
  employerRestrictions: string;
  selfEmploymentAllowed: boolean;
  unemploymentLimit?: string;
  geographicRestrictions?: string;
}

export interface ApplicationProcess {
  timingBeforeGraduation?: string;
  processingTimeWeeks?: number | string;
  cost?: number;
  costCurrency?: string;
  [key: string]: unknown;
}

export interface PostStudyWorkRights {
  country: string;
  countryCode: string;
  visaName: string;
  visaDuration: string;
  score: number;
  scoreConfidence: number;
  scoreEvidence: string;
  eligibilityRequirements: string[];
  workRestrictions: WorkRestrictions;
  applicationProcess?: ApplicationProcess;
  extensionOptions?: string;
  pathwayToPR?: string;
  bdNationalConsiderations?: string;
  criticalWarnings?: string[];
  strategicAdvice?: string;
}

export interface PostStudyWorkFile {
  postStudyWorkRights: PostStudyWorkRights[];
}
