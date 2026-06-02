const fs = require('fs');

const missingCountries = [
  { country: "Austria", countryCode: "AT" },
  { country: "Belgium", countryCode: "BE" },
  { country: "New Zealand", countryCode: "NZ" },
  { country: "Singapore", countryCode: "SG" },
  { country: "France", countryCode: "FR" },
  { country: "United Arab Emirates", countryCode: "AE" }
];

function patchFile(fileName, listKey, generateFn) {
  const filePath = `e:/PROJECT/GradPlanner/frontend/public/countries/${fileName}`;
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let list = data[listKey];

  missingCountries.forEach(mc => {
    if (!list.find(c => c.country === mc.country)) {
      list.push(generateFn(mc.country, mc.countryCode));
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`${fileName} patched successfully!`);
}

patchFile('document-requirements.json', 'documentRequirements', (country, code) => ({
  country, countryCode: code,
  generalDocuments: [{ document: "Transcripts", details: "Attested copies required.", attestationRequired: true, translationRequired: country === 'France' || country === 'Austria', processingTime: "2-4 weeks" }],
  visaDocuments: [{ document: "Proof of Funds", details: "Required.", processingTime: "4 weeks" }],
  bangladeshSpecificSteps: ["Ministry attestation required."],
  keyDeadlines: { fallIntake: "Varies", winterIntake: "Varies", visaApplyAfterAdmission: "Immediately" },
  estimatedCosts: { applicationFees: "USD 100", studyPermitFee: "Varies", biometricFee: "Varies", medicalExam: "Varies", attestationCosts: "BDT 5,000" }
}));

patchFile('funding-opportunities.json', 'fundingOpportunities', (country, code) => ({
  country, countryCode: code,
  overallFundingScore: country === 'United Arab Emirates' ? 95 : 60,
  fundingAvailability: country === 'United Arab Emirates' ? "Excellent (MBZUAI fully funded)" : "Moderate",
  mscFundingChance: country === 'United Arab Emirates' ? 90 : 30, phdFundingChance: 80,
  governmentScholarships: [],
  universityFunding: { availability: "Varies", typicalPackage: { phd: "Funded", msc: "Partial" }, fundingSources: ["TA/RA"], topFundedUniversities: [], fundingNote: "" },
  externalFellowships: [],
  livingStipendAdequacy: "Adequate", averageMonthlyStipend: "Varies", averageMonthlyCost: "Varies",
  selfFundingCost: { mscTotal: "High", phdTotal: "N/A" },
  workWhileStudying: "Allowed with limits", realisticStrategy: "Target PhD", confidenceScore: 85
}));

patchFile('research-opportunities.json', 'researchOpportunities', (country, code) => ({
  country, countryCode: code,
  researchQualityScore: 80, researchFundingScore: 75, accessibilityScore: 70,
  topUniversities: [], topResearchLabs: [], governmentFunding: "Moderate", industryCollaboration: 70, phdPositionsAvailable: "Moderate", fundingForPhd: 85, keyResearchAreas: ["AI/ML"], publicationOpportunities: "Good", internationalCollaboration: 80,
  bangladeshiAccessibility: { score: 70, challenges: "High competition", advantages: "Merit-based", successRate: "Moderate" },
  averageAdmissionRate: "10-20%", typicalPhdDuration: "3-4 years", stipendAdequacy: 80, postPhdProspects: "Good", researchCulture: "Rigorous", strategicAdvice: "Focus on publications", confidenceScore: 85
}));

patchFile('salary-data.json', 'salaryData', (country, code) => ({
  country, countryCode: code, currency: country === 'Singapore' ? 'SGD' : country === 'United Arab Emirates' ? 'AED' : country === 'New Zealand' ? 'NZD' : 'EUR',
  salaryScore: 75, confidenceScore: 85,
  softwareEngineer: { junior: { min: "40k", max: "60k", average: "50k" }, mid: { min: "60k", max: "80k", average: "70k" }, senior: { min: "80k", max: "120k", average: "100k" } },
  aiMlEngineer: { junior: { min: "50k", max: "70k", average: "60k" }, mid: { min: "70k", max: "90k", average: "80k" }, senior: { min: "90k", max: "150k", average: "120k" } },
  dataScientist: { junior: { min: "45k", max: "65k", average: "55k" }, mid: { min: "65k", max: "85k", average: "75k" }, senior: { min: "85k", max: "130k", average: "110k" } },
  regionalVariations: { capital: "+15%" }, sectorVariations: { tech: "+20%" },
  benefits: { healthInsurance: "Standard", retirement: "Standard", vacation: "20+ days", parentalLeave: "Varies" },
  salaryGrowth: "Moderate", negotiationPower: "Moderate"
}));

patchFile('timeline-rules.json', 'countryTimelines', (country, code) => ({
  country, countryCode: code,
  totalJourneyYears: { mscPathway: "10 years", phdPathway: "12 years" },
  phases: {
    phase1_application: { duration: "6 months", startDate: "Varies", keyMilestones: [], criticalDeadlines: "Varies" },
    phase2_study: { mscDuration: "2 years", phdDuration: "4 years", keyMilestones: [], criticalNote: "" },
    phase3_postStudyWork: { permitName: "PSW", duration: "1-3 years", processingTime: "Varies", keyMilestones: [], criticalNote: "" },
    phase4_pr: { pathwayName: "Skilled route", processingTime: "Varies", eligibilityRequirements: [], estimatedYearsFromGraduation: "3-5 years", keyMilestones: [] },
    phase5_citizenship: { waitAfterPr: "3-5 years", processingTime: "Varies", languageRequired: "Varies", estimatedYearsFromGraduation: "8-10 years", note: "" },
    phase6_familyRelocation: { spouseVisa: "Allowed", childrenVisa: "Allowed", parentSponsor: "Hard", bestTime: "After PR", timeFromGraduation: "Varies" }
  },
  sampleTimeline_MSc: [], confidenceScore: 80
}));
