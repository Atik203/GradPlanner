const fs = require('fs');
const filePath = 'e:/PROJECT/GradPlanner/frontend/public/countries/job-market.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const upgrades = [
  {
    country: "Switzerland",
    countryCode: "CH",
    overallJobMarketScore: 92,
    demandLevel: "Very High",
    demandTrend: "Strong and growing — highest AI salaries in Europe",
    marketSaturation: "Low",
    averageTimeToJob: "3-6 months",
    averageTimeToJobDays: 120,
    jobOpeningsAnnual: 15000,
    aiMlSpecificOpenings: 4500,
    competitionLevel: 72,
    jobSecurityScore: 88,
    startupEcosystemScore: 82,
    researchPositionsScore: 98,
    remoteWorkCulture: 78,
    workLifeBalanceScore: 85,
    careerProgressionScore: 90,
    majorHubs: ["Zurich", "Geneva", "Basel", "Lausanne"],
    topEmployers: ["Google (Zurich — largest outside US)", "Microsoft Research", "IBM Research Zurich", "UBS AI Lab", "Credit Suisse Tech", "Novartis AI", "Roche Informatics", "CERN", "ABB Robotics", "Nestlé Digital Hub"],
    emergingCompanies: ["Beekeeper", "Yokoy", "Climeworks", "GetYourGuide", "Ava"],
    skillsInDemand: ["Large-scale ML systems (Google Zurich style)", "Quantitative ML (FinTech)", "Drug discovery AI", "Robotics control", "Privacy-preserving ML (EU AI Act compliance)", "High-performance computing"],
    industriesHiring: [
      { sector: "Big Tech Research", demandScore: 98, salaryRange: "CHF 150,000-250,000+/year", note: "Google Zurich has 5,000+ engineers — top research lab outside US headquarters; Brain team here" },
      { sector: "Banking & FinTech AI", demandScore: 90, salaryRange: "CHF 130,000-200,000/year", note: "UBS, Credit Suisse successor, Julius Baer — algorithmic trading, risk ML, fraud detection" },
      { sector: "Pharma & Life Sciences AI", demandScore: 88, salaryRange: "CHF 120,000-180,000/year", note: "Novartis, Roche, Lonza — drug discovery AI, clinical trial optimization; Basel is pharma capital" },
      { sector: "Robotics & Industrial AI", demandScore: 85, salaryRange: "CHF 115,000-175,000/year", note: "ABB (world's #1 industrial robotics) HQ in Zurich; control systems AI, digital twin" },
      { sector: "International Organizations", demandScore: 80, salaryRange: "CHF 110,000-160,000 + UN benefits", note: "CERN, WHO, WEF, UN Geneva — data science, AI ethics, computational research" }
    ],
    entryLevelReality: { easiestEntry: "Google Zurich (largest hiring pipeline; actively recruiting EU PhD graduates)", hardestEntry: "Quant roles at private banks (HEC/ETH only practically)", sweetSpot: "ETH Zurich / EPFL PhD → Google/IBM Research postdoc → industry", bangladeshiPresence: "Very small; Zurich is cosmopolitan; English in tech is standard", biasLevel: "Low professionally; Swiss rental market has documented discrimination against non-European names" },
    visaSponsorshipReality: { willingnessScore: 72, pospWpgpAdvantage: "6 months job seeker; BUT quota system (Kontingent) limits non-EU work permits; employer must prove no EU/Swiss candidate available", studyPermitToPgwpSuccess: 78, sponsorshipCost: "High (legal fees, quota application)", note: "CRITICAL RISK: Even with a job offer, your canton's non-EU quota may be exhausted — permit denied. Google/IBM have enough political weight to navigate this; smaller companies struggle." },
    salaryExpectations: { phdEntryLevel: "CHF 130,000-170,000/year", mscEntryLevel: "CHF 100,000-135,000/year", midLevel3to5yrs: "CHF 150,000-200,000/year", seniorLevel: "CHF 200,000-350,000+/year", totalCompNote: "Highest base salaries globally after USA; ZERO income tax for first years if on lump-sum taxation; 2nd pillar pension accumulation is significant" },
    geographicVariation: {
      zurich: { jobDensity: 95, avgSalary: "CHF 145,000", costOfLivingIndex: 100, netBenefit: "Google, UBS, ABB — most tech jobs; rent CHF 3,000-5,000/month 1BR; highest cost city in world" },
      geneva: { jobDensity: 78, avgSalary: "CHF 140,000", costOfLivingIndex: 98, netBenefit: "UN/International orgs, pharma; CERN nearby; also very expensive" },
      basel: { jobDensity: 72, avgSalary: "CHF 130,000", costOfLivingIndex: 88, netBenefit: "Pharma capital (Novartis, Roche); more affordable; tri-national area (CH/DE/FR)" },
      lausanne: { jobDensity: 68, avgSalary: "CHF 125,000", costOfLivingIndex: 92, netBenefit: "EPFL hub; startup ecosystem; French-speaking; slightly lower cost" }
    },
    workCulture: { averageHoursPerWeek: 42, vacationDays: 20, sickLeaveDays: "Employer covered; no statutory unlimited sick leave", parentalLeaveWeeks: 14, workFromHomeAcceptance: 78, diversityScore: 88, burnoutRisk: "Medium-High", culturalFit: "Precise, punctual, quality-obsessed; four national languages internally; English dominant in tech" },
    careerGrowth: { pathToSenior: "4-6 years", pathToStaffPrincipal: "8-12 years", managementOpportunities: 82, technicalLadder: "Strongest in Europe at Google/IBM/ETH spin-outs", entrepreneurshipSupport: 85, note: "ETH Zurich spinout ecosystem produced 500+ companies; Innosuisse grants; world-class venture scene" },
    foreignCredentialRecognition: { canadianMasterScore: 85, topUsPhd: 95, topEuPhd: 92, bangladeshUndergrad: 62, note: "ETH/EPFL degree = global top 10 credential; US PhD highly respected; employer cares most about output/publications" },
    layoffRisk2027to2029: { riskScore: 42, trend: "Stable at Big Tech; banking sector restructuring ongoing; pharma AI investment structural", protection: "Swiss employment law is relatively employer-friendly vs EU; however severance packages generous in practice" },
    prPathwayIntegration: { jobRequiredForPr: true, skillClassEligibility: 85, crsPointsFromJob: "N/A", provinceNominationBoost: "N/A", note: "10 years legal residence for C-permit (PR). WARNING: even with a tech job, you remain on quota-based B-permit for years. PR is not guaranteed and community can vote against your naturalization." },
    longTermOutlook: { outlook2030: "Exceptional — Switzerland AI investment growing; Google Zurich expanding; pharma AI structural", outlook2040: "Strong — wealth, stability, political neutrality; demographic need for immigrants", riskFactors: "10yr PR wait; cantonal naturalization voting system; quota work permit system; extremely high COL" },
    strategicAdvice: "Switzerland offers the highest AI salaries in Europe, world-class research at ETH/EPFL/Google Zurich, and extraordinary quality of life. STRATEGY: Target ETH Zurich or EPFL for PhD (free, fully paid), then join Google Zurich as research scientist. This is the elite academic-to-industry pipeline. DO NOT plan to stay permanently unless at a major employer with resources to navigate the quota/permit system.",
    confidenceScore: 91,
    dataQuality: "High"
  },
  {
    country: "Austria",
    countryCode: "AT",
    overallJobMarketScore: 72,
    demandLevel: "Moderate-High",
    demandTrend: "Growing — small but efficient tech ecosystem",
    marketSaturation: "Medium",
    averageTimeToJob: "3-5 months",
    averageTimeToJobDays: 110,
    jobOpeningsAnnual: 8000,
    aiMlSpecificOpenings: 2000,
    competitionLevel: 60,
    jobSecurityScore: 85,
    startupEcosystemScore: 75,
    researchPositionsScore: 78,
    remoteWorkCulture: 75,
    workLifeBalanceScore: 88,
    careerProgressionScore: 72,
    majorHubs: ["Vienna", "Graz", "Linz"],
    topEmployers: ["Red Bull (AI/digital)", "A1 Telekom", "Erste Group (FinTech AI)", "Raiffeisen Digital", "Kapsch", "AIT (Austrian Institute of Technology)", "AVL (automotive AI)", "Frequentis", "Spar Tech"],
    emergingCompanies: ["Bitpanda", "Shpock", "Runtastic", "Anyline", "Mostly AI"],
    skillsInDemand: ["Computer Vision (Anyline — document scanning AI)", "FinTech AI (Erste/Raiffeisen)", "Automotive embedded AI (AVL)", "Synthetic data generation (Mostly AI)", "Telecom AI (A1)"],
    industriesHiring: [
      { sector: "Financial Services AI", demandScore: 85, salaryRange: "EUR 55,000-90,000", note: "Erste Bank, Raiffeisen — Central and Eastern Europe's largest banks; heavy AI investment in fraud/credit" },
      { sector: "Automotive & Mobility", demandScore: 82, salaryRange: "EUR 55,000-88,000", note: "AVL (engine/battery AI), Kapsch (traffic systems); Austria has strong automotive supply chain" },
      { sector: "Telecom AI", demandScore: 75, salaryRange: "EUR 50,000-80,000", note: "A1 Telekom; network optimization, churn prediction, customer AI" },
      { sector: "Synthetic Data & Privacy AI", demandScore: 80, salaryRange: "EUR 55,000-90,000", note: "Mostly AI (world-leading synthetic data company, Vienna HQ) — rapidly growing sector" },
      { sector: "Research Institutes", demandScore: 78, salaryRange: "EUR 50,000-80,000", note: "AIT (Austrian Institute of Technology) — government-funded applied AI; very stable employment" }
    ],
    entryLevelReality: { easiestEntry: "AIT research positions, A1 Telekom graduate programs", hardestEntry: "Mostly AI/Bitpanda — competitive even for Vienna market", sweetSpot: "Vienna fintech or synthetic data startups — English-friendly", bangladeshiPresence: "Small; South Asian community in Vienna (approx 15,000); halal food available", biasLevel: "Medium — German language strongly favored; right-wing political shifts create some tension" },
    visaSponsorshipReality: { willingnessScore: 78, pospWpgpAdvantage: "Red-White-Red Card (RWR) is Austria's skilled migration visa — straightforward for tech roles", studyPermitToPgwpSuccess: 82, sponsorshipCost: "Low-Medium", note: "RWR Card requires minimum EUR 2,352/month salary (easy in tech); processing 4-8 weeks via AMS" },
    salaryExpectations: { phdEntryLevel: "EUR 55,000-75,000/year", mscEntryLevel: "EUR 42,000-62,000/year", midLevel3to5yrs: "EUR 65,000-85,000/year", seniorLevel: "EUR 85,000-120,000/year", totalCompNote: "14th salary (holiday and Christmas bonus = 2 extra months) is standard — effectively 14 monthly payments per year" },
    geographicVariation: {
      vienna: { jobDensity: 90, avgSalary: "EUR 56,000", costOfLivingIndex: 82, netBenefit: "90%+ of Austrian tech jobs; excellent public transit; rent EUR 1,200-1,800 1BR — manageable" },
      graz: { jobDensity: 60, avgSalary: "EUR 50,000", costOfLivingIndex: 70, netBenefit: "TU Graz (strong AI dept), AVL HQ; affordable; underrated tech city" },
      linz: { jobDensity: 45, avgSalary: "EUR 48,000", costOfLivingIndex: 68, netBenefit: "Manufacturing tech (Voestalpine AI); affordable; smaller but stable" }
    },
    workCulture: { averageHoursPerWeek: 38.5, vacationDays: 25, sickLeaveDays: "6 weeks fully paid (employer), then government benefits", parentalLeaveWeeks: 52, workFromHomeAcceptance: 78, diversityScore: 72, burnoutRisk: "Low-Medium", culturalFit: "Formal professional culture; titles matter; coffee house culture is the social institution; German essential" },
    careerGrowth: { pathToSenior: "4-6 years", pathToStaffPrincipal: "10-14 years", managementOpportunities: 68, technicalLadder: "Developing; less mature than Germany", entrepreneurshipSupport: 78, note: "Vienna startup ecosystem growing (Bitpanda, Mostly AI); Austria Wirtschaftsservice (AWS) provides startup grants" },
    foreignCredentialRecognition: { canadianMasterScore: 82, topUsPhd: 88, topEuPhd: 88, bangladeshUndergrad: 58, note: "TU Wien/TU Graz degrees respected in German-speaking market; NARIC Austria for credential recognition" },
    layoffRisk2027to2029: { riskScore: 38, trend: "Very stable; Austrian employment law heavily protects workers; layoffs legally difficult and expensive", protection: "Abfertigung Neu (severance fund) — employer contributes 1.53% salary monthly; accrues as your portable pension" },
    prPathwayIntegration: { jobRequiredForPr: true, skillClassEligibility: 82, crsPointsFromJob: "N/A", provinceNominationBoost: "N/A", note: "10 years for standard PR. Red-White-Red Card Plus after 2yr → 5yr → settlement permit. Faster for highly qualified but still 5-6 years minimum." },
    longTermOutlook: { outlook2030: "Moderate — small market but stable; EU Blue Card option for Germany transition", outlook2040: "Stable — Austria benefits from Central European gateway role; demographics favor immigrants", riskFactors: "Right-wing FPÖ political risk to immigration policy; German language mandatory; 10yr PR wait" },
    strategicAdvice: "Austria is Germany's quieter sibling — similar language requirement but less competition and faster visa process. Vienna is a genuinely beautiful city with high quality of life. STRATEGY: Use Austria as an entry point into the German-speaking tech market if Germany visa wait times are prohibitive. The RWR Card is far faster than German visa queues. Learn German — no alternative.",
    confidenceScore: 84,
    dataQuality: "High"
  },
  {
    country: "Belgium",
    countryCode: "BE",
    overallJobMarketScore: 78,
    demandLevel: "High",
    demandTrend: "Strong — EU institutions, semiconductor, and FinTech",
    marketSaturation: "Medium",
    averageTimeToJob: "2-4 months",
    averageTimeToJobDays: 90,
    jobOpeningsAnnual: 12000,
    aiMlSpecificOpenings: 3500,
    competitionLevel: 65,
    jobSecurityScore: 88,
    startupEcosystemScore: 78,
    researchPositionsScore: 82,
    remoteWorkCulture: 85,
    workLifeBalanceScore: 88,
    careerProgressionScore: 80,
    majorHubs: ["Brussels", "Antwerp", "Ghent", "Leuven"],
    topEmployers: ["IMEC (world's largest semiconductor research center)", "Google Belgium", "Microsoft Belgium", "Proximus (telecom AI)", "ING Belgium (FinTech AI)", "Solvay (materials AI)", "UCB (pharma AI)", "Audi Brussels", "NATO (data science roles)"],
    emergingCompanies: ["Cowboy (e-bike AI)", "Odoo (ERP AI)", "Showpad", "Teamleader", "Silverfin"],
    skillsInDemand: ["Semiconductor process AI (IMEC)", "FinTech ML (ING)", "NLP multilingual (FR/NL/DE/EN)", "Computer Vision industrial", "EU AI Act compliance architecture", "Chip design automation"],
    industriesHiring: [
      { sector: "Semiconductors & Chip AI", demandScore: 95, salaryRange: "EUR 65,000-120,000", note: "IMEC (Leuven) is world's most cited semiconductor research institute — AI for chip design, lithography optimization; ASML partner" },
      { sector: "EU Institutions AI", demandScore: 88, salaryRange: "EUR 70,000-110,000 + EU benefits", note: "European Commission, European Parliament, NATO — data science, AI policy, NLP; competitive but stable" },
      { sector: "FinTech & Banking", demandScore: 85, salaryRange: "EUR 60,000-100,000", note: "ING Group, KBC, Belfius — credit risk AI, anti-money laundering ML, wealth management automation" },
      { sector: "Pharma & Chemical AI", demandScore: 82, salaryRange: "EUR 62,000-100,000", note: "UCB, Solvay, Janssen (J&J) — drug discovery AI, molecular simulation ML" },
      { sector: "Software & SaaS", demandScore: 80, salaryRange: "EUR 55,000-90,000", note: "Odoo (world's most popular open-source ERP), Showpad — Belgium has surprisingly strong SaaS cluster" }
    ],
    entryLevelReality: { easiestEntry: "Odoo (large international team, English-first), IMEC research positions, EU institution consultants", hardestEntry: "EU permanent staff positions (A-grade: requires EU citizenship)", sweetSpot: "IMEC spin-out startup or FinTech in Brussels with international team", bangladeshiPresence: "Moderate; established South Asian community in Brussels and Antwerp", biasLevel: "Low in Brussels (highly international); medium in Flanders (Dutch-language preference)" },
    visaSponsorshipReality: { willingnessScore: 82, pospWpgpAdvantage: "Single Permit (combined work + residence) — straightforward for tech; employer must apply", studyPermitToPgwpSuccess: 85, sponsorshipCost: "Low", note: "Highly Qualified Worker permit: salary > EUR 45,144 — easily met in tech. EU Blue Card Belgium also available." },
    salaryExpectations: { phdEntryLevel: "EUR 65,000-90,000/year", mscEntryLevel: "EUR 50,000-72,000/year", midLevel3to5yrs: "EUR 75,000-100,000/year", seniorLevel: "EUR 100,000-145,000/year", totalCompNote: "Gross salary heavily taxed (50%+) BUT take-home is mitigated by company car, meal vouchers, eco-cheques, and group insurance — total compensation is competitive" },
    geographicVariation: {
      brussels: { jobDensity: 88, avgSalary: "EUR 68,000 gross", costOfLivingIndex: 80, netBenefit: "EU institutions, Big Tech, FinTech; most international city; English widely used; rent EUR 1,100-1,800 1BR" },
      leuven: { jobDensity: 78, avgSalary: "EUR 65,000 gross", costOfLivingIndex: 72, netBenefit: "IMEC HQ, KU Leuven — semiconductor and research; 30 min from Brussels; university town vibe" },
      ghent: { jobDensity: 65, avgSalary: "EUR 60,000 gross", costOfLivingIndex: 70, netBenefit: "Growing tech hub; Odoo offices; Ghent university; affordable and beautiful" },
      antwerp: { jobDensity: 68, avgSalary: "EUR 62,000 gross", costOfLivingIndex: 74, netBenefit: "Logistics AI (port of Antwerp), diamond-tech; Dutch-speaking predominantly" }
    },
    workCulture: { averageHoursPerWeek: 38, vacationDays: 20, sickLeaveDays: "First month full pay (employer); then INAMI covers 60-75%", parentalLeaveWeeks: 15, workFromHomeAcceptance: 88, diversityScore: 88, burnoutRisk: "Low-Medium", culturalFit: "Pragmatic; split culture (French vs Flemish); Brussels is anglophone in tech; excellent food and beer culture" },
    careerGrowth: { pathToSenior: "4-5 years", pathToStaffPrincipal: "8-12 years", managementOpportunities: 78, technicalLadder: "Well developed at IMEC and Big Tech offices", entrepreneurshipSupport: 80, note: "Imec.istart accelerator; Flanders Innovation & Entrepreneurship; hub.brussels for startups" },
    foreignCredentialRecognition: { canadianMasterScore: 85, topUsPhd: 90, topEuPhd: 92, bangladeshUndergrad: 62, note: "KU Leuven (IMEC affiliated) degree is top-10 EU engineering credential; multilingual Belgium rewards multilingual candidates" },
    layoffRisk2027to2029: { riskScore: 35, trend: "Very stable; EU institutional employment is permanent; private sector heavily protected by law", protection: "Among strongest employment protections in EU; Collective Redundancy (CLA No.32bis) provides major severance" },
    prPathwayIntegration: { jobRequiredForPr: true, skillClassEligibility: 88, crsPointsFromJob: "N/A", provinceNominationBoost: "N/A", note: "5 years legal residence for PR. EU Blue Card after 18 months → mobility within EU. Single Permit for employment. Citizenship after 5yr PR (10yr total). Language requirement: FR or NL B1." },
    longTermOutlook: { outlook2030: "Strong — IMEC semiconductor role in EU Chips Act critical; EU AI regulation compliance creating jobs", outlook2040: "Strong — Belgium's position as EU headquarters city is permanent; geopolitical stability very high", riskFactors: "Language fragmentation (need both French and Dutch for true integration); high taxes; political instability" },
    strategicAdvice: "Belgium is severely underrated. IMEC alone makes it a world-class destination for AI/semiconductor research. EU institution careers offer unmatched job security. Brussels is the most international city in Europe — English is a de facto official language in tech. STRATEGY: Target IMEC or EU Commission AI roles. Zero competition from most Asian applicants who overlook Belgium. Capital gains tax is 0% — invest aggressively.",
    confidenceScore: 88,
    dataQuality: "High"
  },
  {
    country: "New Zealand",
    countryCode: "NZ",
    overallJobMarketScore: 62,
    demandLevel: "Moderate",
    demandTrend: "Flat — small market with brain drain to Australia",
    marketSaturation: "Medium-High",
    averageTimeToJob: "4-6 months",
    averageTimeToJobDays: 135,
    jobOpeningsAnnual: 4500,
    aiMlSpecificOpenings: 900,
    competitionLevel: 68,
    jobSecurityScore: 72,
    startupEcosystemScore: 65,
    researchPositionsScore: 70,
    remoteWorkCulture: 80,
    workLifeBalanceScore: 92,
    careerProgressionScore: 60,
    majorHubs: ["Auckland", "Wellington", "Christchurch"],
    topEmployers: ["Xero (cloud accounting AI)", "Fisher & Paykel Healthcare Tech", "Weta FX (visual effects AI)", "ANZ Bank NZ", "Westpac NZ", "NIWA (climate science)", "AgResearch", "Datacom", "Auckland University of Technology"],
    emergingCompanies: ["Partly (car insurance AI)", "Auror (retail security AI)", "Timely (booking AI)", "PocketSmith", "Vend (now Lightspeed)"],
    skillsInDemand: ["Cloud AI (Xero ecosystem)", "Computer Vision (Weta FX)", "AgriTech AI", "Climate AI (NIWA)", "Healthcare sensor ML", "NLP English-language"],
    industriesHiring: [
      { sector: "Cloud Accounting & SaaS", demandScore: 82, salaryRange: "NZD 90,000-140,000", note: "Xero is world's leading cloud accounting platform — massive ML/AI investment in automation, forecasting" },
      { sector: "Visual Effects & Film AI", demandScore: 78, salaryRange: "NZD 85,000-135,000", note: "Weta FX (Lord of the Rings heritage) — AI for VFX, generative imagery, 3D simulation; very niche but world-class" },
      { sector: "AgriTech & Climate AI", demandScore: 72, salaryRange: "NZD 75,000-120,000", note: "NZ's farming sector investing heavily in AI; NIWA climate modeling; Precision Agriculture AI unique globally" },
      { sector: "Banking & FinTech", demandScore: 75, salaryRange: "NZD 80,000-130,000", note: "ANZ, ASB, Kiwibank — fraud detection, wealth management AI; smaller scale than Australia" },
      { sector: "Healthcare & MedTech", demandScore: 72, salaryRange: "NZD 78,000-125,000", note: "Fisher & Paykel Healthcare (world-class respiratory devices), Health Alliance NZ" }
    ],
    entryLevelReality: { easiestEntry: "Xero (large international team), government research roles (NIWA, AgResearch)", hardestEntry: "Weta FX (extremely selective; requires specialist VFX background)", sweetSpot: "Auckland SaaS startup with international growth ambitions", bangladeshiPresence: "Small but established; South Asian community approximately 200,000 in NZ; Auckland has halal food", biasLevel: "Low — highly multicultural; New Zealanders (Kiwis) very welcoming" },
    visaSponsorshipReality: { willingnessScore: 75, pospWpgpAdvantage: "Post Study Work Visa: 1-3 years depending on NZ study level; pathway to Skilled Migrant Category", studyPermitToPgwpSuccess: 82, sponsorshipCost: "Low", note: "Accredited Employer Work Visa (AEWV) — employer must be INZ-accredited; tech companies generally are; processing 4-8 weeks" },
    salaryExpectations: { phdEntryLevel: "NZD 100,000-130,000/year", mscEntryLevel: "NZD 80,000-105,000/year", midLevel3to5yrs: "NZD 105,000-140,000/year", seniorLevel: "NZD 140,000-190,000/year", totalCompNote: "Salaries lower than Australia by 20-30%; however cost of living also lower outside Auckland; quality of life extremely high" },
    geographicVariation: {
      auckland: { jobDensity: 85, avgSalary: "NZD 100,000", costOfLivingIndex: 82, netBenefit: "80% of NZ tech jobs; housing crisis (1BR NZD 3,000-4,000/month in central) is severe" },
      wellington: { jobDensity: 65, avgSalary: "NZD 92,000", costOfLivingIndex: 75, netBenefit: "Government tech, Xero HQ, WCC; more manageable housing; windy but vibrant capital" },
      christchurch: { jobDensity: 45, avgSalary: "NZD 85,000", costOfLivingIndex: 65, netBenefit: "Emerging tech hub post-earthquake rebuild; most affordable major city; aerospace and AgriTech" }
    },
    workCulture: { averageHoursPerWeek: 38, vacationDays: 20, sickLeaveDays: "10 days/year (statutory)", parentalLeaveWeeks: 26, workFromHomeAcceptance: 82, diversityScore: 85, burnoutRisk: "Very Low", culturalFit: "Relaxed, flat hierarchy; no-nonsense; rugby and outdoor culture dominant; Māori culture respected and integrated" },
    careerGrowth: { pathToSenior: "4-6 years", pathToStaffPrincipal: "Difficult — market too small for many principal-level roles", managementOpportunities: 65, technicalLadder: "Limited; most senior talent moves to Australia or globally", entrepreneurshipSupport: 72, note: "Callaghan Innovation provides R&D grants; NZ Growth Grants; easy to start a company" },
    foreignCredentialRecognition: { canadianMasterScore: 82, topUsPhd: 88, topEuPhd: 82, bangladeshUndergrad: 65, note: "Auckland/Victoria/Otago degrees respected regionally; NZQA credential assessment required for overseas qualifications" },
    layoffRisk2027to2029: { riskScore: 58, trend: "Higher risk than Australian counterpart — small economy very sensitive to global tech cycles and China trade", protection: "90 days notice requirement; employment court relatively employee-friendly; no equivalent to Australian Fair Work" },
    prPathwayIntegration: { jobRequiredForPr: true, skillClassEligibility: 78, crsPointsFromJob: "N/A", provinceNominationBoost: "N/A", note: "Skilled Migrant Category (SMC) point system — 160+ points required. Tech jobs score well. PR in 1-2 years after PSW." },
    longTermOutlook: { outlook2030: "Moderate — brain drain to Australia structural; housing crisis unresolved; AgriTech AI unique niche", outlook2040: "Moderate — climate change makes NZ increasingly attractive as safe haven; tech sector growing slowly", riskFactors: "Career ceiling too low; earthquake risk; economic dependence on China and Australia" },
    strategicAdvice: "New Zealand offers an extraordinary quality of life and a genuinely welcoming, safe society. HOWEVER: it is career-limiting for CS/AI graduates. Use NZ as a 2-4 year quality-of-life destination with a clear plan to transition to Australia (Trans-Tasman agreement makes this trivial). Xero is the flagship employer. If you want AgriTech or climate AI, NZ is world-class and unique. Otherwise, treat it as a beautiful stepping stone to Australian PR.",
    confidenceScore: 85,
    dataQuality: "High"
  }
];

upgrades.forEach(upgrade => {
  const idx = data.jobMarkets.findIndex(j => j.country === upgrade.country);
  if (idx !== -1) {
    data.jobMarkets[idx] = upgrade;
  } else {
    data.jobMarkets.push(upgrade);
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('job-market.json: Switzerland, Austria, Belgium, New Zealand upgraded!');
