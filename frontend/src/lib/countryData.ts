/**
 * Country Intelligence Data Loaders
 * 
 * These helpers load the 21 JSON files from /public/countries/
 * and return them with full TypeScript types.
 * 
 * Usage (in Server Components only):
 *   import { loadJobMarket, loadCountries } from '@/lib/countryData';
 */

import type {
  
  AiEcosystemFile,
  CitizenshipRulesFile,
  CountriesFile,
  CountryRisksFile,
  DocumentRequirementsFile,
  FamilyImmigrationFile,
  FundingOpportunitiesFile,
  FutureProofingFile,
  HousingMarketFile,
  JobMarketFile,
  LanguageRequirementsFile,
  LivingCostsFile,
  PostStudyWorkFile,
  PrPathwaysFile,
  RankingFactorsFile,
  ResearchOpportunitiesFile,
  SalaryDataFile,
  ScholarshipsFile,
  TaxationFile,
  TimelineRulesFile,
  VisaRulesFile,
} from '@/types/countries';

import type {
  CountrySummary,
  JobMarket,
  FundingOpportunity,
  CountryRanking,
  CountryTimeline,
  Scholarship,
  VisaRules,
  PostStudyWorkRights,
  PrPathways,
  LivingCosts,
  SalaryData,
  LanguageRequirements,
  DocumentRequirements,
  FamilyImmigrationRights,
  AiEcosystem,
  ResearchOpportunities,
  HousingMarket,
  TaxationEntry,
  CountryRisk,
  FutureProofing,
  CitizenshipRules,
} from '@/types/countries';

// Re-export types for convenience
export type {
  
  CountrySummary, JobMarket, FundingOpportunity, CountryRanking,
  CountryTimeline, Scholarship, VisaRules, PostStudyWorkRights,
  PrPathways, LivingCosts, SalaryData, LanguageRequirements,
  DocumentRequirements, FamilyImmigrationRights, AiEcosystem,
  ResearchOpportunities, HousingMarket, TaxationEntry, CountryRisk,
  FutureProofing, CitizenshipRules,
};

const BASE = '/countries';

async function loadJson<T>(file: string): Promise<T> {
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'countries', file);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } else {
    const res = await fetch(`${BASE}/${file}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
    return res.json() as Promise<T>;
  }
}

// ─── Individual loaders ────────────────────────────────────────────

export const loadAiEcosystem = () =>
  loadJson<AiEcosystemFile>('ai-ecosystem.json').then(d => d.countries);

export const loadCitizenshipRules = () =>
  loadJson<CitizenshipRulesFile>('citizenship-rules.json').then(d => d.citizenshipRules);

export const loadCountries = () =>
  loadJson<CountriesFile>('countries.json').then(d => d.countries);

export const loadCountryRisks = () =>
  loadJson<CountryRisksFile>('country-risks.json').then(d => d.countryRisks);

export const loadDocumentRequirements = () =>
  loadJson<DocumentRequirementsFile>('document-requirements.json').then(d => d.documentRequirements);

export const loadFamilyImmigration = () =>
  loadJson<FamilyImmigrationFile>('family-immigration.json').then(d => d.familyImmigrationRights);

export const loadFundingOpportunities = () =>
  loadJson<FundingOpportunitiesFile>('funding-opportunities.json').then(d => d.fundingOpportunities);

export const loadFutureProofing = () =>
  loadJson<FutureProofingFile>('future-proofing.json').then(d => d.futureProofing);

export const loadHousingMarket = () =>
  loadJson<HousingMarketFile>('housing-market.json').then(d => d.housingMarkets);

export const loadJobMarket = () =>
  loadJson<JobMarketFile>('job-market.json').then(d => d.jobMarkets);

export const loadLanguageRequirements = () =>
  loadJson<LanguageRequirementsFile>('language-requirements.json').then(d => d.languageRequirements);

export const loadLivingCosts = () =>
  loadJson<LivingCostsFile>('living-costs.json').then(d => d.livingCosts);

export const loadPostStudyWork = () =>
  loadJson<PostStudyWorkFile>('post-study-work.json').then(d => d.postStudyWorkRights);

export const loadPrPathways = () =>
  loadJson<PrPathwaysFile>('pr-pathways.json').then(d => d.prPathways);

export const loadRankingFactors = () =>
  loadJson<RankingFactorsFile>('ranking-factors.json').then(d => d.countryRankings);

export const loadResearchOpportunities = () =>
  loadJson<ResearchOpportunitiesFile>('research-opportunities.json').then(d => d.researchOpportunities);

export const loadSalaryData = () =>
  loadJson<SalaryDataFile>('salary-data.json').then(d => d.salaryData);

export const loadScholarships = () =>
  loadJson<ScholarshipsFile>('scholarships.json').then(d => d.scholarships);

export const loadTaxation = () =>
  loadJson<TaxationFile>('taxation.json').then(d => d.taxation);

export const loadTimelineRules = () =>
  loadJson<TimelineRulesFile>('timeline-rules.json').then(d => d.countryTimelines);

export const loadVisaRules = () =>
  loadJson<VisaRulesFile>('visa-rules.json').then(d => d.visaRules);

// ─── Country-scoped helpers ────────────────────────────────────────

export async function getCountryIntelligence(countryCode: string) {
  const [
    countries, jobMarkets, fundingOpportunities, countryRankings,
    countryTimelines, scholarships, visaRules, postStudyWork,
    prPathways, livingCosts, salaryData, languageRequirements,
    documentRequirements, familyImmigration, aiEcosystem,
    researchOpportunities, housingMarkets, taxation, countryRisks,
    futureProofing, citizenshipRules,
  ] = await Promise.all([
    loadCountries(),
    loadJobMarket(),
    loadFundingOpportunities(),
    loadRankingFactors(),
    loadTimelineRules(),
    loadScholarships(),
    loadVisaRules(),
    loadPostStudyWork(),
    loadPrPathways(),
    loadLivingCosts(),
    loadSalaryData(),
    loadLanguageRequirements(),
    loadDocumentRequirements(),
    loadFamilyImmigration(),
    loadAiEcosystem(),
    loadResearchOpportunities(),
    loadHousingMarket(),
    loadTaxation(),
    loadCountryRisks(),
    loadFutureProofing(),
    loadCitizenshipRules(),
  ]);

  const normalizedInput = countryCode.toLowerCase().replace(/\s+/g, '-');
  const countryEntry = countries.find(c => 
    c.countryCode.toLowerCase() === normalizedInput || 
    c.country.toLowerCase().replace(/\s+/g, '-') === normalizedInput
  );

  if (!countryEntry) {
    throw new Error(`Country not found for input: ${countryCode}`);
  }

  const cc = countryEntry.countryCode;

  return {
    summary:              countries.find(c => c.countryCode === cc),
    jobMarket:            jobMarkets.find(c => c.countryCode === cc),
    funding:              fundingOpportunities.find(c => c.countryCode === cc),
    ranking:              countryRankings.find(c => c.countryCode === cc),
    timeline:             countryTimelines.find(c => c.countryCode === cc),
    /** Multiple scholarships per country */
    scholarships:         scholarships.filter(s => s.countryCode === cc),
    visa:                 visaRules.find(c => c.countryCode === cc),
    postStudyWork:        postStudyWork.find(c => c.countryCode === cc),
    prPathways:           prPathways.find(c => c.countryCode === cc),
    livingCosts:          livingCosts.find(c => c.countryCode === cc),
    salary:               salaryData.find(c => c.countryCode === cc),
    language:             languageRequirements.find(c => c.countryCode === cc),
    documents:            documentRequirements.find(c => c.countryCode === cc),
    family:               familyImmigration.find(c => c.countryCode === cc),
    aiEcosystem:          aiEcosystem.find(c => c.countryCode === cc),
    research:             researchOpportunities.find(c => c.countryCode === cc),
    housing:              housingMarkets.find(c => c.countryCode === cc),
    taxation:             taxation.find(c => c.countryCode === cc),
    risks:                countryRisks.find(c => c.countryCode === cc),
    futureProofing:       futureProofing.find(c => c.countryCode === cc),
    citizenship:          citizenshipRules.find(c => c.countryCode === cc),
  };
}

/** Infer the full return type for use in page components */
export type CountryIntelligence = Awaited<ReturnType<typeof getCountryIntelligence>>;
