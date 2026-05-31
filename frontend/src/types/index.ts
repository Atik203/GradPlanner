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
  deadline?: string | null;
  intake?: string | null;
  website?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  application?: Application | null;
  professors?: Professor[];
}

export type ProfessorStatus =
  | "NOT_CONTACTED"
  | "EMAILED"
  | "AWAITING_REPLY"
  | "REPLIED_POSITIVE"
  | "REPLIED_NEGATIVE"
  | "INTERVIEWED";

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
