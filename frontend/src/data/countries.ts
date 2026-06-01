export interface HeroSection {
  title: string;
  flag: string;
  score: number;
  overallRecommendation: string;
  bestFor: string[];
  lastUpdated: string;
}

export interface EconomicOutlook {
  gdpGrowth: string;
  inflation: string;
  techMarket: string;
  majorCompanies: string[];
}

export interface CareerOutlook {
  entrySalary: string;
  midSalary: string;
  seniorSalary: string;
  jobDemandTrend: string;
  topRoles: string[];
}

export interface VisaImmigration {
  studyVisaApprovalRate: string;
  typicalProcessingTime: string;
  postStudyWorkVisa: string;
  prDifficulty: string;
  citizenshipTimeline: string;
  commonRejectionReasons: string[];
}

export interface CostAnalysis {
  tuition: string;
  livingCost: string;
  accommodation: string;
  insurance: string;
  transport: string;
  partTimeEarnings: string;
  expectedMonthlyBalance: string;
}

export interface Scholarships {
  government: string[];
  university: string[];
  external: string[];
  fundingProbability: string;
}

export interface ApplicationTimelineEvent {
  month: string;
  year: string;
  action: string;
}

export interface CountryIntelligence {
  id: string;
  slug: string;
  hero: HeroSection;
  economic: EconomicOutlook;
  career: CareerOutlook;
  visa: VisaImmigration;
  cost: CostAnalysis;
  scholarships: Scholarships;
  timeline: ApplicationTimelineEvent[];
}

export const countriesData: Record<string, CountryIntelligence> = {
  ireland: {
    id: "Ireland",
    slug: "ireland",
    hero: {
      title: "Ireland",
      flag: "🇮🇪",
      score: 5,
      overallRecommendation: "Top Choice",
      bestFor: ["CGPA 3.5+", "Research students", "Industry-focused students"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable, High GDP per capita",
      inflation: "Moderate (~3-4%)",
      techMarket: "Excellent (European Tech Hub)",
      majorCompanies: ["Google", "Meta", "Microsoft", "Amazon", "TikTok", "Intel"],
    },
    career: {
      entrySalary: "€40,000 - €50,000",
      midSalary: "€60,000 - €80,000",
      seniorSalary: "€90,000+",
      jobDemandTrend: "High Demand",
      topRoles: ["ML Engineer", "Data Scientist", "AI Engineer", "Research Engineer"],
    },
    visa: {
      studyVisaApprovalRate: "High (~90% for BD Nationals)",
      typicalProcessingTime: "4 - 8 weeks",
      postStudyWorkVisa: "2 Years (Stamp 1G for Masters)",
      prDifficulty: "Moderate (Stamp 4 pathway)",
      citizenshipTimeline: "5 Years Total",
      commonRejectionReasons: ["Insufficient Funds", "Unclear Intent to Return", "Missing Documents"],
    },
    cost: {
      tuition: "€15,000 - €25,000 / year",
      livingCost: "€12,000 - €15,000 / year",
      accommodation: "€800 - €1,200 / month (Dublin)",
      insurance: "€150 - €300 / year",
      transport: "€80 - €120 / month",
      partTimeEarnings: "€12.70 / hour (Minimum Wage)",
      expectedMonthlyBalance: "Deficit of €300 - €500 / month without full scholarship",
    },
    scholarships: {
      government: ["Government of Ireland International Education Scholarship"],
      university: ["UCD Global Excellence Scholarship", "Trinity College Dublin Scholarships"],
      external: ["Erasmus Mundus (if applicable)"],
      fundingProbability: "Moderate",
    },
    timeline: [
      { year: "2027", month: "August", action: "Research Universities & Professors" },
      { year: "2027", month: "September", action: "Start Outreach & Prepare Documents" },
      { year: "2027", month: "October", action: "Take IELTS/GRE" },
      { year: "2027", month: "November", action: "Submit Early Applications" },
      { year: "2028", month: "January", action: "Submit Regular Applications" },
      { year: "2028", month: "February", action: "Await Decisions / Apply for Scholarships" },
    ]
  },
  sweden: {
    id: "Sweden",
    slug: "sweden",
    hero: {
      title: "Sweden",
      flag: "🇸🇪",
      score: 4,
      overallRecommendation: "Excellent for Research & SI Scholarship",
      bestFor: ["Research-focused", "Sustainable Tech", "High CGPA"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable",
      inflation: "Moderate",
      techMarket: "Strong Innovation Hub",
      majorCompanies: ["Spotify", "Ericsson", "Klarna", "Volvo"],
    },
    career: {
      entrySalary: "SEK 400,000 - 500,000",
      midSalary: "SEK 550,000 - 700,000",
      seniorSalary: "SEK 800,000+",
      jobDemandTrend: "High Demand",
      topRoles: ["AI Engineer", "ML Researcher", "Data Scientist"],
    },
    visa: {
      studyVisaApprovalRate: "High",
      typicalProcessingTime: "2 - 3 months",
      postStudyWorkVisa: "1 Year",
      prDifficulty: "Hard (Requires Swedish proficiency)",
      citizenshipTimeline: "5 Years",
      commonRejectionReasons: ["Insufficient Funds", "Late Application"],
    },
    cost: {
      tuition: "SEK 140,000 - 200,000 / year",
      livingCost: "SEK 10,000 - 12,000 / month",
      accommodation: "SEK 4,000 - 6,000 / month",
      insurance: "Included if >1 year",
      transport: "SEK 600 - 900 / month",
      partTimeEarnings: "Variable",
      expectedMonthlyBalance: "Deficit",
    },
    scholarships: {
      government: ["Swedish Institute (SI) Scholarship"],
      university: ["KTH Scholarship", "Chalmers IPOET"],
      external: [],
      fundingProbability: "Highly Competitive (1-3%)",
    },
    timeline: [
      { year: "2027", month: "October", action: "Applications Open (UniversityAdmissions.se)" },
      { year: "2028", month: "January", action: "Deadline for Applications" },
      { year: "2028", month: "February", action: "Deadline for Documents & SI Scholarship" },
    ]
  },
  germany: {
    id: "Germany",
    slug: "germany",
    hero: {
      title: "Germany",
      flag: "🇩🇪",
      score: 5,
      overallRecommendation: "Top Choice for Budget & PR",
      bestFor: ["Budget-conscious", "Automotive AI", "Long-term PR"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable",
      inflation: "Low-Moderate",
      techMarket: "Massive (Industry 4.0)",
      majorCompanies: ["SAP", "Siemens", "BMW", "Bosch", "DeepL"],
    },
    career: {
      entrySalary: "€50,000 - €60,000",
      midSalary: "€70,000 - €90,000",
      seniorSalary: "€100,000+",
      jobDemandTrend: "Very High Demand",
      topRoles: ["Computer Vision Engineer", "ML Engineer", "Data Scientist"],
    },
    visa: {
      studyVisaApprovalRate: "High (if APS cleared)",
      typicalProcessingTime: "~2.5 years wait in Dhaka",
      postStudyWorkVisa: "18 Months",
      prDifficulty: "Easy (EU Blue Card route)",
      citizenshipTimeline: "3-5 Years (with German proficiency)",
      commonRejectionReasons: ["No APS Certificate", "Blocked Account Issues", "Language Failure"],
    },
    cost: {
      tuition: "Free (most public unis) or ~€1,500/semester (TUM)",
      livingCost: "€934 / month (Blocked Account)",
      accommodation: "€350 - €600 / month",
      insurance: "€120 / month",
      transport: "Semesterticket included in student fee",
      partTimeEarnings: "€12.41 / hour",
      expectedMonthlyBalance: "Manageable with part-time job (HiWi)",
    },
    scholarships: {
      government: ["DAAD"],
      university: ["Deutschlandstipendium"],
      external: ["Heinrich Böll", "Konrad-Adenauer"],
      fundingProbability: "Moderate to High",
    },
    timeline: [
      { year: "2027", month: "August", action: "Apply for APS Certificate (Crucial!)" },
      { year: "2027", month: "December", action: "Apply for Winter Semester via Uni-Assist" },
      { year: "2028", month: "April", action: "Receive Admits & Book Visa Appointment" },
    ]
  },
  australia: {
    id: "Australia",
    slug: "australia",
    hero: {
      title: "Australia",
      flag: "🇦🇺",
      score: 4,
      overallRecommendation: "Great for fast Visa & Post-Study Work",
      bestFor: ["Group of 8 targets", "Fast Processing", "Long PSW Visa"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable",
      inflation: "Moderate",
      techMarket: "Growing rapidly (Fintech, Healthtech)",
      majorCompanies: ["Atlassian", "Canva", "Google", "Amazon"],
    },
    career: {
      entrySalary: "AUD 70,000 - 90,000",
      midSalary: "AUD 100,000 - 130,000",
      seniorSalary: "AUD 150,000+",
      jobDemandTrend: "High Demand",
      topRoles: ["Data Scientist", "ML Engineer", "AI Specialist"],
    },
    visa: {
      studyVisaApprovalRate: "Very High (~94% for BD)",
      typicalProcessingTime: "2 - 6 weeks (Online)",
      postStudyWorkVisa: "4-5 Years (Subclass 485)",
      prDifficulty: "Moderate (Points-based 189/190)",
      citizenshipTimeline: "4 Years",
      commonRejectionReasons: ["GTE failure", "Financials"],
    },
    cost: {
      tuition: "AUD 35,000 - 50,000 / year",
      livingCost: "AUD 24,500 / year",
      accommodation: "AUD 800 - 1,500 / month",
      insurance: "AUD 500 - 700 / year (OSHC)",
      transport: "AUD 150 / month",
      partTimeEarnings: "AUD 23.23 / hour",
      expectedMonthlyBalance: "Deficit unless fully funded",
    },
    scholarships: {
      government: ["Australia Awards", "Destination Australia"],
      university: ["RTP (Research Training Program)"],
      external: [],
      fundingProbability: "Low for coursework, High for research",
    },
    timeline: [
      { year: "2027", month: "July", action: "Contact Supervisors (if Research)" },
      { year: "2027", month: "September", action: "Submit Applications for Feb Intake" },
      { year: "2027", month: "November", action: "Apply for Visa" },
    ]
  },
  usa: {
    id: "USA",
    slug: "usa",
    hero: {
      title: "USA",
      flag: "🇺🇸",
      score: 4,
      overallRecommendation: "Unmatched Funding & Salaries, but PR is impossible",
      bestFor: ["PhD Candidates", "TA/RA Seekers", "High Salaries"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Strong",
      inflation: "Moderate",
      techMarket: "Global Leader (Silicon Valley)",
      majorCompanies: ["OpenAI", "Google", "Meta", "Apple", "Microsoft", "Nvidia"],
    },
    career: {
      entrySalary: "$120,000 - $160,000",
      midSalary: "$180,000 - $250,000",
      seniorSalary: "$300,000+",
      jobDemandTrend: "Very High Demand",
      topRoles: ["AI Scientist", "LLM Engineer", "ML Infrastructure"],
    },
    visa: {
      studyVisaApprovalRate: "Moderate (~85% for BD, better with funding)",
      typicalProcessingTime: "Variable (Interview wait times)",
      postStudyWorkVisa: "3 Years (STEM OPT)",
      prDifficulty: "Extremely Hard (~70-90 year backlog for EB-2 BD)",
      citizenshipTimeline: "Unlikely for BD Nationals",
      commonRejectionReasons: ["214(b) Immigrant Intent", "No Funding"],
    },
    cost: {
      tuition: "Full Waiver (with TA/RA) or $30k-$60k / year",
      livingCost: "$15,000 - $25,000 / year",
      accommodation: "$800 - $1,800 / month",
      insurance: "Often covered by University",
      transport: "$100 / month",
      partTimeEarnings: "$15 - $25 / hour (On-campus only)",
      expectedMonthlyBalance: "Surplus of $500-$1000 if funded",
    },
    scholarships: {
      government: ["Fulbright"],
      university: ["TA / RA / Fellowship (Highly Common for PhD)"],
      external: [],
      fundingProbability: "Very High for PhD, Low for MS",
    },
    timeline: [
      { year: "2027", month: "August", action: "Email Professors for TA/RA" },
      { year: "2027", month: "October", action: "Take GRE/TOEFL" },
      { year: "2027", month: "December", action: "Application Deadlines (Fall 2028)" },
      { year: "2028", month: "March", action: "Decisions & Funding Offers" },
    ]
  },
  canada: {
    id: "Canada",
    slug: "canada",
    hero: {
      title: "Canada",
      flag: "🇨🇦",
      score: 5,
      overallRecommendation: "The Best Path to PR for BD Nationals",
      bestFor: ["PR Seekers", "Tech workers", "Safe Immigration"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable",
      inflation: "Moderate",
      techMarket: "Strong (Toronto, Vancouver hubs)",
      majorCompanies: ["Shopify", "Amazon", "Google", "Microsoft"],
    },
    career: {
      entrySalary: "CAD 70,000 - 90,000",
      midSalary: "CAD 100,000 - 130,000",
      seniorSalary: "CAD 150,000+",
      jobDemandTrend: "High Demand",
      topRoles: ["ML Engineer", "Data Engineer", "AI Researcher"],
    },
    visa: {
      studyVisaApprovalRate: "High via SDS Route (~78% overall)",
      typicalProcessingTime: "10-20 days (SDS), 2-3 months (Regular)",
      postStudyWorkVisa: "Up to 3 Years (PGWP)",
      prDifficulty: "Easy (Express Entry CEC)",
      citizenshipTimeline: "4-5 Years",
      commonRejectionReasons: ["Poor Financials", "Non-SDS Route", "Purpose of Visit"],
    },
    cost: {
      tuition: "CAD 15,000 - 35,000 / year",
      livingCost: "CAD 20,635 / year (GIC requirement)",
      accommodation: "CAD 800 - 1,500 / month",
      insurance: "Varies by province",
      transport: "CAD 120 / month",
      partTimeEarnings: "CAD 16.55 / hour",
      expectedMonthlyBalance: "Deficit unless funded",
    },
    scholarships: {
      government: ["Vanier CGS"],
      university: ["Internal TA/RA (OISE, Vector Institute)"],
      external: ["Mitacs"],
      fundingProbability: "Moderate (Research Masters), High (PhD)",
    },
    timeline: [
      { year: "2027", month: "September", action: "Contact Supervisors" },
      { year: "2027", month: "December", action: "Submit Applications" },
      { year: "2028", month: "March", action: "Apply for SDS Visa (Needs GIC + IELTS 6.0+)" },
    ]
  },
  "south-korea": {
    id: "South Korea",
    slug: "south-korea",
    hero: {
      title: "South Korea",
      flag: "🇰🇷",
      score: 4,
      overallRecommendation: "Excellent for Fully Funded Engineering Masters",
      bestFor: ["Hardware AI", "Full Funding Seekers", "Fast admission"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Moderate",
      inflation: "Stable",
      techMarket: "World Leader in Hardware/Semiconductors",
      majorCompanies: ["Samsung", "LG", "Hyundai", "Naver", "Kakao"],
    },
    career: {
      entrySalary: "KRW 40M - 60M",
      midSalary: "KRW 70M - 100M",
      seniorSalary: "KRW 120M+",
      jobDemandTrend: "High Demand (requires Korean)",
      topRoles: ["AI Engineer", "Robotics AI", "Data Scientist"],
    },
    visa: {
      studyVisaApprovalRate: "High",
      typicalProcessingTime: "2-4 weeks",
      postStudyWorkVisa: "D-10 (6 months, extendable)",
      prDifficulty: "Moderate (F-5 visa requires TOPIK 4+)",
      citizenshipTimeline: "5+ Years",
      commonRejectionReasons: ["Incomplete Docs", "University not accredited"],
    },
    cost: {
      tuition: "KRW 4M - 7M / semester (Often 100% waived)",
      livingCost: "KRW 1M / month",
      accommodation: "KRW 300k - 500k / month",
      insurance: "KRW 70k / month",
      transport: "KRW 60k / month",
      partTimeEarnings: "Lab Stipends usually cover living",
      expectedMonthlyBalance: "Surplus (if Lab Funded)",
    },
    scholarships: {
      government: ["Global Korea Scholarship (GKS)"],
      university: ["Professor's Research Grant (Lab Funding)"],
      external: [],
      fundingProbability: "Very High (if Professor accepts)",
    },
    timeline: [
      { year: "2027", month: "September", action: "Email Professors for Spring/Fall" },
      { year: "2027", month: "October", action: "Interviews with Labs" },
      { year: "2028", month: "May", action: "Visa Application" },
    ]
  },
  china: {
    id: "China",
    slug: "china",
    hero: {
      title: "China",
      flag: "🇨🇳",
      score: 4,
      overallRecommendation: "Best for CSC Scholarships & Free Master's",
      bestFor: ["CSC Scholarship Seekers", "Tencent/Alibaba Research", "Low cost of living"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Strong (~5%)",
      inflation: "Very Low (~1-2%)",
      techMarket: "Massive (Tencent, Alibaba, Baidu, Huawei)",
      majorCompanies: ["Tencent", "Alibaba", "Huawei", "Baidu", "ByteDance"],
    },
    career: {
      entrySalary: "CNY 150,000 - 250,000",
      midSalary: "CNY 300,000 - 500,000",
      seniorSalary: "CNY 600,000+",
      jobDemandTrend: "High for AI/ML Research",
      topRoles: ["Computer Vision Researcher", "NLP Engineer", "Robotics Scientist"],
    },
    visa: {
      studyVisaApprovalRate: "Very High (~98% with CSC Scholarship)",
      typicalProcessingTime: "1 - 3 weeks",
      postStudyWorkVisa: "1-2 Years (Requires employer sponsorship)",
      prDifficulty: "Extremely Hard (No realistic PR pathway for BD nationals)",
      citizenshipTimeline: "Virtually Impossible",
      commonRejectionReasons: ["Invalid CSC letter", "Incomplete physical exam"],
    },
    cost: {
      tuition: "Free (under CSC) or CNY 20,000 - 40,000 / year",
      livingCost: "CNY 15,000 - 30,000 / year",
      accommodation: "CNY 800 - 1,500 / month (Dorms)",
      insurance: "CNY 800 / year",
      transport: "CNY 100 - 200 / month",
      partTimeEarnings: "Illegal on study visa (Strictly prohibited)",
      expectedMonthlyBalance: "Surplus of CNY 500 - 1,000 with CSC stipend",
    },
    scholarships: {
      government: ["Chinese Government Scholarship (CSC) - Type A & B"],
      university: ["Presidential Scholarships", "Tsinghua/Peking University Scholarships"],
      external: ["Mofcom Scholarship"],
      fundingProbability: "High (CSC covers tuition, lodging, + ¥3,000/month stipend)",
    },
    timeline: [
      { year: "2027", month: "August", action: "Select target universities & contact professors for pre-admission" },
      { year: "2027", month: "November", action: "Prepare CSC portal documents & physical exam report" },
      { year: "2028", month: "January", action: "Submit CSC application on portal" },
      { year: "2028", month: "April", action: "Receive university pre-admission letter" },
    ]
  },
  japan: {
    id: "Japan",
    slug: "japan",
    hero: {
      title: "Japan",
      flag: "🇯🇵",
      score: 4,
      overallRecommendation: "Top Choice for MEXT Scholarship & Robotics/Hardware AI",
      bestFor: ["MEXT Seekers", "Robotics AI", "Hardware Co-design"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Low (~1-1.5%)",
      inflation: "Low (~2-3%)",
      techMarket: "Very Strong in Hardware & Robotics",
      majorCompanies: ["Sony", "Toyota", "SoftBank", "Fujitsu", "Rakuten"],
    },
    career: {
      entrySalary: "JPY 3,500,000 - 5,000,000",
      midSalary: "JPY 6,000,000 - 8,000,000",
      seniorSalary: "JPY 10,000,000+",
      jobDemandTrend: "High (But requires Japanese fluency)",
      topRoles: ["Robotics AI Engineer", "Embedded ML Developer", "Data Scientist"],
    },
    visa: {
      studyVisaApprovalRate: "Very High (~96% for BD Nationals)",
      typicalProcessingTime: "4 - 8 weeks",
      postStudyWorkVisa: "1 Year (Designated Activities Visa for job hunting)",
      prDifficulty: "Moderate (10 years residence, reduced to 1-3 years under points system + JLPT N2)",
      citizenshipTimeline: "5 Years (Requires renouncing BD passport)",
      commonRejectionReasons: ["Unapproved funding sponsor", "Unsatisfactory study plan"],
    },
    cost: {
      tuition: "Free (under MEXT) or JPY 535,800 / year (National Universities)",
      livingCost: "JPY 1,000,000 - 1,500,000 / year",
      accommodation: "JPY 40,000 - 80,000 / month",
      insurance: "JPY 20,000 / year (National Health Insurance)",
      transport: "JPY 8,000 - 15,000 / month",
      partTimeEarnings: "JPY 1,100 / hour (Up to 28 hours/week with permission)",
      expectedMonthlyBalance: "Surplus of JPY 20,000 - 40,000 if MEXT funded",
    },
    scholarships: {
      government: ["MEXT Scholarship (University & Embassy track)"],
      university: ["University of Tokyo Fellowship", "Keio University Scholarships"],
      external: ["JASSO Honors Scholarship", "Honjo International Scholarship"],
      fundingProbability: "Highly Competitive for Embassy, High for Research if Professor supports",
    },
    timeline: [
      { year: "2027", month: "June", action: "Apply for MEXT Embassy Track (Dhaka)" },
      { year: "2027", month: "September", action: "Contact professors for MEXT University Track recommendation" },
      { year: "2028", month: "January", action: "Submit official university applications" },
      { year: "2028", month: "June", action: "Receive final MEXT approval & visa dispatch" },
    ]
  },
  uae: {
    id: "UAE",
    slug: "uae",
    hero: {
      title: "UAE",
      flag: "🇦🇪",
      score: 4,
      overallRecommendation: "MBZUAI is Top Fully Funded AI Destination",
      bestFor: ["Generous Stipends", "Tax-free environment", "Near-zero visa rejection"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Strong (~3.5%)",
      inflation: "Moderate (~3%)",
      techMarket: "Growing rapidly (AI strategy, Hub71)",
      majorCompanies: ["G42", "e&", "ADNOC", "Microsoft (G42 partnership)"],
    },
    career: {
      entrySalary: "AED 120,000 - 180,000",
      midSalary: "AED 240,000 - 360,000",
      seniorSalary: "AED 450,000+ (Tax-Free)",
      jobDemandTrend: "Expanding fast in GenAI & HPC",
      topRoles: ["LLM Specialist", "Research Scientist", "AI Engineer"],
    },
    visa: {
      studyVisaApprovalRate: "Near 100% (Handled by University)",
      typicalProcessingTime: "1 - 3 weeks",
      postStudyWorkVisa: "1 Year or Golden Visa (for top graduates)",
      prDifficulty: "Impossible (No traditional PR pathway)",
      citizenshipTimeline: "Virtually Impossible (Golden Visa 10yr renewable is the main route)",
      commonRejectionReasons: ["Failed medical exam (HIV, Hep B/C, TB are grounds for denial under UAE law)"],
    },
    cost: {
      tuition: "Free (MBZUAI covers 100% tuition)",
      livingCost: "AED 40,000 - 60,000 / year (Fully covered by stipend)",
      accommodation: "Free (On-campus housing provided by MBZUAI)",
      insurance: "Free (Comprehensive insurance provided by university)",
      transport: "AED 200 - 500 / month (Metro/Taxis)",
      partTimeEarnings: "AED 50 - 100 / hour (On-campus research, external work requires permit)",
      expectedMonthlyBalance: "Surplus of AED 5,000 - 7,000 / month from AED 9,300 stipend",
    },
    scholarships: {
      government: ["None for international students"],
      university: ["MBZUAI Full Scholarship (Includes AED 9,300/mo stipend + housing)"],
      external: ["G42 Fellowships"],
      fundingProbability: "High if admitted (100% of MBZUAI students get funded)",
    },
    timeline: [
      { year: "2027", month: "August", action: "Prepare for MBZUAI Entry Exam (Math & Programming)" },
      { year: "2027", month: "October", action: "Submit MBZUAI Portal Application" },
      { year: "2028", month: "January", action: "Complete Online Technical Interview" },
      { year: "2028", month: "April", action: "Receive Admission Offer & Visa Initiation" },
    ]
  },
  netherlands: {
    id: "Netherlands",
    slug: "netherlands",
    hero: {
      title: "Netherlands",
      flag: "🇳🇱",
      score: 4,
      overallRecommendation: "High Cost but Fast PR Path & Strong Tech Ecosystem",
      bestFor: ["Fast PR seekers", "English-medium daily life", "ASML targeters"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable (~1.5%)",
      inflation: "Moderate (~3-4%)",
      techMarket: "Excellent (Semiconductor & Biotech Hub)",
      majorCompanies: ["ASML", "NXP", "Philips", "Booking.com", "Uber"],
    },
    career: {
      entrySalary: "€45,000 - €55,000",
      midSalary: "€65,000 - €85,000",
      seniorSalary: "€100,000+",
      jobDemandTrend: "High Demand (Highly Skilled Migrant status)",
      topRoles: ["ML Engineer", "Embedded Software Engineer", "Data Scientist"],
    },
    visa: {
      studyVisaApprovalRate: "Very High (~95% for BD Nationals)",
      typicalProcessingTime: "4 - 6 weeks (MVV visa via university)",
      postStudyWorkVisa: "1 Year (Zoekjaar / Orientation Year)",
      prDifficulty: "Moderate (Requires 5 years stay + NT2 Dutch Language exam)",
      citizenshipTimeline: "5 Years Total",
      commonRejectionReasons: ["Failed TB test post-arrival", "Insufficient funds validation"],
    },
    cost: {
      tuition: "€15,000 - €22,000 / year",
      livingCost: "€12,000 - €16,000 / year",
      accommodation: "€600 - €1,000 / month",
      insurance: "€100 - €130 / month",
      transport: "€100 / month (Discount cards available)",
      partTimeEarnings: "€13 - €16 / hour (Requires work permit, max 16 hrs/week)",
      expectedMonthlyBalance: "Deficit of €500 - €800 / month without scholarship",
    },
    scholarships: {
      government: ["NL Scholarship (formerly Holland Scholarship - €5,000 one-time)"],
      university: ["TU Delft Justus & Louise van Effen", "Utrecht Excellence Scholarship"],
      external: ["Orange Tulip Scholarship (OTS)"],
      fundingProbability: "Low to Moderate (Highly competitive)",
    },
    timeline: [
      { year: "2027", month: "September", action: "Start university portal applications (Studielink)" },
      { year: "2027", month: "November", action: "Submit TU Delft/Eindhoven early applications" },
      { year: "2028", month: "January", action: "Deadline for university scholarships" },
      { year: "2028", month: "April", action: "Start MVV entry visa process via university" },
    ]
  },
  switzerland: {
    id: "Switzerland",
    slug: "switzerland",
    hero: {
      title: "Switzerland",
      flag: "🇨🇭",
      score: 4,
      overallRecommendation: "Top-tier Research (ETH/EPFL) but Very Hard PR",
      bestFor: ["Academic Excellence", "Low Tuition Fees", "AI/ML Research"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable (~1-2%)",
      inflation: "Very Low (~1-2%)",
      techMarket: "Prestigious (Google Zurich, IBM Research)",
      majorCompanies: ["Google Zurich", "IBM Research", "Nvidia", "Microsoft"],
    },
    career: {
      entrySalary: "CHF 90,000 - 110,000",
      midSalary: "CHF 120,000 - 150,000",
      seniorSalary: "CHF 180,000+",
      jobDemandTrend: "High Demand, but quota limits for non-EU",
      topRoles: ["ML Researcher", "AI Infrastructure Engineer", "Quant Developer"],
    },
    visa: {
      studyVisaApprovalRate: "Moderate (~80% for BD Nationals)",
      typicalProcessingTime: "8 - 12 weeks",
      postStudyWorkVisa: "6 Months (For job hunting, strictly enforced)",
      prDifficulty: "Very Hard (Requires 10 years continuous residence for C-permit for non-EU)",
      citizenshipTimeline: "10 Years Total",
      commonRejectionReasons: ["Insufficient proof of CHF 21,000 blocked assets", "Non-return intention suspicion"],
    },
    cost: {
      tuition: "CHF 1,500 - 2,000 / year (Extremely low tuition at ETH/EPFL)",
      livingCost: "CHF 18,000 - 24,000 / year",
      accommodation: "CHF 600 - 1,000 / month (Shared student housing)",
      insurance: "CHF 80 - 120 / month (Student discount plans)",
      transport: "CHF 80 / month (Halbtax card recommended)",
      partTimeEarnings: "CHF 25 - 35 / hour (Allowed 15 hrs/week after 6 months stay)",
      expectedMonthlyBalance: "Deficit of CHF 600 - 1,000 / month unless funded",
    },
    scholarships: {
      government: ["Swiss Government Excellence Scholarships (Research/PhD only)"],
      university: ["ETH Excellence Scholarship (ESOP)", "EPFL Excellence Fellowships"],
      external: [],
      fundingProbability: "Very Low for Master's, High for PhD (paid as university employee)",
    },
    timeline: [
      { year: "2027", month: "August", action: "Select projects & contact labs (if Research MSc)" },
      { year: "2027", month: "November", action: "Submit applications to ETH Zurich (ESOP deadline Dec 15)" },
      { year: "2028", month: "March", action: "Await decisions & prep visa financial documents (CHF 21k proof)" },
      { year: "2028", month: "May", action: "Submit visa application to Swiss Embassy Dhaka" },
    ]
  },
  finland: {
    id: "Finland",
    slug: "finland",
    hero: {
      title: "Finland",
      flag: "🇫🇮",
      score: 4,
      overallRecommendation: "Best 4-Year PR Pathway & High Quality of Life",
      bestFor: ["Stable PR Seekers", "Families", "Work-Life Balance"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "Stable",
      inflation: "Low",
      techMarket: "Strong in Mobile, Telecomm & AI",
      majorCompanies: ["Nokia", "Rovio", "Supercell", "Wärtsilä"],
    },
    career: {
      entrySalary: "€38,000 - €45,000",
      midSalary: "€50,000 - €65,000",
      seniorSalary: "€75,000+",
      jobDemandTrend: "High Demand (particularly in software & data)",
      topRoles: ["Software Engineer", "ML Practitioner", "Data Engineer"],
    },
    visa: {
      studyVisaApprovalRate: "Very High (~92% for BD Nationals)",
      typicalProcessingTime: "1 - 2 months (Online portal Enter Finland)",
      postStudyWorkVisa: "2 Years (Highly flexible job-seeking permit)",
      prDifficulty: "Easy (4-year legal residence, study years count towards citizenship/PR)",
      citizenshipTimeline: "5 Years Total (Requires Finnish or Swedish language skill)",
      commonRejectionReasons: ["Lack of health insurance", "Unconfirmed tuition fee payment"],
    },
    cost: {
      tuition: "€10,000 - €15,000 / year",
      livingCost: "€8,000 - €10,000 / year",
      accommodation: "€350 - €600 / month (HOAS/TOAS student housing)",
      insurance: "€200 / year (Schengen student insurance)",
      transport: "€35 - €50 / month (Student discount)",
      partTimeEarnings: "€12 - €15 / hour (Up to 30 hours/week)",
      expectedMonthlyBalance: "Deficit of €300 - €500 / month without scholarship",
    },
    scholarships: {
      government: ["Finland Scholarship (Covers 100% tuition + €5,000 relocation)"],
      university: ["Aalto/Helsinki Tuition Fee Waiver (50-100% tuition)"],
      external: ["Erasmus+ (if joint program)"],
      fundingProbability: "Moderate (Aalto/UHelsinki give many waiver scholarships)",
    },
    timeline: [
      { year: "2027", month: "November", action: "Prepare portfolio (if design-related) and take IELTS" },
      { year: "2028", month: "January", action: "Submit applications via Studyinfo.fi (Joint Application)" },
      { year: "2028", month: "March", action: "Receive admissions & scholarship waiver results" },
      { year: "2028", month: "May", action: "Submit residence permit application on Enter Finland" },
    ]
  },
};

function generateEmptyCountry(title: string, flag: string, slug: string, rec: string = "Data pending..."): CountryIntelligence {
  return {
    id: title,
    slug: slug,
    hero: {
      title,
      flag,
      score: 3,
      overallRecommendation: rec,
      bestFor: ["TBD"],
      lastUpdated: "2026",
    },
    economic: {
      gdpGrowth: "TBD",
      inflation: "TBD",
      techMarket: "TBD",
      majorCompanies: ["TBD"],
    },
    career: {
      entrySalary: "TBD",
      midSalary: "TBD",
      seniorSalary: "TBD",
      jobDemandTrend: "TBD",
      topRoles: ["TBD"],
    },
    visa: {
      studyVisaApprovalRate: "TBD",
      typicalProcessingTime: "TBD",
      postStudyWorkVisa: "TBD",
      prDifficulty: "TBD",
      citizenshipTimeline: "TBD",
      commonRejectionReasons: ["TBD"],
    },
    cost: {
      tuition: "TBD",
      livingCost: "TBD",
      accommodation: "TBD",
      insurance: "TBD",
      transport: "TBD",
      partTimeEarnings: "TBD",
      expectedMonthlyBalance: "TBD",
    },
    scholarships: {
      government: [],
      university: [],
      external: [],
      fundingProbability: "TBD",
    },
    timeline: []
  };
}
