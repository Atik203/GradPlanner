// =====================================================================
// research-opportunities.json
// =====================================================================

export interface ResearchOpportunities {
  country: string;
  countryCode: string;
  researchQualityScore: number;
  researchFundingScore: number;
  accessibilityScore: number;
  topUniversities: string[];
  topResearchLabs: string[];
  governmentFunding: string;
  industryCollaboration: number;
  phdPositionsAvailable: string;
  fundingForPhd: number;
  keyResearchAreas: string[];
  bangladeshiAccessibility?: string;
  languageBarrierForResearch?: string;
  visaPathwayForResearchers?: string;
  topConferences?: string[];
  collaborationOpportunities?: string[];
  researchSummary?: string;
}

export interface ResearchOpportunitiesFile {
  researchOpportunities: ResearchOpportunities[];
}
