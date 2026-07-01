# GradPlanner

<p align="center">
  <strong>The ultimate decision-support platform built specifically for Bangladeshi students pursuing graduate admissions (MSc/PhD) abroad in CS, AI, ML, and Engineering.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-emerald.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20Express.js-blue.svg" alt="Tech Stack">
  <img src="https://img.shields.io/badge/Edition-Bangladesh-red.svg" alt="Edition">
</p>

---

## 🌟 Why GradPlanner?

Standard study-abroad tools focus on generic dashboards and simple university rankings. But applying for a technical graduate degree under a **Bangladeshi Passport** presents unique realities.

GradPlanner solves the real bottlenecks:

- **Funding > Rankings:** Prioritizes programs with active TA/RA stipends, DAAD, MEXT, and fully funded fellowship packages.
- **Bangladesh-Specific Visa Intelligence:** Tracks German APS bottlenecks (2.5+ years Dhaka waittimes), Canadian SDS requirements, and USA F-1 interview strategies.
- **Outreach Tracker:** Organizes email pipelines to prospective advisors, managing local local times, follow-up timers, and reply status tracking.
- **Document Timelines:** Schedules document gathering (police clearances, transcript requests, GIC bank transfers) matching Dhaka timeline realities.

---

## 🛠️ Technical Stack

GradPlanner is built as a highly performant, decoupled monorepo:

### Frontend

- **Framework:** Next.js 16 (App Router) with TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS & shadcn/ui
- **Client Authentication:** `better-auth` client instance

### Backend

- **Server:** Express.js with TypeScript
- **Database ORM:** Prisma Client
- **Database:** PostgreSQL
- **Authentication:** `better-auth` server handler

---

## 📂 Project Structure

```
├── backend/                  # Express.js REST API server
│   ├── prisma/               # Database schemas and seeding scripts
│   └── src/                  # Controllers, routes, and lib instances
├── frontend/                 # Next.js 15 public & dashboard app
│   ├── public/               # Static country and salary JSON metadata
│   └── src/                  # Page routers, Redux slices, and UI components
├── AGENTS.md                 # Product guidance for AI agents
├── CONTRIBUTING.md           # Contribution workflows & guidelines
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
