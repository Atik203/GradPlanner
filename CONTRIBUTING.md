# Contributing to GradPlanner

First off, thank you for considering contributing to GradPlanner! It's people like you who make this a trusted advisor platform for the Bangladeshi graduate applicant community.

By contributing to this repository, you agree to adhere to our standards and code of conduct.

---

## Code Architecture & Philosophy

GradPlanner operates as a monorepo containing a separate Frontend (Next.js 15 App Router) and Backend (Express.js + Prisma + PostgreSQL). To maintain a production-grade codebase, please adhere to these architectural rules:

1.  **Frontend/Backend Separation:** 
    *   The Frontend is strictly **UI and state management (Redux)**. 
    *   Never import backend packages (e.g. `@prisma/client`, `pg`) or files into the frontend workspace.
    *   Do not perform direct database queries on the client or server components; always query via REST API endpoints or server actions.
2.  **Authentication:**
    *   Authentication is powered exclusively by `better-auth`. Do not write custom OAuth handlers or suggest NextAuth.
3.  **Bangladesh-First Principle:**
    *   Every feature must prioritize funding data, visa waitlists, and document collection timelines tailored specifically to Bangladeshi passport holders.

---

## Local Development Workflow

### 1. Requirements
*   Node.js (v20+ recommended)
*   pnpm (v10+)
*   PostgreSQL database instance

### 2. Setup
Clone the repository and install dependencies from the root:
```bash
pnpm install
```

To copy environment templates:
*   Frontend: Configure `frontend/.env` based on standard client settings.
*   Backend: Configure `backend/.env` with your `DATABASE_URL` and `BETTER_AUTH_SECRET`.

### 3. Database Migration and Seeding
Whenever schema changes occur or reference data is updated:
1. Run migrations:
   ```bash
   cd backend
   pnpm exec prisma migrate dev
   ```
2. Re-seed country and university ranking metadata:
   ```bash
   pnpm exec prisma db seed
   ```

---

## Branching & Commit Guidelines

*   **Branch Naming:**
    *   Feature branches: `feature/your-feature-name`
    *   Bug fixes: `bugfix/issue-description`
    *   Hotfixes: `hotfix/urgent-patch`
*   **Commit Messages:** Follow standard conventional commit formats:
    *   `feat: add new countries dropdown to rankings`
    *   `fix: resolve BDT currency converter precision`
    *   `docs: update readme with seeding guidelines`

---

## Code Quality Standards

*   **TypeScript:** All contributions must be strictly typed. Avoid `any` types; prefer explicit interfaces or type inference.
*   **CSS & Styling:** We use vanilla Tailwind CSS with custom variables mapped in `index.css`. Keep spacing, colors, and layout classes responsive.
*   **Linting:** Run `pnpm run lint` before committing to catch any static analysis errors.
