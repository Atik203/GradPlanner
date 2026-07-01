export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Tier = "DREAM" | "MATCH" | "SAFETY";

export interface University {
  id: string;
  userId: string;
  name: string;
  country: string;
  tier: Tier;
  program?: string | null;
  tuitionPerYr?: string | null;
  livingCostPerYr?: string | null;
  scholarshipsAvailable: boolean;
  minCgpa?: number | null;
  minIelts?: number | null;
  acceptanceRate?: number | null;
  fundingAvailable: boolean;
  prPathwayQuality?: string | null;
  deadline?: string | null;
  intake?: string | null;
  website?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  application?: Application | null;
  professors?: Professor[];
  rankingId?: string | null;
  ranking?: UniversityRanking | null;
}

export type ProfessorStatus =
  | "NOT_CONTACTED"
  | "EMAILED"
  | "AWAITING_REPLY"
  | "REPLIED_POSITIVE"
  | "REPLIED_NEGATIVE"
  | "INTERVIEWED";

export type FundingStatus =
  | "FUNDED"
  | "LIKELY"
  | "UNLIKELY"
  | "UNKNOWN";

export interface Professor {
  id: string;
  userId: string;
  universityId?: string | null;
  university?: University | null;
  name: string;
  email?: string | null;
  profileUrl?: string | null;
  researchInterests?: string | null;
  emailSentDate?: string | null;
  emailSubject?: string | null;
  replyReceived: boolean;
  replyDate?: string | null;
  status: ProfessorStatus;
  fundingStatus: FundingStatus;
  researchFitScore?: number | null;
  followUpCount: number;
  lastFollowUp?: string | null;
  nextFollowUp?: string | null;
  interviewDate?: string | null;
  suggestedContact?: string | null;
  futureFundingNote?: string | null;
  notes?: string | null;
  customFields?: Record<string, any>;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "OFFER_RECEIVED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Application {
  id: string;
  userId: string;
  universityId: string;
  university?: University | null;
  status: ApplicationStatus;
  deadline?: string | null;
  submittedAt?: string | null;
  decisionDate?: string | null;
  offerReceived: boolean;
  scholarshipAmt?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | "TRANSCRIPT"
  | "DEGREE_CERTIFICATE"
  | "IELTS"
  | "TOEFL"
  | "GRE"
  | "LOR"
  | "SOP"
  | "CV"
  | "PASSPORT"
  | "POLICE_CLEARANCE"
  | "BANK_STATEMENT"
  | "MEDICAL"
  | "OTHER";

export type DocumentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "OBTAINED"
  | "EXPIRED"
  | "NOT_REQUIRED";

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  country?: string | null;
  status: DocumentStatus;
  fileUrl?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  university?: string | null;
  cgpa?: number | null;
  targetIntake?: string | null;
  graduationDate?: string | null;
  targetDegree?: string | null;
  // ── Match Intelligence ─────────────────────────────────────────────
  ieltsScore?: number | null;        // actual or target IELTS band score
  monthlyBudgetUSD?: number | null;  // self-funded monthly cap in USD
  researchInterests?: string[];      // e.g. ["NLP", "Computer Vision"]
  prPriority?: number | null;        // 1=low … 5=essential
  familyRelocation?: boolean | null; // plans to bring spouse/children
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UniversityRanking {
  id: string;
  institutionName: string;
  country: string;
  region?: string | null;
  inQs: boolean;
  inThe: boolean;
  inArwu: boolean;
  qs2026Rank?: number | null;
  qs2026RankDisplay?: string | null;
  qs2026Score?: number | null;
  qsArScore?: number | null;
  qsErScore?: number | null;
  qsFsrScore?: number | null;
  qsCpfScore?: number | null;
  qsIfrScore?: number | null;
  qsIsrScore?: number | null;
  qsEoScore?: number | null;
  qsSusScore?: number | null;
  the2026Rank?: number | null;
  the2026RankDisplay?: string | null;
  the2026Score?: number | null;
  theTeaching?: number | null;
  theResearchEnv?: number | null;
  theResearchQuality?: number | null;
  theIndustry?: number | null;
  theInternational?: number | null;
  arwu2025Rank?: number | null;
  arwu2025Score?: number | null;
  arwuAlumni?: number | null;
  arwuAward?: number | null;
  arwuHici?: number | null;
  arwuNs?: number | null;
  arwuPub?: number | null;
  arwuPcp?: number | null;
}

// ─── Notifications (Phase 5) ─────────────────────────────────────────────────

export type NotificationType =
  | "DEADLINE_APPROACHING"
  | "DEADLINE_URGENT"
  | "FOLLOW_UP_DUE"
  | "FOLLOW_UP_LIMIT"
  | "DOCUMENT_EXPIRING"
  | "PROFILE_INCOMPLETE"
  | "APPLICATION_UPDATE"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── User Settings (Phase 1) ────────────────────────────────────────────────

export type StrategyPreference = "PR speed" | "AI Market" | "No Tuition" | "Scholarship";

export interface UserSettings {
  id: string;
  userId: string;
  emailDeadlineAlerts: boolean;
  timelineNotifications: boolean;
  strategyPreference: StrategyPreference;
  createdAt: string;
  updatedAt: string;
}

// ─── Search (Phase 6) ────────────────────────────────────────────────────────

export interface SearchUniversityRanking {
  id: string;
  institutionName: string;
  country: string;
  inQs: boolean;
  inThe: boolean;
  inArwu: boolean;
}

export interface SearchedUniversity {
  id: string;
  name: string;
  country: string;
  program: string | null;
  tier: Tier;
}

export interface SearchedProfessor {
  id: string;
  name: string;
  researchInterests: string | null;
  researchFitScore: number | null;
  university: { name: string } | null;
}

export interface SearchedCountry {
  id: string;
  country: string;
  countryCode: string;
  overallScore: number;
}

export interface SearchResults {
  universityRankings: SearchUniversityRanking[];
  universities: SearchedUniversity[];
  professors: SearchedProfessor[];
  countries: SearchedCountry[];
}

// ─── Analytics (Phase 7) ──────────────────────────────────────────────────────

export interface UnivBreakdown {
  name: string;
  country: string;
  tier: string;
  tuition: number;
  livingCost: number;
  scholarship: number;
}

export interface AnalyticsResponse {
  profileCompleteness: number;
  applicationFunnel: Record<string, number>;
  financial: {
    totalEstimatedCost: number;
    scholarshipsTotal: number;
    fundingGap: number;
    avgPostGradSalary: number;
    roiScore: number;
    breakdownByUniversity: UnivBreakdown[];
  };
  professorOutreach: {
    total: number;
    contacted: number;
    repliedPositive: number;
    repliedNegative: number;
    noResponse: number;
    responseRate: number;
    averageFitScore: number;
    followUpEfficacy: number;
  };
  activityTimeline: Array<{ date: string; count: number }>;
}

// ─── Professor Email Generator (Phase 8) ─────────────────────────────────────

export type EmailFocus = "research" | "funding" | "paper" | "followUp1" | "followUp2";

export interface GenerateEmailInput {
  focus?: EmailFocus;
  paperTitle?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

// ─── PR & Visa Pathway Simulator (Phase 9) ─────────────────────────────────────

export interface PathwayVisa {
  visaName: string;
  processingTime: string;
  applicationFee: number;
  feeCurrency: string;
  difficulty: string;
  rejectionRiskBD: string;
  tips: string;
  officialUrl: string;
  workRights: string;
}

export interface PathwayPostStudyWork {
  visaName: string;
  duration: string;
  pathwayToPR: boolean;
  difficulty: string;
  notes: string;
}

export interface PathwayPROverview {
  overallScore: number;
  averageYears: number;
  confidenceScore: number;
  keyRisks: string[];
  keyAdvantages: string[];
}

export interface PathwayPR {
  pathwayName: string;
  difficulty: string;
  estimatedYears: number;
  description: string;
  languageRequired: string;
  jobRequired: boolean;
  costEstimate: number | null;
  costCurrency: string | null;
  strengths: string[];
  weaknesses: string[];
  strategicAdvice: string;
}

export interface PathwayPhase {
  id: string;
  name: string;
  duration: string;
  milestones: string[];
  riskLevel: string;
}

export interface PathwayTimeline {
  totalJourneyYears: string;
  phases: PathwayPhase[];
  sampleTimeline: { year: number; event: string }[];
}

export interface PathwayRiskDimension {
  name: string;
  score: number;
  level: string;
  summary: string;
  trend: string;
}

export interface PathwayRisks {
  overallScore: number;
  riskLevel: string;
  warnings: string[];
  dimensions: PathwayRiskDimension[];
}

export interface PathwayCitizenship {
  yearsRequired: number;
  difficulty: string;
  dualAllowed: boolean;
  languageRequired: string;
  passportStrength: string;
}

export interface PathwayCost {
  item: string;
  amountUSD: number;
  notes: string;
}

export interface PathwayData {
  country: string;
  countryCode: string;
  studentVisa: PathwayVisa | null;
  postStudyWork: PathwayPostStudyWork | null;
  prOverview: PathwayPROverview | null;
  prPathways: PathwayPR[];
  timeline: PathwayTimeline | null;
  risks: PathwayRisks | null;
  citizenship: PathwayCitizenship | null;
  costs: PathwayCost[];
  lastUpdated: string;
}
