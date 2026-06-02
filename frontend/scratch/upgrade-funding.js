const fs = require('fs');
const filePath = 'e:/PROJECT/GradPlanner/frontend/public/countries/funding-opportunities.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const upgrades = [
  {
    country: "Austria",
    countryCode: "AT",
    overallFundingScore: 72,
    fundingAvailability: "Good for PhD; Limited for MSc",
    mscFundingChance: 25,
    phdFundingChance: 78,
    governmentScholarships: [
      { name: "OeAD Government Scholarship", amount: "EUR 1,030/month + tuition waiver", eligibility: "PhD and postdoc; partner country agreements", applicationDeadline: "March annually", competitiveness: "High", bangladeshiSuccess: "Low — BD not primary target country; German language proficiency expected" },
      { name: "Ernst Mach Grant", amount: "EUR 1,200/month for 1-9 months", eligibility: "Research stays; PhD researchers", applicationDeadline: "February", competitiveness: "High", bangladeshiSuccess: "Low-Medium" }
    ],
    universityFunding: {
      availability: "Good for PhD (employment model)",
      typicalPackage: { phd: "EUR 2,200-2,800/month (TV-L 13 equivalent, 75% employment)", msc: "Rarely funded; occasional tuition waivers" },
      fundingSources: ["FWF (Austrian Science Fund) project contracts", "University fellowships", "Industry-university collaboration"],
      topFundedUniversities: ["TU Wien (AI/ML)", "TU Graz", "University of Vienna", "JKU Linz"],
      fundingNote: "Austrian PhD contracts are employment-based (similar to Germany) — you are an employee with full social security, pension, and healthcare. This is a major advantage over self-funded models."
    },
    externalFellowships: [
      { name: "DAAD Scholarship (Germany) → Austria crossover", amount: "EUR 861-1,200/month", eligibility: "Research at Austrian-German collaborative labs", competitiveness: "High", applicationWindow: "October-November" },
      { name: "Marie Curie Fellowship (EU Horizon)", amount: "EUR 4,411/month living + mobility + family allowances", eligibility: "Postdoctoral researcher; any nationality", competitiveness: "Very High (15% success rate)", applicationWindow: "September annual call" }
    ],
    livingStipendAdequacy: "Adequate — EUR 2,200/month covers Vienna living costs comfortably",
    averageMonthlyStipend: "EUR 2,200-2,800",
    averageMonthlyCost: "EUR 1,200-1,600",
    selfFundingCost: { mscTotal: "EUR 35,000-50,000 (2 years)", phdTotal: "Rarely needed — employment model" },
    workWhileStudying: "Allowed up to 20 hrs/week for non-EU students; full work rights as PhD employee",
    realisticStrategy: "Apply for TU Wien or TU Graz PhD with FWF-funded project supervisor. Austrian PhD = employment contract = no financial stress. For MSc, plan self-funding or target Germany (DAAD) first and transfer.",
    confidenceScore: 85
  },
  {
    country: "Belgium",
    countryCode: "BE",
    overallFundingScore: 78,
    fundingAvailability: "Very good for PhD (tax-advantaged); limited MSc",
    mscFundingChance: 20,
    phdFundingChance: 82,
    governmentScholarships: [
      { name: "VLIR-UOS Scholarship (Flemish universities)", amount: "EUR 1,200/month + tuition + travel + insurance", eligibility: "Students from 31 development countries including Bangladesh", applicationDeadline: "February 1 annually", competitiveness: "High", bangladeshiSuccess: "Medium — Bangladesh is explicitly listed as partner country; ~50 scholarships/year across all programs" },
      { name: "Belgian Federal Science Policy (Belspo)", amount: "EUR 2,500/month for research positions", eligibility: "PhD researchers in science and technology", applicationDeadline: "Rolling (project-based)", competitiveness: "Medium", bangladeshiSuccess: "Medium — requires Belgian research partner" }
    ],
    universityFunding: {
      availability: "Excellent for PhD — unique tax status",
      typicalPackage: { phd: "EUR 2,100-2,500/month (gross) with exceptional tax treatment — PhD scholarships are often 100% tax-exempt in Belgium", msc: "VLIR-UOS is primary MSc funding; internal waivers rare" },
      fundingSources: ["FWO (Flanders Fund for Scientific Research)", "FNRS (French-speaking Fund)", "ERC grants (EU)", "Industrial PhDs (sandwich with company)"],
      topFundedUniversities: ["KU Leuven (IMEC affiliation)", "Ghent University", "UCLouvain", "Vrije Universiteit Brussel"],
      fundingNote: "CRITICAL: Belgian PhD scholarships are legally classified as 'educational grants' — they are 100% exempt from income tax AND social security contributions in many cases. A EUR 2,100/month scholarship in Belgium ≈ EUR 2,900/month in Germany after taxes."
    },
    externalFellowships: [
      { name: "Marie Curie Fellowship", amount: "EUR 4,411/month all-inclusive", eligibility: "Postdoc; any nationality; Belgian host institution", competitiveness: "Very High", applicationWindow: "September" },
      { name: "ERC Starting Grant (for postdocs)", amount: "Up to EUR 1.5M over 5 years", eligibility: "2-7 years post-PhD; any nationality; EU host", competitiveness: "Extremely High (10% success)", applicationWindow: "Varies" }
    ],
    livingStipendAdequacy: "Very good — tax-free EUR 2,100 goes far in Belgium",
    averageMonthlyStipend: "EUR 2,100-2,500",
    averageMonthlyCost: "EUR 1,000-1,400",
    selfFundingCost: { mscTotal: "EUR 30,000-45,000 (2 years)", phdTotal: "Rarely needed" },
    workWhileStudying: "Permitted; as PhD employee/scholar, full work rights",
    realisticStrategy: "Apply for VLIR-UOS scholarship for MSc at KU Leuven (strongly recommended — BD is partner country). Then apply for KU Leuven or UGent PhD with FWO or IMEC funding. The VLIR-UOS application opens in September; prepare by July. BD nationals have specifically been awarded VLIR-UOS consistently.",
    confidenceScore: 88
  },
  {
    country: "New Zealand",
    countryCode: "NZ",
    overallFundingScore: 58,
    fundingAvailability: "Limited — most government scholarships require previous NZ connection",
    mscFundingChance: 15,
    phdFundingChance: 62,
    governmentScholarships: [
      { name: "Manaaki New Zealand Scholarships", amount: "Full tuition + NZD 1,750/month living + insurance + airfare", eligibility: "Citizens of developing countries in Pacific/Asia; Bangladesh historically included", applicationDeadline: "March annually (country-specific)", competitiveness: "Very High", bangladeshiSuccess: "Low — NZ prioritizes Pacific Island nations; BD allocations very few (2-5/year total all fields)" },
      { name: "New Zealand Aid Programme", amount: "Partial funding for master's level", eligibility: "From development priority countries", applicationDeadline: "March", competitiveness: "High", bangladeshiSuccess: "Low" }
    ],
    universityFunding: {
      availability: "Limited — NZ universities are fee-dependent; PhD funding exists but is competitive",
      typicalPackage: { phd: "NZD 28,000-35,000/year (Doctoral Scholarship) + tuition waiver; roughly living-cost adequate only", msc: "Very rarely funded; merit scholarships typically NZD 5,000-15,000 partial tuition" },
      fundingSources: ["University Doctoral Scholarships", "Marsden Fund (RSNZ)", "Callaghan Innovation PhD Industry Fellowships"],
      topFundedUniversities: ["University of Auckland (AI)", "Victoria University of Wellington (CS)", "University of Canterbury"],
      fundingNote: "NZ PhD stipends (NZD 28,000-35,000) cover living costs minimally in Auckland but are adequate in Wellington or Christchurch. International tuition waiver is typically included — this is important as international fees are NZD 35,000+/year."
    },
    externalFellowships: [
      { name: "Commonwealth Scholarships (NZ arm)", amount: "Tuition + living allowance", eligibility: "Commonwealth citizens (Bangladesh qualifies)", competitiveness: "High", applicationWindow: "April-June" }
    ],
    livingStipendAdequacy: "Barely adequate in Auckland; adequate in Wellington/Christchurch",
    averageMonthlyStipend: "NZD 2,300-2,900",
    averageMonthlyCost: "NZD 2,000-3,500 (Auckland significantly higher)",
    selfFundingCost: { mscTotal: "NZD 85,000-110,000 (2 years — high)", phdTotal: "Covered by scholarship if admitted" },
    workWhileStudying: "20 hours/week permitted",
    realisticStrategy: "Apply for PhD with supervisor-specific funding at University of Auckland AI group or Waikato ML group. Manaaki NZ scholarship is worth applying for but success rate is very low for BD CS applicants. Self-funded MSc is expensive — target Australia instead if budget is a concern. Callaghan Innovation PhD Fellowship is excellent if you can secure an NZ industry partner.",
    confidenceScore: 78
  },
  {
    country: "Singapore",
    countryCode: "SG",
    overallFundingScore: 90,
    fundingAvailability: "Excellent — one of the world's most generous PhD funding systems",
    mscFundingChance: 35,
    phdFundingChance: 92,
    governmentScholarships: [
      { name: "SINGA (Singapore International Graduate Award)", amount: "SGD 2,200/month + tuition waiver + airfare (SGD 1,500) + settling-in allowance", eligibility: "International students for PhD at NUS, NTU, SUTD, SIT, SUSS, A*STAR", applicationDeadline: "January 1 and June 1 (two rounds)", competitiveness: "High (1,000+ candidates for ~200 awards per round)", bangladeshiSuccess: "Medium — BD applicants with strong CGPA (3.7+) and publications have been successful; engineering/CS fields prioritized" },
      { name: "NUS Research Scholarship", amount: "SGD 2,200-2,700/month + tuition waiver", eligibility: "PhD candidates admitted to NUS", applicationDeadline: "Rolling with admission", competitiveness: "Medium-High", bangladeshiSuccess: "Medium — NUS admission is the bottleneck" },
      { name: "NTU Research Scholarship", amount: "SGD 2,200/month + tuition", eligibility: "PhD at NTU; CGPA 3.5+", applicationDeadline: "Rolling", competitiveness: "Medium", bangladeshiSuccess: "Medium" }
    ],
    universityFunding: {
      availability: "Excellent — nearly all admitted PhD students are funded",
      typicalPackage: { phd: "SGD 2,200-2,700/month + tuition waiver (total value SGD 150,000+ over 4yr)", msc: "Mostly self-funded; some competitive scholarships exist; focus on PhD route" },
      fundingSources: ["A*STAR (Agency for Science, Technology and Research) project grants", "NRF (National Research Foundation) grants", "Industry research partnerships (Samsung, Google Singapore)"],
      topFundedUniversities: ["NUS (National University of Singapore — top 20 globally)", "NTU (Nanyang Technological University)", "SUTD (Singapore University of Technology and Design — MIT partnership)"],
      fundingNote: "CRITICAL: Singapore's PhD funding is among the best in Asia. SGD 2,200/month is genuinely comfortable in Singapore if living outside CBD. NUS/NTU ranking (top 20 globally) means your PhD credential is world-class. SINGA bond: 3-year work commitment in Singapore after PhD — not a penalty but a career opportunity."
    },
    externalFellowships: [
      { name: "A*STAR PhD Fellowship", amount: "SGD 3,200/month + conference travel + equipment allowance", eligibility: "Outstanding international students; research at A*STAR institutes (IMCB, IISG)", competitiveness: "Very High (500 applicants for ~30 awards)", applicationWindow: "December-January" },
      { name: "Lee Kuan Yew Scholarship (not research)", amount: "Full funding for leadership programs", eligibility: "Leadership potential; any field", competitiveness: "Extremely High", applicationWindow: "September" }
    ],
    livingStipendAdequacy: "Adequate — SGD 2,200 covers rent (SGD 800-1,200 shared, SGD 1,500-2,000 studio) and food comfortably",
    averageMonthlyStipend: "SGD 2,200-3,200",
    averageMonthlyCost: "SGD 1,800-2,800",
    selfFundingCost: { mscTotal: "SGD 60,000-90,000 (1.5yr coursework MSc)", phdTotal: "Fully funded if SINGA/NUS scholarship awarded" },
    workWhileStudying: "16 hours/week for PhD students; full-time during vacation",
    realisticStrategy: "Apply to SINGA in BOTH rounds (January and June). Simultaneously apply to NUS and NTU directly. If you have one publication and CGPA 3.7+, your chances are genuine. SINGA bond means 3 years in Singapore post-PhD — with Singapore's COMPASS and Golden Pass, this gives you a strong PR application. Target AI/ML and computer vision labs at NUS SoC (School of Computing) — Tat-Seng Chua and Harold Soh labs are world-class.",
    confidenceScore: 92
  },
  {
    country: "France",
    countryCode: "FR",
    overallFundingScore: 80,
    fundingAvailability: "Good for PhD; moderate for MSc via Eiffel",
    mscFundingChance: 30,
    phdFundingChance: 80,
    governmentScholarships: [
      { name: "Eiffel Excellence Scholarship", amount: "EUR 1,181/month (MSc) or EUR 1,400/month (PhD) + health insurance + cultural activities", eligibility: "International students under 30 (MSc) or 35 (PhD); nominated by French institution", applicationDeadline: "January 9 (institutions apply on student's behalf)", competitiveness: "Very High (500 awarded from 10,000+ applications globally)", bangladeshiSuccess: "Low-Medium — BD applicants in engineering admitted historically; requires institutional nomination first" },
      { name: "French Government Scholarship (BGF)", amount: "EUR 700-1,000/month + exemption from tuition", eligibility: "Master's or PhD; bilateral agreement countries; via Campus France BD", applicationDeadline: "March via Campus France Dhaka", competitiveness: "Medium-High", bangladeshiSuccess: "Medium — Campus France Dhaka actively promotes; 20-30 scholarships/year for BD nationals across all fields" }
    ],
    universityFunding: {
      availability: "Good for PhD — contrat doctoral system",
      typicalPackage: { phd: "EUR 2,100/month (contrat doctoral — full employment contract, 3 years, renewable) + health insurance + pension", msc: "Eiffel or BGF scholarship main routes; occasional excellence stipends at Ecole Polytechnique (EUR 1,000/month)" },
      fundingSources: ["ANR (Agence Nationale de la Recherche) projects", "ERC grants (EU)", "CIFRE (Industry-academic PhD — company pays)", "Ecole Polytechnique internal fellowships"],
      topFundedUniversities: ["Ecole Polytechnique (X)", "INRIA (research institute)", "ENS Paris", "Sorbonne (Pierre and Marie Curie)", "CentraleSupélec"],
      fundingNote: "French contrat doctoral is the most employee-friendly PhD contract in Europe — full social security, healthcare, 25 days vacation, right to strike. EUR 2,100/month after employer charges. CIFRE (industry PhD) pays EUR 2,500+ as you work with a company simultaneously — excellent for AI engineers."
    },
    externalFellowships: [
      { name: "Campus France Scholarship (BD-France)", amount: "EUR 700-1,000/month", eligibility: "BD nationals admitted to French program; via Campus France Dhaka (House 8, Rd 53, Gulshan)", competitiveness: "Medium", applicationWindow: "March-April" },
      { name: "Marie Curie MSCA Doctoral Fellowship", amount: "EUR 3,200/month + mobility + family allowances", eligibility: "Early career researcher; French host institution; any nationality", competitiveness: "High (30% success in competitive calls)", applicationWindow: "Varies by call" }
    ],
    livingStipendAdequacy: "Adequate outside Paris; tight in Paris (EUR 2,100 minus EUR 1,200 rent = EUR 900 remaining)",
    averageMonthlyStipend: "EUR 2,100-2,500",
    averageMonthlyCost: "EUR 900-1,500 (Paris higher)",
    selfFundingCost: { mscTotal: "EUR 12,000-20,000 (low tuition + living costs; most affordable EU option for MSc)", phdTotal: "Covered by contrat doctoral" },
    workWhileStudying: "60 hours/month maximum as PhD contractor; MSc students up to 964 hours/year",
    realisticStrategy: "Step 1: Contact Campus France Dhaka (Gulshan) — they are the gateway to French scholarships and have a dedicated office. Step 2: Apply to BGF scholarship (March) simultaneously with university applications. Step 3: For PhD, write to INRIA or Ecole Polytechnique professors directly about ANR-funded PhD positions — many are advertised in English. CIFRE is the elite path: get a French company (Thales, Airbus, Mistral AI) to co-fund your PhD.",
    confidenceScore: 88
  },
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    overallFundingScore: 95,
    fundingAvailability: "Exceptional — MBZUAI is one of the world's most generous AI scholarships globally",
    mscFundingChance: 85,
    phdFundingChance: 92,
    governmentScholarships: [
      { name: "MBZUAI Full Scholarship (MSc)", amount: "Full tuition (AED 100,000+) + AED 9,300/month living stipend + health insurance + furnished housing + return airfare", eligibility: "BSc in CS/AI/Math/Engineering; IELTS 6.5+; CGPA 3.5+ recommended; no GRE required", applicationDeadline: "February 28 (primary) and May 31 (secondary round)", competitiveness: "High but not extreme — 500-700 MSc applicants for ~100-150 seats; BD acceptance rate medium-high given strong CS reputation", bangladeshiSuccess: "Good — BUET, AUST, IUT, Dhaka University graduates have been admitted; publication helps but not required" },
      { name: "MBZUAI Full Scholarship (PhD)", amount: "Full tuition + AED 11,000/month + housing + health + airfare", eligibility: "MSc degree in relevant field; research proposal; strong academic record", applicationDeadline: "December and March rounds", competitiveness: "High", bangladeshiSuccess: "Medium — requires prior MSc from strong institution or MBZUAI MSc itself" }
    ],
    universityFunding: {
      availability: "Exceptional — MBZUAI funds ALL admitted students as a policy",
      typicalPackage: { phd: "AED 11,000/month + tuition waiver + furnished housing; approximately USD 3,000/month take-home", msc: "AED 9,300/month + tuition waiver + furnished housing; approximately USD 2,530/month take-home" },
      fundingSources: ["UAE Government (Abu Dhabi Department of Education and Knowledge)", "G42 industry partnership research grants", "Mohamed bin Zayed Foundation"],
      topFundedUniversities: ["MBZUAI (Mohamed bin Zayed University of Artificial Intelligence)", "Khalifa University", "American University of Sharjah (partial)"],
      fundingNote: "MBZUAI is the world's first fully AI-focused university and ALL students are fully funded. This is NOT a scholarship you apply for separately — admission = full funding. Tax-free stipend of AED 9,300/month = approximately USD 2,530/month with zero deductions. Furnished housing is provided or housing allowance given. Effectively, you receive USD 30,000+ per year while studying in a world-class AI program."
    },
    externalFellowships: [
      { name: "G42 PhD Fellowship", amount: "AED 15,000/month + research budget + NVIDIA GPU cluster access", eligibility: "PhD candidates working on G42-relevant research (LLMs, genomics AI, smart cities)", competitiveness: "High", applicationWindow: "Rolling — contact G42 Research directly" },
      { name: "Technology Innovation Institute (TII) Fellowship", amount: "AED 12,000/month + publication bonuses", eligibility: "Postdoctoral researchers in AI, quantum, autonomous systems", competitiveness: "High", applicationWindow: "Rolling" }
    ],
    livingStipendAdequacy: "Very good — AED 9,300/month in Abu Dhabi allows comfortable living with savings",
    averageMonthlyStipend: "AED 9,300-11,000",
    averageMonthlyCost: "AED 4,000-7,000 (housing often provided)",
    selfFundingCost: { mscTotal: "N/A — all admitted students are funded", phdTotal: "N/A — all admitted students are funded" },
    workWhileStudying: "On-campus research and TA roles encouraged; off-campus requires additional permit",
    realisticStrategy: "Apply to MBZUAI as your TOP PRIORITY. This is the single best scholarship available to Bangladeshi CS/AI graduates globally in terms of funding generosity and admission competitiveness ratio. PREPARATION: (1) IELTS 7.0 target, (2) Contact MBZUAI faculty whose research matches your interest (email in English, reference their specific papers), (3) Two recommendation letters — one from your university professor, one from an industry supervisor if possible. Apply in the February round for September intake. If rejected, apply in the May round for January intake.",
    confidenceScore: 95
  }
];

upgrades.forEach(upgrade => {
  const idx = data.fundingOpportunities.findIndex(f => f.country === upgrade.country);
  if (idx !== -1) {
    data.fundingOpportunities[idx] = upgrade;
  } else {
    data.fundingOpportunities.push(upgrade);
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('funding-opportunities.json: All 6 countries upgraded!');
