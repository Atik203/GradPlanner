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
Phase 1 : Completed     (Backend API hardening: validators, ApiResponse<T>, UserSettings)
Phase 2 : Completed     (Onboarding wizard & isOnboarded flag)
Phase 3 : Completed     (Skeletons, error states, empty states)
Phase 4 : Completed     (Mobile-first UI & navigation)
Phase 5 : Completed     (Notifications & reminders)
Phase 6 : Completed     (Global search & command palette)
Phase 7 : Completed     (Advanced analytics & ROI dashboard)

Phase 9 : Pending       (PR & visa pathway simulator)
Phase 10: Pending       (PWA & performance optimization)
```

## Current Phase Details

Phase 8 — Professor email generator (Pending)
- Backend: POST /api/v1/professors/:id/generate-email endpoint with LLM integration
- Frontend: EmailGeneratorModal with draft editor, regenerate options, copy to clipboard
- Professor detail page integration with "Draft Outreach Email" button

## Completed Phases

### Phase 1 — Backend API Hardening & Input Validation (Completed)

Goals delivered:
- ✅ Zod validation, ApiResponse<T> envelope, rate limiting, body-size cap, structured logger, UserSettings model, settings page rewrite, shared parsers, 3045 rankings + 20-country seed data.

### Phase 2 — Onboarding Wizard & Profile Intelligence UX (Completed)

Goals delivered:
- ✅ `isOnboarded` flag, 4-step wizard (OnboardingWizard/Guide/Gate), BdtConverter, DeleteConfirmDialog, profile completeness bar, Info tooltips, live country preview, Reset Onboarding.

### Phase 3 — Loading Skeletons, Error States & Empty States Overhaul (Completed)

Goals delivered:
- ✅ ErrorState (retry+back), EmptyState (10 locations), TimelineSkeleton, `loading.tsx`+`error.tsx` boundaries, optimistic status updates, `pnpm build` passes.

### Phase 4 — Mobile-First UI & Navigation (Completed)

Goals delivered:
- ✅ useSwipeGesture, safe-area utilities, fluid typography, 29 touch targets (44px), ResponsiveModal (Sheet/Dialog), MoreSheet, country card snap-scroll, sidebar swipe, bottom nav indicator, `pnpm build`+`type-check` pass.

### Phase 5 — Notifications & Deadline Reminders (Completed)

Goals delivered:
- ✅ Notification model+enum, 6 CRUD endpoints, notificationService (5 generators), injection into 5 routes, Redux slice, NotificationBell/Panel/Item/EmptyState, header integration, WhatNextToday summary, Sonner toast on urgent.

### Phase 6 — Global Search & Command Palette (Completed)

Goals delivered:
- ✅ cmdk + shadcn Command, Ctrl+K palette, GET /api/v1/search cross-entity, useCommandPalette hook, CommandPalette with grouped results + quick actions, SearchTrigger in header, `pnpm build`+`type-check` pass.

### Phase 7 — Advanced Analytics & ROI Dashboard (Completed)

Goals delivered:
- ✅ GET /api/v1/analytics endpoint (funnel, financial, outreach, activity), ApplicationFunnel (FunnelChart), FinancialROI (BarChart + funding gap), ProfessorOutreach (PieChart + metrics), ActivityHeatmap (custom SVG 365-day grid), full analytics page rewrite, `pnpm build` passes.

---

# Implementation Memory

Reference these before reading the full repo or creating new files.

## Current Phase

None — Phase 5 complete.

## Completed Phases

Phase 1: Backend API Hardening & Input Validation (Completed)
- Zod validation across all routes, ApiResponse<T> envelope, rate limiting,
  body-size cap, structured logger, UserSettings model, settings page rewrite.
- Seed data: 3045 university rankings (CSV → UniversityRanking) +
  20-country intelligence (JSON → CountryIntelligence).

Phase 2: Onboarding Wizard & Profile Intelligence UX (Completed)
- 4-step onboarding wizard with sessionStorage persistence and per-step validation.
- `isOnboarded` DB flag + POST `/api/v1/profile/complete-onboarding` endpoint.
- `OnboardingGate` wraps dashboard; `OnboardingGuide` post-onboarding tour.
- `BdtConverter`, `DeleteConfirmDialog` shared components.
- Profile page: Info tooltips on all Match Intelligence fields + live country preview.
- Dashboard: profile completeness bar with contextual messages.
- Settings: "Reset Onboarding" option.

Phase 3: Loading Skeletons, Error States & Empty States Overhaul (Completed)
- `ErrorState` full-page centered error card with retry + back navigation.
- `onRetry` added to 7 dashboard pages (timeline, analytics, countries, professors, rankings, funding, profile).
- All inline empty states replaced with `EmptyState` component (10 locations across 8 pages).
- Timeline refetch spinner replaced with `TimelineSkeleton`.
- `loading.tsx` + `error.tsx` added at dashboard segment level.
- Optimistic status updates on applications + documents pages.
- `pnpm build` + `pnpm type-check` pass cleanly.

Phase 4: Mobile-First UI & Navigation (Completed)
- `useSwipeGesture` hook for horizontal swipe detection on mobile.
- `globals.css` utilities: `safe-bottom`, `safe-top`, `touch-target`, `scrollbar-none`.
- Fluid typography (`text-page-title`/`text-section`) applied across 13 dashboard pages.
- 29 touch targets standardized to 44px (`min-h-11`/`touch-target`).
- `DeleteConfirmDialog` and `EmailGeneratorModal` use `ResponsiveModal` (Sheet mobile, Dialog desktop).
- `MoreSheet` has `safe-bottom` padding; `ResponsiveModal` has drag handle + safe area.
- Country cards: horizontally scrollable metric strip with `snap-x` on mobile.
- Sidebar: swipe left/right to collapse via `useSwipeGesture`.
- Bottom nav: active tab indicator bar (`h-1 w-8 rounded-full bg-primary`).
- Rankings pagination: touch targets standardized.
- `pnpm build` + `pnpm type-check` pass cleanly.

Phase 5: Notifications & Deadline Reminders (Completed)
- Notification model+enum, 6 CRUD endpoints, notificationService (5 generators).
- Injected into applications, professors, documents, profile, stats routes.
- Redux slice + 3 notification components (Bell/Panel/Item) + empty state.
- Header integration, WhatNextToday summary, Sonner toast on urgent.
- `pnpm type-check` passes in both frontend and backend.

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
| ApiErrorAlert | frontend/src/components/shared/ApiErrorAlert.tsx | Friendly error display with retry |
| FieldError | frontend/src/components/shared/FieldError.tsx | Inline form-field error |
| BdtConverter | frontend/src/components/shared/BdtConverter.tsx | USD→BDT live conversion display |
| DeleteConfirmDialog | frontend/src/components/shared/DeleteConfirmDialog.tsx | Replaces native confirm() |
| SettingsSkeleton | frontend/src/components/skeletons/SettingsSkeleton.tsx | Settings page loading |
| DashboardSkeleton | frontend/src/components/skeletons/DashboardSkeleton.tsx | Dashboard page loading |
| ProfileSkeleton | frontend/src/components/skeletons/ProfileSkeleton.tsx | Profile page loading |
| OnboardingGate | frontend/src/components/onboarding/OnboardingGate.tsx | Guards dashboard; shows wizard if !isOnboarded |
| OnboardingWizard | frontend/src/components/onboarding/OnboardingWizard.tsx | 4-step first-run wizard |
| OnboardingGuide | frontend/src/components/onboarding/OnboardingGuide.tsx | Post-onboarding tooltip tour |
| MetricCard | frontend/src/components/dashboard/MetricCard.tsx | Dashboard metrics |
| SectionHeader | frontend/src/components/dashboard/SectionHeader.tsx | Page sections |
| WhatNextToday | frontend/src/components/dashboard/WhatNextToday.tsx | Dashboard suggestions |
| NotificationBell | frontend/src/components/notifications/NotificationBell.tsx | Header bell with badge + polling |
| NotificationPanel | frontend/src/components/notifications/NotificationPanel.tsx | Notification list sheet |
| NotificationItem | frontend/src/components/notifications/NotificationItem.tsx | Single notification row |
| NotificationEmptyState | frontend/src/components/notifications/NotificationEmptyState.tsx | Empty notification state |

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

## Seed Data

| Script | Run With | Seeds |
|--------|----------|-------|
| `backend/prisma/seed.ts` | `pnpm db:seed` (or `pnpm exec prisma db seed`) | 3045 UniversityRanking rows from `notebook/universities.csv` + 20 CountryIntelligence rows from `frontend/public/countries/*.json` |

## Data Sources

| Data | Source File | Location |
|------|-------------|----------|
| University Rankings | `universities.csv` (preprocessed, 3045 rows) | `notebook/universities.csv` |
| Country Intelligence | 21 JSON files (countries, visa, PR, etc.) | `frontend/public/countries/` |

## Shared State Slices

| Slice | Path |
|-------|------|
| profileSlice | frontend/src/lib/store/slices/profileSlice.ts |
| universitySlice | frontend/src/lib/store/slices/universitySlice.ts |
| professorSlice | frontend/src/lib/store/slices/professorSlice.ts |
| applicationSlice | frontend/src/lib/store/slices/applicationSlice.ts |
| documentSlice | frontend/src/lib/store/slices/documentSlice.ts |
| countryMatchSlice | frontend/src/lib/store/slices/countryMatchSlice.ts |
| settingsSlice | frontend/src/lib/store/slices/settingsSlice.ts |
| notificationSlice | frontend/src/lib/store/slices/notificationSlice.ts |

## Database Schema Version

v1.2 — Current models:
- User, Account, Session, Verification
- UserProfile
- UserSettings (Phase 1: emailDeadlineAlerts, timelineNotifications, strategyPreference)
- University, Professor, Application, Document
- UniversityRanking
- CountryIntelligence
- Notification (Phase 5: type, title, message, link, referenceId, isRead)

Pending additions:
- None — Phase 5 complete. Schema is stable going into Phase 6.

## Design System Version

v1.0 — Tailwind v4 + shadcn/ui primitives.
- Theme: light/dark/system via next-themes
- Color tokens: default shadcn slate/zinc scale
- Fluid typography via `clamp()` CSS variables (Phase 4)

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
