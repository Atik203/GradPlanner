# AGENT.md — GradPlanner Application

> **Read this file before writing any code.**
> This is the single source of truth for all architectural decisions, constraints, and conventions.
> Never deviate from these rules without explicit instruction.

---

## 🎯 Project Overview

**GradPlanner** is a multi-user Next.js full-stack web application for tracking and managing graduate school applications for a Master's degree in **Machine Learning and Artificial Intelligence abroad**.

| Field                    | Value                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Primary User Profile** | Md. Atikur Rahaman, 4th-year CSE, UIU Dhaka, Bangladesh                                                                  |
| **Target Intake**        | September 2028 (fallback: January 2029)                                                                                  |
| **Graduation Date**      | Late 2027 (November worst-case)                                                                                          |
| **CGPA**                 | 3.8 / 4.0                                                                                                                |
| **Countries Tracked**    | 13 (Ireland, Sweden, Germany, Australia, USA, Canada, South Korea, China, Japan, UAE, Netherlands, Switzerland, Finland) |
| **University Tiers**     | Dream · Match · Safety                                                                                                   |
| **Auth Model**           | Multi-user — each user has isolated data                                                                                 |

---

## 🛠️ Tech Stack

| Layer              | Technology                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| Framework          | Next.js 14+ (App Router)                                                       |
| Language           | TypeScript (strict mode)                                                       |
| Database ORM       | Prisma + PostgreSQL                                                            |
| Auth               | **better-auth** — email/password (Phase 1), Google OAuth planned (Phase 2)     |
| Styling            | Tailwind CSS + shadcn/ui                                                       |
| Forms & Validation | React Hook Form + Zod                                                          |
| State Management   | Server state via RSC + Server Actions; no global client store unless justified |
| File Storage       | Vercel Blob or Supabase Storage (for document uploads)                         |
| Email              | Resend (for notifications / follow-up reminders)                               |
| Deployment         | Vercel                                                                         |

---

## 🏗️ Architecture Rules

### Next.js App Router

- **Default to React Server Components (RSC).** Only add `'use client'` when strictly required:
  - Browser APIs (`window`, `localStorage`, `navigator`)
  - Interactivity (`onClick`, `onChange`, controlled inputs)
  - React hooks (`useState`, `useEffect`, `useRef`)
  - shadcn/ui components that are inherently client-side
- **Never** put `'use client'` at layout level unless the entire subtree needs it.
- Use **Next.js Server Actions** for ALL database mutations (create, update, delete, reorder).
- Use **`next/navigation`** (`redirect`, `notFound`) inside Server Actions and RSCs — never `useRouter` in Server Actions.
- Colocate Server Actions in `actions/` directory or at the top of the component file using `'use server'` directive.

### Routing Structure

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── layout.tsx          ← Protected layout (auth guard here)
│   ├── page.tsx            ← Dashboard overview
│   ├── universities/
│   ├── professors/
│   ├── applications/
│   ├── documents/
│   ├── timeline/
│   └── settings/
├── layout.tsx              ← Root layout (fonts, providers)
└── page.tsx                ← Landing / marketing page
```

---

## 🔐 Authentication & Multi-User Rules

- Use **better-auth** — do NOT use NextAuth/Auth.js. Do NOT implement custom JWT or session logic.
- **Architecture**: better-auth runs in the **Express backend** (`backend/src/lib/auth.ts`), mounted as `app.all("/api/auth/*splat", toNodeHandler(auth))`.
- **Phase 1**: email + password only (via `authClient.signIn.email` / `authClient.signUp.email`).
- **Phase 2 (future)**: Google OAuth — do not implement until `GOOGLE_CLIENT_ID` env var is configured.
- Password hashing: better-auth uses `scrypt` natively — do NOT use bcryptjs or any custom hasher unless explicitly requested.
- Passwords are stored in the `Account` table (not `User`) with `providerId = "credential"`.
- Session strategy: **database sessions** stored in `Session` table. Token in cookie.
- **Every** database query MUST be scoped to `userId`. Never query without a userId filter.
- Auth guard lives in `(dashboard)/layout.tsx` — redirect unauthenticated users to `/login`.
- Get session in **Server Components / Server Actions** via the backend API or better-auth's `getSession()`.
- Frontend client: `import { authClient } from "@/lib/auth-client"` — NEVER import server auth config on the client.
- On Server Actions, always validate session first:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return { success: false, error: "Unauthorized" };
}
```

- Never expose one user's data to another. All Prisma queries include `where: { userId: session.user.id }`.

---

## 🗄️ Database & Prisma Rules

- Always use **`select`** or **`include`** — never fetch entire models when a subset suffices.
- Use Prisma **transactions** (`prisma.$transaction`) when multiple dependent writes occur together.
- All models must have:
  - `id` — `@id @default(cuid())`
  - `createdAt` — `@default(now())`
  - `updatedAt` — `@updatedAt`
  - `userId` — foreign key to `User` model (multi-tenancy)
- Use **soft deletes** (`deletedAt DateTime?`) on critical records (applications, universities, professors).
- Run `prisma generate` after every schema change. Never import from `@prisma/client` before generating.
- Seed file at `prisma/seed.ts` must include the 13 countries and default university tier data.

### Core Schema Outline

```prisma
model User {
  id            String        @id @default(cuid())
  name          String?
  email         String        @unique
  password      String?       // nullable for OAuth users
  image         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  profile       UserProfile?
  universities  University[]
  professors    Professor[]
  applications  Application[]
  documents     Document[]
  sessions      Session[]
}

model UserProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  university       String?  // e.g. "UIU Dhaka"
  cgpa             Float?
  targetIntake     String?  // e.g. "Sep 2028"
  graduationDate   String?  // e.g. "Nov 2027"
  targetDegree     String?  // e.g. "MSc ML/AI"
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model University {
  id           String        @id @default(cuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  country      String
  tier         Tier          // Dream | Match | Safety
  program      String?
  tuitionPerYr String?
  deadline     String?
  intake       String?
  website      String?
  notes        String?
  deletedAt    DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  professors   Professor[]
  application  Application?
}

model Professor {
  id               String            @id @default(cuid())
  userId           String
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  universityId     String?
  university       University?       @relation(fields: [universityId], references: [id])
  name             String
  email            String?
  profileUrl       String?
  researchInterests String?
  emailSentDate    DateTime?
  emailSubject     String?
  replyReceived    Boolean           @default(false)
  replyDate        DateTime?
  status           ProfessorStatus   @default(NOT_CONTACTED)
  lastFollowUp     DateTime?
  nextFollowUp     DateTime?
  interviewDate    DateTime?
  suggestedContact String?           // if professor referred someone else
  futureFundingNote String?          // "funding available next year" etc.
  notes            String?
  deletedAt        DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model Application {
  id             String            @id @default(cuid())
  userId         String
  user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  universityId   String            @unique
  university     University        @relation(fields: [universityId], references: [id])
  status         ApplicationStatus @default(PLANNING)
  deadline       DateTime?
  submittedAt    DateTime?
  decisionDate   DateTime?
  offerReceived  Boolean           @default(false)
  scholarshipAmt String?
  notes          String?
  deletedAt      DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model Document {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  type        DocumentType
  country     String?        // which country this doc is for, null = all
  status      DocumentStatus @default(PENDING)
  fileUrl     String?
  expiresAt   DateTime?
  notes       String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum Tier {
  DREAM
  MATCH
  SAFETY
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
  POLICE_CLEARANCE
  BANK_STATEMENT
  MEDICAL
  OTHER
}

enum DocumentStatus {
  PENDING
  IN_PROGRESS
  OBTAINED
  EXPIRED
  NOT_REQUIRED
}
```

---

## 📝 TypeScript Rules

- **`strict: true`** in `tsconfig.json` — no exceptions.
- Never use `any`. Use `unknown` and narrow with type guards, or use Zod inference.
- Type all Server Action return values explicitly:

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- Use Zod schemas for ALL form validation — both client-side (React Hook Form resolver) and server-side (inside Server Actions before DB write).
- Infer types from Zod schemas: `type FormData = z.infer<typeof formSchema>`.
- Use Prisma's generated types for DB return values — never manually type a Prisma result.

---

## 🎨 UI & Styling Rules

- Use **shadcn/ui** components as the base — do not reinvent buttons, inputs, dialogs, tables.
- Tailwind only — no inline styles, no CSS modules unless absolutely necessary.
- All pages must be **responsive** (mobile-first). Use Tailwind breakpoints: `sm`, `md`, `lg`.
- Color system: use CSS variables defined in `globals.css` (shadcn default + custom).
- Dark mode: support via `next-themes` + shadcn's `ThemeProvider`.
- Loading states: use **Suspense + loading.tsx** for RSC streaming. Use skeleton components.
- Empty states: every list/table must have a meaningful empty state component.
- Error states: every async boundary must have an `error.tsx` or inline error UI.

---

## 🌍 Domain Logic Constraints

### Timeline Logic

- Graduation: **November 2027** (worst-case). All date calculations must account for this.
- Primary target intake: **September 2028**.
- Fallback intake: **January 2029**.
- Application window opens: **August 2027** (post-graduation document collection).
- Key hard deadline in system: **Sweden universityadmissions.se — January 15, 2028**.
- When calculating "days until deadline", always compare against `new Date()` server-side.

### Professor Outreach

- Status must only use the `ProfessorStatus` enum values above — no freeform strings.
- Follow-up interval: 14 days minimum between contacts.
- Max follow-ups: 2 per professor (enforce as UI warning, not hard block).
- Best email time: Tuesday–Thursday, 8:30–9:30 AM professor's local time (display as reminder in UI).

### Countries

The 13 tracked countries are fixed. Country data (tiers, visa info, scholarship info) is seeded — users can add universities within these countries but cannot add new countries unless admin.

```typescript
export const COUNTRIES = [
  "Ireland",
  "Sweden",
  "Germany",
  "Australia",
  "USA",
  "Canada",
  "South Korea",
  "China",
  "Japan",
  "UAE",
  "Netherlands",
  "Switzerland",
  "Finland",
] as const;

export type Country = (typeof COUNTRIES)[number];
```

### University Tiers

```typescript
// Dream   = Ambitious (CGPA 3.8 is competitive but not guaranteed)
// Match   = Realistic target for this profile
// Safety  = High acceptance likelihood
```

---

## 🔒 Security Rules

- **Never** expose `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET` or any secret in code.
- All secrets via `process.env` — validate at startup with a `lib/env.ts` file using Zod.
- All Server Actions must validate session before any DB operation.
- Use `headers()` and `cookies()` from `next/headers` — never access raw request objects in RSC.
- Input sanitization: Zod schemas handle this — never trust raw form data.
- Rate limiting on auth routes using `@upstash/ratelimit` + Upstash Redis.

```typescript
// lib/env.ts — always validate env vars
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
```

---

## 📁 File & Folder Conventions

```
src/
├── app/                    ← Next.js App Router
├── components/
│   ├── ui/                 ← shadcn/ui primitives (do not edit)
│   ├── shared/             ← reusable app components (Navbar, Sidebar, etc.)
│   └── [feature]/          ← feature-specific components
├── lib/
│   ├── auth.ts             ← NextAuth config
│   ├── db.ts               ← Prisma client singleton
│   ├── env.ts              ← Zod env validation
│   └── utils.ts            ← cn() and other helpers
├── actions/                ← Server Actions (grouped by domain)
│   ├── university.ts
│   ├── professor.ts
│   ├── application.ts
│   └── document.ts
├── hooks/                  ← custom React hooks (client-side only)
├── types/                  ← shared TypeScript types and Zod schemas
│   ├── professor.ts
│   ├── university.ts
│   └── application.ts
└── constants/              ← COUNTRIES, TIERS, STATUS_LABELS etc.
```

---

## ⚙️ Server Action Pattern (Standard Template)

```typescript
// actions/professor.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { professorSchema } from "@/types/professor";
import { revalidatePath } from "next/cache";

export async function createProfessor(formData: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = professorSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const professor = await db.professor.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/professors");
    return { success: true, data: professor };
  } catch (error) {
    console.error("[CREATE_PROFESSOR]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
```

---

## 🚫 Hard Constraints — Never Do These

- ❌ Never use `useEffect` to fetch data — use RSC or `use()` hook with Suspense
- ❌ Never use `getServerSideProps` or `getStaticProps` — App Router only
- ❌ Never query Prisma without scoping to `userId`
- ❌ Never store secrets in code or `.env.example` with real values
- ❌ Never use `any` type
- ❌ Never mutate state directly — use Server Actions + `revalidatePath`/`revalidateTag`
- ❌ Never install a new package without checking if shadcn/ui or Next.js already provides it
- ❌ Never skip error handling in Server Actions
- ❌ Never use `console.log` in production — use structured logging or remove before commit
- ❌ Never create a new country outside the 13 defined ones (unless admin flag on user)

---

## ✅ Checklist Before Any PR / Feature Completion

- [ ] All Server Actions have auth check + try/catch
- [ ] All Prisma queries scoped to `userId`
- [ ] Zod validation on both client and server
- [ ] No `any` types — TypeScript strict passes
- [ ] Loading, empty, and error states implemented
- [ ] Mobile responsive (tested at 375px width)
- [ ] No secrets hardcoded
- [ ] `prisma generate` run after schema changes
- [ ] `revalidatePath` called after all mutations

---

## 🔑 Authentication Strategy

### Phase 1 — Email / Password (Current)

- Provider: **better-auth** (Replacing NextAuth.js v5)
- Password hashed with **scrypt** automatically by better-auth's credential provider before storage
- Stored in `Account.password` (nullable — null for OAuth users in Phase 2)
- Registration flow: Client calls `authClient.signUp.email({ email, password, name })`
- Login flow: Client calls `authClient.signIn.email({ email, password })`
- Session cookie managed automatically by better-auth
- Session contains: `{ user: { id, name, email, image }, session: { id, token, ... } }`

```typescript
// Client-side authentication example
import { authClient } from "@/lib/auth-client";

// Sign Up
const signUp = async () => {
  const { data, error } = await authClient.signUp.email({
    email: "user@example.com",
    password: "password123",
    name: "User Name",
  });
};

// Sign In
const signIn = async () => {
  const { data, error } = await authClient.signIn.email({
    email: "user@example.com",
    password: "password123",
  });
};
```

### Phase 2 — OAuth (Planned, do NOT implement yet)

- Provider: **Google OAuth** via better-auth social providers
- `Account` and `Session` tables already in schema — ready for OAuth when enabled
- OAuth users will have `password: null` — never prompt them for a password
- Add `Google` provider config only when `GOOGLE_CLIENT_ID` env var is present
- Migration: existing credential users can link Google via account settings

### Password Reset (Phase 2)

- Flow: email → verification flow → time-limited link → new password
- Use `Resend` for transactional emails
- Token expires in 1 hour

---

## 📊 University Rankings Dataset

### Source Files

| File | Source | Years | Records |
|---|---|---|---|
| `dataset/qs-2026.csv` | QS World University Rankings | 2026 only | 1,500 |
| `dataset/the-2016-2026.csv` | Times Higher Education | 2016–2026 | ~2,190/yr |
| `dataset/arwu-2003-2025.csv` | Academic Ranking of World Universities | 2003–2025 | ~1,000/yr |

### Preprocessing Pipeline

Location: `notebook/preprocess.py`

- Uses **latest available year** from each source: QS 2026, THE 2026, ARWU 2025
- Merges all three into a **single row per university** via normalized name matching
- Output: `notebook/universities.csv` — **3,045 universities**, 33 columns
- Coverage:
  - Ranked in all 3 systems: **468 universities**
  - QS + THE only: 455 | QS + ARWU only: 72 | THE + ARWU only: 179
  - Exclusive: QS only 505, THE only 1,088, ARWU only 278

### Database Model: `UniversityRanking`

**One row per university** (not per source/year). Fields:

```
institutionName   Canonical name
country           Country
region            Geographic region (from QS)
inQs / inThe / inArwu   Boolean presence flags
qs2026Rank / the2026Rank / arwu2025Rank   Integer ranks
qs2026Score / the2026Score / arwu2025Score   Overall scores
```

Plus individual metric scores for each system (see `schema.prisma` for full list).

### Seeding

```bash
# Step 1 — regenerate the merged CSV (re-run after dataset updates)
python notebook/preprocess.py

# Step 2 — seed the database
cd backend && pnpm exec prisma db seed
```

### Querying Rankings

```typescript
// Universities ranked in all 3 systems, sorted by QS rank
const top = await db.universityRanking.findMany({
  where: { inQs: true, inThe: true, inArwu: true },
  orderBy: { qs2026Rank: "asc" },
  take: 50,
});

// Find a specific university's full ranking profile
const profile = await db.universityRanking.findUnique({
  where: { institutionName: "University of Oxford" },
});

// Universities in a target country, sorted by best available rank
const byCountry = await db.universityRanking.findMany({
  where: { country: "Germany" },
  orderBy: [{ qs2026Rank: "asc" }, { the2026Rank: "asc" }],
});
```

### Rules for Ranking Data

- **Read-only** — `UniversityRanking` is seeded data, never mutated by user actions.
- When suggesting universities to a user, join `UniversityRanking` on `University.name` for display scores.
- Ranking data is **not** user-scoped — no `userId` filter needed.
- When displaying ranks, always show `rankDisplay` (not the integer) to preserve ranges like "801-1000".
- If a university is not in a ranking system, show "—" not "0" in the UI.

---

## 🗂️ Notebook / Data Pipeline

```
notebook/
├── preprocess.py       ← Merge QS/THE/ARWU → universities.csv
├── inspect.py          ← Quick dataset inspection helper
└── universities.csv    ← Generated merged output (do NOT commit — add to .gitignore)
```

- **Never commit `universities.csv`** — it's generated from the dataset files.
- If dataset files are updated, re-run `preprocess.py` then `prisma db seed`.
- The `notebook/` folder is Python-only; no TypeScript/Node code here.


