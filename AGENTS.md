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
State tasks: read frontend/src/store/ structure first
API tasks: read backend/src/routes/ first

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
- Run pnpm type-check after any TypeScript changes
- Keep Redux slices in frontend/src/store/
- Keep all API calls in frontend/src — never inside components directly
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
