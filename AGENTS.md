# CACHE OPTIMIZATION CONTRACT — FROZEN PREFIX
# This block is always first. Never modify it between calls.
# DeepSeek, Kimi, GLM, MiMo: cache matches from byte 0 forward.
# Any edit before byte N invalidates everything after it.

## Prefix stability rules (all models)
- System prompt and tool definitions: STATIC — never changes between calls
- File reads: DYNAMIC — always appended at the END of context, never inserted mid-prefix
- User message: always last
- Conversation history: append-only, never rewrite or regenerate earlier turns
- Never inject timestamps, dates, session IDs, or any dynamic value into the system prompt

## Qwen cache requirement
Qwen3.x models require minimum 1024 tokens to activate prefix caching.
Keep this AGENTS.md + opencode.json + skills content above 1024 tokens total.
If content is short, the agent must pad with additional project context below.

## Agent behavior rules (cache-preserving)
- Think before acting — understand the full goal before any tool call
- One tool call at a time
- Read a file only ONCE per session unless you have edited it
- Do not re-read files to "verify" — trust what was already loaded into context
- Do not call tools speculatively
- Stop when the goal is achieved — do not add unrequested changes
- Never duplicate file content across turns — reference by path after first read

## File read priority order for GradPlanner tasks
Backend tasks: read backend/prisma/schema.prisma first
Frontend tasks: check frontend/src/components/ before creating new files
Auth tasks: read backend/src/lib/auth.ts first
State tasks: read frontend/src/lib/store/ structure first
API tasks: read backend/src/routes/ first
Implementation plan tasks: read implementation.md once, then use Implementation Status below

## Never do (hard rules)
- Never import backend code into frontend
- Never use Prisma in frontend
- Never suggest NextAuth — use better-auth only
- Never add console.log for debugging
- Never install new packages without confirming with user
- Never touch .env files
- Never run prisma migrate without explicit user instruction
- Never generate code without first stating: goal, risks, approach

## Always do
- Run pnpm type-check after any TypeScript changes (scripts exist in both package.json files)
- Keep Redux slices in frontend/src/lib/store/slices/
- Keep all API calls in frontend/src/lib/api.ts — never inside components directly
- Respect the frontend/backend architecture boundary at all times

---

# GradPlanner AI Agent Instructions

You are working on GradPlanner.

## Product

GradPlanner is a decision-support platform for Bangladeshi students pursuing MSc/PhD abroad.

The goal is NOT dashboard creation.

The goal is helping users:

- Choose countries
- Select universities
- Find professors
- Track scholarships
- Understand visas
- Plan PR pathways
- Manage applications

Every feature must improve decision making.

---

## Tech Stack

Frontend:

- Next.js 15 App Router
- TypeScript Strict
- Redux Toolkit
- Tailwind v4
- shadcn/ui

Backend:

- Express.js
- TypeScript
- Prisma 7
- PostgreSQL
- better-auth

---

## Architecture

Frontend and Backend are separate.

Frontend:

- UI only
- Redux state
- REST API calls via frontend/src/lib/api.ts

Backend:

- Business logic
- Auth
- Prisma

Never import backend code into frontend.

Never use Prisma in frontend.

---

## Authentication

Use better-auth only.

Backend:

/api/v1/auth/*

Frontend:

authClient

Never suggest NextAuth.

---

## Core Pages

Dashboard Home:
Country Intelligence Hub

Flow:

Countries
→ Country Details
→ Universities
→ Professors
→ Applications

---

## Country Intelligence Priority

When showing countries always prioritize:

1. Funding
2. Admission chance
3. Job market
4. PR pathway
5. Family settlement
6. Visa difficulty

Ranking is secondary.

Funding > Ranking

---

## User Profile

Target user:

Bangladeshi CSE student

Typical profile:

- CGPA 3.0–4.0
- Scholarship dependent
- AI/ML focused
- Budget conscious

---

## Before Implementing

Always:

1. Understand goal
2. Identify risks
3. Suggest improvements
4. Implement

Do not blindly generate code.

---

# Implementation Status

Read implementation.md once per phase. Use this section as the source of truth for current progress.

```text
Phase 1 : In Progress   (Backend API hardening: validators, ApiResponse<T>, UserSettings)
Phase 2 : Pending       (Onboarding wizard & isOnboarded flag)
Phase 3 : Pending       (Skeletons, error states, empty states)
Phase 4 : Pending       (Mobile-first UI & navigation)
Phase 5 : Pending       (Notifications & reminders)
Phase 6 : Pending       (Global search & command palette)
Phase 7 : Pending       (Advanced analytics & ROI)
Phase 8 : Pending       (Professor email generator)
Phase 9 : Pending       (PR & visa pathway simulator)
Phase 10: Pending       (PWA & performance optimization)
```

## Current Phase Details

Phase 1: Backend API Hardening & Input Validation

Goals:
- Add Zod validators in backend/src/validators/
- Introduce ApiResponse<T> envelope: { success: true, data: T } | { success: false, error, code, fieldErrors? }
- Update fetchApi in frontend/src/lib/api.ts to unwrap the envelope
- Add rate limiting, body-size limits, structured logger
- Extract shared parsers (toFloatOrNull, toIntOrNull, toBoolOrNull)
- Add UserSettings model + /api/v1/settings endpoints
- Wire frontend Settings page to real API
- Add type-check scripts to both package.json files

## Completed Phases

None.

---

# Implementation Memory

Reference these before reading the full repo or creating new files.

## Current Phase

Phase 1: Backend API Hardening & Input Validation

## Completed Phases

None.

## Shared Components

| Component | Path | Use For |
|-----------|------|---------|
| Button | frontend/src/components/ui/button.tsx | All buttons |
| Card | frontend/src/components/ui/card.tsx | All cards |
| Dialog | frontend/src/components/ui/dialog.tsx | Modals |
| Input | frontend/src/components/ui/input.tsx | Form inputs |
| Label | frontend/src/components/ui/label.tsx | Form labels |
| Select | frontend/src/components/ui/select.tsx | Dropdowns |
| EmptyState | frontend/src/components/shared/EmptyState.tsx | Empty lists |
| CountryFlag | frontend/src/components/shared/CountryFlag.tsx | Flag rendering |
| MetricCard | frontend/src/components/dashboard/MetricCard.tsx | Dashboard metrics |
| SectionHeader | frontend/src/components/dashboard/SectionHeader.tsx | Page sections |
| WhatNextToday | frontend/src/components/dashboard/WhatNextToday.tsx | Dashboard suggestions |

## Shared Layouts

| Layout | Path | Notes |
|--------|------|-------|
| Public layout | frontend/src/app/(public)/layout.tsx | Marketing pages |
| Dashboard layout | frontend/src/app/dashboard/layout.tsx | Auth-guarded app |

## Shared Hooks

| Hook | Path | Use For |
|------|------|---------|
| useDebounce | frontend/src/hooks/use-debounce.ts | Search debounce |

## Shared Services / API

| Service | Path | Use For |
|---------|------|---------|
| fetchApi | frontend/src/lib/api.ts | All API calls |
| authClient | frontend/src/lib/auth-client.ts | Auth calls |

## Shared State Slices

| Slice | Path |
|-------|------|
| profileSlice | frontend/src/lib/store/slices/profileSlice.ts |
| universitySlice | frontend/src/lib/store/slices/universitySlice.ts |
| professorSlice | frontend/src/lib/store/slices/professorSlice.ts |
| applicationSlice | frontend/src/lib/store/slices/applicationSlice.ts |
| documentSlice | frontend/src/lib/store/slices/documentSlice.ts |
| countryMatchSlice | frontend/src/lib/store/slices/countryMatchSlice.ts |

## Database Schema Version

v1.0 — Current models:
- User, Account, Session, Verification
- UserProfile
- University, Professor, Application, Document
- UniversityRanking
- CountryIntelligence

Pending additions (Phase 1):
- UserSettings model

## Design System Version

v1.0 — Tailwind v4 + shadcn/ui primitives.
- Theme: light/dark/system via next-themes
- Color tokens: default shadcn slate/zinc scale
- No custom fluid typography yet (Phase 4)

## Implementation Status

See Implementation Status section above.

---

# Max Cache Hit Rules

Future implementations MUST:

## Cache

- Architecture decisions (this AGENTS.md)
- Shared components listed in Implementation Memory
- Theme system and design tokens
- Database schema version
- API response contract (ApiResponse<T>)
- Shared DTOs / Zod schemas
- Shared hooks
- API clients (fetchApi, authClient)
- Auth flow
- State stores and slice patterns
- Route structure
- shadcn/ui primitives

## Avoid

- Re-reading entire repo unnecessarily
- Re-generating existing components
- Recreating DTOs, services, or hooks
- Duplicating utility functions
- Duplicating schema definitions
- Adding new packages without confirming with user

## Reuse First Principle

Before creating anything, search in this order:

1. Existing component in frontend/src/components/
2. Existing hook in frontend/src/hooks/
3. Existing schema/validator in backend/src/validators/
4. Existing utility in frontend/src/lib/ or backend/src/utils/
5. Existing layout
6. Existing table component
7. Existing form abstraction

If it exists: extend it. Do NOT duplicate.

---

# Shared Architecture Decisions

## API Response Contract

All new backend routes must return:

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string; fieldErrors?: Record<string, string[]> };
```

Error codes: VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, RATE_LIMITED, INTERNAL_ERROR

fetchApi must unwrap `data` from successful responses.

## Validation

Use Zod on backend. Frontend may duplicate lightweight schemas or use react-hook-form resolvers. Never import backend validators into frontend.

## Auth

Use better-auth only. Auth paths (/api/v1/auth/*) are handled by better-auth and must NOT be wrapped in ApiResponse<T>.

## State

Use Redux Toolkit for global state. Keep slices in frontend/src/lib/store/slices/. Local component state is fine for ephemeral UI (modals, wizards).

## API Client

All frontend API calls go through frontend/src/lib/api.ts. Never call fetch directly inside components.

## Theme

Use next-themes. Theme switching is client-side and does not require backend persistence.

## File Naming

- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Slices: camelCase with `Slice` suffix
- Routes: kebab-case or camelCase matching existing convention

---

# Tooling Notes

- packageManager: pnpm. Frontend pins 10.14.0, backend pins 11.8.0 — be aware of mismatch.
- Type-check: run `pnpm type-check` in both frontend/ and backend/ after TS changes.
- Lint: frontend uses `eslint-config-next`; backend has no lint script currently.
- Prisma: never run `prisma migrate` without explicit user instruction.
