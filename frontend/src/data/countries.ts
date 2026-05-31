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
  // Scaffold empty data for others to prevent crashes
  australia: generateEmptyCountry("Australia", "🇦🇺", "australia"),
  usa: generateEmptyCountry("USA", "🇺🇸", "usa"),
  canada: generateEmptyCountry("Canada", "🇨🇦", "canada"),
  "south-korea": generateEmptyCountry("South Korea", "🇰🇷", "south-korea"),
  china: generateEmptyCountry("China", "🇨🇳", "china"),
  japan: generateEmptyCountry("Japan", "🇯🇵", "japan"),
  uae: generateEmptyCountry("UAE", "🇦🇪", "uae"),
  netherlands: generateEmptyCountry("Netherlands", "🇳🇱", "netherlands"),
  switzerland: generateEmptyCountry("Switzerland", "🇨🇭", "switzerland"),
  finland: generateEmptyCountry("Finland", "🇫🇮", "finland"),
};

function generateEmptyCountry(title: string, flag: string, slug: string): CountryIntelligence {
  return {
    id: title,
    slug: slug,
    hero: {
      title,
      flag,
      score: 3,
      overallRecommendation: "Data pending...",
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
