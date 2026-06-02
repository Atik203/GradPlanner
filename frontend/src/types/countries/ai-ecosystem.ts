// =====================================================================
// ai-ecosystem.json
// =====================================================================

export interface AiCompany {
  name: string;
  location: string;
  focus: string;
  hires: string;
}

export interface AiResearchHub {
  name: string;
  focus: string;
  type?: string;
  note?: string;
}

export interface AiEcosystem {
  country: string;
  countryCode: string;
  aiEcosystemScore: number;
  globalAiRanking?: number;
  confidenceScore: number;
  keyStrengths: string[];
  aiCompanies: AiCompany[];
  researchHubs: AiResearchHub[];
  governmentAiInvestment?: string;
  aiResearchOutput?: string;
  bdStudentOpportunity?: string;
  summary?: string;
  evidenceSummary?: string;
}

export interface AiEcosystemFile {
  countries: AiEcosystem[];
}
