import fs from "fs/promises";
import path from "path";
import { prisma } from "../src/lib/prisma.js";

// Helper to load JSON files safely
async function loadJson(fileName: string): Promise<any> {
  const filePath = path.resolve(process.cwd(), "../frontend/public/countries", fileName);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Failed to read or parse JSON file: ${filePath}`, error);
    throw error;
  }
}

export async function seedCountryIntelligence() {
  console.log("🌱 Starting Country Intelligence seeding...");

  // Load all 21 JSON files in parallel
  const [
    countriesFile,
    visaFile,
    prFile,
    citizenshipFile,
    familyFile,
    livingCostsFile,
    jobMarketFile,
    salaryFile,
    scholarshipsFile,
    fundingFile,
    researchFile,
    housingFile,
    taxationFile,
    risksFile,
    futureProofingFile,
    documentsFile,
    languageFile,
    postStudyWorkFile,
    aiEcosystemFile,
    rankingFactorsFile,
    timelineRulesFile,
  ] = await Promise.all([
    loadJson("countries.json"),
    loadJson("visa-rules.json"),
    loadJson("pr-pathways.json"),
    loadJson("citizenship-rules.json"),
    loadJson("family-immigration.json"),
    loadJson("living-costs.json"),
    loadJson("job-market.json"),
    loadJson("salary-data.json"),
    loadJson("scholarships.json"),
    loadJson("funding-opportunities.json"),
    loadJson("research-opportunities.json"),
    loadJson("housing-market.json"),
    loadJson("taxation.json"),
    loadJson("country-risks.json"),
    loadJson("future-proofing.json"),
    loadJson("document-requirements.json"),
    loadJson("language-requirements.json"),
    loadJson("post-study-work.json"),
    loadJson("ai-ecosystem.json"),
    loadJson("ranking-factors.json"),
    loadJson("timeline-rules.json"),
  ]);

  const countries = countriesFile.countries || [];
  console.log(`   Found ${countries.length} countries in countries.json.`);

  // Clear existing country intelligence data to avoid duplicates or orphans
  const deleted = await prisma.countryIntelligence.deleteMany();
  console.log(`   Cleared ${deleted.count} existing country intelligence rows`);

  let count = 0;

  for (const c of countries) {
    const cc = c.countryCode;
    const countryName = c.country;

    // Filter/Find matching records by countryCode (case-insensitive)
    const findByCc = (list: any[]) => list?.find((item) => item?.countryCode?.toLowerCase() === cc.toLowerCase()) || {};
    
    const summary = c;
    const visa = findByCc(visaFile.visaRules);
    const prPathways = findByCc(prFile.prPathways);
    const citizenship = findByCc(citizenshipFile.citizenshipRules);
    const family = findByCc(familyFile.familyImmigrationRights);
    const livingCosts = findByCc(livingCostsFile.livingCosts);
    const jobMarket = findByCc(jobMarketFile.jobMarkets);
    const salary = findByCc(salaryFile.salaryData);
    
    // Multiple scholarships per country
    const scholarships = scholarshipsFile.scholarships?.filter((s: any) => s.countryCode?.toLowerCase() === cc.toLowerCase()) || [];
    
    const funding = findByCc(fundingFile.fundingOpportunities);
    const research = findByCc(researchFile.researchOpportunities);
    const housing = findByCc(housingFile.housingMarkets);
    const taxation = findByCc(taxationFile.taxation);
    const risks = findByCc(risksFile.countryRisks);
    const futureProofing = findByCc(futureProofingFile.futureProofing);
    const documents = findByCc(documentsFile.documentRequirements);
    const language = findByCc(languageFile.languageRequirements);
    const postStudyWork = findByCc(postStudyWorkFile.postStudyWorkRights);
    
    // Key in ai-ecosystem.json is countries
    const aiEcosystem = findByCc(aiEcosystemFile.countries);
    // Key in ranking-factors.json is countryRankings
    const ranking = findByCc(rankingFactorsFile.countryRankings);
    // Key in timeline-rules.json is countryTimelines
    const timeline = findByCc(timelineRulesFile.countryTimelines);

    await prisma.countryIntelligence.create({
      data: {
        country: countryName,
        countryCode: cc,
        overallScore: summary.overallScore || 0,
        summary,
        visa,
        prPathways,
        citizenship,
        family,
        livingCosts,
        jobMarket,
        salary,
        scholarships,
        funding,
        research,
        housing,
        taxation,
        risks,
        futureProofing,
        documents,
        language,
        postStudyWork,
        aiEcosystem,
        ranking,
        timeline,
      },
    });

    count++;
    console.log(`   ✓ Seeded: ${countryName} (${cc})`);
  }

  console.log(`✅ Country Intelligence complete. Seeded ${count} countries.`);
}
