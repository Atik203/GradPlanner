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
- Country cards re-sort by *your personal* match score, not generic score
- "Why this country fits you" explainer panel

**Impact:** High. Transforms GradPlanner from info-browser → decision engine.

---

### 2. Professor Email Generator + Follow-up Tracker
**Answers:** Q3 — Which professors have funding and match my research?

The professor module exists but there's **no email drafting or follow-up intelligence**.

**What to build:**
- Cold email template generator (fills professor name, university, research area, your background)
- Follow-up scheduler with 14-day minimum enforcement (rule from AGENTS.md)
- Email count badge warning at ≥2 follow-ups
- "Best send window" display: Tue–Thu 8:30–9:30 AM professor's local timezone
- Professor funding status: FUNDED / LIKELY / UNLIKELY / UNKNOWN with color badges
- Research fit score (1–10) auto-suggested based on keyword matching with user's interests

**Impact:** Very High. This is the most critical conversion action in a student's application.

---

### 3. Application Decision Engine ("What Next Today")
**Answers:** Q5 — What should I do next, today?

Currently applications are tracked but there's **no intelligent next-action recommendation**.

**What to build:**
- Smart daily task list: "You have 3 professors to follow up with", "Australia RTP deadline in 47 days"
- Application readiness score per university: CGPA ✓ IELTS ✗ SOP ✗ → 33% ready
- Deadline proximity alerts sorted by urgency
- "Apply Now" vs "Prepare More" vs "Too Early" status per program

**Impact:** Very High. This is the "What should I do today?" answer.

---

### 4. Scholarship Eligibility Checker
**Answers:** Q2 — Which universities fit my profile AND budget?

The scholarship data exists in the DB but **no checker against user profile**.

**What to build:**
- Input: user's CGPA, IELTS, work experience, degree level target
- Output: list of scholarships ranked by eligibility match %
- Highlight: which requirements you're missing (e.g. "Need 0.3 more CGPA for RTP")
- Funding gap calculator: "You need AUD 45,000/year. RTP covers 100%. Gap = $0"

**Impact:** High. Every user is scholarship-dependent (AGENTS.md rule).

---

### 5. SOP / Document Readiness Tracker
**Answers:** Q5 — What should I do next, today?

The documents module exists but **has no intelligence — it's just a list**.

**What to build:**
- Per-country document checklist auto-generated (visa + admission docs combined)
- BD-specific timelines: "Police Clearance takes 2–6 weeks → Start by [date]"
- "Start by" date calculator working backwards from application deadline
- Document status: NOT_STARTED / IN_PROGRESS / READY / SUBMITTED
- APS certificate warning for Germany (mandatory, 6–8 week wait)

**Impact:** High. Document delays are the #1 reason Bangladeshi students miss deadlines.

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

### 11. Compare Countries Side-by-Side
**Answers:** Q1 — Which country should I target?

- Select 2–4 countries from a multi-select
- Grid comparison: Funding | Admission | Job Market | PR | Family | Visa | Salary | Cost
- Winner highlighted per row
- "For your profile, Canada wins on PR but Germany wins on cost"

---

### 12. Application Timeline Planner (Gantt-style)
**Answers:** Q5 — What should I do next, today?

- User inputs target intake (Sep 2028 / Jan 2029)
- System generates backwards timeline:
  - "Oct 2027: Submit applications"
  - "Aug 2027: Get Police Clearance"  
  - "Jun 2027: Take IELTS"
  - "Jan 2027: Contact professors"
- Color-coded: DONE / IN PROGRESS / UPCOMING / OVERDUE

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

| Feature | Impact | Effort | Priority |
|---|---|---|---|
| Profile-Based Country Match | 🔴 Critical | Medium | **P0** |
| Professor Email Generator | 🔴 Critical | Medium | **P0** |
| Application "What Next" Engine | 🔴 Critical | High | **P0** |
| Scholarship Eligibility Checker | 🔴 High | Medium | **P1** |
| Document Readiness + Date Calc | 🔴 High | Medium | **P1** |
| Country Side-by-Side Compare | 🟡 High | Medium | **P1** |
| Application Timeline Gantt | 🟡 High | High | **P1** |
| University Full Decision Card | 🟡 Medium | Low | **P2** |
| PR Pathway Visualizer | 🟡 Medium | Medium | **P2** |
| Budget Planner | 🟡 Medium | Low | **P2** |
| Professor Research Fit | 🟡 Medium | Medium | **P2** |
| Salary Savings Calculator | 🟢 Medium | Low | **P3** |
| Research Proposal Assistant | 🟢 Low | High | **P3** |
| PR Probability Calculator | 🟢 Medium | High | **P3** |

---

## 🚫 What NOT to Build
Per AGENTS.md — GradPlanner is NOT:
- A generic university ranking browser → no "Top 100 Universities" page
- A CRUD dashboard → every list must have decision context
- A social network → no comments, feeds, or sharing
- A news aggregator → no general immigration news without BD-specific relevance

---

> **North Star:** A Bangladeshi CS student with CGPA 3.2, IELTS 7.0, and zero savings should open GradPlanner and within 10 minutes know: which 3 countries to target, which 5 professors to email, which 2 scholarships to apply for, and exactly what to do this week.
