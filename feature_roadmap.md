# GradPlanner Feature Roadmap

> Every feature must answer one of the 5 core user questions from AGENTS.md

---

## 🎯 Core User Questions (from AGENTS.md)

1. Which **country** should I target?
2. Which **universities** fit my profile AND budget?
3. Which **professors** have funding and match my research?
4. What are my realistic **chances**?
5. What should I do **next, today**?

---

## 🔴 Critical Gaps (Missing Core Features)

### ✅ ~~1. Profile-Based Country Match Score~~ — **DONE**

**Implemented:** Prisma migration · 6-dimension scoring engine (`matchScore.ts`) · `countryMatchSlice` Redux · Profile "Match Intelligence" UI (IELTS, budget, research tags, PR priority, family plans) · `MatchBreakdownPopover` · Countries page sorted by personal match % · Dashboard top-3 by personal score · BD-specific warnings (Germany APS, USA Green Card backlog, UAE no-PR).

Currently countries show static scores. There's no **user profile input** that personalizes the recommendation.

**What to build:**

- Profile wizard: CGPA, IELTS score, research interests, budget, family plans, PR priority
- Dynamic country match % recalculated per profile (stored in Redux, no DB needed)
- Country cards re-sort by _your personal_ match score, not generic score
- "Why this country fits you" explainer panel

**Impact:** High. Transforms GradPlanner from info-browser → decision engine.

---

### ✅ ~~2. Professor Email Generator + Follow-up Tracker~~ — **DONE**

**Implemented:** Cold email templates customized dynamically based on student profile (CGPA, IELTS, research tags, degree level) and professor details · Advisor panel with timezone-aware BDT sending slot recommendations · 14-day minimum interval enforcement and 2 follow-ups max limit validated at the database layer in `/api/v1/professors/:id/log-email` · Grid integrations for inline editing of `fundingStatus` and `researchFitScore` with auto-suggest score generation based on profile keyword matching · Integration with Follow-Up Reminders pages and cards.

---

### ✅ ~~3. Application Decision Engine ("What Next Today")~~ — **DONE**

**Implemented:** Multi-dimension Smart Task Checklist (recommending professor follow-ups, Dhaka PCC wait times, German APS certificate wait times, language exam planning, and application deadlines) · Core university readiness score algorithm (25% CGPA, 25% IELTS, 50% documents) with country-specific adaptations (Germany APS; Canada/Australia financials) · Widget overlay for dashboard overview (`WhatNextToday.tsx`) displaying colored gauges, status indicators, and criteria checks.

---

### ✅ ~~4. Scholarship Eligibility Checker~~ — **DONE**

**Implemented:** Express backend routing `/api/v1/scholarships/checker` · Custom string parsing engine for GPA, IELTS, and work experience criteria · Multi-dimension matching & eligibility scoring (100 pt scale covering degree level, CGPA, IELTS, work experience, publications) · Dynamic out-of-pocket funding gap calculator (combining tuition and shared accommodation living cost minus scholarship tuition + monthly stipend coverage, outputting equivalents in both USD and BDT at BDT 118 rate) · Dual-tab frontend Scholarship Hub (Eligibility Checker vs Browse Database) · Interactive parameters control panel (prefilled with profile defaults) · Missing requirements alert blocks · Strengths checks · Expandable annual cost gap breakdowns.

---

### ✅ ~~5. SOP / Document Readiness Tracker~~ — **DONE**

**Implemented:** Dynamic target application deadline solver (resolving from tracked university deadlines or profile target intake fallback) · UI Date controller to custom override deadlines · Backwards-calculated timelines for key BD processing queues (Police clearance 2–6 wks + buffer = 8 wks; German APS 6–8 wks + buffer = 12 wks; Transcripts 10 wks; IELTS 10 wks; LOR 6 wks; SOP/CV 4 wks) · Dynamic Chronological Timeline grouping documents into urgency slots (Overdue, Urgent, Upcoming, Completed) · Inline status update dropdowns synchronizing updates with the Express database in real-time · German APS attestation and embassy backlog warnings.

---

## 🟡 High-Value Improvements (Existing Features)

### 6. University Page: Full Decision Card

**Current state:** Basic list with name, tier, tuition.

**What to add:**

- All 3 ranks side-by-side: QS | THE | ARWU (show "—" if not ranked — never hide)
- Tuition + estimated living = **Net Annual Cost in BDT**
- Funding available: Yes / No / Unknown
- Acceptance rate for international CS/AI students
- Minimum CGPA / IELTS required
- PR pathway quality rating for that country
- "Your fit" badge based on user profile

---

### 7. Country Intelligence: PR Pathway Visualizer

**Current state:** PR info shown as text in the PR tab.

**What to add:**

- Visual timeline: Study → Work → PR → Citizenship with estimated years
- Side-by-side comparison: "Canada: 3yr PR | Australia: 4yr PR | Germany: 21 months (EU Blue Card)"
- BD passport-specific warnings (e.g. USA Green Card backlog notice)
- Language investment required on the PR path

---

### 8. Visa Process: Step-by-Step BD-Specific Guide

**Current state:** Generic visa steps.

**What to add:**

- Dhaka Embassy appointment wait times (real values from AGENTS.md)
- APS certificate requirement alert for Germany
- Estimated cost breakdown in BDT
- "Start visa process by [date]" reverse calculator
- Common rejection reasons for BD nationals per country

---

### 9. Professor Page: Research Fit Intelligence

**Current state:** Basic list of professors.

**What to add:**

- Research keywords extracted from user profile → match against professor interests
- Publication recency indicator ("Last paper: 2024" vs "Last paper: 2019")
- Lab funding signals: active grants listed, industry partnerships
- "This professor is at capacity" warning based on recent PhD graduations
- Suggested contact timing based on admission cycles

---

### 10. Salary Page: BDT Equivalent + Purchasing Power

**Current state:** Shows salary but limited context.

**What to add:**

- Monthly net income after tax (already partially done)
- **Savings rate calculator**: Net income − living costs = monthly savings
- "Time to save for parents' Hajj / house in Dhaka" fun contextual goal
- Cost of family sponsorship: "Bringing spouse to [country] costs X more/month"
- Salary growth curve: Entry → Mid → Senior with years

---

## 🟢 New Sections to Build

### ✅ ~~11. Compare Countries Side-by-Side~~ — **DONE**

**Implemented:** Multi-select country selector upgraded to support up to 4 countries side-by-side · Tabular matrix grid mapping 8 critical dimensions (Funding, Admission, Job Market, PR, Family, Visa, Salary, Cost) · Row-wise winner calculation engine comparing scores and BDT-equivalent savings · Personalized Match Advisor panel generating tailored study-abroad guidance from Redux user profile settings (budget warnings, Germany zero-tuition advantages, USA Green Card backlog notices, family relocation work rights, and Canada SDS band advice).

---

### ✅ ~~12. Application Timeline Planner (Gantt-style)~~ — **DONE**

**Implemented:** Express API route `/api/v1/timeline/planner` computing chronological milestone dates and status mappings on the server side to comply with Rule 8 rules · Dynamic calculation of 8 key application stages (IELTS prep, professor outreach, document drafting, graduation collection, police clearance, applications, GIC/blocked account setup, and program start) relative to the chosen target intake (Sep 2028 vs Jan 2029) · CSS Grid Gantt chart rendering monthly headers, color-coded task rows (Overdue in red, In Progress in blue, Done in green, Upcoming in gray), and a vertical Today cursor line aligned to the serverTime timestamp · Country timeline overlays mapping Dhaka embassy waiting times (Germany 2.5+ years wait, US 6-12 months wait), Canadian SDS band minimums, and Swedish hard dead-lines.

---

### 13. Budget Planner

**Answers:** Q2 — Which universities fit my profile AND budget?

- Input: available budget (BDT or USD)
- Output: ranked list of programs user can afford (self-funded)
- Show scholarship gap: "With RTP scholarship: $0 needed. Without: $45,000/year"
- Show loan feasibility: "Bangladesh Bank education loan limit: BDT 20 lakh"

---

### 14. Research Proposal Assistant

**Answers:** Q3 — Which professors have funding and match my research?

- User inputs: research area, previous work, professor's recent paper
- System generates: 3–5 research questions aligned with professor's work
- Email template pre-filled with the research alignment angle
- "Your fit score with Prof. X is 8/10 based on keyword overlap"

---

### 15. PR Probability Calculator

**Answers:** Q4 — What are my realistic chances?

- Input: target country, degree level, IELTS score, work experience
- Output: estimated PR timeline and success probability
- BD-specific: flags USA Green Card as "Not viable (70–90yr backlog for BD nationals)"
- Shows points score for Canada CRS, Australia Points Test, Germany Blue Card

---

## 📊 Feature Priority Matrix

| Feature                         | Impact      | Effort | Priority | Status |
| ------------------------------- | ----------- | ------ | -------- | ------ |
| Profile-Based Country Match     | 🔴 Critical | Medium | **P0**   | Done   |
| Professor Email Generator       | 🔴 Critical | Medium | **P0**   | Done   |
| Application "What Next" Engine  | 🔴 Critical | High   | **P0**   | Done   |
| Scholarship Eligibility Checker | 🔴 High     | Medium | **P1**   | Done   |
| Document Readiness + Date Calc  | 🔴 High     | Medium | **P1**   | Done   |
| Country Side-by-Side Compare    | 🟡 High     | Medium | **P1**   | Done   |
| Application Timeline Gantt      | 🟡 High     | High   | **P1**   | Done   |
| University Full Decision Card   | 🟡 Medium   | Low    | **P2**   |
| PR Pathway Visualizer           | 🟡 Medium   | Medium | **P2**   |
| Budget Planner                  | 🟡 Medium   | Low    | **P2**   |
| Professor Research Fit          | 🟡 Medium   | Medium | **P2**   |
| Salary Savings Calculator       | 🟢 Medium   | Low    | **P3**   |
| Research Proposal Assistant     | 🟢 Low      | High   | **P3**   |
| PR Probability Calculator       | 🟢 Medium   | High   | **P3**   |

---

## 🚫 What NOT to Build

Per AGENTS.md — GradPlanner is NOT:

- A generic university ranking browser → no "Top 100 Universities" page
- A CRUD dashboard → every list must have decision context
- A social network → no comments, feeds, or sharing
- A news aggregator → no general immigration news without BD-specific relevance

---

> **North Star:** A Bangladeshi CS student with CGPA 3.2, IELTS 7.0, and zero savings should open GradPlanner and within 10 minutes know: which 3 countries to target, which 5 professors to email, which 2 scholarships to apply for, and exactly what to do this week.
