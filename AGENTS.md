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
- Tailwind
- shadcn/ui

Backend:

- Express.js
- TypeScript
- Prisma
- PostgreSQL
- better-auth

---

## Architecture

Frontend and Backend are separate.

Frontend:

- UI only
- Redux state
- REST API calls

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

/api/v1/auth/\*

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
