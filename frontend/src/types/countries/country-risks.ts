// =====================================================================
// country-risks.json
// =====================================================================

export interface CountryRisksMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
}

export type RiskTrend = 'IMPROVING' | 'STABLE' | 'WORSENING';

export type RiskLevel =
  | 'VERY LOW'
  | 'LOW'
  | 'LOW-MODERATE'
  | 'MODERATE'
  | 'MODERATE-HIGH'
  | 'HIGH'
  | 'VERY HIGH'
  | 'EXTREME';

export interface RiskFactor {
  score: number;
  level: RiskLevel;
  summary: string;
  trend: RiskTrend;
}

export interface CountryRisks {
  housingRisk: RiskFactor;
  economicRisk: RiskFactor;
  inflationRisk: RiskFactor;
  antiImmigrationRisk: RiskFactor;
  climateRisk: RiskFactor;
  warRisk: RiskFactor;
  jobMarketRisk: RiskFactor;
  politicalRisk: RiskFactor;
}

export interface CountryRisk {
  country: string;
  countryCode: string;
  overallRiskScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  risks: CountryRisks;
  keyWarnings: string[];
  evidenceSummary: string;
}

export interface CountryRisksFile {
  countryRisks: CountryRisk[];
  metadata?: CountryRisksMetadata;
}
