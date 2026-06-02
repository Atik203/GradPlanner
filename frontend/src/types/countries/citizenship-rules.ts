// =====================================================================
// citizenship-rules.json
// =====================================================================

export interface CitizenshipRules {
  country: string;
  countryCode: string;
  citizenshipType: string;
  minimumResidencyYears: number;
  residencyCalculation: string;
  prRequired: boolean;
  prYearsBeforeApplying: number;
  languageRequirement: string;
  languageTest: string;
  civicsTest: boolean;
  civicsTestDescription?: string;
  ageRequirement: string;
  criminalRecordRequirement: string;
  incomeRequirement?: string;
  dualCitizenshipAllowed: boolean;
  bangladeshPositionOnDual?: string;
  renunciationRequired: boolean;
  childrenBornAbroad?: string;
  childrenBornInCountry?: string;
  applicationFee: number;
  applicationFeeCurrency: string;
  processingTime: string;
  citizenshipScore: number;
  difficulty: string;
  confidenceScore: number;
  keyNotes: string;
  passportStrength?: string;
  futureOutlook?: string;
}

export interface CitizenshipRulesFile {
  citizenshipRules: CitizenshipRules[];
}
