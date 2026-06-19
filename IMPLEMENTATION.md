# GradPlanner — Continuous Improvement Plan

---

## Phase 1: Backend API Hardening & Input Validation

### 1. Goal

Transform the Express backend from a prototype-grade API into a **production-hardened, validated, type-safe REST API** that can be trusted by any frontend consumer without defensive coding on every call.

### 2. Why This Phase Is Needed

After a full project audit, the single biggest gap preventing GradPlanner from being production-ready is **backend reliability and safety**. Every downstream feature — UI error states, loading states, mobile UX, onboarding flows — depends on an API that behaves predictably. Currently:

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **Zero request validation** — all 11 route files accept `req.body` without Zod/schema validation | Any malformed request can crash queries, inject bad data, or produce silent corruption | 🔴 CRITICAL |
| **No rate limiting** — every authenticated endpoint is wide open | A single compromised session cookie can exhaust DB connections in seconds | 🔴 CRITICAL |
| **Inconsistent error responses** — some routes return `{ error: string }`, others throw unhandled | Frontend cannot reliably distinguish "not found" from "validation error" from "server crash" | 🟠 HIGH |
| **No request body size limits** — `express.json()` has no limit set | A single POST with a 50MB body would consume all available memory on Vercel Serverless | 🟠 HIGH |
| **Missing `select` in many Prisma queries** — `include: { university: true }` returns ALL fields | Over-fetching wastes bandwidth and leaks data (e.g., `deletedAt`, internal IDs) | 🟡 MEDIUM |
| **Duplicate helper functions** — `toFloatOrNull` is defined inline in 2 routes | Maintenance burden, inconsistency risk | 🟡 MEDIUM |
| **No structured logging** — routes use `console.error` with no context | Production debugging is nearly impossible on Vercel serverless | 🟡 MEDIUM |
| **Settings page is mock-only** — `handleSave` uses `setTimeout`, settings aren't persisted | Users see "saved" but nothing actually persists to the database | 🟠 HIGH |

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
    | { success: false; error: string; code: string; fieldErrors?: Record<string, string[]> }
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

| Route | Method | Validation Schema | Auth | Purpose |
|-------|--------|-------------------|------|---------|
| `/api/v1/settings` | GET | — | Required | Fetch user settings (upsert default if none) |
| `/api/v1/settings` | PUT | `settingsUpdateSchema` | Required | Update user settings |

**Validation schemas (Zod):**

- `settingsUpdateSchema`: `{ emailDeadlineAlerts?: boolean, timelineNotifications?: boolean, strategyPreference?: enum("PR speed" | "AI Market" | "No Tuition" | "Scholarship") }`

#### All existing routes refactored:

| Route File | Changes |
|------------|---------|
| `profile.ts` | Add `profileUpdateSchema` validation on PUT |
| `universities.ts` | Add `universityCreateSchema` / `universityUpdateSchema` validation |
| `professors.ts` | Add `professorCreateSchema` / `professorUpdateSchema` / `logEmailSchema` validation |
| `applications.ts` | Add `applicationCreateSchema` / `applicationUpdateSchema` validation |
| `documents.ts` | Add `documentCreateSchema` / `documentUpdateSchema` validation |
| `decisionEngine.ts` | Add query param validation |
| `scholarships.ts` | Add query param validation |
| `timeline.ts` | Add query param validation |
| `rankings.ts` | Add query param validation |
| `countries.ts` | No body mutations, but add query param validation |
| `stats.ts` | No changes needed (read-only, no body) |

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

| Change | Type | Risk |
|--------|------|------|
| Add `UserSettings` model | Additive | ✅ Zero risk — new table, no existing data affected |
| Add `settings` relation to `User` | Additive | ✅ Zero risk — optional relation |

**Migration strategy:** Single `prisma migrate dev` with descriptive name `add-user-settings`.

---

### 8. API Changes

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| All responses wrapped in `{ success, data }` or `{ success, error, code }` | ⚠️ Yes — frontend must update | Update `fetchApi` to unwrap `data` from the new envelope. This is a single-point change in `frontend/src/lib/api.ts`. |
| New 422 status code for validation errors | No — frontend currently treats all non-2xx as errors | Frontend already throws on `!res.ok`. The new `code` field enables smarter error handling. |
| New `/api/v1/settings` endpoints | No — additive | Frontend settings page updated to use them. |

---

### 9. Compatibility Analysis

| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **API contract change** | 🟠 Medium — response shape changes | Update `fetchApi` FIRST, then deploy backend changes. The wrapper function is a single point of change. |
| **Migration** | ✅ None — purely additive | Standard `prisma migrate dev` |
| **Auth** | ✅ None — no auth flow changes | Settings endpoints use existing `requireAuth` middleware |
| **UI** | ✅ Minimal — only Settings page changes | Settings page already exists; replace mock logic with real API calls |
| **State** | ✅ None — no Redux store changes | Settings are fetched on Settings page mount only, no global state needed |
| **Breaking changes** | 🟠 One — API response envelope | Mitigated by updating `fetchApi` to transparently unwrap the new format |

---

### 10. Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API response envelope breaks frontend | Medium | High | Update `fetchApi` to unwrap `data` field — ALL frontend calls go through this single function |
| Zod adds bundle size to backend | Low | Low | Zod is already a frontend dependency; backend is server-only so bundle size is irrelevant |
| Rate limiting blocks legitimate users | Low | Medium | Start with generous limits (100/min). Log rate-limit events. Add bypass for health checks. |
| New `express-rate-limit` package | Low | Low | Well-maintained, zero-dependency package. Confirm with user before installing. |
| Migration conflicts | None | — | Purely additive migration — no existing columns changed |

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

| Problem | Impact | Risk Level |
|---------|--------|------------|
| **No onboarding flow** — new users land on an empty dashboard with 0 data | Immediate churn — users don't understand the product value | 🔴 CRITICAL |
| **Profile completeness drives match scores** — but users must discover the Profile page themselves | The core value proposition (personalized country recommendations) requires data users don't provide | 🔴 CRITICAL |
| **No `isOnboarded` flag** — every dashboard load rechecks profile, no way to distinguish first-time from returning user | Can't conditionally show onboarding or welcome-back flows | 🟠 HIGH |
| **Dashboard profile modal is redundant** — quick-edit modal on dashboard duplicates the full Profile page, but collects only 5/10 fields | Users who fill the modal think they're done, but miss 5 critical match intelligence fields | 🟠 HIGH |
| **No contextual guidance** — new users see "AI Fit Recommendations" with generic scores, no explanation of how to improve them | Users don't understand the relationship between profile data and recommendation quality | 🟡 MEDIUM |
| **Registration → login → empty dashboard** is a cold, generic experience | No wow moment, no value demonstration, no momentum | 🟡 MEDIUM |

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

| Route | Method | Changes | Auth |
|-------|--------|---------|------|
| `/api/v1/profile` | GET | Add `isOnboarded` to response (already returned by Prisma) | Required |
| `/api/v1/profile` | PUT | Accept `isOnboarded` field in body | Required |
| `/api/v1/profile/complete-onboarding` | POST | **NEW** — Bulk-update all profile fields + set `isOnboarded: true` in one transaction | Required |

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

| Change | Type | Risk |
|--------|------|------|
| Add `isOnboarded Boolean @default(false)` to `UserProfile` | Additive | ✅ Zero risk — new column with default, existing rows get `false` |

**Migration strategy:** Single `prisma migrate dev` with name `add-is-onboarded-flag`. All existing users will have `isOnboarded: false`, which means they'll see the wizard on next login — this is the desired behavior.

---

### 8. API Changes

| Change | Breaking? | Migration Path |
|--------|-----------|----------------|
| `isOnboarded` field added to GET `/profile` response | No — additive field | Frontend reads it when available |
| `isOnboarded` accepted in PUT `/profile` body | No — optional field | No change needed for existing calls |
| New POST `/profile/complete-onboarding` endpoint | No — additive | New endpoint, no existing code calls it |

---

### 9. Compatibility Analysis

| Dimension | Risk | Mitigation |
|-----------|------|------------|
| **Migration** | ✅ None — purely additive column | `@default(false)` ensures existing rows are valid |
| **Auth** | ✅ None — uses existing `requireAuth` | No auth flow changes |
| **UI** | 🟡 Low — existing dashboard layout needs conditional rendering | Add `isOnboarded` check in dashboard layout, redirect to wizard if false |
| **State** | ✅ Minimal — profile Redux slice already exists | `isOnboarded` is part of the profile object, no new slice needed |
| **API** | ✅ None — new endpoint, no changes to existing endpoints | Existing profile PUT still works identically |
| **Breaking changes** | 🟡 One behavioral change — existing users will see the wizard | Mitigated: wizard has "Skip" option and users can complete it in < 2 minutes |

---

### 10. Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Existing users see the wizard after deploy | Certain | Low | The wizard has a "Skip & go to dashboard" link. Existing users can complete it in 2 minutes, which actually improves their match scores. |
| Wizard state lost on page refresh | Medium | Medium | Store wizard progress in `sessionStorage`. Restore on re-render. |
| Onboarding adds friction for users who just want to explore | Low | Medium | Prominent "Skip for now" link on every step. Dashboard is accessible from sidebar even during onboarding. |
| Step transitions feel janky on mobile | Low | Low | Use CSS `transform: translateX()` with `transition` instead of JavaScript animations. Test on low-end devices. |
| BDT conversion rate becomes stale | Low | Low | Use a static rate (120 BDT/USD) with a "Rate as of Jun 2026" disclaimer. Future phase can add live rates. |

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
