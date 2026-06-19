# GradPlanner — Continuous Improvement Plan

---

## Phase 1: Backend API Hardening & Input Validation

### 1. Goal

Transform the Express backend from a prototype-grade API into a **production-hardened, validated, type-safe REST API** that can be trusted by any frontend consumer without defensive coding on every call.

### 2. Why This Phase Is Needed

After a full project audit, the single biggest gap preventing GradPlanner from being production-ready is **backend reliability and safety**. Every downstream feature — UI error states, loading states, mobile UX, onboarding flows — depends on an API that behaves predictably. Currently:

| Problem                                                                                           | Impact                                                                                       | Risk Level  |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| **Zero request validation** — all 11 route files accept `req.body` without Zod/schema validation  | Any malformed request can crash queries, inject bad data, or produce silent corruption       | 🔴 CRITICAL |
| **No rate limiting** — every authenticated endpoint is wide open                                  | A single compromised session cookie can exhaust DB connections in seconds                    | 🔴 CRITICAL |
| **Inconsistent error responses** — some routes return `{ error: string }`, others throw unhandled | Frontend cannot reliably distinguish "not found" from "validation error" from "server crash" | 🟠 HIGH     |
| **No request body size limits** — `express.json()` has no limit set                               | A single POST with a 50MB body would consume all available memory on Vercel Serverless       | 🟠 HIGH     |
| **Missing `select` in many Prisma queries** — `include: { university: true }` returns ALL fields  | Over-fetching wastes bandwidth and leaks data (e.g., `deletedAt`, internal IDs)              | 🟡 MEDIUM   |
| **Duplicate helper functions** — `toFloatOrNull` is defined inline in 2 routes                    | Maintenance burden, inconsistency risk                                                       | 🟡 MEDIUM   |
| **No structured logging** — routes use `console.error` with no context                            | Production debugging is nearly impossible on Vercel serverless                               | 🟡 MEDIUM   |
| **Settings page is mock-only** — `handleSave` uses `setTimeout`, settings aren't persisted        | Users see "saved" but nothing actually persists to the database                              | 🟠 HIGH     |

**Business value:** Without this phase, every future phase (onboarding, notifications, mobile UX) will be built on an unreliable foundation that will produce hard-to-debug failures in production.

---

### 3. Features

#### 3.1 Zod Validation Layer for All Routes

- Create a shared `backend/src/validators/` directory with Zod schemas for every API endpoint
- Schemas for: `profileSchema`, `universityCreateSchema`, `universityUpdateSchema`, `professorCreateSchema`, `professorUpdateSchema`, `applicationCreateSchema`, `applicationUpdateSchema`, `documentCreateSchema`, `documentUpdateSchema`
- A reusable `validateBody` middleware that runs `safeParse`, returns `422` with structured field errors on failure
- All routes refactored to use the validation middleware before any business logic

#### 3.2 Standardized API Response Contract

- Create a shared `ApiResponse<T>` type:
  ```typescript
  type ApiResponse<T> =
    | { success: true; data: T }
    | {
        success: false;
        error: string;
        code: string;
        fieldErrors?: Record<string, string[]>;
      };
  ```
- Consistent error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `RATE_LIMITED`, `INTERNAL_ERROR`
- All routes refactored to return this shape
- Frontend `fetchApi` updated to parse the new contract

#### 3.3 Rate Limiting

- Add `express-rate-limit` (confirm with user before installing)
- Global rate limit: 100 requests/minute per IP
- Auth-specific rate limit: 10 requests/minute on `/api/v1/auth/*`
- Write-specific rate limit: 30 requests/minute on POST/PUT/DELETE

#### 3.4 Request Body Size Limits

- `express.json({ limit: '256kb' })` for standard routes
- Prevents memory exhaustion on Vercel serverless

#### 3.5 Shared Utility Extraction

- Extract `toFloatOrNull`, `toIntOrNull`, `toBoolOrNull` into `backend/src/utils/parsers.ts`
- Extract error response helper into `backend/src/utils/apiResponse.ts`

#### 3.6 Prisma Query Optimization

- Add explicit `select` to all queries that currently use `include` without `select`
- Remove over-fetching of `deletedAt`, internal metadata from API responses
- Ensure all list queries have sensible default `orderBy` and soft-delete filtering

#### 3.7 Settings Persistence

- Create `UserSettings` model in Prisma schema (theme preference, notification preferences, strategy preference)
- Create `backend/src/routes/settings.ts` with GET/PUT endpoints
- Replace the mock `setTimeout` save in the frontend Settings page with actual API calls
- Wire frontend Settings page to persist and load from the new API

#### 3.8 Structured Logging Upgrade

- Replace all `console.error` with a lightweight structured logger utility (`backend/src/utils/logger.ts`)
- Log format: `{ timestamp, level, route, userId?, error?, durationMs }`
- Preserves compatibility with Vercel serverless log aggregation

---

### 4. Detailed UI/UX Requirements

#### Settings Page (`/dashboard/settings`)

**Current state:** Mock-only, `setTimeout` fake save, settings not persisted.

**Target state:**

- **Layout:** Single-column form, max-width 640px, centered
- **Sections:**
  - Theme selector (already works via `next-themes`, no API needed)
  - Notification preferences section with toggle switches (persisted via API)
  - Immigration strategy selector (persisted via API)
- **Loading state:** Skeleton loader while fetching current settings from API on page mount
- **Save interaction:**
  - Button shows `<Loader2 />` spinner during save
  - On success: toast notification "Settings saved"
  - On error: inline destructive alert with specific error message
- **Error state:** If GET /settings fails, show destructive alert with "Failed to load settings. Retry" button
- **Mobile:** Full-width sections, larger touch targets for toggles (min 44px)
- **Tablet:** Same as desktop (single-column layout naturally responsive)
- **Desktop:** Centered within `max-w-2xl` container (already correct)

#### Error Handling UX (Global)

- All API errors that return `VALIDATION_ERROR` should produce field-level error highlighting in forms where applicable
- All API errors that return `INTERNAL_ERROR` should produce a generic toast: "Something went wrong. Please try again."
- Network timeouts should produce: "Unable to reach the server. Check your connection."

---

### 5. Backend Requirements

#### Database

**New model: `UserSettings`**

```prisma
model UserSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailDeadlineAlerts   Boolean  @default(true)
  timelineNotifications Boolean  @default(true)
  strategyPreference    String   @default("PR speed")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

**Relation added to User:**

```prisma
model User {
  // ... existing fields
  settings     UserSettings?
}
```

**Indexes:** `@@index([userId])` (covered by `@unique`)

**Migration:** Non-breaking additive migration — no existing data affected.

#### API

| Route              | Method | Validation Schema      | Auth     | Purpose                                      |
| ------------------ | ------ | ---------------------- | -------- | -------------------------------------------- |
| `/api/v1/settings` | GET    | —                      | Required | Fetch user settings (upsert default if none) |
| `/api/v1/settings` | PUT    | `settingsUpdateSchema` | Required | Update user settings                         |

**Validation schemas (Zod):**

- `settingsUpdateSchema`: `{ emailDeadlineAlerts?: boolean, timelineNotifications?: boolean, strategyPreference?: enum("PR speed" | "AI Market" | "No Tuition" | "Scholarship") }`

#### All existing routes refactored:

| Route File          | Changes                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| `profile.ts`        | Add `profileUpdateSchema` validation on PUT                                         |
| `universities.ts`   | Add `universityCreateSchema` / `universityUpdateSchema` validation                  |
| `professors.ts`     | Add `professorCreateSchema` / `professorUpdateSchema` / `logEmailSchema` validation |
| `applications.ts`   | Add `applicationCreateSchema` / `applicationUpdateSchema` validation                |
| `documents.ts`      | Add `documentCreateSchema` / `documentUpdateSchema` validation                      |
| `decisionEngine.ts` | Add query param validation                                                          |
| `scholarships.ts`   | Add query param validation                                                          |
| `timeline.ts`       | Add query param validation                                                          |
| `rankings.ts`       | Add query param validation                                                          |
| `countries.ts`      | No body mutations, but add query param validation                                   |
| `stats.ts`          | No changes needed (read-only, no body)                                              |

---

### 6. Architecture Requirements

#### New Files

```
backend/src/
├── validators/
│   ├── index.ts              # Re-exports all schemas + validateBody middleware
│   ├── profile.ts            # profileUpdateSchema
│   ├── university.ts         # universityCreateSchema, universityUpdateSchema
│   ├── professor.ts          # professorCreateSchema, professorUpdateSchema, logEmailSchema
│   ├── application.ts        # applicationCreateSchema, applicationUpdateSchema
│   ├── document.ts           # documentCreateSchema, documentUpdateSchema
│   └── settings.ts           # settingsUpdateSchema
├── utils/
│   ├── apiResponse.ts        # success(), error() response builders
│   ├── parsers.ts            # toFloatOrNull, toIntOrNull, toBoolOrNull
│   └── logger.ts             # Structured logger (replaces console.error)
├── routes/
│   └── settings.ts           # NEW: User settings CRUD
```

#### Reusable Modules

- **`validateBody` middleware:** Generic, takes any Zod schema, returns 422 with field errors. Usable by all routes.
- **`apiResponse` utilities:** `success(data)` and `error(message, code, fieldErrors?)` ensure every response follows the contract.
- **`parsers.ts`:** Shared parsing functions eliminate duplication across universities.ts and professors.ts.

#### Future Scalability

- The `validators/` pattern scales cleanly as new routes are added.
- The `ApiResponse<T>` contract is the foundation for future typed API client generation (e.g., via OpenAPI).
- Structured logging enables future integration with Sentry, Datadog, or Vercel Log Drains.

---

### 7. Database Changes

| Change                            | Type     | Risk                                                |
| --------------------------------- | -------- | --------------------------------------------------- |
| Add `UserSettings` model          | Additive | ✅ Zero risk — new table, no existing data affected |
| Add `settings` relation to `User` | Additive | ✅ Zero risk — optional relation                    |

**Migration strategy:** Single `prisma migrate dev` with descriptive name `add-user-settings`.

---

### 8. API Changes

| Change                                                                     | Breaking?                                            | Migration Path                                                                                                        |
| -------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| All responses wrapped in `{ success, data }` or `{ success, error, code }` | ⚠️ Yes — frontend must update                        | Update `fetchApi` to unwrap `data` from the new envelope. This is a single-point change in `frontend/src/lib/api.ts`. |
| New 422 status code for validation errors                                  | No — frontend currently treats all non-2xx as errors | Frontend already throws on `!res.ok`. The new `code` field enables smarter error handling.                            |
| New `/api/v1/settings` endpoints                                           | No — additive                                        | Frontend settings page updated to use them.                                                                           |

---

### 9. Compatibility Analysis

| Dimension               | Risk                                    | Mitigation                                                                                              |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **API contract change** | 🟠 Medium — response shape changes      | Update `fetchApi` FIRST, then deploy backend changes. The wrapper function is a single point of change. |
| **Migration**           | ✅ None — purely additive               | Standard `prisma migrate dev`                                                                           |
| **Auth**                | ✅ None — no auth flow changes          | Settings endpoints use existing `requireAuth` middleware                                                |
| **UI**                  | ✅ Minimal — only Settings page changes | Settings page already exists; replace mock logic with real API calls                                    |
| **State**               | ✅ None — no Redux store changes        | Settings are fetched on Settings page mount only, no global state needed                                |
| **Breaking changes**    | 🟠 One — API response envelope          | Mitigated by updating `fetchApi` to transparently unwrap the new format                                 |

---

### 10. Risks and Mitigation

| Risk                                  | Probability | Impact | Mitigation                                                                                    |
| ------------------------------------- | ----------- | ------ | --------------------------------------------------------------------------------------------- |
| API response envelope breaks frontend | Medium      | High   | Update `fetchApi` to unwrap `data` field — ALL frontend calls go through this single function |
| Zod adds bundle size to backend       | Low         | Low    | Zod is already a frontend dependency; backend is server-only so bundle size is irrelevant     |
| Rate limiting blocks legitimate users | Low         | Medium | Start with generous limits (100/min). Log rate-limit events. Add bypass for health checks.    |
| New `express-rate-limit` package      | Low         | Low    | Well-maintained, zero-dependency package. Confirm with user before installing.                |
| Migration conflicts                   | None        | —      | Purely additive migration — no existing columns changed                                       |

---

### 11. Future Phase Considerations

This phase establishes foundations that make future phases dramatically easier:

- **Phase 2 (Onboarding & Profile Wizard):** Relies on validated profile endpoints and structured error responses to show field-level errors in multi-step forms.
- **Phase 3 (Notifications & Reminders):** Relies on persisted `UserSettings.emailDeadlineAlerts` / `timelineNotifications` to determine which notifications to send.
- **Phase 4 (Mobile-First UI Overhaul):** Relies on consistent API error codes to show appropriate mobile error sheets and retry buttons.
- **Future API Client Generation:** The `ApiResponse<T>` contract is the foundation for auto-generating a typed frontend client.

**What this phase avoids:**

- No hardcoded logic — all validation is schema-driven and composable
- No duplicate code — shared utilities in `utils/` and `validators/`
- No tight coupling — validation middleware is independent of route business logic
- No temporary hacks — the response contract and validation layer are permanent architectural decisions

---

### 12. Acceptance Criteria

- [ ] All 11 backend route files use Zod validation for request bodies
- [ ] All API responses follow the `{ success, data }` / `{ success, error, code }` contract
- [ ] Frontend `fetchApi` transparently unwraps the new response format
- [ ] Rate limiting is active on all routes with configurable thresholds
- [ ] `express.json({ limit: '256kb' })` is set
- [ ] `UserSettings` model exists with GET/PUT endpoints
- [ ] Settings page persists preferences via API instead of mock `setTimeout`
- [ ] Settings page has loading skeleton and error state
- [ ] Shared `parsers.ts` replaces duplicated `toFloatOrNull` in universities.ts and professors.ts
- [ ] Structured logger replaces all `console.error` calls in route files
- [ ] `pnpm type-check` passes in both frontend and backend
- [ ] No new lint errors introduced

---

## Phase 2: Onboarding Wizard & Profile Intelligence UX

### 1. Goal

Create a **guided multi-step onboarding wizard** that new users see on their first login, collects all profile + match intelligence data upfront, and ensures every user reaches ≥80% profile completeness before entering the dashboard. Transform the first-use experience from "empty dashboard with 0% profile" into a premium, contextual onboarding flow that immediately demonstrates GradPlanner's value.

### 2. Why This Phase Is Needed

After backend hardening (Phase 1), the single biggest user experience gap is **the first 60 seconds after registration**:

| Problem                                                                                                                                  | Impact                                                                                              | Risk Level  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------- |
| **No onboarding flow** — new users land on an empty dashboard with 0 data                                                                | Immediate churn — users don't understand the product value                                          | 🔴 CRITICAL |
| **Profile completeness drives match scores** — but users must discover the Profile page themselves                                       | The core value proposition (personalized country recommendations) requires data users don't provide | 🔴 CRITICAL |
| **No `isOnboarded` flag** — every dashboard load rechecks profile, no way to distinguish first-time from returning user                  | Can't conditionally show onboarding or welcome-back flows                                           | 🟠 HIGH     |
| **Dashboard profile modal is redundant** — quick-edit modal on dashboard duplicates the full Profile page, but collects only 5/10 fields | Users who fill the modal think they're done, but miss 5 critical match intelligence fields          | 🟠 HIGH     |
| **No contextual guidance** — new users see "AI Fit Recommendations" with generic scores, no explanation of how to improve them           | Users don't understand the relationship between profile data and recommendation quality             | 🟡 MEDIUM   |
| **Registration → login → empty dashboard** is a cold, generic experience                                                                 | No wow moment, no value demonstration, no momentum                                                  | 🟡 MEDIUM   |

**Business value:** Onboarding is THE highest-leverage UX improvement. A user who completes the wizard will see personalized country recommendations immediately — that's the product's "aha moment." Without it, most new users will see generic scores, get confused, and leave.

---

### 3. Features

#### 3.1 Multi-Step Onboarding Wizard Component

A full-screen modal/page wizard with 4 steps, shown to users whose `isOnboarded` flag is `false`:

**Step 1 — Welcome & Academic Profile**

- Welcome message with user's name (from auth)
- University name (text input with autocomplete suggestions for BD universities)
- CGPA (number input with 4.0 scale validation)
- Target degree (select: MSc / PhD / MSc → PhD track)
- Graduation date (month/year picker)
- Target intake (select: Sep 2028, Jan 2029, Sep 2029)

**Step 2 — Match Intelligence**

- IELTS score (number input with 0.5 step, 0–9.0)
- Monthly budget in USD (number input, with BDT equivalent shown live: `$1,500 ≈ ৳180,000/month`)
- Research interests (tag picker with quick-add suggestions: NLP, LLM, CV, RL, Deep Learning, etc.)
- PR priority slider (1–5 with labeled descriptions)

**Step 3 — Priorities & Preferences**

- Family relocation toggle (solo vs. bringing spouse/children)
- Country preferences (optional multi-select: "I'm already considering" with flags)
- What matters most (drag-rank or priority selector: Funding > PR > Job Market > Ranking > Cost)

**Step 4 — Summary & Launch**

- Visual summary of everything entered
- Profile completeness gauge (should be ≥80%)
- "See Your Personalized Recommendations →" CTA button
- Animated transition into the dashboard with recommendations pre-loaded

#### 3.2 `isOnboarded` Flag on UserProfile

- New boolean field on `UserProfile` model
- Set to `true` when the wizard is completed
- Dashboard layout checks this flag: if `false` → redirect to onboarding wizard
- A "Reset Onboarding" option in Settings for users who want to redo it

#### 3.3 Dashboard Welcome-Back Banner (Post-Onboarding)

After onboarding is complete, the dashboard welcome banner changes:

- Shows "Your profile is X% complete" with contextual tips to reach 100%
- If profile < 60%: Warning banner "Complete your match intelligence to unlock accurate recommendations"
- If profile ≥ 80%: Success indicator with match quality confidence
- Remove the redundant "Update Profile Details" modal from dashboard (replaced by link to full Profile page)

#### 3.4 Profile Page Improvements

- Add a "What does this affect?" tooltip next to each Match Intelligence field, explaining how it impacts recommendations
- Add live preview: "Based on your current profile, your top 3 countries are: [X, Y, Z]" — updates as user changes fields
- Add clear visual grouping: "Required for basic recommendations" vs "Improves accuracy" vs "Optional fine-tuning"

#### 3.5 Post-Onboarding Guided Tour (Lightweight)

After the wizard, show 3–4 tooltip-style highlights on the dashboard:

- "Your top country matches are here" → points to AI Fit Recommendations section
- "Track universities you're interested in" → points to sidebar Universities link
- "Email professors directly" → points to sidebar Professors link
- Dismissible, not shown again after user clicks through or closes

---

### 4. Detailed UI/UX Requirements

#### Onboarding Wizard (`/dashboard/onboarding` or full-screen overlay)

**Layout:**

- Full-screen overlay on top of the dashboard (not a separate route — prevents URL sharing/bookmarking of a half-state)
- Centered card, max-width 640px, with glassmorphism background
- Step indicator at the top: 4 dots/pills showing current step, completed steps have checkmarks
- Progress bar under the step indicator showing overall progress

**Step Navigation:**

- "Back" and "Next" buttons at the bottom of each step
- "Next" validates current step fields before proceeding (Zod client-side validation)
- "Skip for now" link under the Next button (still marks step as visited, sets fields to null)
- Keyboard: Enter advances to next step, Escape does nothing (prevent accidental close)

**Step 1 — Academic Profile:**

- Hero heading: "Let's set up your profile" with subtle gradient text
- Subheading: "This takes about 2 minutes and powers all your recommendations"
- Fields arranged in 2-column grid (desktop), single column (mobile)
- University field: Combobox with typeahead for known BD universities (UIU, BUET, DU, NSU, BRAC, etc.)
- CGPA field: Slider from 2.0–4.0 with 0.01 step, current value displayed in a badge
- Target degree: Select with icons (🎓 MSc, 🔬 PhD, 🎓→🔬 MSc then PhD)
- Graduation date: Month + Year selects side by side
- Target intake: Button group (Sep 2028, Jan 2029, Sep 2029, Other)

**Step 2 — Match Intelligence:**

- Section heading: "What matters to you?" with Brain icon
- IELTS: Number input with helper text "6.5+ recommended for English-speaking countries"
- Budget: Input with live BDT conversion shown below (using static rate, ~120 BDT/USD)
- Research tags: Same tag picker UI as the Profile page, with 14 quick-add suggestions
- PR slider: Same slider as Profile page, with descriptions and color coding

**Step 3 — Priorities & Preferences:**

- Family toggle: Two large cards (Solo / Family) with icons, click to select
- Country preferences: Grid of country flags with checkboxes, max 5 selections, with labels
- Priority ranker: Drag-and-drop or numbered select for: Funding, PR, Job Market, Ranking, Cost

**Step 4 — Summary:**

- All entered data displayed in a clean summary card
- Profile completeness radial gauge (like the dashboard PR gauge)
- "Edit" buttons next to each section that jump back to the relevant step
- Large primary CTA: "Launch Your Workspace →" with subtle animation
- Confetti or success animation on launch (lightweight, CSS-only)

**Loading State:** Not applicable (wizard is client-side state until final submission)

**Error State:** Inline field errors (red border + error text below field)

**Empty State:** Not applicable (wizard guides data entry)

**Mobile (< 768px):**

- Single column layout throughout
- Step indicator becomes a text "Step 2 of 4" instead of dots
- Full-width buttons, min-height 48px for touch targets
- Scroll within each step if content overflows

**Tablet (768px–1024px):**

- Same as desktop but with slightly smaller max-width (560px)

**Desktop (> 1024px):**

- Centered 640px card with backdrop blur
- Two-column grid for field pairs

**Hover States:**

- Next/Back buttons: subtle scale and color shift
- Tag suggestions: border highlight on hover
- Country flags: scale 1.05 with subtle shadow

**Animations:**

- Step transitions: slide-in from right (next) or left (back), 300ms
- Progress bar: smooth width transition, 500ms
- Summary card: fade-in with staggered list animation
- Launch CTA: pulse animation

---

### 5. Backend Requirements

#### Database

**Modified model: `UserProfile`**

```prisma
model UserProfile {
  // ... existing fields unchanged
  isOnboarded       Boolean  @default(false) // NEW: tracks onboarding completion
}
```

**No new models required.** The wizard collects data for the existing `UserProfile` model.

#### API

| Route                                 | Method | Changes                                                                               | Auth     |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------- | -------- |
| `/api/v1/profile`                     | GET    | Add `isOnboarded` to response (already returned by Prisma)                            | Required |
| `/api/v1/profile`                     | PUT    | Accept `isOnboarded` field in body                                                    | Required |
| `/api/v1/profile/complete-onboarding` | POST   | **NEW** — Bulk-update all profile fields + set `isOnboarded: true` in one transaction | Required |

**New endpoint detail:**

`POST /api/v1/profile/complete-onboarding`

```typescript
// Request body (Zod-validated, all optional since users can skip fields)
{
  university?: string;
  cgpa?: number;
  targetDegree?: string;
  targetIntake?: string;
  graduationDate?: string;
  ieltsScore?: number;
  monthlyBudgetUSD?: number;
  researchInterests?: string[];
  prPriority?: number;
  familyRelocation?: boolean;
}

// Response
{
  success: true,
  data: UserProfile // with isOnboarded: true
}
```

**Why a separate endpoint?** The existing PUT `/profile` is for incremental updates. The onboarding endpoint:

1. Sets `isOnboarded: true` atomically
2. Can trigger future side-effects (e.g., send welcome email, log analytics event)
3. Validates the full profile context (not just individual field changes)

---

### 6. Architecture Requirements

#### New Files

```
frontend/src/
├── components/
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx       # Main wizard shell (step management, progress)
│   │   ├── StepAcademicProfile.tsx    # Step 1 component
│   │   ├── StepMatchIntelligence.tsx  # Step 2 component
│   │   ├── StepPriorities.tsx         # Step 3 component
│   │   ├── StepSummary.tsx            # Step 4 component
│   │   └── OnboardingGuide.tsx        # Post-onboarding tooltip tour
│   └── shared/
│       └── BdtConverter.tsx           # Reusable USD→BDT display component

backend/src/
├── routes/
│   └── profile.ts                     # MODIFIED: add complete-onboarding endpoint
├── validators/
│   └── profile.ts                     # MODIFIED: add onboardingSchema
```

#### Reusable Modules

- **`OnboardingWizard`**: Generic multi-step wizard shell. Takes steps as children, manages state, back/next navigation. Reusable for any future multi-step flow (e.g., application submission wizard).
- **`BdtConverter`**: Small component that converts USD to BDT at a static rate and displays both. Reusable wherever costs are shown.
- **Step components**: Each step is an independent component that receives `formData` and `onChange` props. Can be reused in the Profile page for inline editing.

#### State Management

- Wizard state is local (`useState` in `OnboardingWizard`). NOT in Redux.
- On final submission, profile is dispatched to Redux via `setProfile`.
- The `isOnboarded` flag is read from the profile in Redux to determine whether to show the wizard.

#### Future Scalability

- The wizard shell (`OnboardingWizard`) is step-count agnostic — adding a 5th step for "Import from previous application" requires only adding a new step component.
- The `isOnboarded` flag enables future features like "Re-onboard" for profile migration or major version changes.
- Country preference selections from Step 3 can feed into a future "My Shortlist" feature.

---

### 7. Database Changes

| Change                                                     | Type     | Risk                                                              |
| ---------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Add `isOnboarded Boolean @default(false)` to `UserProfile` | Additive | ✅ Zero risk — new column with default, existing rows get `false` |

**Migration strategy:** Single `prisma migrate dev` with name `add-is-onboarded-flag`. All existing users will have `isOnboarded: false`, which means they'll see the wizard on next login — this is the desired behavior.

---

### 8. API Changes

| Change                                               | Breaking?           | Migration Path                          |
| ---------------------------------------------------- | ------------------- | --------------------------------------- |
| `isOnboarded` field added to GET `/profile` response | No — additive field | Frontend reads it when available        |
| `isOnboarded` accepted in PUT `/profile` body        | No — optional field | No change needed for existing calls     |
| New POST `/profile/complete-onboarding` endpoint     | No — additive       | New endpoint, no existing code calls it |

---

### 9. Compatibility Analysis

| Dimension            | Risk                                                           | Mitigation                                                                   |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Migration**        | ✅ None — purely additive column                               | `@default(false)` ensures existing rows are valid                            |
| **Auth**             | ✅ None — uses existing `requireAuth`                          | No auth flow changes                                                         |
| **UI**               | 🟡 Low — existing dashboard layout needs conditional rendering | Add `isOnboarded` check in dashboard layout, redirect to wizard if false     |
| **State**            | ✅ Minimal — profile Redux slice already exists                | `isOnboarded` is part of the profile object, no new slice needed             |
| **API**              | ✅ None — new endpoint, no changes to existing endpoints       | Existing profile PUT still works identically                                 |
| **Breaking changes** | 🟡 One behavioral change — existing users will see the wizard  | Mitigated: wizard has "Skip" option and users can complete it in < 2 minutes |

---

### 10. Risks and Mitigation

| Risk                                                        | Probability | Impact | Mitigation                                                                                                                               |
| ----------------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Existing users see the wizard after deploy                  | Certain     | Low    | The wizard has a "Skip & go to dashboard" link. Existing users can complete it in 2 minutes, which actually improves their match scores. |
| Wizard state lost on page refresh                           | Medium      | Medium | Store wizard progress in `sessionStorage`. Restore on re-render.                                                                         |
| Onboarding adds friction for users who just want to explore | Low         | Medium | Prominent "Skip for now" link on every step. Dashboard is accessible from sidebar even during onboarding.                                |
| Step transitions feel janky on mobile                       | Low         | Low    | Use CSS `transform: translateX()` with `transition` instead of JavaScript animations. Test on low-end devices.                           |
| BDT conversion rate becomes stale                           | Low         | Low    | Use a static rate (120 BDT/USD) with a "Rate as of Jun 2026" disclaimer. Future phase can add live rates.                                |

---

### 11. Future Phase Considerations

This phase establishes foundations that make future phases dramatically easier:

- **Phase 3 (Loading/Error/Empty States):** The onboarding wizard ensures users always have some data, reducing the frequency of empty states on the dashboard. Empty states become "you haven't added X yet" rather than "everything is empty."
- **Phase 5 (Notifications):** The `isOnboarded` flag enables "complete your profile" reminder notifications for users who skipped the wizard.
- **Phase 6 (Search & Command Palette):** Country preference selections from Step 3 can pre-populate search filters.
- **Future "Profile Migration" feature:** The wizard shell can be reused for re-onboarding when the profile schema changes significantly.
- **Future "Team/Advisor" feature:** The wizard can include a "Share with advisor" step.

**What this phase avoids:**

- No hardcoded step logic — wizard shell is generic and step-count agnostic
- No duplicate profile forms — step components share field components with the Profile page
- No tight coupling — wizard state is local, only dispatched to Redux on completion
- No temporary hacks — `isOnboarded` flag is a permanent architectural decision

---

### 12. Acceptance Criteria

- [ ] New `isOnboarded` field exists on `UserProfile` with `@default(false)`
- [ ] New POST `/api/v1/profile/complete-onboarding` endpoint exists and is validated
- [ ] Users with `isOnboarded: false` see the full-screen onboarding wizard on dashboard load
- [ ] Wizard has 4 steps with proper back/next navigation and step indicator
- [ ] Each step validates fields before allowing "Next" (with inline error display)
- [ ] "Skip for now" link is available on every step
- [ ] Step 2 shows live BDT conversion for the budget field
- [ ] Step 4 shows a visual summary of all entered data with edit links
- [ ] Completing the wizard sets `isOnboarded: true` and redirects to dashboard
- [ ] Dashboard shows personalized country recommendations immediately after onboarding
- [ ] Wizard state persists in `sessionStorage` across page refreshes
- [ ] Wizard is fully responsive (mobile single-column, desktop two-column)
- [ ] Step transitions are smooth (slide animation, 300ms)
- [ ] Redundant profile edit modal removed from dashboard page
- [ ] Profile page has "What does this affect?" tooltips on Match Intelligence fields
- [ ] Settings page has "Reset Onboarding" option
- [ ] `pnpm type-check` passes in both frontend and backend
- [ ] No new lint errors introduced

---

## Phase 3: Loading Skeletons, Error States & Empty States Overhaul

### 1. Goal

Replace every `<Loader2 className="animate-spin" />` spinner with **contextual skeleton loaders** that match the page layout, upgrade all empty states with **illustrations and guided actions**, and standardize error states with **retry buttons and specific error messages** across all 12+ dashboard pages.

### 2. Why This Phase Is Needed

Every page in the dashboard currently follows the same anti-pattern:

```tsx
// Current pattern on EVERY page:
if (loading) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
```

| Problem                                                                                                                        | Where                                                                                                                              | Risk Level  |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **All pages use identical centered spinner** — user sees a blank page with a spinning icon for 1–3 seconds on every navigation | Dashboard, Countries, Universities, Professors, Applications, Documents, Rankings, Profile, Analytics, Timeline, Settings, Funding | 🔴 CRITICAL |
| **Empty states are inconsistent** — some pages use `EmptyState` component, others use inline `<div>` with basic text           | Applications (`<p>No applications...</p>`), Documents (same), Universities (uses `EmptyState`), Dashboard (uses `EmptyState`)      | 🟠 HIGH     |
| **Error states are dismissible but not recoverable** — error banners show text but no "Retry" button                           | All data-fetching pages show `setError("Failed to load...")` with no retry action                                                  | 🟠 HIGH     |
| **No progressive loading** — Dashboard fetches 5 API calls in parallel but shows nothing until ALL complete                    | Dashboard page: stats + profile + universities + countries + decision engine must ALL resolve                                      | 🟡 MEDIUM   |
| **No optimistic UI** — status updates (application status, document status) block the UI until API returns                     | Applications page `handleUpdateStatus`, Documents page `handleUpdateStatus`                                                        | 🟡 MEDIUM   |
| **`confirm()` used for delete actions** — native browser dialog breaks the premium feel                                        | Applications, Documents, Professors, Universities all use `confirm("Are you sure?")`                                               | 🟡 MEDIUM   |

**Business value:** Skeleton loaders and progressive loading eliminate the perception of slowness. Users who see a shaped skeleton for 500ms feel faster than users who see a spinner for the same 500ms. Error recovery reduces support requests. Beautiful empty states guide users to take action instead of bouncing.

---

### 3. Features

#### 3.1 Reusable Skeleton Component Library

Create a set of composable skeleton primitives:

- `SkeletonText` — animated pulse rectangle for text lines (configurable width/height)
- `SkeletonCard` — card-shaped skeleton matching the Card component dimensions
- `SkeletonTable` — rows with alternating widths simulating a table
- `SkeletonAvatar` — circular skeleton for user images/flags
- `SkeletonMetric` — matches the MetricCard component shape (number + label)

Each skeleton matches the exact layout of the real component it replaces.

#### 3.2 Page-Specific Skeleton Screens (12 pages)

| Page                   | Skeleton Layout                                                             |
| ---------------------- | --------------------------------------------------------------------------- |
| **Dashboard**          | 3 metric cards skeleton → 3 country cards skeleton → deadline list skeleton |
| **Countries Explorer** | Search bar skeleton → 3×3 grid of country card skeletons                    |
| **Country Detail**     | Hero section skeleton → tabbed content skeleton                             |
| **Universities**       | Header + 2×2 grid of university card skeletons                              |
| **Add University**     | Form skeleton with 8 field placeholders                                     |
| **Professors**         | Kanban-style column skeletons (3 columns × 2 cards each)                    |
| **Applications**       | Pipeline summary skeleton → 2×2 application card skeletons                  |
| **Documents**          | 2×3 grid of document card skeletons                                         |
| **Profile**            | Completeness bar skeleton → 2 form section skeletons                        |
| **Rankings**           | Table with 10 row skeletons + search bar                                    |
| **Timeline**           | Vertical timeline with 6 milestone skeletons                                |
| **Analytics**          | 2 chart placeholder skeletons + 3 stat cards                                |

#### 3.3 Enhanced Empty State Component

Upgrade the existing `EmptyState` component:

- Add optional `illustration` prop (SVG/icon composition, not external images)
- Add `actionHref` prop for link-based CTAs (e.g., "Add University" → `/dashboard/universities/new`)
- Add `secondaryAction` prop for alternative actions
- Add contextual suggestions based on the page context
- Examples:
  - Universities empty: "Start by adding a target university. We'll auto-link QS/THE/ARWU rankings."
  - Professors empty: "Track professor outreach. Add your first contact to get follow-up reminders."
  - Applications empty: "Begin tracking application progress once you have saved universities."
  - Documents empty: "Create a BD document checklist to stay on top of police clearance, transcripts, and bank statements."

#### 3.4 Error State with Retry

Create a reusable `ErrorState` component:

- Icon + error message + "Try Again" button
- "Try Again" calls the original fetch function
- Network errors show specific message: "Unable to reach the server. Check your connection."
- Server errors show: "Something went wrong. Our team has been notified."
- All pages refactored to pass their `loadData` function to the error state for retry

#### 3.5 Confirmation Dialog (Replace `confirm()`)

Create a reusable `ConfirmDialog` component using shadcn `Dialog`:

- Title, description, confirm button (destructive variant), cancel button
- Replaces all `confirm()` calls across Applications, Documents, Professors, Universities
- Accessible (focus trap, Escape to close, ARIA labels)

#### 3.6 Progressive Loading on Dashboard

Refactor dashboard to render sections independently:

- Stats section loads and renders first
- Country recommendations load next (don't block stats)
- Decision engine loads last (optional, catches errors silently)
- Each section shows its own skeleton until its specific data is ready

#### 3.7 Optimistic Status Updates

For status dropdown changes (Applications, Documents):

- Immediately update UI state
- Fire API call in background
- On failure: revert to previous state + show error toast
- Eliminates the "lag" feeling when changing statuses

---

### 4. Detailed UI/UX Requirements

#### Skeleton Loaders

- **Animation:** Tailwind `animate-pulse` with `bg-muted/60` color
- **Shape matching:** Skeletons must match the exact dimensions of the real content (same heights, widths, border-radius, grid layout)
- **Duration:** Skeleton should be visible for at least 200ms (add `min-height` to prevent layout shift)
- **Transition:** When real data loads, fade-in with `animate-in fade-in duration-300`

#### Empty States

- **Layout:** Centered vertically within the content area, max-width 400px
- **Icon:** 48×48 icon from lucide-react in `muted-foreground/40` color
- **Title:** 16px font-semibold, `text-foreground`
- **Description:** 14px font-normal, `text-muted-foreground`, max 2 lines
- **CTA:** Primary button or ghost link depending on the action
- **Mobile:** Same layout, full-width CTA button

#### Error States

- **Layout:** Centered card with destructive border accent
- **Icon:** `AlertCircle` in destructive color
- **Message:** Specific and user-friendly (never show raw error strings)
- **Action:** "Try Again" button (primary), optional "Go Back" link
- **Timeout:** Network errors auto-suggest after 10 seconds: "This is taking longer than expected."

#### Confirmation Dialog

- **Overlay:** `bg-black/60 backdrop-blur-sm`
- **Card:** max-width 400px, centered, with shadcn Dialog
- **Title:** "Delete [item type]?" (e.g., "Delete Professor?")
- **Description:** "This action cannot be undone. [item name] will be permanently removed."
- **Buttons:** "Cancel" (ghost) + "Delete" (destructive)
- **Keyboard:** Escape to cancel, Enter to confirm
- **Mobile:** Full-width buttons, larger touch targets

---

### 5. Backend Requirements

**No backend changes required for this phase.** All improvements are frontend-only.

---

### 6. Architecture Requirements

#### New Files

```
frontend/src/components/
├── skeletons/
│   ├── SkeletonText.tsx         # Configurable text line skeleton
│   ├── SkeletonCard.tsx         # Card-shaped skeleton
│   ├── SkeletonMetric.tsx       # Metric card skeleton
│   ├── SkeletonTable.tsx        # Table row skeletons
│   ├── DashboardSkeleton.tsx    # Full dashboard page skeleton
│   ├── CountrySkeleton.tsx      # Country explorer skeleton
│   ├── UniversitySkeleton.tsx   # University list skeleton
│   └── GenericListSkeleton.tsx  # Reusable list/grid skeleton
├── shared/
│   ├── EmptyState.tsx           # ENHANCED: add illustration, actionHref, secondaryAction
│   ├── ErrorState.tsx           # NEW: error display with retry
│   └── ConfirmDialog.tsx        # NEW: replaces confirm()
```

#### Reusable Modules

- **Skeleton primitives** (`SkeletonText`, `SkeletonCard`, etc.): Composable building blocks. Page-specific skeletons compose these.
- **`ErrorState`**: Takes `message`, `onRetry`, optional `onBack`. Used by all data-fetching pages.
- **`ConfirmDialog`**: Takes `open`, `onConfirm`, `onCancel`, `title`, `description`, `confirmLabel`. Used by all delete actions.

---

### 7. Database Changes

None — this phase is entirely frontend.

---

### 8. API Changes

None — this phase is entirely frontend.

---

### 9. Compatibility Analysis

| Dimension    | Risk                                                          | Mitigation                                                                     |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **UI**       | 🟡 Low — every page changes its loading/empty/error rendering | Changes are isolated to conditional rendering blocks; business logic untouched |
| **State**    | ✅ None — no Redux changes                                    | Optimistic updates use local `useState`                                        |
| **Breaking** | ✅ None — no API or data model changes                        | Pure visual improvements                                                       |

---

### 10. Risks and Mitigation

| Risk                                                     | Probability | Impact | Mitigation                                             |
| -------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------ |
| Skeleton dimensions mismatch real content → layout shift | Medium      | Low    | Measure actual rendered dimensions and match exactly   |
| Optimistic updates cause stale data on network failure   | Low         | Medium | Always revert to previous state on error + show toast  |
| Too many skeleton variants → maintenance burden          | Low         | Low    | Use composable primitives; page skeletons compose them |

---

### 11. Future Phase Considerations

- **Phase 4 (Mobile):** Skeleton components will need mobile-specific layouts (single column instead of grid).
- **Phase 6 (Search):** Empty states for "no search results" will reuse the enhanced `EmptyState` component.
- **Phase 8 (Accessibility):** `ConfirmDialog` is built with shadcn Dialog which has proper focus trap and ARIA — one less thing to fix.

---

### 12. Acceptance Criteria

- [ ] All 12 dashboard pages use contextual skeleton loaders instead of centered spinners
- [ ] Skeletons match the exact layout of real content (same grid, card sizes, spacing)
- [ ] Dashboard loads progressively (stats first, recommendations second, decision engine last)
- [ ] All empty states use the enhanced `EmptyState` component with specific guidance and CTAs
- [ ] All error states show "Try Again" button that re-fetches data
- [ ] Network errors show specific "connection" message instead of generic "failed to load"
- [ ] All `confirm()` calls replaced with `ConfirmDialog` component
- [ ] Application/Document status updates use optimistic UI
- [ ] `EmptyState` component supports `actionHref`, `secondaryAction`, and `illustration` props
- [ ] `ErrorState` component is used on all data-fetching pages
- [ ] No layout shift when transitioning from skeleton to real content
- [ ] `pnpm type-check` passes
- [ ] No new lint errors

---

## Phase 4: Mobile-First Responsive UI & Navigation Overhaul

### 1. Goal

Transform GradPlanner from a desktop-first app with basic mobile support into a **mobile-first responsive application** with a native-feeling bottom navigation bar, touch-optimized interactions, responsive data tables, and mobile-specific dialog patterns. Ensure every page is usable and beautiful on devices from 320px to 2560px.

### 2. Why This Phase Is Needed

The current mobile experience has significant usability issues:

| Problem                                                                                                                                  | Impact                                                                                 | Risk Level  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------- |
| **No bottom navigation** — mobile users must open the hamburger sidebar menu for every page transition                                   | High friction; mobile users average 3x more taps to navigate than necessary            | 🔴 CRITICAL |
| **Data tables (Rankings) overflow horizontally** — no responsive table strategy                                                          | Rankings page is unusable on mobile; users must scroll horizontally to see all columns | 🔴 CRITICAL |
| **Modals use fixed positioning without mobile adaptation** — profile edit, add university, add document modals overflow on small screens | Form inputs below the fold, submit buttons unreachable without scrolling               | 🟠 HIGH     |
| **Country comparison grid uses 3-column layout** — cards stack vertically but are too information-dense for mobile                       | Country cards on mobile have tiny text, cramped metrics, unreadable on small phones    | 🟠 HIGH     |
| **Touch targets too small** — many buttons are 32px or smaller (minimum recommended: 44px)                                               | Misclicks, frustration on touch devices                                                | 🟠 HIGH     |
| **No responsive typography** — same font sizes on 320px phone and 2560px monitor                                                         | Text either too small on mobile or too large on desktop                                | 🟡 MEDIUM   |
| **Sidebar collapse button overlaps content** — the circular ◀/▶ toggle overlaps the main content area                                    | Visual glitch on medium-width tablets                                                  | 🟡 MEDIUM   |
| **No swipe gestures** — mobile sidebar has no swipe-to-close                                                                             | Feels non-native compared to mobile apps                                               | 🟡 MEDIUM   |

**Business value:** The target user (Bangladeshi CSE student) primarily accesses web apps on mobile devices. A poor mobile experience means losing the majority of the user base. Bottom navigation alone typically increases mobile engagement by 30–50%.

---

### 3. Features

#### 3.1 Bottom Navigation Bar (Mobile)

A fixed bottom navigation bar visible only on mobile (`< 768px`):

- 5 tabs: **Home** (Dashboard), **Countries**, **Universities**, **Professors**, **More** (dropdown)
- Active tab highlighted with primary color + filled icon
- "More" tab opens a slide-up sheet with remaining navigation items
- Hides the hamburger sidebar menu on mobile (bottom nav replaces it)
- Auto-hides on scroll-down, reveals on scroll-up (like native mobile apps)

#### 3.2 Responsive Data Tables

Replace the Rankings page table with a responsive pattern:

- **Desktop (>1024px):** Full table with all columns
- **Tablet (768–1024px):** Table with column visibility toggle (hide less important columns)
- **Mobile (<768px):** Card-based layout — each university becomes a card showing key metrics
- Pattern is reusable for any future table-based pages

#### 3.3 Mobile-Optimized Modals → Bottom Sheets

Transform all modals on mobile to **bottom sheets** (slide-up from bottom):

- Profile edit, Add University, Add Professor, Add Document, Add Application
- Bottom sheets use 85% viewport height max
- Drag handle at top for swipe-to-close
- Snap points: half-screen and full-screen
- Desktop: unchanged (centered modal)

#### 3.4 Touch Target Standardization

Audit and fix all interactive elements:

- All buttons: minimum 44×44px touch target (CSS, not visual size)
- All select dropdowns: minimum 44px height
- All tag pills (research interests): minimum 36px touch target
- Sidebar links on mobile: minimum 48px height
- Status dropdowns in cards: 44px height with larger hit area

#### 3.5 Responsive Typography System

Add a fluid typography scale using CSS `clamp()`:

- Page titles: `clamp(1.25rem, 3vw, 1.875rem)` (20px→30px)
- Section headings: `clamp(1rem, 2.5vw, 1.25rem)` (16px→20px)
- Body text: `clamp(0.8125rem, 2vw, 0.875rem)` (13px→14px)
- Small/meta text: `clamp(0.6875rem, 1.5vw, 0.75rem)` (11px→12px)

#### 3.6 Country Cards Mobile Layout

Redesign country cards for mobile:

- Full-width cards instead of 3-column grid
- Horizontal metric strip (PR | Cost | AI Market) instead of vertical
- Score badge and flag inline with title
- Touch-friendly "Analyze" button (full-width, 44px height)

#### 3.7 Mobile-Friendly Sidebar Improvements

- Add swipe-to-close gesture on the mobile sidebar overlay
- Increase sidebar link touch targets to 48px height
- Add haptic-style visual feedback on tap (scale animation)
- Remove sidebar collapse toggle on mobile (it's irrelevant — bottom nav replaces sidebar)

#### 3.8 Safe Area and Notch Handling

- Add `env(safe-area-inset-bottom)` padding to bottom navigation
- Add `env(safe-area-inset-top)` to header
- Ensures proper display on iPhones with notch/Dynamic Island

---

### 4. Detailed UI/UX Requirements

#### Bottom Navigation Bar

- **Position:** Fixed bottom, full width, `z-50`
- **Height:** 56px + safe-area-inset-bottom
- **Background:** `bg-background/95 backdrop-blur-md border-t border-border`
- **Icons:** 24×24 lucide icons, label below (10px font)
- **Active state:** Primary color icon + label, subtle scale animation
- **Inactive state:** `text-muted-foreground/60`
- **"More" tab:** Opens a slide-up sheet with all remaining nav items organized by group
- **Visibility:** `md:hidden` — only visible on mobile
- **Content padding:** Main content gets `pb-20` on mobile to account for bottom nav

#### Bottom Sheet Pattern

- **Trigger:** All modals auto-convert to bottom sheets on `< 768px`
- **Animation:** Slide up from bottom, 300ms ease-out
- **Drag handle:** 40×4px rounded bar at top center, `bg-muted-foreground/30`
- **Backdrop:** `bg-black/50 backdrop-blur-xs`
- **Close:** Tap backdrop, swipe down past threshold, or X button
- **Max height:** `85dvh` (dynamic viewport height for mobile browser chrome)
- **Snap:** Half-screen (50dvh) for simple forms, full for complex forms

#### Responsive Table → Cards

- **Card layout (mobile):** Each row becomes a card
- **Key info:** University name (bold), country flag, QS/THE/ARWU ranks in horizontal badges
- **Secondary info:** Scores collapsed into a "More details" expandable
- **Sort:** Dropdown selector above the cards
- **Search:** Full-width search input, 44px height

---

### 5. Backend Requirements

**No backend changes required.** All improvements are frontend-only.

---

### 6. Architecture Requirements

#### New Files

```
frontend/src/components/
├── navigation/
│   ├── BottomNav.tsx            # Mobile bottom navigation bar
│   ├── MoreSheet.tsx            # "More" tab slide-up sheet
│   └── useScrollDirection.ts   # Hook for scroll-based show/hide
├── responsive/
│   ├── BottomSheet.tsx          # Reusable bottom sheet wrapper
│   ├── ResponsiveModal.tsx      # Auto-switches between modal (desktop) and bottom sheet (mobile)
│   └── ResponsiveTable.tsx      # Table on desktop, cards on mobile
├── hooks/
│   ├── useMediaQuery.ts         # SSR-safe media query hook
│   └── useSwipeGesture.ts       # Touch swipe detection hook
```

#### Modified Files

| File                   | Changes                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `DashboardNav.tsx`     | Hide sidebar hamburger on mobile, add `md:flex` to desktop sidebar       |
| `dashboard/layout.tsx` | Add `<BottomNav />` for mobile, add bottom padding to main content       |
| `globals.css`          | Add fluid typography scale, safe-area variables                          |
| All modal-using pages  | Replace `<div className="fixed inset-0">` with `<ResponsiveModal>`       |
| Rankings page          | Replace `<table>` with `<ResponsiveTable>`                               |
| Countries page         | Update grid from `md:grid-cols-3` to responsive with mobile card variant |

---

### 7. Database Changes

None — this phase is entirely frontend.

---

### 8. API Changes

None — this phase is entirely frontend.

---

### 9. Compatibility Analysis

| Dimension    | Risk                                                           | Mitigation                                                                 |
| ------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **UI**       | 🟠 Medium — navigation pattern changes significantly on mobile | Bottom nav is `md:hidden`, sidebar is `hidden md:flex` — no desktop impact |
| **State**    | ✅ None                                                        | No state management changes                                                |
| **Breaking** | 🟡 Low — modal behavior changes on mobile                      | `ResponsiveModal` is a wrapper; modal content components unchanged         |

---

### 10. Risks and Mitigation

| Risk                                             | Probability | Impact | Mitigation                                                                            |
| ------------------------------------------------ | ----------- | ------ | ------------------------------------------------------------------------------------- |
| Bottom nav hides content at page bottom          | Certain     | Low    | Add `pb-20 md:pb-0` to main content container                                         |
| Bottom sheet swipe conflicts with form scrolling | Medium      | Medium | Disable swipe-to-close when user is scrolling within the sheet content                |
| SSR hydration mismatch with `useMediaQuery`      | Medium      | Low    | Use `useEffect` to set media query state client-side; render desktop layout on server |
| Safe area insets not supported on older browsers | Low         | Low    | Fallback padding values for non-supporting browsers                                   |
| Performance of scroll direction detection        | Low         | Low    | Use `requestAnimationFrame` throttling on scroll listener                             |

---

### 11. Future Phase Considerations

- **Phase 6 (Command Palette):** Bottom nav "More" sheet can include a "Search" shortcut.
- **Phase 8 (Accessibility):** Bottom nav needs proper `role="navigation"` and `aria-current` attributes.
- **`ResponsiveModal`** becomes the standard for all future modals — no more one-off implementations.
- **`ResponsiveTable`** becomes the standard for any future data tables.

---

### 12. Acceptance Criteria

- [ ] Bottom navigation bar visible on mobile (`< 768px`) with 5 tabs
- [ ] Bottom nav has active state highlighting and smooth transitions
- [ ] Bottom nav auto-hides on scroll-down, reveals on scroll-up
- [ ] "More" tab opens slide-up sheet with full navigation
- [ ] Sidebar hamburger menu removed on mobile (bottom nav replaces it)
- [ ] All modals convert to bottom sheets on mobile
- [ ] Bottom sheets have drag-to-close and backdrop-tap-to-close
- [ ] Rankings page uses card layout on mobile instead of table
- [ ] All interactive elements have ≥44px touch targets
- [ ] Fluid typography scales between 320px and 2560px viewports
- [ ] Country cards use mobile-optimized layout on `< 768px`
- [ ] Safe area insets applied for notched devices
- [ ] Mobile sidebar has swipe-to-close gesture
- [ ] No horizontal overflow on any page at 320px viewport width
- [ ] Desktop experience is completely unchanged
- [ ] `pnpm type-check` passes
- [ ] No new lint errors

---

## Phase 5: Notification & Deadline Reminder System

### 1. Goal

Build an **in-app notification center** and **deadline-aware reminder engine** that proactively alerts users about upcoming application deadlines, professor follow-up windows, document expiration, and profile completion gaps. Transform GradPlanner from a passive tracking tool into an **active advisor** that pushes users to take timely action.

### 2. Why This Phase Is Needed

GradPlanner currently has zero proactive communication:

| Problem                                                                                                             | Impact                                                                             | Risk Level  |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------- |
| **No deadline reminders** — users must manually check their tracked deadlines                                       | A student misses a Jan 15 Sweden deadline because they forgot to check GradPlanner | 🔴 CRITICAL |
| **No follow-up reminders for professors** — `nextFollowUp` date exists in DB but nothing surfaces it                | A 14-day follow-up window passes silently; professor outreach momentum is lost     | 🔴 CRITICAL |
| **No document expiration alerts** — IELTS scores expire after 2 years, police clearance expires                     | User submits an application with an expired IELTS score                            | 🟠 HIGH     |
| **Settings page has notification toggles but they're mocked** — Phase 1 will persist them, but no system reads them | Users configure "Email alerts" that don't actually exist                           | 🟠 HIGH     |
| **No in-app notification center** — no bell icon, no notification history, no unread count                          | Users have no central place to see what needs attention                            | 🟠 HIGH     |
| **"What Next Today" widget is static** — shows recommendations but doesn't track user actions                       | Same advice repeats even after user takes action                                   | 🟡 MEDIUM   |
| **No profile completion nudges** — users who skip onboarding never get reminded                                     | Profile stays at 30%, match scores remain generic                                  | 🟡 MEDIUM   |

**Business value:** Notifications are the #1 retention mechanism in SaaS products. A student who gets a "Your Sweden deadline is in 30 days" notification is 5x more likely to return than one who doesn't. Professor follow-up reminders directly improve admission outcomes. This phase transforms GradPlanner from a tool users open occasionally into a companion that actively helps.

---

### 3. Features

#### 3.1 Notification Data Model & Backend Engine

**New `Notification` model:**

- Stores per-user notifications with type, title, message, read status, link, and creation timestamp
- Notification types: `DEADLINE_APPROACHING`, `FOLLOW_UP_DUE`, `DOCUMENT_EXPIRING`, `PROFILE_INCOMPLETE`, `APPLICATION_UPDATE`, `SYSTEM`
- A backend notification generation service that runs on specific triggers

**Notification triggers (computed on API calls, not cron):**

| Trigger                                        | When Generated                                   | Notification                                       |
| ---------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| Application deadline < 30 days away            | On `GET /dashboard/stats` or `GET /applications` | "⏰ [University] deadline is in X days"            |
| Application deadline < 7 days away             | Same                                             | "🔴 URGENT: [University] deadline in X days!"      |
| Professor `nextFollowUp` date is today or past | On `GET /professors`                             | "📧 Time to follow up with Prof. [Name]"           |
| Professor follow-up count = 2 (at limit)       | On professor update                              | "⚠️ Prof. [Name] has reached the follow-up limit"  |
| Document `expiresAt` < 60 days away            | On `GET /documents`                              | "📄 [Document] expires in X days"                  |
| Profile completeness < 60%                     | On `GET /profile`                                | "Complete your profile for better recommendations" |
| Application status changes to OFFER_RECEIVED   | On application update                            | "🎉 Offer received from [University]!"             |

#### 3.2 In-App Notification Center

**Bell icon in the dashboard header:**

- Shows unread count badge (red dot with number)
- Clicking opens a dropdown panel (desktop) or bottom sheet (mobile)
- Lists notifications sorted by recency
- Each notification has: icon (by type), title, message, timestamp, and optional CTA link
- "Mark all as read" action
- "Clear all" action
- Notifications auto-generated on relevant API calls

#### 3.3 Notification API Endpoints

| Route                                    | Method | Purpose                                                 |
| ---------------------------------------- | ------ | ------------------------------------------------------- |
| `GET /api/v1/notifications`              | GET    | Fetch all user notifications (paginated, newest first)  |
| `GET /api/v1/notifications/unread-count` | GET    | Fetch unread count only (lightweight, for header badge) |
| `PUT /api/v1/notifications/:id/read`     | PUT    | Mark a single notification as read                      |
| `PUT /api/v1/notifications/read-all`     | PUT    | Mark all as read                                        |
| `DELETE /api/v1/notifications/:id`       | DELETE | Delete a notification                                   |
| `DELETE /api/v1/notifications/clear-all` | DELETE | Clear all notifications                                 |

#### 3.4 Notification Generation Service

A backend service (`backend/src/services/notificationService.ts`) that:

- Provides `generateDeadlineNotifications(userId)` — checks all application deadlines
- Provides `generateFollowUpNotifications(userId)` — checks all professor nextFollowUp dates
- Provides `generateDocumentExpiryNotifications(userId)` — checks document expiry dates
- Provides `generateProfileNotifications(userId)` — checks profile completeness
- De-duplicates: doesn't create a notification if one with the same `type + referenceId` already exists and is unread
- Called lazily on relevant GET requests (not a cron job — keeps it serverless-friendly)

#### 3.5 Toast-Style Live Notifications

When a notification is generated during a page load:

- Show a toast notification (using existing Sonner integration)
- Toast links to the relevant page
- Only show toasts for HIGH-priority notifications (deadline < 7 days, follow-up overdue)

#### 3.6 Enhanced "What Next Today" Widget

Upgrade the existing `WhatNextToday` component to:

- Pull from notifications to show the most urgent items
- Show "You have X notifications requiring attention" summary
- Track which suggestions the user has dismissed (store in `localStorage`)
- Refresh dynamically as user takes actions

#### 3.7 User Notification Preferences Integration

Read the `UserSettings` model (from Phase 1) to control notification behavior:

- `emailDeadlineAlerts: false` → don't generate DEADLINE_APPROACHING notifications
- `timelineNotifications: false` → don't generate FOLLOW_UP_DUE notifications
- Respect preferences in the notification generation service

---

### 4. Detailed UI/UX Requirements

#### Notification Bell (Header)

- **Position:** Dashboard header, between theme toggle and user menu
- **Icon:** `Bell` from lucide-react, 20×20
- **Badge:** Red circle, 16px diameter, white text, positioned top-right of bell icon
- **Badge animation:** Scale-in animation when count changes
- **No notifications:** Bell icon with no badge, muted color

#### Notification Dropdown (Desktop)

- **Width:** 380px, max-height 480px
- **Position:** Anchored to bell icon, aligned right
- **Header:** "Notifications" title + "Mark all read" link
- **Items:** Each notification is a row with:
  - Left: Type icon (color-coded by urgency)
  - Center: Title (bold) + message (muted) + timestamp ("2 hours ago")
  - Right: Blue dot for unread, hover shows "×" to dismiss
- **Empty state:** "No notifications. You're all caught up! ✅"
- **Footer:** "View all notifications" link (future: full notifications page)

#### Notification Bottom Sheet (Mobile)

- Same content as dropdown but rendered as a bottom sheet (Phase 4's `ResponsiveModal`)
- Full width, slides up from bottom
- Swipe-to-dismiss individual notifications

#### Notification Item Urgency Colors

| Type               | Icon          | Color             |
| ------------------ | ------------- | ----------------- |
| DEADLINE < 7 days  | `AlertCircle` | Destructive (red) |
| DEADLINE < 30 days | `Clock`       | Warning (amber)   |
| FOLLOW_UP_DUE      | `Mail`        | Info (blue)       |
| DOCUMENT_EXPIRING  | `FileText`    | Warning (amber)   |
| PROFILE_INCOMPLETE | `User`        | Muted             |
| APPLICATION_UPDATE | `CheckCircle` | Success (green)   |
| SYSTEM             | `Bell`        | Muted             |

---

### 5. Backend Requirements

#### Database

**New model: `Notification`**

```prisma
model Notification {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        NotificationType
  title       String
  message     String
  link        String?          // e.g., "/dashboard/applications"
  referenceId String?          // e.g., application ID, professor ID
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@index([userId, type, referenceId])
}
```

**New enum: `NotificationType`**

```prisma
enum NotificationType {
  DEADLINE_APPROACHING
  DEADLINE_URGENT
  FOLLOW_UP_DUE
  FOLLOW_UP_LIMIT
  DOCUMENT_EXPIRING
  PROFILE_INCOMPLETE
  APPLICATION_UPDATE
  SYSTEM
}
```

**Relation added to User:**

```prisma
model User {
  // ... existing fields
  notifications Notification[]
}
```

#### API

| Route                                | Method | Validation                  | Auth     |
| ------------------------------------ | ------ | --------------------------- | -------- |
| `/api/v1/notifications`              | GET    | Query: `?limit=20&offset=0` | Required |
| `/api/v1/notifications/unread-count` | GET    | —                           | Required |
| `/api/v1/notifications/:id/read`     | PUT    | —                           | Required |
| `/api/v1/notifications/read-all`     | PUT    | —                           | Required |
| `/api/v1/notifications/:id`          | DELETE | —                           | Required |
| `/api/v1/notifications/clear-all`    | DELETE | —                           | Required |

---

### 6. Architecture Requirements

#### New Files

```
backend/src/
├── routes/
│   └── notifications.ts                # Notification CRUD endpoints
├── services/
│   └── notificationService.ts          # Notification generation logic
├── validators/
│   └── notification.ts                 # Query param validation

frontend/src/
├── components/
│   ├── notifications/
│   │   ├── NotificationBell.tsx         # Header bell icon with badge
│   │   ├── NotificationPanel.tsx        # Dropdown/sheet notification list
│   │   ├── NotificationItem.tsx         # Single notification row
│   │   └── NotificationEmptyState.tsx   # "All caught up" empty state
├── lib/
│   └── store/
│       └── slices/
│           └── notificationSlice.ts     # NEW: unread count in Redux
```

#### Key Design Decisions

1. **Lazy generation (not cron):** Notifications are generated on relevant GET requests. This keeps the architecture serverless-friendly (no persistent background worker needed on Vercel). Trade-off: notifications only appear when the user opens the app. This is acceptable for Phase 5; Phase 10 can add a cron if needed.

2. **De-duplication by `type + referenceId`:** Prevents "deadline in 30 days" from being created every time the user loads the page. Only creates a new notification if no unread notification of the same type for the same reference exists.

3. **Unread count in Redux:** The header bell badge needs to be updated globally. A lightweight Redux slice with just the count (fetched from `/unread-count`) avoids re-fetching the full notification list on every page.

4. **Notification preferences:** The generation service reads `UserSettings` to respect opt-outs. If `emailDeadlineAlerts` is false, deadline notifications are skipped entirely.

---

### 7. Database Changes

| Change                                 | Type     | Risk                             |
| -------------------------------------- | -------- | -------------------------------- |
| Add `Notification` model               | Additive | ✅ Zero risk — new table         |
| Add `NotificationType` enum            | Additive | ✅ Zero risk — new enum          |
| Add `notifications` relation to `User` | Additive | ✅ Zero risk — optional relation |

**Migration:** Single `prisma migrate dev` with name `add-notifications`.

---

### 8. API Changes

| Change                                                                      | Breaking?             | Migration Path                                             |
| --------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------- |
| New `/api/v1/notifications/*` endpoints                                     | No — additive         | New route, no existing code affected                       |
| Stats/professors/applications endpoints may trigger notification generation | No — side effect only | Notifications generated silently; response shape unchanged |

---

### 9. Compatibility Analysis

| Dimension       | Risk                                                                        | Mitigation                                                                     |
| --------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Migration**   | ✅ None — additive                                                          | New table and enum only                                                        |
| **Auth**        | ✅ None                                                                     | Uses existing `requireAuth`                                                    |
| **UI**          | 🟡 Low — adds bell icon to header                                           | Header layout already has `gap-4` flex container; bell icon slots in naturally |
| **State**       | 🟡 Low — new Redux slice                                                    | `notificationSlice` is independent; no existing slices modified                |
| **Performance** | 🟡 Low — lazy notification generation adds DB queries to existing endpoints | Generation queries are indexed and cached per request; minimal overhead        |

---

### 10. Risks and Mitigation

| Risk                                                                | Probability | Impact | Mitigation                                                                                                                   |
| ------------------------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Lazy generation misses notifications if user doesn't visit the page | Medium      | Medium | "What Next Today" widget on dashboard runs all generators; users who visit dashboard daily are covered                       |
| Notification table grows unbounded                                  | Medium      | Low    | Add a cleanup query: delete read notifications older than 90 days                                                            |
| De-duplication logic has edge cases                                 | Low         | Low    | Use database unique constraint on `(userId, type, referenceId)` for unread notifications; catch constraint errors gracefully |
| Notification dropdown blocks header interaction                     | Low         | Low    | Click-outside-to-close handler; proper z-index layering                                                                      |
| Too many notifications overwhelm the user                           | Low         | Medium | Group similar notifications ("3 deadlines approaching") and cap at 50 total                                                  |

---

### 11. Future Phase Considerations

- **Phase 9 (Performance):** Notification unread count can be cached in Redis/memory for high-traffic scenarios.
- **Phase 10 (Production Readiness):** Add optional email delivery using a provider (Resend, SendGrid) for critical notifications (deadline < 7 days).
- **Future "Cron Worker" phase:** Move from lazy generation to a scheduled background job that generates notifications nightly, enabling push notifications for users who haven't visited.
- **Future "Push Notifications":** The `Notification` model is already structured to support browser push notifications (add `deliveredVia` field).

---

### 12. Acceptance Criteria

- [ ] `Notification` model and `NotificationType` enum exist in Prisma schema
- [ ] All 6 notification API endpoints implemented and validated
- [ ] Notification generation service creates de-duplicated notifications for:
  - Application deadlines < 30 days (and urgent < 7 days)
  - Professor follow-ups that are due or overdue
  - Documents approaching expiry (< 60 days)
  - Profile completeness < 60%
  - Application status changes to OFFER_RECEIVED
- [ ] Bell icon in dashboard header shows unread notification count
- [ ] Clicking bell opens notification dropdown (desktop) / bottom sheet (mobile)
- [ ] Notifications are sorted by recency with urgency-colored icons
- [ ] "Mark all as read" and individual "mark read" work correctly
- [ ] "Clear all" deletes all user notifications
- [ ] `UserSettings` preferences respected (opt-out of deadline/timeline notifications)
- [ ] `WhatNextToday` widget integrates with notification system
- [ ] HIGH-priority notifications trigger toast on page load
- [ ] Notification Redux slice stores unread count globally
- [ ] Empty state shown when no notifications exist
- [ ] `pnpm type-check` passes in both frontend and backend
- [ ] No new lint errors

---

## Phase 6: Global Search & Command Palette

### 1. Goal

Implement a **fast, keyboard-driven Ctrl+K command palette** that serves as the central nervous system for GradPlanner. Allow users to instantly navigate the app, search across all entities (universities, professors, countries, applications), and execute quick actions without taking their hands off the keyboard.

### 2. Why This Phase Is Needed

Currently, navigating GradPlanner requires significant mouse interaction and multiple clicks:

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **Deep navigation paths** | Users must click sidebar -> list -> item to view details | 🟠 HIGH |
| **No cross-entity search** | Finding a specific professor requires going to the Professors page | 🟠 HIGH |
| **Slow repetitive actions** | Adding a new university takes 3-4 clicks from the dashboard | 🟡 MEDIUM |
| **No keyboard shortcuts** | Power users have no way to speed up their workflow | 🟡 MEDIUM |
| **Hidden features** | Less commonly used features are hard to discover | 🟡 MEDIUM |

**Business value:** A command palette drastically reduces friction, making the app feel like a premium, professional tool (similar to Superhuman, Linear, or Raycast). This increases perceived value and user retention by speeding up everyday tasks.

### 3. Features

#### 3.1 Global Shortcut Trigger
- Pressing Ctrl+K (Windows/Linux) or Cmd+K (Mac) opens the command palette overlay.
- Accessible via a visible search bar button in the dashboard header for mouse users.

#### 3.2 Unified Search Engine
- **Universities:** Search by name or country.
- **Professors:** Search by name, university, or research interest.
- **Countries:** Quick jump to country intelligence pages.
- **Applications:** Search by university or status.

#### 3.3 Quick Navigation Commands
- "Go to Dashboard"
- "Go to Profile"
- "Go to Settings"
- "Go to Timeline"

#### 3.4 Quick Actions
- "Add New University" (opens the bottom sheet/modal immediately)
- "Add New Professor"
- "Add New Document"
- "Toggle Theme (Light/Dark)"
- "Log Out"

#### 3.5 Context-Aware Suggestions
- Empty state (no search query) shows:
  - Recently accessed items (stored in localStorage)
  - Suggested commands based on the current page (e.g., if on Professors page, prioritize "Add Professor")

### 4. Detailed UI/UX Requirements

#### Command Palette Modal
- **Layout:** Centered modal overlay, max-width 640px, elevated shadow (shadow-2xl).
- **Backdrop:** g-black/50 backdrop-blur-sm.
- **Search Input:** Large, clean input field with a search icon. No visible border.
- **Results List:** Grouped by category (e.g., "Universities", "Commands").
- **Highlighting:** The matched substring in the search results should be highlighted (e.g., bold or primary color).
- **Keyboard Navigation:** 
  - Arrow Up / Arrow Down to traverse the list.
  - Enter to select.
  - Escape to close.
- **Visuals:** Use cmdk (a React command menu component) styled with shadcn/ui Command component.

#### Mobile UX
- On mobile, the command palette opens as a full-screen sheet or stays as a responsive modal that anchors to the top.
- The Ctrl+K hint is hidden on touch devices.

### 5. Backend Requirements

#### API
| Route | Method | Validation | Auth | Purpose |
|-------|--------|------------|------|---------|
| /api/v1/search | GET | Query: ?q=query | Required | Unified search endpoint returning matching universities, professors, and applications |

**Search Query Logic:**
- Use contains with mode: 'insensitive' in Prisma for fast LIKE queries.
- Limit results to top 5 per category to keep the payload lightweight and UI responsive.

### 6. Architecture Requirements

#### New Files
``
backend/src/
├── routes/
│   └── search.ts                     # Unified search endpoint

frontend/src/
├── components/
│   └── command-palette/
│       ├── CommandPalette.tsx        # Main cmdk wrapper and state
│       └── useCommandPalette.ts      # Global state/hook to manage open/close
``

#### Reusable Modules
- **useCommandPalette context/zustand store:** Allows any component to trigger the command palette programmatically.

### 7. Database Changes
None. Search utilizes existing tables and indexes.

### 8. API Changes
| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| New /api/v1/search endpoint | No | Additive feature |

### 9. Compatibility Analysis
| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **Performance** | 🟡 Low | Debounce the search input (e.g., 300ms) before hitting the /search API |
| **Keyboard conflicts** | 🟡 Low | Ensure Ctrl+K doesn't conflict with browser defaults (it usually focuses the address bar, preventDefault() is needed) |

### 10. Risks and Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Search API is too slow | Medium | Medium | Limit results, ensure proper DB indexes on 
ame fields |
| cmdk bundle size | Low | Low | The library is lightweight and tree-shakable |

### 11. Future Phase Considerations
- **Phase 8 (AI Email Generator):** Can add a "Draft Email to Professor" quick action directly from the search results.

### 12. Acceptance Criteria
- [ ] cmdk component integrated and styled with Tailwind.
- [ ] Ctrl+K / Cmd+K keyboard shortcut opens the palette globally.
- [ ] Dashboard header includes a visual search bar button.
- [ ] Typing in the input debounces and calls GET /api/v1/search.
- [ ] Search results are grouped by category (Universities, Professors, Commands).
- [ ] Arrow key navigation and Enter selection works flawlessly.
- [ ] Selecting a route navigates to the correct page.
- [ ] Selecting an action (e.g., "Add University") opens the respective modal.
- [ ] Mobile view is responsive and usable without keyboard shortcuts.
- [ ] pnpm type-check passes.
- [ ] No new lint errors.

---

## Phase 7: Advanced Analytics & ROI Dashboard

### 1. Goal

Build a comprehensive **Analytics & ROI (Return on Investment) Dashboard** that visualizes the student's application funnel, scholarship probabilities, and total estimated costs. Move beyond tracking to strategic financial and timeline forecasting.

### 2. Why This Phase Is Needed

Targeting higher education abroad involves complex financial planning and probability assessment:

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **No aggregate view of costs** | Students don't know their total estimated first-year costs across all target universities | 🔴 CRITICAL |
| **Hard to visualize progress** | A list of applications doesn't show conversion rates (Applied -> Interview -> Offer) | 🟠 HIGH |
| **Unclear scholarship ROI** | Students don't see how much funding they actually need vs. what is guaranteed | 🟠 HIGH |
| **Professor outreach black box** | No visualization of email response rates | 🟡 MEDIUM |

**Business value:** Providing a "Financial Snapshot" and "Success Funnel" makes GradPlanner indispensable. It transitions the product from a CRM to a strategic planner that directly impacts a student's financial decisions.

### 3. Features

#### 3.1 Application Success Funnel
- A visual funnel chart showing: Shortlisted → Applied → Interviewed → Offer Received → Enrolled.
- Calculates conversion percentages between stages.

#### 3.2 Financial & ROI Forecaster
- **Total Estimated Cost:** Aggregates tuition and living costs of shortlisted universities.
- **Funding Gap Analysis:** Visualizes (Total Cost) - (Expected Scholarships/Stipends) = (Funding Gap in BDT).
- **ROI Metric:** Compares the median post-graduation salary of the target country against the total cost.

#### 3.3 Professor Outreach Analytics
- Response rate pie chart (Replied Positive, Replied Negative, No Response).
- Follow-up effectiveness metrics.

#### 3.4 Timeline Heatmap
- A GitHub-style contribution heatmap showing user activity (documents uploaded, emails logged, statuses updated) to encourage daily engagement.

### 4. Detailed UI/UX Requirements

#### Analytics Page (/dashboard/analytics)
- **Layout:** Masonry grid or defined CSS grid for dashboard widgets.
- **Charts:** Use echarts for highly customizable, responsive SVG charts.
- **Theming:** Charts must use CSS variables (e.g., hsl(var(--primary))) to perfectly match light/dark modes.
- **Financial Widget:** Large typography for the "Funding Gap" in BDT. Conditional coloring (red if gap > user budget, green if fully funded).
- **Funnel Widget:** Horizontal or vertical funnel visualization. 
- **Tooltips:** Hovering over chart elements shows detailed breakdowns.

### 5. Backend Requirements

#### API
| Route | Method | Validation | Auth | Purpose |
|-------|--------|------------|------|---------|
| /api/v1/analytics/funnel | GET | — | Required | Returns counts for application stages |
| /api/v1/analytics/financial | GET | — | Required | Returns aggregated cost and funding data |
| /api/v1/analytics/outreach | GET | — | Required | Returns professor response statistics |

**Aggregation Logic:**
- Use Prisma groupBy and aggregate functions (_sum, _avg) to compute stats on the database side rather than loading all rows into Node.js memory.

### 6. Architecture Requirements

#### New Files
``
backend/src/
├── routes/
│   └── analytics.ts                  # Analytics aggregation endpoints

frontend/src/
├── app/dashboard/analytics/
│   └── page.tsx                      # Main Analytics dashboard
├── components/
│   └── analytics/
│       ├── FunnelChart.tsx           # Recharts funnel
│       ├── FinancialForecaster.tsx   # ROI widget
│       └── OutreachStats.tsx         # Pie/Bar charts for professor data
``

#### Reusable Modules
- Add echarts as a dependency.
- Create a ChartContainer wrapper that handles ResponsiveContainer and theming consistently.

### 7. Database Changes
None. Aggregations use existing data.

### 8. API Changes
| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| New /api/v1/analytics/* endpoints | No | Additive feature |

### 9. Compatibility Analysis
| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **Bundle Size** | 🟡 Low | echarts is a medium-sized dependency. Ensure it's only loaded on the Analytics route (Next.js route-based splitting handles this). |

### 10. Risks and Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex Prisma aggregations cause slow queries | Low | Medium | Ensure indexes exist on status fields in Application and Professor tables. |
| Charts break on small mobile screens | High | Medium | Use ResponsiveContainer and stack charts vertically on < 768px. |

### 11. Future Phase Considerations
- **Phase 9 (PR Pathway):** The ROI calculator can integrate PR visa costs into the total financial gap analysis.

### 12. Acceptance Criteria
- [ ] echarts library integrated.
- [ ] /dashboard/analytics page created and accessible from the sidebar/bottom nav.
- [ ] Application funnel chart renders correctly and calculates conversion rates.
- [ ] Financial Forecaster aggregates costs from universities and displays the BDT gap.
- [ ] Professor outreach stats render as a pie or bar chart.
- [ ] All charts are fully responsive and adapt to light/dark themes.
- [ ] Backend routes use Prisma aggregations instead of loading all rows in memory.
- [ ] pnpm type-check passes.
- [ ] No new lint errors.

---

## Phase 8: Intelligent Professor Email Generator

### 1. Goal

Integrate an **LLM-assisted email generation engine** that helps students draft highly tailored, high-converting outreach emails to professors by analyzing the professor's research interests against the student's academic profile.

### 2. Why This Phase Is Needed

For Bangladeshi students, securing funding (TA/RA) is critical for visa approval and affordability. The primary mechanism for this is cold-emailing professors:

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **Generic, copy-pasted emails** | Professors ignore templates; response rates drop near 0% | 🔴 CRITICAL |
| **Time-consuming research** | Crafting a good email takes 30-45 minutes per professor | 🟠 HIGH |
| **Language barriers** | Non-native speakers struggle with the right tone (confident but respectful) | 🟠 HIGH |
| **Lack of structure** | Students fail to attach their CVs, mention their IELTS, or link their GitHub | 🟡 MEDIUM |

**Business value:** The "Email Generator" becomes a premium feature. By turning a 45-minute task into a 2-minute task while simultaneously increasing the quality of the outreach, GradPlanner provides immediate, tangible ROI to the user.

### 3. Features

#### 3.1 Profile Context Assembly
- The backend automatically aggregates the student's profile (CGPA, IELTS, Research Interests, GitHub) and the specific professor's details (University, Research Area, Recent Publications).

#### 3.2 AI Prompt Engineering
- A strict, system-prompted LLM call (e.g., via OpenAI API, Anthropic, or Gemini) that enforces:
  - 150-200 word limit.
  - No generic flattery; direct reference to the professor's recent work.
  - Clear "Call to Action" (e.g., asking for a 10-minute chat or confirming if they are taking students).
  - Perfect grammar and professional academic tone.

#### 3.3 Draft Editor UI
- The generated email is presented in a rich-text editor, allowing the user to make manual tweaks before copying it to their email client.

#### 3.4 Feedback Loop
- Users can click "Regenerate (Make it shorter)" or "Regenerate (Focus more on NLP)".

### 4. Detailed UI/UX Requirements

#### Professor Detail Page Integration
- Inside the Professor Card / Modal, add a primary button: `✨ Draft Outreach Email`.
- Clicking this opens a side-panel or full-screen modal:
  - **Left side:** The professor's details and the student's matching skills.
  - **Right side:** The generated email draft in a text area, with a "Copy to Clipboard" button.
- **Loading State:** A skeleton loader with a subtle pulsing animation and text like "Analyzing professor's profile..." to communicate value during the ~3-5 second API wait.

### 5. Backend Requirements

#### API
| Route | Method | Validation | Auth | Purpose |
|-------|--------|------------|------|---------|
| `/api/v1/professors/:id/generate-email` | POST | `emailGenConfigSchema` | Required | Triggers the LLM generation and returns the drafted text |

**LLM Integration Layer:**
- Add `ai` or `@google/generative-ai` SDK depending on the chosen provider.
- Manage API keys securely in Vercel Environment Variables.
- Implement streaming (Server-Sent Events) for the response to improve perceived performance.

### 6. Architecture Requirements

#### New Files
```
backend/src/
├── routes/
│   └── ai.ts                         # AI generation endpoints
├── services/
│   └── llmService.ts                 # Wrapper for the LLM provider SDK

frontend/src/
├── components/
│   └── professors/
│       └── EmailGeneratorModal.tsx   # UI for the draft editor
```

#### Reusable Modules
- **`llmService`**: A decoupled service that accepts context and returns a prompt response. Can be reused later for SOP (Statement of Purpose) reviews.

### 7. Database Changes
| Change | Type | Risk |
|--------|------|------|
| Add `emailsGenerated` counter to `UserProfile` | Additive | ✅ Zero risk |

*(Optional: Used to limit AI usage on free tiers).*

### 8. API Changes
| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| New `/api/v1/professors/:id/generate-email` endpoint | No | Additive feature |

### 9. Compatibility Analysis
| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **Cost / API Usage** | 🟠 Medium | Implement strict rate-limiting (e.g., 5 generations per day per user) |
| **Response Latency** | 🟡 Low | Use streaming responses (SSE) so the UI updates as the email is written |

### 10. Risks and Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Hallucinations (AI makes up facts) | Medium | High | The prompt MUST instruct the AI not to invent academic papers or grades. |
| Malicious prompt injection | Low | Low | User input is limited to predefined dropdowns (e.g., "Make it shorter"). |

### 11. Future Phase Considerations
- **Phase 10:** If email generation is a paid feature, this lays the groundwork for Stripe integration.

### 12. Acceptance Criteria
- [ ] LLM provider SDK integrated securely in the backend.
- [ ] `/generate-email` endpoint accepts professor ID, fetches context, and streams AI response.
- [ ] System prompt enforces length, tone, and accuracy constraints.
- [ ] Frontend `EmailGeneratorModal` displays the streaming response.
- [ ] "Copy to Clipboard" functionality works.
- [ ] Backend rate limits generation to prevent abuse.
- [ ] `pnpm type-check` passes.
- [ ] No new lint errors.

---

## Phase 9: PR & Visa Pathway Simulator

### 1. Goal

Build an interactive **Immigration & Visa Pathway Simulator** tailored specifically for Bangladeshi nationals. It maps out the realistic timeline, costs, and steps from Student Visa -> Post-Study Work Visa -> PR (Permanent Residency) for the user's targeted countries.

### 2. Why This Phase Is Needed

Most students study abroad with the ultimate goal of immigration, but they lack clear, BD-specific knowledge of the pathways:

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **Misunderstanding timelines** | Students target the USA for PR, not realizing the EB-2/EB-3 backlog for BD is decades | 🔴 CRITICAL |
| **Hidden costs** | Failure to account for APS certificates (Germany) or GIC (Canada) leads to visa rejection | 🔴 CRITICAL |
| **Generic advice** | Global advice doesn't account for the high visa rejection rates for BD passports | 🟠 HIGH |
| **Missing intermediate steps** | Students don't realize they need a specific language proficiency (e.g., B1 German) for expedited PR | 🟡 MEDIUM |

**Business value:** By providing hyper-specific, reality-based immigration pathways, GradPlanner differentiates itself from every other generic study-abroad tracker. It becomes a trusted advisor.

### 3. Features

#### 3.1 BD-Specific Visa Reality Data
- Static reference data mapping visa requirements specifically for BD passport holders (e.g., APS for Germany, SDS restrictions for Canada).

#### 3.2 Interactive Timeline Simulator
- A visual node-based timeline (e.g., Start -> Graduation -> Post-Study Work -> Apply for PR -> Citizenship).
- Dynamic calculations based on graduation date (e.g., if graduation is Nov 2027, PR eligibility in Australia is Nov 2030).

#### 3.3 "Risk & Reality" Cards
- Honest assessments for each country (e.g., "USA: High Risk for PR", "Canada: Moderate Risk, Fast Processing", "Germany: Low Risk, High Language Barrier").

#### 3.4 Cost Mapping
- Visualization of immigration-specific costs (SEVIS fees, Residence Permit fees, Health Surcharges) independent of university tuition.

### 4. Detailed UI/UX Requirements

#### Pathway Simulator Page (`/dashboard/pathways`)
- **Layout:** Horizontal scrolling timeline or vertical stepper (similar to a train map) representing the immigration journey.
- **Interactivity:** Clicking a node (e.g., "Post-Study Work Visa") opens a drawer with BD-specific requirements (e.g., "Must have IELTS 6.0, costs $500").
- **Comparison:** Allow users to place two countries side-by-side to visually compare the length of time to PR.
- **Visuals:** Use a timeline library or custom `shadcn/ui` based steppers. Color-code nodes by difficulty/risk.

### 5. Backend Requirements

#### API
| Route | Method | Validation | Auth | Purpose |
|-------|--------|------------|------|---------|
| `/api/v1/pathways/:country` | GET | — | Required | Returns structured visa and PR timeline data for the given country |

**Data Structure:**
- Create a set of JSON files or Prisma seeded tables containing the pathway logic (e.g., `PathwayStep`: Title, Description, DurationMonths, CostUSD, RiskLevel).

### 6. Architecture Requirements

#### New Files
```
backend/src/
├── data/
│   └── pathways/
│       ├── canada.json               # BD-specific rules
│       ├── germany.json              # BD-specific rules
│       └── australia.json            # BD-specific rules

frontend/src/
├── app/dashboard/pathways/
│   └── page.tsx                      # Simulator UI
├── components/
│   └── pathways/
│       └── PathwayTimeline.tsx       # Node-based interactive timeline
```

#### Reusable Modules
- **`PathwayTimeline`**: Visual stepper component mapping the stages of immigration.

### 7. Database Changes
| Change | Type | Risk |
|--------|------|------|
| (Optional) Add `Pathway` and `PathwayStep` reference tables | Additive | ✅ Zero risk |

*Alternatively, this data can remain in static JSON files since it changes infrequently.*

### 8. API Changes
| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| New `/api/v1/pathways/:country` endpoint | No | Additive feature |

### 9. Compatibility Analysis
| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **Data Maintenance** | 🟠 Medium | Immigration rules change; keep data in easily editable JSON or simple tables |

### 10. Risks and Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Providing legal advice | High | High | Add explicit disclaimers: "This is a strategic estimate, not legal immigration advice." |
| Outdated information | Medium | High | Include "Last updated: [Date]" on all pathway cards. |

### 11. Future Phase Considerations
- **Phase 10:** Combine the pathway timeline with the user's personal timeline to create a unified 5-year master plan.

### 12. Acceptance Criteria
- [ ] Static data/JSON created for Canada, USA, Australia, and Germany pathways specifically for BD nationals.
- [ ] `/dashboard/pathways` page built with a responsive timeline/stepper UI.
- [ ] Side-by-side comparison logic implemented.
- [ ] Explicit disclaimers added regarding legal advice.
- [ ] All costs and durations render correctly.
- [ ] `pnpm type-check` passes.
- [ ] No new lint errors.

---

## Phase 10: Performance Optimization, Offline Mode & PWA Support

### 1. Goal

Upgrade GradPlanner into a highly performant **Progressive Web App (PWA)**. By enabling offline mode, caching, and installability, the platform will feel like a native mobile application. Furthermore, strict performance optimizations will ensure fast load times even on slow 3G/4G connections typical in Bangladesh.

### 2. Why This Phase Is Needed

A premium SaaS product must be fast, resilient, and always accessible:

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **No offline capabilities** | Students cannot check professor details or deadlines when internet drops | 🟠 HIGH |
| **No home screen icon** | Mobile users must type the URL every time, reducing daily active usage | 🟠 HIGH |
| **Large bundle sizes** | High bounce rates due to slow initial load times on mobile networks | 🟡 MEDIUM |
| **Uncached assets** | Re-downloading fonts and images wastes bandwidth | 🟡 MEDIUM |

**Business value:** PWAs increase user engagement by up to 50% because the app lives on the user's home screen. Offline mode ensures reliability, building immense trust with users who might be reviewing application notes while commuting.

### 3. Features

#### 3.1 PWA Installability
- Valid `manifest.json` with all required app icons, theme colors, and splash screens.
- Triggers the native "Add to Home Screen" prompt on Android and iOS.

#### 3.2 Service Worker & Offline Caching
- Implement `next-pwa` or a custom service worker via Workbox.
- **Cache Strategies:**
  - *Network First, fallback to Cache:* For user-specific data (e.g., API routes for profile, applications).
  - *Cache First, fallback to Network:* For static assets (fonts, icons, CSS).
- When completely offline, users can still view cached dashboard pages and read saved data.

#### 3.3 Next.js Bundle & Rendering Optimization
- Use `@next/bundle-analyzer` to identify and remove heavy/duplicate dependencies.
- Implement React Server Components (RSC) heavily for static pages (e.g., country intelligence) to ship zero JS.
- Optimize images using `next/image` with proper sizing and format (WebP/AVIF).

#### 3.4 API Response Compression & CDN
- Enable Brotli/Gzip compression on the Express backend.
- Serve backend static assets through a CDN.
- Use `ETag` and `Cache-Control` headers for immutable data (e.g., University Rankings lists).

### 4. Detailed UI/UX Requirements

#### Offline State UI
- A subtle, non-intrusive banner at the top of the app: "You are currently offline. Showing cached data."
- Disable submit buttons for forms (like "Add Professor") when `navigator.onLine` is false, showing a tooltip: "Action unavailable offline."

#### App Install Banner
- Instead of relying solely on the browser's native prompt, show a custom, styled banner on the dashboard for mobile users: "Install GradPlanner for a faster, app-like experience."

### 5. Backend Requirements

#### API
| Route | Method | Validation | Auth | Purpose |
|-------|--------|------------|------|---------|
| All `GET` routes | — | — | — | Add appropriate `Cache-Control` headers for data that changes infrequently (like `countries`, `universities`) |

**Compression:** Ensure the `compression` middleware is installed and active in the Express app.

### 6. Architecture Requirements

#### New Files
```
frontend/
├── public/
│   ├── manifest.json                 # PWA Web App Manifest
│   ├── icons/                        # 192x192, 512x512 app icons
│   └── sw.js                         # Custom Service Worker (if not using next-pwa)
├── next.config.mjs                   # MODIFIED: wrap with withPWA
```

#### Reusable Modules
- **`useNetworkStatus` hook:** Monitors online/offline state and dispatches UI changes globally.

### 7. Database Changes
None.

### 8. API Changes
None breaking. Additive caching headers.

### 9. Compatibility Analysis
| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **Service Worker caching** | 🟠 Medium | Service workers can aggressively cache stale data. Use strict cache invalidation rules and "stale-while-revalidate" strategies for API calls. |
| **iOS PWA limits** | 🟡 Low | iOS Safari has strict limits on PWA cache size; ensure we only cache essential data. |

### 10. Risks and Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Over-caching causes users to see outdated application statuses | Medium | High | Exclude `POST/PUT/DELETE` API routes from the service worker completely. Use network-first for dashboard data. |

### 11. Future Phase Considerations
- **Post-Phase 10:** With PWA foundations, adding Web Push Notifications becomes possible (replacing/supplementing the in-app notification center from Phase 5).

### 12. Acceptance Criteria
- [ ] `manifest.json` and required icons are present in the `public` directory.
- [ ] Lighthouse PWA score is 100/100.
- [ ] Application is installable on Android (Chrome) and iOS (Safari).
- [ ] Service worker successfully caches static assets and API GET requests.
- [ ] Application functions in read-only mode when disconnected from the network.
- [ ] Offline banner displays when `navigator.onLine` is false.
- [ ] Express backend uses `compression` middleware.
- [ ] Next.js bundle size is audited and optimized.
- [ ] `pnpm type-check` passes.
- [ ] No new lint errors.
