# GradPlanner

<p align="center">
  <strong>The ultimate decision-support platform built specifically for Bangladeshi students pursuing graduate admissions (MSc/PhD) abroad in CS, AI, ML, and Engineering.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/Stack-Next.js%2015%20%7C%20Express.js-blue.svg" alt="Tech Stack">
  <img src="https://img.shields.io/badge/Edition-Bangladesh-red.svg" alt="Edition">
  <img src="https://img.shields.io/badge/version-2.0.0-green.svg" alt="version">
  <img src="https://img.shields.io/badge/PWA-Ready-purple.svg" alt="PWA Ready">
  <img src="https://img.shields.io/badge/Phases-10%2F10%20Complete-brightgreen.svg" alt="Phases Complete">
</p>

---

## 🌟 Why GradPlanner?

Standard study-abroad tools focus on generic dashboards and simple university rankings. But applying for a technical graduate degree under a **Bangladeshi Passport** presents unique realities.

GradPlanner solves the real bottlenecks:

- **Funding > Rankings:** Prioritizes programs with active TA/RA stipends, DAAD, MEXT, and fully funded fellowship packages — not just QS rankings.
- **Bangladesh-Specific Visa Intelligence:** Tracks German APS bottlenecks (2.5+ yr Dhaka wait times), Canadian SDS requirements, and USA F-1 interview strategies with BD-specific rejection rate data.
- **AI-Powered Professor Outreach:** LLM-assisted cold email generator (5 focus modes) drafts tailored outreach to professors in under 2 minutes with tone, funding, and research-fit alignment.
- **PR & Visa Pathway Simulator:** Interactive country-by-country immigration timeline — Student Visa → Post-Study Work → PR → Citizenship — with honest BD-specific risk ratings and hidden costs.
- **Deadline Notification Engine:** Smart deadline reminders for application windows, follow-up timers, document expiry alerts, and urgent Sonner toasts across 5 event types.
- **Command Palette (⌘K):** Instant cross-entity search across universities, professors, countries, and rankings — navigate anywhere without leaving the keyboard.
- **Advanced Analytics & ROI Dashboard:** Application funnel chart, financial ROI breakdown, professor outreach distribution, and 365-day activity heatmap powered by Recharts.
- **Document Timelines:** Schedules document gathering (police clearances, APS certificates, GIC bank transfers) matching real Dhaka-to-embassy timeline realities.
- **PWA & Offline Mode:** Installable as a home-screen app on Android/iOS with service-worker caching, offline banner, and Brotli-compressed API responses.

---

## 🛠️ Technical Stack

GradPlanner is built as a highly performant, decoupled monorepo:

### Frontend

- **Framework:** Next.js 15 (App Router) with TypeScript Strict
- **State Management:** Redux Toolkit + Redux Persist
- **Styling:** Tailwind CSS v4 & shadcn/ui component library
- **Charts & Visuals:** Recharts (funnel, bar, pie) + custom SVG heatmap
- **Command Palette:** `cmdk` + shadcn Command component
- **Notifications:** Sonner toast + in-app notification panel
- **PWA:** Custom Service Worker + Web App Manifest + `InstallBanner`
- **Client Authentication:** `better-auth` client instance

### Backend

- **Server:** Express.js with TypeScript
- **Database ORM:** Prisma 7 (PostgreSQL)
- **Database:** PostgreSQL with JSONB country intelligence fields
- **Authentication:** `better-auth` server handler
- **AI Integration:** OpenAI `gpt-4o-mini` via `llmService` (professor email generation)
- **Performance:** `compression` middleware (Brotli/Gzip) + `Cache-Control` headers

---

## 📂 Project Structure

```
├── backend/                  # Express.js REST API server
│   ├── prisma/               # Schema, migrations, and seed scripts (3045 rankings + 20 countries)
│   └── src/
│       ├── routes/           # All REST endpoints (auth, profile, countries, professors, ai, analytics…)
│       ├── services/         # Business logic: notificationService, llmService
│       ├── validators/       # Zod schemas for every route
│       └── lib/              # Auth handler, logger, Prisma client
├── frontend/                 # Next.js 15 (App Router) with shadcn/ui dashboard
│   ├── public/
│   │   ├── countries/        # 21 country intelligence JSON files (visa, PR, costs, risks)
│   │   ├── manifest.json     # PWA Web App Manifest
│   │   └── sw.js             # Custom Service Worker (cache-first / network-first strategies)
│   └── src/
│       ├── app/dashboard/    # Dashboard pages (pathways, analytics, professors, rankings…)
│       ├── components/       # Shared UI: notifications, onboarding, skeletons, analytics charts
│       ├── lib/
│       │   ├── api.ts        # Centralized API client (all fetch calls)
│       │   └── store/slices/ # Redux Toolkit slices (profile, countries, professors, notifications…)
│       └── hooks/            # useDebounce, useSwipeGesture, useNetworkStatus, useCommandPalette
├── notebook/                 # Data preprocessing scripts + universities.csv (3045 rows)
├── AGENTS.md                 # Product guidance for AI agents
├── CONTRIBUTING.md           # Contribution workflows & guidelines
├── implementation.md         # Phase-by-phase implementation plan & acceptance criteria
├── LICENSE                   # MIT License
└── README.md                 # Main workspace documentation
```

---

## 🚀 Getting Started

### 1. Installation

Install dependencies for both frontend and backend using `pnpm` from the root directory:

```bash
pnpm install
```

### 2. Database Setup & Seeding

Ensure you have a PostgreSQL database running. Create a `.env` file in the `backend/` folder and supply the credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gradplanner?schema=public"
BETTER_AUTH_SECRET="your-super-secret-auth-key"
```

Apply database migrations:

```bash
cd backend
pnpm exec prisma migrate dev
```

Seed the reference country intelligence and university ranking datasets:

```bash
pnpm exec prisma db seed
```

### 3. Running Locally

Start both services in development mode:

- **Backend Server:**

  ```bash
  cd backend
  pnpm dev
  ```

  _(Starts API on `http://localhost:5000`)_

- **Frontend Client:**
  ```bash
  cd frontend
  pnpm dev
  ```
  _(Starts Next.js on `http://localhost:3000`)_

---

## 🤝 Contributing

Contributions to GradPlanner are highly welcome! Please read our [CONTRIBUTING.md](file:///e:/PROJECT/GradPlanner/CONTRIBUTING.md) to understand branch conventions, coding guidelines, and PR procedures.

---

## ⚖️ License

Distributed under the MIT License. See [LICENSE](file:///e:/PROJECT/GradPlanner/LICENSE) for more details. Copyright (c) 2026 Atik203.
