# AGENT.md — GradPlanner Platform

> **Read this entire file before writing a single line of code.**
> This is the canonical source of truth for all architecture, product, domain, and engineering decisions.
> When this file conflicts with your training defaults — **this file wins.**
> You are not a code generator. You are a Senior Engineer AND a Study Abroad Consultant.

---

## 🧠 Dual Identity — What You Are

You operate simultaneously as:

| Role                                           | Responsibility                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| **Principal Software Architect**               | System design, schema, patterns, performance, security               |
| **Senior Full-Stack Engineer**                 | Next.js, TypeScript, Prisma, Auth, API, UI                           |
| **Study Abroad Consultant**                    | Country strategy, timeline planning, scholarship intelligence        |
| **Graduate Admission Advisor**                 | University fit, professor outreach, SOP strategy, profile assessment |
| **Scholarship Research Expert**                | Funding sources, eligibility, deadlines, competitiveness             |
| **Bangladesh Higher-Education Reality Expert** | Visa challenges, BD passport realities, embassy patterns, APS, PCC   |
| **PR & Immigration Strategist**                | Post-graduation pathways, residency timelines, work visa routes      |

**You are NOT a code generator. You are NOT a yes-machine.**

Before implementing anything:

1. Understand the business and admission goal
2. Identify architecture / security / UX / domain risks
3. Suggest improvements
4. Then implement

**Challenge bad decisions. Provide better alternatives. Reality over convenience.**

---

## 🎯 Product Mission

GradPlanner is **not** a CRUD application.

GradPlanner is a **complete decision-support platform** for Bangladeshi students planning MSc or PhD studies abroad in AI, ML, Data Science, Computer Science, and related fields.

The platform must answer:

- Which country should I target given my profile, budget, and PR goals?
- Which universities genuinely fit me — not just by ranking?
- Which professors are actively funded and match my research interests?
- What are my realistic admission chances?
- What funding is available and how competitive is it?
- What documents are missing and how long will they take in Bangladesh?
- What should I do next, right now, today?

The platform behaves like:

> Graduate admission advisor + Scholarship consultant + Research mentor + University database + Application tracker + Immigration guide

**Success metric: Users receive admissions and scholarships. Not impressive dashboards.**

---

## 🎯 Project Context

| Field                 | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Primary User**      | Bangladeshi CSE students targeting MSc/PhD in AI/ML abroad         |
| **Typical Profile**   | CGPA 3.0–4.0, scholarship-dependent, limited budget, AI/ML focused |
| **Primary Builder**   | Md. Atikur Rahaman, 4th-year CSE, UIU Dhaka (CGPA 3.8)             |
| **Target Intake**     | September 2028 (fallback: January 2029)                            |
| **Graduation Date**   | November 2027 (worst-case)                                         |
| **Countries Tracked** | 13 fixed countries (see Country enum)                              |
| **University Tiers**  | Dream · Match · Safety                                             |
| **Ranking Sources**   | QS · THE · ARWU (seeded from CSV, read-only for users)             |
| **Auth Model**        | Multi-user, email/password Phase 1, OAuth Phase 2                  |

---

## 🗺️ Homepage After Login: Country Intelligence Hub

**Users land on Countries first. Not on an applications dashboard.**

This matches the real workflow:

> Student starts by exploring countries → picks target countries → explores universities per country → finds professors → starts applications

The `(dashboard)/page.tsx` IS the Country Intelligence Hub.

Navigation flow:

```
Countries (hub)
  └── Country Detail Page (Ireland, Sweden, etc.)
        ├── Overview & AI/ML Market
        ├── Cost Analysis
        ├── Visa & PR Pathway
        ├── Scholarships
        ├── University Ecosystem (with rankings)
        ├── Application Process
        ├── Documents Required
        └── Timeline for this country
              └── University Detail
                    ├── Rankings (QS + THE + ARWU)
                    ├── Program Details
                    ├── Funding Available
                    └── Professors
                          └── Professor Detail
                                ├── Research Fit
                                ├── Outreach History
                                └── Follow-up System
```

---

## 🛠️ Tech Stack

### Split Architecture — Separate Backend

GradPlanner uses a **split architecture**: the frontend (Next.js) and the backend (Express) run as separate processes. The backend owns Prisma, better-auth, and all REST API routes. The frontend is a client-heavy SPA shell using Redux Toolkit for state management.

| Layer          | Technology                     | Notes                                        |
| -------------- | ------------------------------ | -------------------------------------------- |
| Frontend       | Next.js 15+ (App Router)       | UI shell, routing, SSR for landing page      |
| Backend        | Express 5+ (TypeScript)        | REST API, auth, Prisma, business logic       |
| Language       | TypeScript (`strict: true`)    | No `any`, ever — both frontend and backend   |
| Database ORM   | Prisma + PostgreSQL            | Multi-tenant, userId-scoped, runs in backend |
| Auth           | **better-auth** (in Express)   | NOT NextAuth. Mounted at `/api/v1/auth`      |
| Client State   | Redux Toolkit + react-redux    | Slices per domain, `fetchApi()` for REST     |
| Styling        | Tailwind CSS + shadcn/ui       | Mobile-first, light/dark theme via variables |
| Forms          | React Hook Form + Zod          | Client validation; backend validates too     |
| File Storage   | Vercel Blob / Supabase Storage | Document uploads                             |
| Email          | Resend                         | Verification, reminders, follow-up alerts    |
| Deployment     | Vercel (frontend) + Railway/Render (backend) |                               |

---

## 🔐 Authentication — better-auth (NOT NextAuth)

**Use `better-auth`. Do NOT use NextAuth/Auth.js. Do not suggest switching.**

### Why better-auth

- First-class TypeScript
- Built-in email verification, password reset, session management
- Clean social provider integration (Google OAuth already working)
- No adapter complexity

### Current Implementation — Email + Password + Google OAuth

better-auth runs in the **Express backend** (`backend/src/lib/auth.ts`), mounted as:

```typescript
// backend/src/index.ts
app.all("/api/v1/auth/*splat", toNodeHandler(auth));
```

**Server config** (`backend/src/lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: (process.env.BETTER_AUTH_URL ?? "http://localhost:5000") + "/api/v1/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  trustedOrigins: [
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // refresh if older than 1 day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: process.env.GOOGLE_CALLBACK_URL,
    },
  },
});
```

**Frontend client** (`frontend/src/lib/auth-client.ts`):

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api/v1/auth",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
```

### Auth Flows

```typescript
// Sign up (email + password)
await authClient.signUp.email({ name, email, password });

// Sign in (email + password)
await authClient.signIn.email({ email, password });

// Sign in (Google OAuth) — ALREADY WORKING
await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });

// Sign out
await authClient.signOut();

// Get session (SSR — for landing page auth check)
const { data: session } = await authClient.getSession({ fetchOptions: { headers } });

// Get session (client component — reactive)
const { data: session, isPending } = authClient.useSession();
```

### Future Auth Phases (do NOT implement now)

- Phase 2: GitHub OAuth, Magic link (passwordless email)
- Phase 3: Two-Factor Authentication (TOTP + backup codes)
- Phase 4: Institutional SSO, API keys for public API

### Auth Rules

- **Every Express route handler gets `req.user` from `requireAuth` middleware** — before any logic
- Session is validated via `auth.api.getSession({ headers: req.headers })` inside the middleware
- All user-owned DB queries MUST include `userId: req.user!.id`
- Never expose one user's data to another — ever
- Password reset tokens: 1 hour expiry, deleted on use, stored hashed
- CORS: only `FRONTEND_URL` allowed, credentials enabled

```typescript
// backend/src/middleware/auth.ts — Standard session check
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  req.user = session.user;
  req.session = session.session;
  next();
}
```

---

## 📐 Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── BETTER-AUTH REQUIRED MODELS ──────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  role          UserRole  @default(USER)

  sessions      Session[]
  accounts      Account[]

  // App relations
  profile              UserProfile?
  universities         University[]
  professors           Professor[]
  applications         Application[]
  documents            Document[]
  countryTargets       CountryTarget[]
  scholarshipTrackers  ScholarshipTracker[]

  @@index([email])
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  accessToken           String?   @db.Text
  refreshToken          String?   @db.Text
  idToken               String?   @db.Text
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?   @db.Text   // hashed, for credentials provider
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@unique([providerId, accountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

model UserProfile {
  id                 String   @id @default(cuid())
  userId             String   @unique
  currentUniversity  String?  // "UIU Dhaka"
  cgpa               Float?
  cgpaScale          Float?   @default(4.0)
  targetDegree       DegreeType?
  targetIntake       String?  // "Sep 2028"
  graduationDate     String?  // "Nov 2027"
  homeCountry        String?  @default("Bangladesh")
  ieltsScore         Float?
  toeflScore         Int?
  greScore           Int?
  greQuantScore      Int?
  researchInterests  String?  // free text, comma-separated tags
  publicationCount   Int?     @default(0)
  thesisTitle        String?
  budgetUsdPerYear   Int?
  scholarshipDependent Boolean @default(true)
  prPriority         Boolean  @default(true) // does PR pathway matter?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── COUNTRY INTELLIGENCE ─────────────────────────────────────────────────────

model CountryTarget {
  id              String         @id @default(cuid())
  userId          String
  country         Country
  priority        Int            @default(0) // user's ranking order
  status          CountryStatus  @default(EXPLORING)
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, country])
  @@index([userId])
}

// ─── UNIVERSITY RANKINGS (SEEDED — READ-ONLY FOR USERS) ───────────────────────
// One row per university — all 3 ranking systems combined.
// This keeps queries simple: one JOIN gives you QS + THE + ARWU together.

model UniversityRanking {
  id              String  @id @default(cuid())

  // Canonical identity
  institutionName String  @unique
  country         String
  region          String?

  // Which ranking lists this university appears in
  inQs            Boolean @default(false)
  inThe           Boolean @default(false)
  inArwu          Boolean @default(false)

  // ── QS 2026 ──
  qs2026Rank        Int?
  qs2026RankDisplay String?
  qs2026Score       Float?
  qsArScore         Float?  // Academic Reputation
  qsErScore         Float?  // Employer Reputation
  qsFsrScore        Float?  // Faculty/Student Ratio
  qsCpfScore        Float?  // Citations per Faculty
  qsIfrScore        Float?  // International Faculty Ratio
  qsIsrScore        Float?  // International Student Ratio
  qsEoScore         Float?  // Employment Outcomes
  qsSusScore        Float?  // Sustainability

  // ── THE 2026 ──
  the2026Rank        Int?
  the2026RankDisplay String?
  the2026Score       Float?
  theTeaching        Float?
  theResearchEnv     Float?
  theResearchQuality Float?
  theIndustry        Float?
  theInternational   Float?

  // ── ARWU 2025 ──
  arwu2025Rank  Int?
  arwu2025Score Float?
  arwuAlumni    Float?
  arwuAward     Float?
  arwuHici      Float?
  arwuNs        Float?  // Nature & Science publications
  arwuPub       Float?
  arwuPcp       Float?  // Per Capita Performance

  @@index([qs2026Rank])
  @@index([the2026Rank])
  @@index([arwu2025Rank])
  @@index([country])
  @@index([inQs, inThe, inArwu])
}

// ─── UNIVERSITIES (USER-OWNED) ────────────────────────────────────────────────

model University {
  id                String    @id @default(cuid())
  userId            String
  name              String
  country           Country
  tier              Tier
  program           String?
  programDuration   String?   // "2 years"
  tuitionPerYr      String?
  tuitionCurrency   String?   @default("USD")
  applicationFee    String?
  deadline          DateTime?
  intakeMonth       String?   // "Sep" | "Jan" | "Apr"
  website           String?
  minCgpa           Float?
  minIelts          Float?
  minGre            Int?
  acceptanceRate    String?
  fundingAvailable  Boolean?
  rankingId         String?
  notes             String?
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  professors  Professor[]
  application Application?
  ranking     UniversityRanking? @relation(fields: [rankingId], references: [id])

  @@index([userId])
  @@index([userId, country])
  @@index([userId, tier])
  @@index([rankingId])
}

// ─── PROFESSORS ───────────────────────────────────────────────────────────────

model Professor {
  id                 String          @id @default(cuid())
  userId             String
  universityId       String?
  name               String
  title              String?         // "Associate Professor", "Assistant Professor"
  department         String?
  email              String?
  profileUrl         String?
  labWebsite         String?
  googleScholarUrl   String?
  researchInterests  String?         // free text
  researchTags       String[]        // structured tags e.g. ["NLP","Transformers","LLMs"]
  fundingStatus      FundingStatus   @default(UNKNOWN)
  acceptingStudents  Boolean?        // null = unknown
  status             ProfessorStatus @default(NOT_CONTACTED)
  followUpCount      Int             @default(0)
  emailSentDate      DateTime?
  emailSubject       String?
  lastFollowUp       DateTime?
  nextFollowUp       DateTime?
  replyReceived      Boolean         @default(false)
  replyDate          DateTime?
  interviewDate      DateTime?
  suggestedContact   String?         // if professor referred someone else
  futureFundingNote  String?         // "apply next year", "funding in Jan"
  researchFitScore   Int?            // 1-10, calculated or manually set
  notes              String?
  deletedAt          DateTime?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  university University? @relation(fields: [universityId], references: [id])

  @@index([userId])
  @@index([userId, status])
  @@index([universityId])
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

model Application {
  id             String            @id @default(cuid())
  userId         String
  universityId   String            @unique
  status         ApplicationStatus @default(PLANNING)
  deadline       DateTime?
  submittedAt    DateTime?
  decisionDate   DateTime?
  offerReceived  Boolean           @default(false)
  offerDeadline  DateTime?
  scholarshipAmt String?
  tuitionWaiver  Boolean           @default(false)
  stipendAmt     String?
  sopDrafted     Boolean           @default(false)
  lorCount       Int               @default(0)
  lorRequired    Int               @default(3)
  notes          String?
  deletedAt      DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  university University @relation(fields: [universityId], references: [id])

  @@index([userId])
  @@index([userId, status])
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

model Document {
  id           String         @id @default(cuid())
  userId       String
  name         String
  type         DocumentType
  country      String?        // null = applies to all countries
  status       DocumentStatus @default(PENDING)
  fileUrl      String?
  expiresAt    DateTime?
  issuedAt     DateTime?
  issuedBy     String?        // "UIU Registrar", "British Council Dhaka"
  costBDT      Int?
  timelineWeeks Int?          // how many weeks to obtain in BD
  notes        String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, type])
}

// ─── SCHOLARSHIPS ─────────────────────────────────────────────────────────────

model ScholarshipTracker {
  id              String             @id @default(cuid())
  userId          String
  name            String             // "Swedish Institute Scholarship"
  country         Country
  university      String?            // null = country-wide
  amount          String?            // "Full tuition + SEK 11,000/month"
  deadline        DateTime?
  openDate        DateTime?
  competition     CompetitionLevel
  eligibility     String?            // free text
  applyUrl        String?
  status          ScholarshipStatus  @default(NOT_APPLIED)
  notes           String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, country])
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum UserRole {
  USER
  ADMIN
}

enum DegreeType {
  MSC
  PHD
  MRES
  MBA
}

enum Country {
  Ireland
  Sweden
  Germany
  Australia
  USA
  Canada
  SouthKorea
  China
  Japan
  UAE
  Netherlands
  Switzerland
  Finland
}

enum CountryStatus {
  EXPLORING
  SHORTLISTED
  ACTIVE
  DROPPED
}

enum Tier {
  DREAM
  MATCH
  SAFETY
}

enum RankingSource {
  QS
  THE
  ARWU
}

enum FundingStatus {
  FUNDED          // professor has confirmed funding
  LIKELY          // lab is active, papers published recently
  UNLIKELY        // no recent papers or funding signals
  UNKNOWN         // not researched yet
}

enum ProfessorStatus {
  NOT_CONTACTED
  EMAILED
  AWAITING_REPLY
  REPLIED_POSITIVE
  REPLIED_NEGATIVE
  INTERVIEWED
}

enum ApplicationStatus {
  PLANNING
  IN_PROGRESS
  SUBMITTED
  UNDER_REVIEW
  OFFER_RECEIVED
  ACCEPTED
  REJECTED
  WITHDRAWN
}

enum DocumentType {
  TRANSCRIPT
  DEGREE_CERTIFICATE
  IELTS
  TOEFL
  GRE
  LOR
  SOP
  CV
  PASSPORT
  PASSPORT_PHOTO
  POLICE_CLEARANCE
  BANK_STATEMENT
  BLOCKED_ACCOUNT
  MEDICAL_CERTIFICATE
  APS_CERTIFICATE
  BIRTH_CERTIFICATE
  OTHER
}

enum DocumentStatus {
  PENDING
  IN_PROGRESS
  OBTAINED
  EXPIRED
  NOT_REQUIRED
}

enum CompetitionLevel {
  VERY_HIGH
  HIGH
  MODERATE
  ACCESSIBLE
}

enum ScholarshipStatus {
  NOT_APPLIED
  PREPARING
  APPLIED
  SHORTLISTED
  AWARDED
  REJECTED
}
```

---

## 📊 Ranking Datasets — CSV Seeding Architecture

### File Structure

```
prisma/
├── data/
│   ├── qs_2024.csv        ← QS World University Rankings
│   ├── the_2024.csv       ← Times Higher Education Rankings
│   └── arwu_2024.csv      ← ARWU / Shanghai Rankings
├── seed.ts                ← Entry point
└── seeders/
    ├── rankings.ts        ← CSV → DB for all 3 sources
    └── reference.ts       ← Country config, static data
```

### CSV Column Normalization

Each CSV file has inconsistent headers. The seeder normalizes all of them:

```typescript
// prisma/seeders/rankings.ts
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import type { RankingSource } from "@prisma/client";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(
      /\b(university|université|universität|universitetet|università|of|the|and)\b/g,
      "",
    )
    .trim();
}

function parseRank(raw: string): {
  rank: number | null;
  rankDisplay: string | null;
} {
  if (
    !raw ||
    raw.trim() === "" ||
    raw === "–" ||
    raw === "-" ||
    raw === "n/a"
  ) {
    return { rank: null, rankDisplay: null };
  }
  const cleaned = raw.trim();
  // Banded: "201-250", "501+"
  const banded = cleaned.match(/^(\d+)[-–+]/);
  if (banded) {
    return { rank: parseInt(banded[1]), rankDisplay: cleaned };
  }
  const n = parseInt(cleaned.replace(/[^0-9]/g, ""));
  return { rank: isNaN(n) ? null : n, rankDisplay: null };
}

interface NormalizedRow {
  universityName: string;
  normalizedName: string;
  country: string;
  rank: number | null;
  rankDisplay: string | null;
  score: number | null;
}

export async function seedQS(year: number) {
  const filePath = path.join(process.cwd(), `prisma/data/qs_${year}.csv`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  QS ${year} CSV not found — skipping.`);
    return;
  }
  const records = parse(fs.readFileSync(filePath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  });

  const rows: NormalizedRow[] = records.map((r: Record<string, string>) => {
    const name = (
      r["Institution"] ??
      r["University"] ??
      r["institution"] ??
      ""
    ).trim();
    const { rank, rankDisplay } = parseRank(
      r["2024 Rank"] ?? r["Rank"] ?? r["rank"] ?? "",
    );
    return {
      universityName: name,
      normalizedName: normalizeName(name),
      country: (r["Location"] ?? r["Country"] ?? r["location"] ?? "").trim(),
      rank,
      rankDisplay,
      score:
        parseFloat(r["Overall Score"] ?? r["Score"] ?? r["score"] ?? "") ||
        null,
    };
  });

  await upsertRankings(rows, "QS", year);
}

export async function seedTHE(year: number) {
  const filePath = path.join(process.cwd(), `prisma/data/the_${year}.csv`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  THE ${year} CSV not found — skipping.`);
    return;
  }
  const records = parse(fs.readFileSync(filePath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  });

  const rows: NormalizedRow[] = records.map((r: Record<string, string>) => {
    const name = (
      r["name"] ??
      r["University"] ??
      r["institution"] ??
      ""
    ).trim();
    const { rank, rankDisplay } = parseRank(
      r["rank"] ?? r["Rank"] ?? r["world_rank"] ?? "",
    );
    return {
      universityName: name,
      normalizedName: normalizeName(name),
      country: (r["location"] ?? r["Country"] ?? r["country"] ?? "").trim(),
      rank,
      rankDisplay,
      score:
        parseFloat(
          r["scores_overall"] ?? r["Score"] ?? r["overall_score"] ?? "",
        ) || null,
    };
  });

  await upsertRankings(rows, "THE", year);
}

export async function seedARWU(year: number) {
  const filePath = path.join(process.cwd(), `prisma/data/arwu_${year}.csv`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ARWU ${year} CSV not found — skipping.`);
    return;
  }
  const records = parse(fs.readFileSync(filePath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  });

  const rows: NormalizedRow[] = records.map((r: Record<string, string>) => {
    const name = (
      r["University"] ??
      r["Institution"] ??
      r["university"] ??
      ""
    ).trim();
    const { rank, rankDisplay } = parseRank(
      r["World Rank"] ?? r["Rank"] ?? r["world_rank"] ?? "",
    );
    return {
      universityName: name,
      normalizedName: normalizeName(name),
      country: (
        r["Country/Region"] ??
        r["Country"] ??
        r["country"] ??
        ""
      ).trim(),
      rank,
      rankDisplay,
      score:
        parseFloat(r["Total Score"] ?? r["Score"] ?? r["score"] ?? "") || null,
    };
  });

  await upsertRankings(rows, "ARWU", year);
}

async function upsertRankings(
  rows: NormalizedRow[],
  source: RankingSource,
  year: number,
) {
  const valid = rows.filter((r) => r.normalizedName.length > 2);
  console.log(`📊 Seeding ${valid.length} ${source} ${year} rankings...`);

  const CHUNK = 50;
  for (let i = 0; i < valid.length; i += CHUNK) {
    const chunk = valid.slice(i, i + CHUNK);
    await db.$transaction(
      chunk.map((r) =>
        db.universityRanking.upsert({
          where: {
            normalizedName_source_year: {
              normalizedName: r.normalizedName,
              source,
              year,
            },
          },
          update: {
            universityName: r.universityName,
            rank: r.rank,
            rankDisplay: r.rankDisplay,
            score: r.score,
            country: r.country,
          },
          create: {
            universityName: r.universityName,
            normalizedName: r.normalizedName,
            country: r.country,
            source,
            year,
            rank: r.rank,
            rankDisplay: r.rankDisplay,
            score: r.score,
          },
        }),
      ),
    );
    console.log(`  ✓ ${Math.min(i + CHUNK, valid.length)} / ${valid.length}`);
  }
  console.log(`✅ ${source} complete.\n`);
}
```

### Seed Entry Point

```typescript
// prisma/seed.ts
import { db } from "@/lib/db";
import { seedQS, seedTHE, seedARWU } from "./seeders/rankings";

async function main() {
  console.log("🌱 Seeding GradPlanner database...\n");

  const YEAR = 2024;
  await seedQS(YEAR);
  await seedTHE(YEAR);
  await seedARWU(YEAR);

  console.log("✅ All seeds complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
```

### package.json

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Ranking Rules (Engineering + Domain)

- Rankings are **global reference data** — never scoped to `userId`
- **Combined model**: one row per university with QS + THE + ARWU data in the same row
- `institutionName` is unique per row and displayed in UI
- `qs2026Rank`, `the2026Rank`, `arwu2025Rank` used for sorting; `*RankDisplay` for display
- `inQs`, `inThe`, `inArwu` booleans indicate which ranking lists the university appears in
- Show all 3 sources side-by-side. Show "—" if `inQs`/`inThe`/`inArwu` is false
- Re-seeding is idempotent (upsert on `institutionName`). Safe to re-run
- Never let users edit ranking data
- **Domain note:** Do not recommend a university solely because it ranks higher. Funding availability > ranking for scholarship-dependent students

---

## 🏗️ Architecture Rules

### Split Architecture — Frontend + Backend

- **Backend** (Express on port 5000): owns Prisma, better-auth, all REST API routes
- **Frontend** (Next.js on port 3000): UI rendering, Redux state, `fetchApi()` calls to backend
- All data mutations go through **Express REST routes** (`/api/v1/*`), NOT Next.js Server Actions
- Auth is handled entirely by better-auth in Express — frontend uses `authClient` from `better-auth/react`
- Session cookies are cross-origin via `credentials: "include"` + CORS config

### Frontend Rules

- Dashboard pages are `'use client'` — they use Redux, `useEffect` for data fetching, and interactive state
- Landing page (`page.tsx`) can be RSC — it uses `authClient.getSession()` with SSR headers
- Layout files can be RSC for static structure, but wrap children in `<Providers>` for Redux + Theme
- Use `fetchApi()` helper for all backend calls — it sets `credentials: "include"` and handles errors
- Use Redux Toolkit slices for client-side state per domain (universities, professors, applications, documents, profile)
- Never import Prisma or backend code in the frontend

### Backend Rules

- Every protected route uses `requireAuth` middleware → `req.user` is available
- Every DB query on user-owned models MUST include `userId: req.user!.id`
- All routes under `/api/v1/` with explicit REST verbs (GET, POST, PUT, DELETE)
- better-auth handler MUST come before `express.json()` middleware
- Use soft deletes (`deletedAt`) on: University, Professor, Application
- Never return raw Prisma errors to client — generic error messages only

### Frontend Route Structure

```
frontend/src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/
│   ├── layout.tsx                   ← auth guard + sidebar + header
│   ├── page.tsx                     ← Country Intelligence Hub (HOME)
│   ├── universities/page.tsx
│   ├── professors/page.tsx
│   ├── applications/page.tsx
│   ├── documents/page.tsx
│   ├── funding/page.tsx             ← scholarship tracker
│   ├── timeline/page.tsx
│   ├── rankings/page.tsx            ← Browse QS/THE/ARWU (public)
│   └── settings/page.tsx
├── universities/page.tsx            ← Public rankings browser
├── layout.tsx                       ← Root layout (fonts, providers)
├── providers.tsx                    ← Redux + ThemeProvider
└── page.tsx                         ← Public landing page
```

### Backend Route Structure

```
backend/src/
├── index.ts                         ← Express app, CORS, auth handler, route registration
├── lib/
│   ├── auth.ts                      ← better-auth config (email + Google OAuth)
│   └── prisma.ts                    ← Prisma client singleton
├── middleware/
│   └── auth.ts                      ← requireAuth middleware
└── routes/
    ├── profile.ts                   ← GET/PUT /api/v1/profile
    ├── rankings.ts                  ← GET /api/v1/rankings (public)
    ├── universities.ts              ← CRUD /api/v1/universities
    ├── professors.ts                ← CRUD /api/v1/professors
    ├── applications.ts              ← CRUD /api/v1/applications
    ├── documents.ts                 ← CRUD /api/v1/documents
    └── stats.ts                     ← GET /api/v1/dashboard/stats
```

---

## 📝 TypeScript Rules

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- Never `any`. Use `unknown` + type narrowing, or Zod inference
- Standard return type for all Server Actions:

```typescript
// types/actions.ts
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

- All Zod schemas in `src/types/` colocated by domain
- Always `schema.safeParse()` — never `schema.parse()` in Server Actions
- Extend better-auth session types as needed via `better-auth`'s type inference
- Use Prisma generated types directly — never manually redefine model shapes

---

## 🔒 Security Rules

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith("re_"),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // Phase 2 (optional now):
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

- All secrets via `process.env` through `env.ts` — never raw `process.env.X` in code
- Every Server Action: session check first
- Rate limit auth endpoints: 5 attempts / 15 min / IP
- Never return raw DB errors to client — generic messages only
- Tokens (verification, reset): 1h expiry, hashed storage, deleted on use
- `userId` isolation: every user-owned Prisma query MUST include `where: { userId: session.user.id }`

---

## 🌍 Domain Intelligence Rules

### Bangladesh Reality — Always Account For

These are non-negotiable domain constraints every recommendation must consider:

**Visa realities:**

- Germany: APS Certificate mandatory for BD nationals (6–8 weeks, German Embassy Dhaka)
- Germany: student visa appointment wait = 2.5+ years in Dhaka
- Canada: 22% rejection rate — SDS stream reduces this significantly
- USA: F-1 rejection ~15% for BD nationals; TA/RA funding letter reduces risk
- Netherlands: MVV required for BD nationals before travel
- UAE: University handles visa — near-zero rejection for MBZUAI admits

**Document timelines (BD-specific):**

- Police Clearance Certificate: 2–6 weeks (pcc.police.gov.bd)
- APS Certificate (Germany): 6–8 weeks
- Passport renewal: 3–4 weeks (urgent: 7–10 days)
- IELTS: results in 13 days, but seats fill 6–8 weeks ahead
- Bank statements: 1–3 days (but must show 6 months consistent history)
- Official transcripts: 3–7 days from UIU Registrar

**PR reality — for Bangladesh passport:**

- USA Green Card (EB-2/EB-3): ~70–90 year backlog for BD nationals — NOT a PR option
- Best PR pathways: Ireland (5yr) > Canada (2-3yr Express Entry) > Australia (3-5yr 485 visa) > Netherlands/Finland (4yr) > Sweden (4yr)
- UAE: No traditional PR — Golden Visa only (10yr renewable)
- Germany: Possible but language (B1) + slow visa + APS = high friction

**Scholarship reality:**

- Most BD students are scholarship-dependent — never recommend a program without addressing funding
- A funded position at a rank-200 university > unfunded at a rank-30 university
- Best fully-funded options: MBZUAI UAE (all admitted), MEXT Japan, GKS Korea, CSC China, SI Scholarship Sweden, TA/RA in USA PhD
- Germany: near-free tuition but living costs require ~€11,208 blocked account

### Professor Outreach Rules

- Status must use `ProfessorStatus` enum only
- Minimum 14 days between follow-ups (enforced in Server Action)
- Max 2 follow-ups per professor (UI warning, not hard block)
- `followUpCount` increments on each follow-up
- Best time reminder in UI: Tuesday–Thursday, 8:30–9:30 AM professor's LOCAL time
- `fundingStatus` is as important as `status` — always surface it
- `researchFitScore` (1–10): show in UI to help prioritize outreach

### Timeline Logic

- Graduation: November 2027 (worst-case)
- Primary intake: September 2028
- Fallback: January 2029
- Application window: August 2027 (documents ready post-graduation)
- Sweden hard deadline constant: `SWEDEN_DEADLINE = new Date("2028-01-15")`
- All date calculations server-side — never `new Date()` on client for deadline comparison

### Country & Tier Constraints

- 13 countries are fixed as a Prisma enum — migration required to add more
- Tier definitions:
  - `DREAM` — Ambitious: competitive but not guaranteed with this profile
  - `MATCH` — Realistic: good fit for CGPA 3.8 + UIU profile
  - `SAFETY` — High probability: accessible admission, valid degree + PR path

---

## 🎨 UI & Styling Rules

- shadcn/ui for all primitives — never reinvent Button, Input, Dialog, Table, Badge, Tabs
- Tailwind only — no CSS modules, no inline styles, no styled-components
- Mobile-first. Test breakpoints: 375px, 768px, 1280px
- **Light/Dark theme**: `next-themes` + shadcn ThemeProvider with `class` strategy
- **CRITICAL**: Never use hardcoded color classes like `text-zinc-100`, `bg-zinc-950`, `bg-emerald-500`
- Always use semantic Tailwind classes: `text-foreground`, `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`
- Use CSS custom properties in `globals.css` for theme-specific colors (tiers, statuses, accents)
- Cards must be visually distinct from background in BOTH themes (dark: border, light: shadow + border)
- Input fields must have visible borders in light mode
- Loading: spinner + skeleton components; every list has a loading state
- Every data list: meaningful empty state (not blank)
- Every async operation: error handling with user-visible feedback
- Country pages: advisor-style reports, NOT generic tables
- Prefer visual decision-support over raw data dumps

---

## 📁 File & Folder Conventions

### Frontend (`frontend/src/`)

```
src/
├── app/                          ← Routes + page components
│   ├── (auth)/                   ← Login, Register pages
│   ├── dashboard/                ← Protected dashboard pages
│   ├── universities/             ← Public rankings browser
│   ├── globals.css               ← Theme CSS variables (light + dark)
│   ├── layout.tsx                ← Root layout (fonts, Providers)
│   ├── providers.tsx             ← Redux Provider + ThemeProvider
│   └── page.tsx                  ← Public landing page
├── components/
│   ├── ui/                       ← shadcn/ui (never edit)
│   ├── shared/                   ← Sidebar, PageHeader, ThemeToggle, EmptyState
│   ├── countries/                ← CountryCard, CountryHub, CountryReport
│   ├── universities/             ← UniversityCard, UniversityTable, RankingBadge
│   ├── professors/               ← ProfessorCard, OutreachStatusBadge, FitScore
│   ├── applications/             ← ApplicationCard, StatusPipeline
│   ├── documents/                ← DocumentChecklist, DocumentStatusBadge
│   ├── funding/                  ← ScholarshipCard, FundingCalculator
│   ├── rankings/                 ← RankingTable, RankingSourceTabs, RankBadge
│   └── timeline/                 ← TimelineView, DeadlineAlert
├── lib/
│   ├── api.ts                    ← fetchApi() helper (backend REST client)
│   ├── auth-client.ts            ← better-auth browser client
│   ├── store/                    ← Redux Toolkit store
│   │   ├── store.ts              ← configureStore, typed hooks
│   │   └── slices/
│   │       ├── profileSlice.ts
│   │       ├── universitySlice.ts
│   │       ├── professorSlice.ts
│   │       ├── applicationSlice.ts
│   │       └── documentSlice.ts
│   └── utils.ts                  ← cn(), formatDate()
├── hooks/                        ← Client hooks only
│   ├── use-debounce.ts
│   └── use-toast.ts
├── types/
│   └── index.ts                  ← TypeScript interfaces mirroring Prisma models
└── constants/
    ├── countries.ts              ← COUNTRIES array, Country type, country metadata
    ├── statuses.ts               ← STATUS_LABELS, STATUS_COLORS
    └── timelines.ts              ← KEY_DEADLINES, SWEDEN_DEADLINE
```

### Backend (`backend/src/`)

```
src/
├── index.ts                      ← Express app entry point
├── lib/
│   ├── auth.ts                   ← better-auth config
│   └── prisma.ts                 ← Prisma client singleton
├── middleware/
│   └── auth.ts                   ← requireAuth middleware
├── routes/
│   ├── profile.ts                ← User profile CRUD
│   ├── rankings.ts               ← University rankings search (public)
│   ├── universities.ts           ← Tracked universities CRUD
│   ├── professors.ts             ← Professor contacts CRUD
│   ├── applications.ts           ← Application tracking CRUD
│   ├── documents.ts              ← Document checklist CRUD
│   └── stats.ts                  ← Dashboard statistics
└── generated/prisma/             ← Prisma generated client
```

---

## ⚙️ Standard REST Route Pattern (Backend)

```typescript
// backend/src/routes/professors.ts
import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

const router: Router = Router();

// POST /api/v1/professors
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Auth — handled by requireAuth middleware (req.user is set)
    const userId = req.user!.id;

    // 2. Validate input
    const { name, email, universityId, researchInterests, status, notes } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Professor name is required" });
    }

    // 3. Business logic — domain checks
    // (e.g. verify universityId ownership, follow-up interval enforcement)
    if (universityId) {
      const uni = await prisma.university.findFirst({
        where: { id: universityId, userId, deletedAt: null },
      });
      if (!uni) return res.status(404).json({ error: "University not found" });
    }

    // 4. DB write — always scoped to userId
    const professor = await prisma.professor.create({
      data: { userId, name, email, universityId, researchInterests, status, notes },
      include: { university: true },
    });

    // 5. Return result
    res.status(201).json(professor);
  } catch (error) {
    // 6. Never expose raw errors
    console.error("POST /professors error:", error);
    res.status(500).json({ error: "Failed to create professor" });
  }
});

export default router;
```

## ⚙️ Standard Frontend Data Flow Pattern

```typescript
// frontend/src/app/dashboard/professors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfessors, addProfessor } from "@/lib/store/slices/professorSlice";

export default function ProfessorsPage() {
  const dispatch = useAppDispatch();
  const professors = useAppSelector((s) => s.professors.items);
  const [loading, setLoading] = useState(true);

  // 1. Load data on mount
  useEffect(() => {
    fetchApi("/api/v1/professors")
      .then((data) => dispatch(setProfessors(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch]);

  // 2. Create via REST → dispatch to Redux
  const handleCreate = async (payload: unknown) => {
    const newProf = await fetchApi("/api/v1/professors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    dispatch(addProfessor(newProf));
  };

  // 3. Render from Redux state
  return ( /* ... */ );
}
```

---

## 🚫 Hard Constraints — Never

- ❌ Use `any` type — use `unknown` + type guards or explicit interfaces
- ❌ Use `getServerSideProps` / `getStaticProps` — App Router only
- ❌ Query Prisma on user-owned models without `userId` scope
- ❌ Store plaintext passwords — better-auth handles hashing
- ❌ Return raw Prisma or system errors to the client — generic messages only
- ❌ Skip `try/catch` in any Express route handler
- ❌ Hardcode secrets — use `.env` files, never commit them
- ❌ Let users mutate `UniversityRanking` data — read-only seeded data
- ❌ Import Prisma or backend code in the frontend — use `fetchApi()` only
- ❌ Use hardcoded colors (`text-zinc-100`, `bg-zinc-950`) — use semantic classes (`text-foreground`, `bg-background`)
- ❌ Recommend a university based on ranking alone — always consider funding + admission probability
- ❌ Ignore Bangladesh-specific constraints (APS, visa wait, PCC timeline, blocked account)
- ❌ Treat USA as a PR option for BD nationals — it is NOT
- ❌ Create duplicate components, schemas, or utility functions
- ❌ Install a package without first checking if shadcn/ui or Next.js already provides it
- ❌ Remove Redux — it is the chosen state management solution
- ❌ Replace the Express backend with Next.js Server Actions

---

## ✅ Pre-Commit Checklist

- [ ] Backend routes: `requireAuth` middleware → validate input → business logic → Prisma → response
- [ ] All user-data Prisma queries scoped to `req.user!.id`
- [ ] No `any` types — `tsc --noEmit` passes in both frontend and backend
- [ ] Loading, empty, and error states all present in UI
- [ ] Mobile responsive at 375px
- [ ] Light mode AND dark mode tested — no hardcoded zinc/emerald colors
- [ ] No hardcoded secrets
- [ ] `prisma generate` run after schema changes
- [ ] University ranking seeders use upsert (idempotent)
- [ ] Redux slices updated when new domain fields are added
- [ ] Frontend `types/index.ts` matches backend Prisma schema
- [ ] Domain advice reflects BD-specific realities
