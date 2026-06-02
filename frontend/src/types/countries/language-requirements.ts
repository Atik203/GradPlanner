// =====================================================================
// language-requirements.json
// =====================================================================

export interface IeltsRequirement {
  overall: number;
  minimumBand: number;
  competitive: number;
}

export interface ToeflRequirement {
  ibt: number;
  competitive: number;
}

export interface LanguageTestEntry {
  ielts?: IeltsRequirement;
  toefl?: ToeflRequirement;
  duolingo?: { score: number; note: string };
  pte?: { overall: number };
  exemptions?: string;
  required?: boolean;
  note?: string;
}

export interface AdmissionLanguageRequirements {
  english: LanguageTestEntry;
  german?: LanguageTestEntry;
  french?: LanguageTestEntry;
  dutch?: LanguageTestEntry;
  [language: string]: LanguageTestEntry | undefined;
}

export interface StudyPhaseLanguage {
  mediumOfInstruction: string;
  hostLanguageForIntegration: string;
  recommendedLevel: string;
  frenchAdvantage?: string;
}

export interface WorkPhaseLanguage {
  required: string;
  salaryImpact: string;
  frenchForQuebec?: string;
}

export interface PrLanguageRequirements {
  expressEntry?: { languageTest: string; clbTarget: string };
  quebecPNP?: { french: string };
  testValidity: string;
}

export interface CitizenshipLanguageRequirements {
  languageTest: string;
  languageInterview?: string;
  practicalLevel: string;
  note?: string;
}

export interface LanguageRequirements {
  country: string;
  countryCode: string;
  officialLanguages: string[];
  workingLanguage: string;
  overallLanguageScore: number;
  confidenceScore: number;
  admissionRequirements: AdmissionLanguageRequirements;
  studyPhaseLanguage: StudyPhaseLanguage;
  workPhaseLanguage: WorkPhaseLanguage;
  prRequirements: PrLanguageRequirements;
  citizenshipRequirements: CitizenshipLanguageRequirements;
  testCentersInBangladesh: string[];
  testCostBDT: Record<string, string>;
  strategicRecommendation: string;
}

export interface LanguageRequirementsFile {
  languageRequirements: LanguageRequirements[];
}
