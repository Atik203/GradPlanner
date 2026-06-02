const fs = require('fs');

// ============ TIMELINE RULES UPGRADE ============
const tlPath = 'e:/PROJECT/GradPlanner/frontend/public/countries/timeline-rules.json';
let tlData = JSON.parse(fs.readFileSync(tlPath, 'utf8'));

function buildTimeline(country, code, prYears, citizenshipYears, visaNote, prNote, startYear = 2027) {
  return {
    country, countryCode: code,
    totalJourneyYears: { mscPathway: `${4 + prYears}-${5 + prYears + 2} years`, phdPathway: `${6 + prYears}-${8 + prYears + 2} years` },
    phases: {
      phase1_application: {
        duration: "8-12 months",
        startDate: "January 2026 for September 2027 intake",
        keyMilestones: ["IELTS preparation (3-6 months)", "University applications (Sep-Dec 2025)", "Acceptance letter (Jan-Apr 2026)", `${visaNote}`, "Visa approval (4-12 weeks)"],
        criticalDeadlines: "Most universities deadline October-January"
      },
      phase2_study: {
        mscDuration: "2 years",
        phdDuration: "3-4 years",
        keyMilestones: ["Year 1: Settle, language course, build research network", "Year 2 MSc: Research/thesis + job search begins", "Apply for PSW visa 3 months before graduation"],
        criticalNote: "Network with professors and industry contacts from Year 1"
      },
      phase3_postStudyWork: {
        permitName: "Post-Study Work Permit",
        duration: "1-3 years",
        processingTime: "4-12 weeks",
        keyMilestones: ["Month 1-3: PSW application", "Month 3-6: Job search and employment", "Month 6+: Accumulate residence time for PR", "Month 12-24: Language exam if required"],
        criticalNote: "Secure employment before PSW expires"
      },
      phase4_pr: {
        pathwayName: prNote,
        processingTime: "6-12 months",
        eligibilityRequirements: [`${prYears} years legal residence`, "Clean criminal record", "Language requirement", "Employment or self-sufficiency"],
        estimatedYearsFromGraduation: `${prYears - 2}-${prYears} years`,
        keyMilestones: ["Accumulate required residence years", "Pass language test if required", "Submit PR application", "PR approved"]
      },
      phase5_citizenship: {
        waitAfterPr: `${citizenshipYears - prYears} years`,
        processingTime: "12-24 months",
        languageRequired: "Country language B1-B2",
        estimatedYearsFromGraduation: `${citizenshipYears}-${citizenshipYears + 2} years`,
        note: "Language test is the main requirement alongside residence"
      },
      phase6_familyRelocation: {
        spouseVisa: "Family reunification visa — usually allowed after PR",
        childrenVisa: "Included in family reunification",
        parentSponsor: "Difficult — requires significant financial proof",
        bestTime: "After PR approval",
        timeFromGraduation: `${prYears + 1}-${prYears + 3} years for spouse`
      }
    },
    sampleTimeline_MSc: [
      { year: 2026, event: `Prepare IELTS, apply to universities, collect documents` },
      { year: startYear, event: `Begin MSc program` },
      { year: startYear + 1, event: `Year 2 MSc — research, internship, job applications` },
      { year: startYear + 2, event: `Graduate — apply for post-study work permit` },
      { year: startYear + 3, event: `Working in ${country} — accumulate residence for PR` },
      { year: startYear + 4, event: `Continue working — language exam, PR application preparation` },
      { year: startYear + prYears, event: `Apply for Permanent Residency` },
      { year: startYear + prYears + 1, event: `PR approved — sponsor spouse and family` },
      { year: startYear + citizenshipYears, event: `Apply for citizenship` }
    ],
    confidenceScore: 85
  };
}

const tlUpgrades = [
  buildTimeline("Austria", "AT", 5, 10, "Austria visa: Apply via Austrian Embassy Dhaka; straightforward but German language expected", "Red-White-Red Card Plus → Settlement Permit (5 years)", 2027),
  buildTimeline("Belgium", "BE", 5, 10, "Belgium visa: Apply via VFS Global/Belgian Embassy; Single Permit via employer", "Single Permit → Carte de Séjour Permanente (5 years)", 2027),
  buildTimeline("New Zealand", "NZ", 3, 8, "NZ visa: Online Visitor Visa then Student Visa; straightforward process for BD nationals", "Skilled Migrant Category points (3 years work exp)", 2027),
  buildTimeline("Singapore", "SG", 6, 20, "Singapore visa: Student Pass via ICA — university arranges; very smooth process", "EP/SP → Permanent Residence application (6+ years)", 2027),
  buildTimeline("France", "FR", 5, 10, "France visa: Long-stay student visa (VLS-TS) — Campus France attestation required; allow 8-12 weeks", "Passeport Talent → Carte de Résident (5 years work)", 2027),
  buildTimeline("United Arab Emirates", "AE", 999, 999, "UAE visa: University/employer arranges entry permit; near-zero rejection for MBZUAI students", "Golden Visa (10yr renewable) — NOT traditional PR; NO citizenship pathway", 2027)
];

// fix UAE special case
const uaeEntry = tlUpgrades.find(t => t.country === "United Arab Emirates");
uaeEntry.totalJourneyYears = { mscPathway: "Career accelerator only — no PR/citizenship", phdPathway: "Career accelerator only — no PR/citizenship" };
uaeEntry.sampleTimeline_MSc = [
  { year: 2026, event: "Apply to MBZUAI (February/May deadlines)" },
  { year: 2027, event: "Begin MBZUAI MSc — AED 9,300/month stipend, zero fees" },
  { year: 2028, event: "MSc Year 2 — research at G42 or TII, network" },
  { year: 2029, event: "Graduate — join G42 / MBZUAI / Microsoft UAE as AI Engineer" },
  { year: 2030, event: "Working in UAE — accumulate savings; apply for Golden Visa (AED 30k salary threshold)" },
  { year: 2031, event: "Golden Visa approved (10yr) — financial security; accelerate savings" },
  { year: 2033, event: "Target: AED 500,000-1M saved; evaluate PR destination (Canada/Ireland/Germany)" },
  { year: 2034, event: "Transition to chosen PR country using UAE experience + savings" },
  { year: 2039, event: "Citizenship in chosen country (if Canada: ~2034, Ireland: ~2034, Germany: ~2036)" }
];
uaeEntry.phases.phase5_citizenship.note = "UAE has NO citizenship pathway. Use UAE for wealth accumulation then transition to Canada/Ireland/Germany for PR and citizenship.";
uaeEntry.phases.phase4_pr.pathwayName = "Golden Visa (10yr renewable) — not traditional PR";
uaeEntry.phases.phase4_pr.estimatedYearsFromGraduation = "2-3 years (Golden Visa threshold)";

tlUpgrades.forEach(upgrade => {
  const idx = tlData.countryTimelines.findIndex(t => t.country === upgrade.country);
  if (idx !== -1) {
    tlData.countryTimelines[idx] = upgrade;
  } else {
    tlData.countryTimelines.push(upgrade);
  }
});

fs.writeFileSync(tlPath, JSON.stringify(tlData, null, 2));
console.log('timeline-rules.json: All 6 countries upgraded!');

// ============ RANKING FACTORS UPGRADE ============
const rfPath = 'e:/PROJECT/GradPlanner/frontend/public/countries/ranking-factors.json';
let rfData = JSON.parse(fs.readFileSync(rfPath, 'utf8'));

const rfUpgrades = [
  {
    country: "Austria", countryCode: "AT",
    overallBalancedScore: 72, overallRank: 10, confidenceScore: 84,
    evidenceSummary: "Austria is Germany's quieter twin — employment-based PhD contracts, Red-White-Red Card skilled migration, EU Blue Card, Vienna quality of life. Main risks: right-wing political shift, German language, and a 10-year PR wait.",
    phaseScores: {
      studyPhase: { score: 78, rank: 9, keyFactors: ["Employment-based PhD (TV-L equivalent)", "TU Wien / TU Graz research quality", "Zero tuition for PhD employees", "OeAD scholarships"], keyRisks: ["German required long-term", "Limited English-only job market"] },
      postStudyWork: { score: 76, rank: 9, keyFactors: ["Red-White-Red Card — fast processing", "EU Blue Card option", "Tech talent shortage in Vienna"], keyRisks: ["German language limits job pool by 60%"] },
      prAcquisition: { score: 55, rank: 15, keyFactors: ["Red-White-Red Card Plus → Settlement Permit", "5 years pathway with employment"], keyRisks: ["10 years for standard PR", "Political risk from FPÖ"] },
      citizenship: { score: 45, rank: 17, keyFactors: ["10yr pathway", "Dual citizenship NOT allowed"], keyRisks: ["Must renounce Bangladeshi citizenship — CRITICAL", "German B1 integration exam"] },
      familySettlement: { score: 72, rank: 11, keyFactors: ["Spouse work rights", "Free public schooling", "Universal healthcare"], keyRisks: ["German language for children's integration"] },
      longTerm20to30Years: { score: 70, rank: 11, keyFactors: ["Aging population needs immigrants", "EU stability", "Vienna ranked #1 liveable city"], keyRisks: ["Right-wing political risk", "Language requirement permanent"] }
    },
    dimensionScores: { admissionFeasibility: 78, scholarshipFunding: 65, researchQuality: 78, jobMarketStrength: 72, salaryPotential: 72, prPathway: 55, citizenshipAccess: 45, familyRights: 72, costOfLiving: 75, housingAvailability: 72, languageBarrier: 35, stabilityScore: 80, aiEcosystemScore: 72, futureProofScore: 70 },
    bangladeshiSpecificFactors: { communityPresence: "SMALL — approximately 15,000 South Asians in Vienna", halalFoodAccess: "GOOD in Vienna; limited elsewhere", islamicFacilities: "ADEQUATE in Vienna (multiple mosques)", dtaaWithBangladesh: true, successProbability: "MODERATE for top academic profiles with German language investment" },
    strategicNote: "Austria is best used as an alternative entry point if Germany visa queues are 2.5+ years. Red-White-Red Card processes in 4-8 weeks vs German bottlenecks. Vienna quality of life is genuinely exceptional. CRITICAL: Dual citizenship is NOT allowed in Austria — you must renounce Bangladeshi passport. This is a major life decision.",
    notRecommendedFor: "Students unwilling to learn German OR students who cannot accept renouncing Bangladeshi citizenship"
  },
  {
    country: "Belgium", countryCode: "BE",
    overallBalancedScore: 78, overallRank: 7, confidenceScore: 88,
    evidenceSummary: "Severely underrated destination. IMEC semiconductor research, VLIR-UOS scholarship (BD is partner country), EU institutions career, tax-free PhD scholarships, zero capital gains tax. Main risks: language fragmentation and world's highest income tax on labor.",
    phaseScores: {
      studyPhase: { score: 82, rank: 7, keyFactors: ["IMEC (world #1 chip research)", "VLIR-UOS scholarship — BD partner country", "KU Leuven top-20 EU research", "Tax-exempt PhD stipends"], keyRisks: ["MSc funding very limited outside VLIR-UOS"] },
      postStudyWork: { score: 80, rank: 8, keyFactors: ["Single Permit straightforward", "EU institutions employment (NATO, EC)", "FinTech and semiconductor demand"], keyRisks: ["Dutch/French language for most roles outside Brussels tech"] },
      prAcquisition: { score: 78, rank: 8, keyFactors: ["5 years → Carte de Séjour Permanente", "EU Blue Card mobility", "Employer-led Single Permit fast"], keyRisks: ["Language test (FR or NL B1)", "Bureaucratic complexity"] },
      citizenship: { score: 75, rank: 9, keyFactors: ["10 years (5 PR + 5 citizenship)", "Dual citizenship ALLOWED — keep BD passport", "Multiple language options (FR or NL)"], keyRisks: ["Dutch or French B1 required"] },
      familySettlement: { score: 80, rank: 7, keyFactors: ["Family reunification after PR", "Free public schooling (excellent quality)", "Universal healthcare", "Free childcare"], keyRisks: ["Brussels housing is competitive"] },
      longTerm20to30Years: { score: 82, rank: 6, keyFactors: ["EU headquarters city (permanent)", "IMEC EU Chips Act role (structural)", "Dual citizenship keeps BD connections"], keyRisks: ["Political instability risk", "Tax burden on labor"] }
    },
    dimensionScores: { admissionFeasibility: 80, scholarshipFunding: 78, researchQuality: 88, jobMarketStrength: 78, salaryPotential: 72, prPathway: 78, citizenshipAccess: 75, familyRights: 80, costOfLiving: 72, housingAvailability: 70, languageBarrier: 45, stabilityScore: 82, aiEcosystemScore: 82, futureProofScore: 82 },
    bangladeshiSpecificFactors: { communityPresence: "MODERATE — established South Asian community in Brussels and Antwerp (~30,000)", halalFoodAccess: "VERY GOOD — halal restaurants throughout Brussels, Antwerp, Ghent", islamicFacilities: "GOOD — multiple mosques; Brussels is 25% Muslim city", dtaaWithBangladesh: true, successProbability: "HIGH for VLIR-UOS applicants; MEDIUM-HIGH for direct PhD" },
    strategicNote: "Belgium is the most underrated country in GradPlanner. VLIR-UOS specifically targets Bangladesh as a partner country — this is a direct pipeline that most Bangladeshi students don't know about. IMEC (Leuven) is making semiconductors that power AI globally. Brussels is the most international city in Europe. Zero capital gains tax means aggressive investment returns. DUAL CITIZENSHIP means you keep your Bangladeshi passport.",
    notRecommendedFor: "Students who need guaranteed English-only workplace (Brussels tech is fine, but Ghent/Antwerp require Dutch)"
  },
  {
    country: "New Zealand", countryCode: "NZ",
    overallBalancedScore: 62, overallRank: 16, confidenceScore: 82,
    evidenceSummary: "Beautiful country with high quality of life but significant career ceiling for AI specialists. Small tech market, brain drain to Australia, severe Auckland housing crisis. Use as quality-of-life destination with Australia transition plan.",
    phaseScores: {
      studyPhase: { score: 70, rank: 14, keyFactors: ["English-medium; no language barrier", "Auckland/Victoria good CS departments", "AgriTech/VFX AI unique niches"], keyRisks: ["Limited scholarships", "High tuition for international students (NZD 35k+)"] },
      postStudyWork: { score: 72, rank: 12, keyFactors: ["Post Study Work Visa 1-3yr", "Accredited Employer Work Visa straightforward", "Trans-Tasman Easy Travel to Australia"], keyRisks: ["Small market — limited senior AI roles"] },
      prAcquisition: { score: 68, rank: 13, keyFactors: ["Skilled Migrant Category points system", "Realistically achievable in 3yr post-graduation"], keyRisks: ["Housing crisis makes cost very high", "Limited points for CS vs engineering"] },
      citizenship: { score: 70, rank: 12, keyFactors: ["5yr PR + 5yr citizenship = 10yr total", "Dual citizenship ALLOWED", "English requirement trivial for CS grads"], keyRisks: [] },
      familySettlement: { score: 68, rank: 13, keyFactors: ["Family reunification smooth", "Free public schooling", "English-medium education"], keyRisks: ["Housing crisis is family budget-killer"] },
      longTerm20to30Years: { score: 60, rank: 17, keyFactors: ["Geopolitical safety (isolated)", "Climate change safe haven (rising)", "NZ-Australia Trans-Tasman pathway"], keyRisks: ["Career ceiling too low for AI specialists", "Economic dependence on China/Australia"] }
    },
    dimensionScores: { admissionFeasibility: 75, scholarshipFunding: 45, researchQuality: 68, jobMarketStrength: 62, salaryPotential: 60, prPathway: 68, citizenshipAccess: 70, familyRights: 70, costOfLiving: 45, housingAvailability: 35, languageBarrier: 98, stabilityScore: 85, aiEcosystemScore: 58, futureProofScore: 60 },
    bangladeshiSpecificFactors: { communityPresence: "MODERATE — approximately 200,000 South Asians; Bangladeshi community established in Auckland", halalFoodAccess: "GOOD in Auckland and Wellington", islamicFacilities: "ADEQUATE — mosques in major cities", dtaaWithBangladesh: false, successProbability: "MODERATE if self-funded; LOW-MODERATE for scholarships" },
    strategicNote: "New Zealand is recommended ONLY for students who value quality of life above career growth, OR who have a specific interest in AgriTech/VFX AI, OR who want NZ as a stepping stone to Australia (Trans-Tasman Freedom of Travel). DO NOT choose NZ for cutting-edge AI career ambitions — you will hit a ceiling within 3-5 years.",
    notRecommendedFor: "Students prioritizing career growth, salary maximization, or research publications in AI/ML"
  },
  {
    country: "Singapore", countryCode: "SG",
    overallBalancedScore: 80, overallRank: 6, confidenceScore: 90,
    evidenceSummary: "World-class AI research (NUS top-20 globally), SINGA scholarship fully funded, strategic Asia-Pacific hub, fastest time-to-employment. Main challenges: expensive housing, restrictive PR system via COMPASS, and no citizenship for most non-residents.",
    phaseScores: {
      studyPhase: { score: 90, rank: 3, keyFactors: ["NUS/NTU global top-20 ranking", "SINGA scholarship SGD 2,200/month fully funded", "A*STAR research institute world-class", "English medium — zero language barrier"], keyRisks: ["Admission very competitive (NUS ~5% international acceptance rate)"] },
      postStudyWork: { score: 82, rank: 7, keyFactors: ["Low unemployment in tech (2.5%)", "COMPASS framework favors STEM PhDs", "Financial hub (DIFC equivalent)"], keyRisks: ["COMPASS makes junior-level sponsorship harder for non-PhD"] },
      prAcquisition: { score: 60, rank: 14, keyFactors: ["PR possible after 2-3yr for top employers", "SINGA bond = 3yr Singapore commitment"], keyRisks: ["COMPASS hidden quota system", "PR is not automatic even with stable job"] },
      citizenship: { score: 30, rank: 19, keyFactors: ["Possible after 2-6yr as PR"], keyRisks: ["Near-impossible in practice (ICA heavily restricts)", "Dual citizenship NOT allowed — must renounce BD passport"] },
      familySettlement: { score: 72, rank: 11, keyFactors: ["Family reunification after PR", "Excellent schooling (world #1 math/science)"], keyRisks: ["International school costs astronomical (SGD 30,000+/year)", "Housing cost for families extreme"] },
      longTerm20to30Years: { score: 78, rank: 9, keyFactors: ["Asia-Pacific strategic hub — permanent", "Geopolitical stability", "Government AI investment (SGD 25B by 2030)"], keyRisks: ["Climate: sea level rise risk", "No citizenship = always vulnerable"] }
    },
    dimensionScores: { admissionFeasibility: 65, scholarshipFunding: 90, researchQuality: 92, jobMarketStrength: 85, salaryPotential: 85, prPathway: 60, citizenshipAccess: 30, familyRights: 70, costOfLiving: 35, housingAvailability: 30, languageBarrier: 98, stabilityScore: 92, aiEcosystemScore: 90, futureProofScore: 78 },
    bangladeshiSpecificFactors: { communityPresence: "SMALL but GROWING — approximately 30,000 BD nationals; Little India area; halal food widely available", halalFoodAccess: "EXCELLENT — Singapore has world-class halal food certification; Muslim-friendly city", islamicFacilities: "EXCELLENT — Singapore government actively supports Muslim community; Masjids in all districts", dtaaWithBangladesh: true, successProbability: "HIGH for scholarship if CGPA 3.7+ with research experience; LOW for self-funded without NUS/NTU admission" },
    strategicNote: "Singapore is the scholarship hunter's dream. SINGA is arguably the best-funded, most prestigious AI scholarship available to Bangladeshi students. NUS Computer Science is Asia's #1 ranked program. The SINGA bond (3yr work commitment) is not a punishment — Singapore's AI job market is world-class. STRATEGY: SINGA → NUS PhD → A*STAR Research Scientist → PR application → Use Singapore experience as leverage for Canada/Australia/Germany PR if Singapore PR rejected.",
    notRecommendedFor: "Students who need PR or citizenship certainty, or families who cannot handle Singapore's cost of living on a single income"
  },
  {
    country: "France", countryCode: "FR",
    overallBalancedScore: 80, overallRank: 5, confidenceScore: 88,
    evidenceSummary: "Europe's rising AI capital (Mistral AI, Station F). Eiffel Scholarship + contrat doctoral funding. Passeport Talent = easiest skilled worker visa in EU. 5-year PR pathway. 35-hour work week. World's best food. Main risk: French language requirement for PR and true integration.",
    phaseScores: {
      studyPhase: { score: 82, rank: 7, keyFactors: ["Eiffel Scholarship EUR 1,181-1,400/month", "INRIA/Ecole Polytechnique world-class research", "Contrat doctoral = full employment benefits", "Low/zero tuition at public universities"], keyRisks: ["Eiffel very competitive (global competition)", "French language practically required for PhD integration"] },
      postStudyWork: { score: 84, rank: 6, keyFactors: ["Passeport Talent — 4yr visa in 4 weeks", "Mistral AI and Station F ecosystem", "INRIA and CEA research positions", "35hr work week + 25 days vacation"], keyRisks: ["French language for 70% of job market"] },
      prAcquisition: { score: 80, rank: 7, keyFactors: ["5yr → Carte de Résident", "Passeport Talent 4yr counts toward PR", "Dual citizenship ALLOWED"], keyRisks: ["French B1 mandatory"] },
      citizenship: { score: 78, rank: 8, keyFactors: ["5yr PR + process = ~10yr total", "Dual citizenship allowed", "France honors BD passport holders"], keyRisks: ["French B1 language exam", "Interview with prefect"] },
      familySettlement: { score: 82, rank: 7, keyFactors: ["Generous family policy (Europe's highest birth rate)", "Free childcare from age 3 (crèche)", "Family quotient reduces tax burden significantly"], keyRisks: ["French language for children's integration", "Paris rent is high for families"] },
      longTerm20to30Years: { score: 82, rank: 7, keyFactors: ["EU nuclear power stability", "France 2030 AI investment", "Aerospace AI world leader (Airbus)", "Dual citizenship = BD roots maintained"], keyRisks: ["Political instability (RN rise)", "Language investment required permanently"] }
    },
    dimensionScores: { admissionFeasibility: 78, scholarshipFunding: 78, researchQuality: 88, jobMarketStrength: 80, salaryPotential: 75, prPathway: 80, citizenshipAccess: 78, familyRights: 85, costOfLiving: 70, housingAvailability: 60, languageBarrier: 35, stabilityScore: 78, aiEcosystemScore: 88, futureProofScore: 82 },
    bangladeshiSpecificFactors: { communityPresence: "LARGE — approximately 100,000 BD nationals in France; significant community in Paris (La Chapelle, Saint-Denis)", halalFoodAccess: "EXCELLENT — Paris has world-class halal food options", islamicFacilities: "GOOD — France's largest Muslim population in Europe; many mosques though mosque-state relations complex", dtaaWithBangladesh: true, successProbability: "MEDIUM-HIGH for Eiffel Scholarship if nominated by French institution; HIGH for direct PhD admission at INRIA" },
    strategicNote: "France is Europe's most exciting AI destination in 2026. Mistral AI's valuation at EUR 6B puts France on the global AI map. The Passeport Talent is the easiest skilled worker path in EU — your employer can process it in 4 weeks. France honors dual citizenship. BD community in Paris is established. CRITICAL INVESTMENT: Enroll at Alliance Française Dhaka 18 months before departure. French B1 transforms your France experience from 'international worker' to 'integrated professional' — this single investment adds 10 years to your effective earning potential in France.",
    notRecommendedFor: "Students absolutely unwilling to invest in French language learning"
  },
  {
    country: "United Arab Emirates", countryCode: "AE",
    overallBalancedScore: 75, overallRank: 8, confidenceScore: 90,
    evidenceSummary: "MBZUAI is the world's most generous AI scholarship. G42 and Falcon LLM are world-class. 100% tax-free salaries. Largest BD community outside Bangladesh. CRITICAL: No PR, no citizenship. Extreme climate risk. Use UAE as 5-10yr wealth accumulation phase.",
    phaseScores: {
      studyPhase: { score: 95, rank: 1, keyFactors: ["MBZUAI — all students 100% funded (AED 9,300/month + housing)", "World-class AI faculty from MIT/Stanford/CMU", "G42 industry access — Falcon LLM, genomics AI", "Abu Dhabi government commitment permanent"], keyRisks: ["Limited to AI field only (appropriate for target users)", "Desert climate — extreme heat summers"] },
      postStudyWork: { score: 88, rank: 4, keyFactors: ["Employer arranges visa — near-zero friction", "G42, MBZUAI, Microsoft UAE hiring pipeline", "Tax-free AED 18,000-35,000/month salary", "Largest BD community — cultural comfort"], keyRisks: ["Visa tied to employer — if fired, 60 days to leave", "Golden Visa required for job-independent security"] },
      prAcquisition: { score: 10, rank: 20, keyFactors: ["Golden Visa (10yr) — AED 30k salary threshold achievable"], keyRisks: ["NOT traditional PR", "No path to citizenship — EVER", "HIV positive = deportation under UAE law"] },
      citizenship: { score: 2, rank: 20, keyFactors: [], keyRisks: ["UAE citizenship does not exist for non-Arabs regardless of years of residence", "Zero pathway — constitutional law"] },
      familySettlement: { score: 72, rank: 12, keyFactors: ["Spouse can be on your dependent visa", "International schools available", "BD community for cultural support"], keyRisks: ["International schools cost AED 50,000-120,000/year", "No healthcare subsidy (employer covers or private)", "No social safety net if unemployed"] },
      longTerm20to30Years: { score: 45, rank: 18, keyFactors: ["Wealth accumulation is unmatched", "Using UAE savings as PR destination capital"], keyRisks: ["Extreme heat making outdoors unlivable by 2040", "Geopolitical Middle East risk", "No citizenship means permanent vulnerability"] }
    },
    dimensionScores: { admissionFeasibility: 85, scholarshipFunding: 98, researchQuality: 88, jobMarketStrength: 88, salaryPotential: 95, prPathway: 10, citizenshipAccess: 2, familyRights: 62, costOfLiving: 50, housingAvailability: 45, languageBarrier: 95, stabilityScore: 72, aiEcosystemScore: 90, futureProofScore: 45 },
    bangladeshiSpecificFactors: { communityPresence: "VERY LARGE — approximately 1.5M BD nationals; largest BD diaspora outside Bangladesh; Deira (Dubai) is effectively a BD neighborhood", halalFoodAccess: "EXCELLENT — entire food system is halal-certified; no dietary concerns whatsoever", islamicFacilities: "EXCELLENT — Friday is weekend; mosques everywhere; full religious freedom for Muslims", dtaaWithBangladesh: true, successProbability: "HIGH for MBZUAI scholarship; VERY HIGH for employment (BD passport well-recognized in UAE)" },
    strategicNote: "UAE is the GradPlanner PHASE 1 accelerator — not the final destination. MBZUAI is objectively the best scholarship available to BD CS/AI students in terms of funding generosity vs admission difficulty. AED 9,300/month tax-free = USD 2,530/month with zero deductions. Use UAE years to: (1) Build world-class AI credentials at MBZUAI/G42, (2) Accumulate AED 500k-1M in savings, (3) Apply for Golden Visa for stability, (4) At Year 5-8, move to Canada/Ireland/Germany with your savings and MBZUAI credential and secure PR within 2 years.",
    notRecommendedFor: "Students who need permanent settlement, citizenship, or government-backed social safety net"
  }
];

rfUpgrades.forEach(upgrade => {
  const idx = rfData.countryRankings.findIndex(r => r.country === upgrade.country);
  if (idx !== -1) {
    rfData.countryRankings[idx] = upgrade;
  } else {
    rfData.countryRankings.push(upgrade);
  }
});

fs.writeFileSync(rfPath, JSON.stringify(rfData, null, 2));
console.log('ranking-factors.json: All 6 countries upgraded!');
