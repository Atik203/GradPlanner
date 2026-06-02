// =====================================================================
// job-market.json
// =====================================================================

export interface JobMarketMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
  analysisScope?: string;
  economicContext?: string;
}

export interface IndustryHiring {
  sector: string;
  demandScore: number;
  salaryRange: string;
  note: string;
}

export interface EntryLevelReality {
  easiestEntry: string;
  hardestEntry: string;
  sweetSpot: string;
  bangladeshiPresence: string;
  biasLevel: string;
}

export interface VisaSponsorshipReality {
  willingnessScore: number;
  pospWpgpAdvantage: string;
  studyPermitToPgwpSuccess: number;
  sponsorshipCost: string;
  note: string;
}

export interface SalaryExpectations {
  phdEntryLevel: string;
  mscEntryLevel: string;
  midLevel3to5yrs: string;
  seniorLevel: string;
  totalCompNote: string;
}

export interface CityJobMarket {
  jobDensity: number;
  avgSalary: string;
  costOfLivingIndex: number;
  netBenefit: string;
}

export interface WorkCulture {
  averageHoursPerWeek: number;
  vacationDays: number;
  sickLeaveDays: number | string;
  parentalLeaveWeeks: number;
  workFromHomeAcceptance: number;
  diversityScore: number;
  burnoutRisk: string;
  culturalFit: string;
}

export interface CareerGrowth {
  pathToSenior: string;
  pathToStaffPrincipal: string;
  managementOpportunities: number;
  technicalLadder: string;
  entrepreneurshipSupport: number;
  note: string;
}

export interface ForeignCredentialRecognition {
  canadianMasterScore: number;
  topUsPhd: number;
  topEuPhd: number;
  bangladeshUndergrad: number;
  note: string;
}

export interface LayoffRisk {
  riskScore: number;
  trend: string;
  protection: string;
}

export interface PrPathwayIntegration {
  jobRequiredForPr: boolean;
  skillClassEligibility: number;
  crsPointsFromJob: string;
  provinceNominationBoost: string;
  note: string;
}

export interface LongTermOutlook {
  outlook2030: string;
  outlook2040: string;
  riskFactors: string;
}

export interface JobMarket {
  country: string;
  countryCode: string;
  overallJobMarketScore: number;
  demandLevel: string;
  demandTrend: string;
  marketSaturation: string;
  averageTimeToJob: string;
  averageTimeToJobDays: number;
  jobOpeningsAnnual: number;
  aiMlSpecificOpenings: number;
  competitionLevel: number;
  jobSecurityScore: number;
  startupEcosystemScore: number;
  researchPositionsScore: number;
  remoteWorkCulture: number;
  workLifeBalanceScore: number;
  careerProgressionScore: number;
  majorHubs: string[];
  topEmployers: string[];
  emergingCompanies: string[];
  skillsInDemand: string[];
  industriesHiring: IndustryHiring[];
  entryLevelReality: EntryLevelReality;
  visaSponsorshipReality: VisaSponsorshipReality;
  salaryExpectations: SalaryExpectations;
  geographicVariation: Record<string, CityJobMarket>;
  workCulture: WorkCulture;
  careerGrowth: CareerGrowth;
  foreignCredentialRecognition: ForeignCredentialRecognition;
  layoffRisk2027to2029: LayoffRisk;
  prPathwayIntegration: PrPathwayIntegration;
  longTermOutlook: LongTermOutlook;
  strategicAdvice: string;
  confidenceScore: number;
  dataQuality: string;
}

export interface JobMarketFile {
  jobMarkets: JobMarket[];
  metadata?: JobMarketMetadata;
}
