// =====================================================================
// visa-rules.json
// =====================================================================

export interface StudentVisa {
  visaName: string;
  processingTime: string;
  applicationFee: number;
  applicationFeeCurrency: string;
  financialRequirement?: string;
  englishRequirement?: string;
  requiresBiometrics?: boolean;
  requiresMedical?: boolean;
  spousePermitIncluded?: string;
  workRightsDuringStudy?: string;
  difficultyLevel?: string;
  rejectionRiskBangladesh?: string;
  tips?: string;
  onlineApplication?: boolean;
  officialUrl?: string;
  apsRequired?: boolean;
  apsNote?: string;
}

export interface PostStudyVisa {
  visaName: string;
  duration: string;
  eligiblePrograms?: string;
  minimumStudyDuration?: string;
  applicationWindow?: string;
  spouseEligibility?: string;
  pathwayToPR?: boolean;
  restrictedFields?: string;
  renewalPossible?: boolean;
  officialUrl?: string;
}

export interface SkillWorkerVisa {
  visaName?: string;
  salaryThreshold?: string | number;
  currency?: string;
  processingTime?: string;
  duration?: string;
  renewalPossible?: boolean;
  pathwayToPR?: boolean;
  [key: string]: unknown;
}

export interface VisaRules {
  country: string;
  countryCode: string;
  studentVisa: StudentVisa;
  postStudyVisa?: PostStudyVisa;
  workPermit?: SkillWorkerVisa;
  skilledWorkerVisa?: SkillWorkerVisa;
  prVisa?: Record<string, unknown>;
  bdNationalSpecificWarnings?: string[];
  overallVisaScore?: number;
  confidenceScore?: number;
  evidenceSummary?: string;
}

export interface VisaRulesFile {
  visaRules: VisaRules[];
}
