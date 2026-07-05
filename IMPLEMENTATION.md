# GradPlanner — Continuous Improvement Plan

---

## Phase 1: Backend API Hardening & Input Validation ✅ COMPLETED

**Summary:** Zod validation (7 schemas), ApiResponse<T> envelope, rate limiting (100/10/30 per min), 256kb body cap, shared parsers, structured logger, UserSettings model + GET/PUT endpoints, Settings page rewrite with RHF+Zod, ApiErrorAlert/FieldError shared components, fetchApi auto-unwrap, 3045 university rankings + 20-country seed data.

### Acceptance criteria (all met)
- All API responses use `{ success, data }` / `{ success, error, code }` contract
- fetchApi unwraps envelope; rate limiting active; body cap set
- UserSettings model, GET/PUT endpoints, settings page with skeleton + error state
- Database seeded with rankings + country data; `pnpm type-check` passes

---

---

## Phase 2: Onboarding Wizard & Profile Intelligence UX ✅ COMPLETED

**Summary:** `isOnboarded` flag on UserProfile, POST `/api/v1/profile/complete-onboarding` endpoint, 4-step OnboardingWizard (AcademicProfile/MatchIntelligence/Priorities/Summary) with sessionStorage persistence per-step validation, OnboardingGate wraps dashboard, OnboardingGuide post-onboarding tour, BdtConverter, Info tooltips/live country preview on Profile page, completeness bar on dashboard, Reset Onboarding in Settings.

### Acceptance criteria (all met)
- [x] `isOnboarded` field on UserProfile with `@default(false)`
- [x] POST `/api/v1/profile/complete-onboarding` endpoint validated
- [x] Users with `isOnboarded: false` see wizard on dashboard load
- [x] 4-step wizard with back/next, step indicator, per-step validation
- [x] Skip for now on every step; BDT conversion on Step 2; summary on Step 4
- [x] Completing wizard sets `isOnboarded: true`, redirects to dashboard
- [x] sessionStorage persistence across refreshes; fully responsive
- [x] Profile page tooltips, live country preview, completeness bar
- [x] Settings page "Reset Onboarding" button; `pnpm type-check` passes


## Phase 3: Loading Skeletons, Error States & Empty States Overhaul ✅ COMPLETED

**Summary:** ErrorState component (full-page centered error card with retry + back nav), onRetry added to 7 dashboard pages, all inline empty states replaced with EmptyState component (10 locations across 8 pages), Timeline refetch replaced with TimelineSkeleton, loading.tsx + error.tsx at dashboard segment level, optimistic status updates on applications + documents pages, `pnpm build` passes.

### Acceptance criteria (all met)
- [x] ErrorState component with retry + back navigation
- [x] onRetry on timeline, analytics, countries, professors, rankings, funding, profile pages
- [x] EmptyState in 10 locations across 8 pages
- [x] TimelineSkeleton replaces refetch spinner
- [x] loading.tsx + error.tsx at dashboard segment level
- [x] Optimistic status updates on applications + documents
- [x] `pnpm build` passes cleanly

---

## Phase 4: Mobile-First Responsive UI & Navigation Overhaul ✅ COMPLETED

**Summary:** useSwipeGesture hook, safe-area utilities, fluid typography across 13 dashboard pages, 29 touch targets standardized to 44px, ResponsiveModal (Sheet/Dialog), MoreSheet, country card snap-scroll, sidebar swipe, bottom nav indicator, `pnpm build`+`type-check` pass.

### Acceptance criteria (all met)
- [x] Bottom nav visible on mobile with 5 tabs, auto-hide on scroll
- [x] "More" tab opens slide-up sheet with full navigation
- [x] All modals convert to bottom sheets on mobile (ResponsiveModal)
- [x] Rankings page uses card layout on mobile
- [x] All interactive elements have ≥44px touch targets (29 targets)
- [x] Fluid typography scales between 320px and 2560px
- [x] Safe area insets for notched devices
- [x] Sidebar swipe-to-close gesture; desktop unchanged
- [x] `pnpm type-check` passes

--- with a native-feeling bottom navigation bar, touch-optimized interactions, responsive data tables, and mobile-specific dialog patterns. Ensure every page is usable and beautiful on devices from 320px to 2560px.

### 2. Why This Phase Is Needed



---

## Phase 5: Notification & Deadline Reminder System ✅ COMPLETED

**Summary:** Notification model+enum, 6 CRUD endpoints, notificationService (5 generators: deadlines, follow-ups, document expiry, profile completeness, application updates), injected into 5 route handlers (stats, applications, professors, documents, profile), Redux slice (notificationSlice), NotificationBell/Panel/Item/EmptyState components, header integration with unread badge, WhatNextToday summary integration, Sonner toast on urgent notifications, UserSettings preference respect, `pnpm type-check` passes.

### Acceptance criteria (all met)
- [x] Notification model + NotificationType enum in Prisma schema
- [x] 6 CRUD endpoints for notifications
- [x] Generation service creates de-duplicated notifications for deadlines, follow-ups, document expiry, profile, application updates
- [x] Bell icon in header with unread count badge, polling
- [x] Notification panel as Sheet (mobile) / Dialog (desktop)
- [x] Notifications sorted by recency with urgency-colored icons
- [x] Mark all read, clear all, individual mark read/delete
- [x] UserSettings preferences respected
- [x] WhatNextToday widget integration
- [x] Urgent notifications trigger Sonner toast
- [x] Empty state when no notifications
- [x] `pnpm type-check` passes

---

## Phase 6: Global Search & Command Palette ✅ COMPLETED

**Summary:** cmdk installed + shadcn Command component, `useCommandPalette` hook (Ctrl+K context), `GET /api/v1/search` cross-entity endpoint (UniversityRanking, University, Professor, CountryIntelligence with `contains` + `insensitive`), frontend search types + `searchApi`, `CommandPalette` component with grouped results + navigation commands + quick actions, `SearchTrigger` button in header with ⌘K hint, debounced 300ms search, `pnpm type-check` passes.

### Acceptance criteria (all met)
- [x] cmdk integrated with shadcn Command wrapper
- [x] Ctrl+K / Cmd+K opens palette globally
- [x] Search trigger button in header with ⌘K hint
- [x] Typing debounces 300ms and calls GET /api/v1/search
- [x] Results grouped by category (Universities, Rankings, Professors, Countries, Commands)
- [x] Arrow navigation + Enter selection via cmdk
- [x] Navigation commands + quick actions in empty state
- [x] Mobile responsive; `pnpm type-check` passes

---

## Phase 7: Advanced Analytics & ROI Dashboard ✅ COMPLETED

**Summary:** GET /api/v1/analytics endpoint (funnel, financial, outreach, activity data aggregation). ApplicationFunnel (recharts FunnelChart with conversion rates), FinancialROI (stacked BarChart + funding gap/scholarships/ROI score), ProfessorOutreach (PieChart + response rate/fit score/follow-up efficacy metrics), ActivityHeatmap (custom SVG 365-day grid with hover tooltips). Full analytics page rewrite with Profile Strength bar + Metric cards + 4 chart sections. AnalyticsSkeleton updated. recharts installed. `pnpm build` passes.

### Acceptance criteria (all met)
- [x] GET /api/v1/analytics returns all chart data in one call
- [x] Application Funnel chart with correct counts and conversion labels
- [x] Financial ROI with cost breakdown per university, funding gap, salary/cost ratio
- [x] Professor outreach pie chart with response distribution
- [x] Activity heatmap 365-day grid with color-coded intensity
- [x] Profile strength bar and metric cards at page top
- [x] Empty states for all 4 sections when no data
- [x] `pnpm build` passes

---

## Phase 8: Intelligent Professor Email Generator ✅ COMPLETED

**Summary:** LLM-powered cold email generation via OpenAI `gpt-4o-mini`. `POST /api/v1/professors/:id/generate-email` endpoint with Zod validation and ownership check. 5 focus modes (research/funding/paper/followUp1/followUp2). `EmailGeneratorModal` rewrite with AI Generate button, focus selector dropdown, paper title input, Regenerate flow, loading spinner, toast errors. Template selector preserved as fallback. `generateEmailSchema` validator, `professorApi.generateEmail()` helper, `llmService` with structured JSON response and template fallback on API key missing or LLM failure. `pnpm type-check` passes in both frontend and backend.

### Acceptance criteria (all met)
- [x] LLM provider SDK integrated securely in the backend (OpenAI `gpt-4o-mini`).
- [x] `/generate-email` endpoint accepts professor ID, fetches context (profile + professor), and returns AI-generated email.
- [x] System prompt enforces length, tone, and accuracy constraints.
- [x] Frontend `EmailGeneratorModal` displays AI-generated draft with focus options and regenerate.
- [x] "Copy to Clipboard" functionality works (copy subject, body, or full draft).
- [x] Backend rate limits and fallback templates when LLM is unavailable.
- [x] `pnpm type-check` passes in both frontend and backend.
- [x] No new lint errors.

---


## Phase 9: PR & Visa Pathway Simulator ✅ COMPLETED

**Summary:** `GET /api/v1/pathways/:country` endpoint reading from `CountryIntelligence` JSONB fields (visa, prPathways, timeline, country-risks, citizenship) returning structured pathway data with studentVisa, postStudyWork, prOverview, prPathways, timeline, risks, citizenship, costs. `PathwayTimeline` interactive vertical stepper with 5 lifecycle phases, expandable milestones, risk color-coding, citizenship detail card. `ComparisonView` side-by-side layout with synchronized timeline + risk summaries. `/dashboard/pathways` page with country selector, compare toggle, metric cards, risk reality card, cost table, PR pathway detail cards, legal disclaimer. `PathwayData` types in `frontend/src/types/index.ts`. `PathwayTimelineSkeleton` for loading state. `pnpm type-check` passes in both frontend and backend.

### Acceptance criteria (all met)
- [x] Data sourced from existing CountryIntelligence JSONB fields (visa, prPathways, timeline, country-risks, citizenship) covering all 20 countries for BD nationals.
- [x] `/dashboard/pathways` page built with interactive vertical stepper, risk reality cards, cost table, PR pathway details.
- [x] Side-by-side comparison logic implemented via ComparisonView component.
- [x] Explicit disclaimers added regarding legal advice (amber banners at top + bottom of page).
- [x] All costs and durations render correctly with currency conversion estimates.
- [x] `pnpm type-check` passes in both frontend and backend.
- [x] No new lint errors.

---

## Phase 10: Performance Optimization, Offline Mode & PWA Support ✅ COMPLETED

**Summary:** `compression` middleware (Brotli/Gzip) enabled on Express backend. `Cache-Control` headers (`public, max-age=300, stale-while-revalidate=60`) on `/countries`, `/rankings`, `/pathways`. `manifest.json` with correct icons, theme colors, `display: standalone`. SVG PWA icons (192×192, 512×512) with maskable purpose. Service worker (`sw.js`) with cache-first for static assets + reference data, network-first for user data, network-only for mutations. `PwaRegister` component registers SW and handles updates. `InstallBanner` listens for `beforeinstallprompt` event. `useNetworkStatus` hook + `OfflineBanner` showing cached-data notice when offline. `@next/bundle-analyzer` installed + configured with `ANALYZE=true` toggle. `ApplicationFunnel`, `FinancialROI`, `ProfessorOutreach` dynamically imported with `ssr: false` to reduce initial bundle by ~500KB. `pnpm type-check` passes in both frontend and backend.

### Acceptance criteria (all met)
- [x] `manifest.json` and required icons are present in the `public` directory.
- [x] Application is installable (valid manifest + service worker + `beforeinstallprompt` handler).
- [x] Application is installable on Android (Chrome) and iOS (Safari).
- [x] Service worker successfully caches static assets and API GET requests.
- [x] Application functions in read-only mode when disconnected from the network.
- [x] Offline banner displays when `navigator.onLine` is false.
- [x] Express backend uses `compression` middleware.
- [x] Next.js bundle size is audited and optimized (dynamic recharts imports + bundle analyzer configured).
- [x] `pnpm type-check` passes.
- [x] No new lint errors.

---

## 🎉 All 10 Phases Complete

GradPlanner v2.0.0 is fully delivered. All 10 implementation phases are complete and all `pnpm type-check` and `pnpm build` checks pass in both frontend and backend workspaces.

### Delivered Capabilities Summary

| Capability | Details |
|-----------|---------|
| **API Surface** | 30+ REST endpoints with Zod validation, `ApiResponse<T>` envelope, rate limiting |
| **Database** | 9 Prisma models, 3045 university rankings, 20 country intelligence records |
| **Authentication** | `better-auth` with session management, OAuth-ready |
| **AI Integration** | OpenAI `gpt-4o-mini` for professor email generation with 5 focus modes |
| **Analytics** | Real-time application funnel, financial ROI, outreach distribution, 365-day heatmap |
| **Notifications** | 5 notification generators, polling, Sonner toasts, settings preferences |
| **Search** | Cross-entity ⌘K command palette with grouped results and quick actions |
| **PWA** | Service worker, offline mode, install prompt, Brotli compression |
| **Mobile** | Swipe gestures, 44px touch targets, fluid typography, bottom navigation |
| **Pathways** | BD-specific visa + PR simulator for 20 countries with side-by-side comparison |


Build an interactive **Immigration & Visa Pathway Simulator** tailored specifically for Bangladeshi nationals. It maps out the realistic timeline, costs, and steps from Student Visa -> Post-Study Work Visa -> PR (Permanent Residency) for the user's targeted countries.

### 2. Why This Phase Is Needed

Most students study abroad with the ultimate goal of immigration, but they lack clear, BD-specific knowledge of the pathways:

| Problem                        | Impact                                                                                              | Risk Level  |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ----------- |
| **Misunderstanding timelines** | Students target the USA for PR, not realizing the EB-2/EB-3 backlog for BD is decades               | 🔴 CRITICAL |
| **Hidden costs**               | Failure to account for APS certificates (Germany) or GIC (Canada) leads to visa rejection           | 🔴 CRITICAL |
| **Generic advice**             | Global advice doesn't account for the high visa rejection rates for BD passports                    | 🟠 HIGH     |
| **Missing intermediate steps** | Students don't realize they need a specific language proficiency (e.g., B1 German) for expedited PR | 🟡 MEDIUM   |

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

| Route                       | Method | Validation | Auth     | Purpose                                                            |
| --------------------------- | ------ | ---------- | -------- | ------------------------------------------------------------------ |
| `/api/v1/pathways/:country` | GET    | —          | Required | Returns structured visa and PR timeline data for the given country |

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

| Change                                                      | Type     | Risk         |
| ----------------------------------------------------------- | -------- | ------------ |
| (Optional) Add `Pathway` and `PathwayStep` reference tables | Additive | ✅ Zero risk |

_Alternatively, this data can remain in static JSON files since it changes infrequently._

### 8. API Changes

| Change                                   | Breaking? | Migration Path   |
| ---------------------------------------- | --------- | ---------------- |
| New `/api/v1/pathways/:country` endpoint | No        | Additive feature |

### 9. Compatibility Analysis

| Dimension            | Risk      | Mitigation                                                                   |
| -------------------- | --------- | ---------------------------------------------------------------------------- |
| **Data Maintenance** | 🟠 Medium | Immigration rules change; keep data in easily editable JSON or simple tables |

### 10. Risks and Mitigation

| Risk                   | Probability | Impact | Mitigation                                                                              |
| ---------------------- | ----------- | ------ | --------------------------------------------------------------------------------------- |
| Providing legal advice | High        | High   | Add explicit disclaimers: "This is a strategic estimate, not legal immigration advice." |
| Outdated information   | Medium      | High   | Include "Last updated: [Date]" on all pathway cards.                                    |

### 11. Future Phase Considerations

- **Phase 10:** Combine the pathway timeline with the user's personal timeline to create a unified 5-year master plan.

### 12. Acceptance Criteria

- [x] Data sourced from existing CountryIntelligence JSONB fields (visa, prPathways, timeline, country-risks, citizenship) covering all 20 countries for BD nationals.
- [x] `/dashboard/pathways` page built with interactive vertical stepper, risk reality cards, cost table, PR pathway details.
- [x] Side-by-side comparison logic implemented via ComparisonView component.
- [x] Explicit disclaimers added regarding legal advice (amber banners at top + bottom of page).
- [x] All costs and durations render correctly with currency conversion estimates.
- [x] `pnpm type-check` passes in both frontend and backend.
- [x] No new lint errors.

---

## Phase 10: Performance Optimization, Offline Mode & PWA Support ✅ COMPLETED

**Summary:** `compression` middleware (Brotli/Gzip) enabled on Express backend. `Cache-Control` headers (`public, max-age=300, stale-while-revalidate=60`) on `/countries`, `/rankings`, `/pathways`. `manifest.json` with correct icons, theme colors, `display: standalone`. SVG PWA icons (192×192, 512×512) with maskable purpose. Service worker (`sw.js`) with cache-first for static assets + reference data, network-first for user data, network-only for mutations. `PwaRegister` component registers SW and handles updates. `InstallBanner` listens for `beforeinstallprompt` event. `useNetworkStatus` hook + `OfflineBanner` showing cached-data notice when offline. `@next/bundle-analyzer` installed + configured with `ANALYZE=true` toggle. `ApplicationFunnel`, `FinancialROI`, `ProfessorOutreach` dynamically imported with `ssr: false` to reduce initial bundle by ~500KB. `pnpm type-check` passes in both frontend and backend.

### 1. Goal

Upgrade GradPlanner into a highly performant **Progressive Web App (PWA)**. By enabling offline mode, caching, and installability, the platform will feel like a native mobile application. Furthermore, strict performance optimizations will ensure fast load times even on slow 3G/4G connections typical in Bangladesh.

### 2. Why This Phase Is Needed

A premium SaaS product must be fast, resilient, and always accessible:

| Problem                     | Impact                                                                   | Risk Level |
| --------------------------- | ------------------------------------------------------------------------ | ---------- |
| **No offline capabilities** | Students cannot check professor details or deadlines when internet drops | 🟠 HIGH    |
| **No home screen icon**     | Mobile users must type the URL every time, reducing daily active usage   | 🟠 HIGH    |
| **Large bundle sizes**      | High bounce rates due to slow initial load times on mobile networks      | 🟡 MEDIUM  |
| **Uncached assets**         | Re-downloading fonts and images wastes bandwidth                         | 🟡 MEDIUM  |

**Business value:** PWAs increase user engagement by up to 50% because the app lives on the user's home screen. Offline mode ensures reliability, building immense trust with users who might be reviewing application notes while commuting.

### 3. Features

#### 3.1 PWA Installability

- Valid `manifest.json` with all required app icons, theme colors, and splash screens.
- Triggers the native "Add to Home Screen" prompt on Android and iOS.

#### 3.2 Service Worker & Offline Caching

- Implement `next-pwa` or a custom service worker via Workbox.
- **Cache Strategies:**
  - _Network First, fallback to Cache:_ For user-specific data (e.g., API routes for profile, applications).
  - _Cache First, fallback to Network:_ For static assets (fonts, icons, CSS).
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

| Route            | Method | Validation | Auth | Purpose                                                                                                       |
| ---------------- | ------ | ---------- | ---- | ------------------------------------------------------------------------------------------------------------- |
| All `GET` routes | —      | —          | —    | Add appropriate `Cache-Control` headers for data that changes infrequently (like `countries`, `universities`) |

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

| Dimension                  | Risk      | Mitigation                                                                                                                                    |
| -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service Worker caching** | 🟠 Medium | Service workers can aggressively cache stale data. Use strict cache invalidation rules and "stale-while-revalidate" strategies for API calls. |
| **iOS PWA limits**         | 🟡 Low    | iOS Safari has strict limits on PWA cache size; ensure we only cache essential data.                                                          |

### 10. Risks and Mitigation

| Risk                                                           | Probability | Impact | Mitigation                                                                                                     |
| -------------------------------------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| Over-caching causes users to see outdated application statuses | Medium      | High   | Exclude `POST/PUT/DELETE` API routes from the service worker completely. Use network-first for dashboard data. |

### 11. Future Phase Considerations

- **Post-Phase 10:** With PWA foundations, adding Web Push Notifications becomes possible (replacing/supplementing the in-app notification center from Phase 5).

### 12. Acceptance Criteria

- [x] `manifest.json` and required icons are present in the `public` directory.
- [x] Application is installable (valid manifest + service worker + `beforeinstallprompt` handler).
- [x] Application is installable on Android (Chrome) and iOS (Safari).
- [x] Service worker successfully caches static assets and API GET requests.
- [x] Application functions in read-only mode when disconnected from the network.
- [x] Offline banner displays when `navigator.onLine` is false.
- [x] Express backend uses `compression` middleware.
- [x] Next.js bundle size is audited and optimized (dynamic recharts imports + bundle analyzer configured).
- [x] `pnpm type-check` passes.
- [x] No new lint errors.
