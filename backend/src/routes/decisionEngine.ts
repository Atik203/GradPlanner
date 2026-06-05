import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/v1/decision-engine
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // 1. Fetch User Profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // 2. Fetch Tracked Universities including linked applications and rankings
    const universities = await prisma.university.findMany({
      where: { userId, deletedAt: null },
      include: {
        application: true,
      },
    });

    // 3. Fetch Documents
    const documents = await prisma.document.findMany({
      where: { userId },
    });

    // 4. Fetch Professors Outreach
    const professors = await prisma.professor.findMany({
      where: { userId, deletedAt: null },
    });

    // Helper: check document status
    const obtainedTypes = new Set(
      documents.filter((d) => d.status === "OBTAINED").map((d) => d.type)
    );

    const hasObtainedDoc = (type: string) => obtainedTypes.has(type as any);

    const hasApsObtained = documents.some(
      (d) =>
        d.status === "OBTAINED" &&
        (d.type === "OTHER" || d.type === "DEGREE_CERTIFICATE") &&
        d.name.toLowerCase().includes("aps")
    );

    const hasBankObtained = obtainedTypes.has("BANK_STATEMENT" as any);

    // Initial lists
    const tasks: any[] = [];
    const readiness: any[] = [];

    // ─── A. TASK CHECKS GENERATOR ───────────────────────────────────────────

    // 1. Profile Gap Tasks
    if (!profile) {
      tasks.push({
        id: "profile-missing",
        title: "Create undergraduate profile",
        description: "Your academic profile is empty. Fill in your CGPA, target intake, and IELTS goals to calculate match percentages and university readiness.",
        type: "PROFILE_GAP",
        urgency: "HIGH",
        link: "/dashboard/profile",
      });
    } else {
      if (profile.cgpa === null || profile.cgpa === undefined) {
        tasks.push({
          id: "profile-cgpa",
          title: "Complete Profile: Enter your CGPA",
          description: "Your profile is missing a CGPA. Fill it in to evaluate minimum academic eligibility against university cutoffs.",
          type: "PROFILE_GAP",
          urgency: "MEDIUM",
          link: "/dashboard/profile",
        });
      }
      if (profile.ieltsScore === null || profile.ieltsScore === undefined) {
        tasks.push({
          id: "profile-ielts",
          title: "Complete Profile: Enter IELTS target or actual score",
          description: "Input your target or actual IELTS band score to check if you satisfy language proficiency requirements.",
          type: "PROFILE_GAP",
          urgency: "MEDIUM",
          link: "/dashboard/profile",
        });
      }
      if (!profile.targetIntake) {
        tasks.push({
          id: "profile-intake",
          title: "Complete Profile: Choose your target intake",
          description: "Select your target intake term (e.g. Fall 2028) to activate application deadline schedules and timelines.",
          type: "PROFILE_GAP",
          urgency: "MEDIUM",
          link: "/dashboard/profile",
        });
      }
    }

    // 2. Professor Outreach Follow-up Tasks
    professors.forEach((p) => {
      const isAwaiting = p.status === "EMAILED" || p.status === "AWAITING_REPLY";
      if (isAwaiting && !p.replyReceived && p.nextFollowUp) {
        const followUpDate = new Date(p.nextFollowUp);
        if (followUpDate <= now) {
          tasks.push({
            id: `prof-followup-${p.id}`,
            title: `Professor Follow-up: Prof. ${p.name}`,
            description: `It has been 14+ days since your last email to Prof. ${p.name}. Send a follow-up draft using the outreach advisor.`,
            type: "PROFESSOR_FOLLOWUP",
            urgency: "HIGH",
            link: "/dashboard/professors/reminders",
            meta: {
              profId: p.id,
              profName: p.name,
              lastEmailDate: p.lastFollowUp || p.emailSentDate,
            },
          });
        }
      }
    });

    // 3. Document Timeline & Deadline Warnings (Dhaka delays!)
    const hasActiveGermany = universities.some((u) =>
      u.country.toLowerCase().includes("germany")
    );
    const hasActiveCanada = universities.some((u) =>
      u.country.toLowerCase().includes("canada")
    );

    // Get earliest university deadline
    let earliestDeadline: Date | null = null;
    let daysToEarliestDeadline: number | null = null;

    universities.forEach((u) => {
      if (u.deadline) {
        const dDate = new Date(u.deadline);
        if (dDate > now && (!earliestDeadline || dDate < earliestDeadline)) {
          earliestDeadline = dDate;
        }
      }
    });

    if (earliestDeadline) {
      daysToEarliestDeadline = Math.ceil(
        ((earliestDeadline as Date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // German APS Check
    if (hasActiveGermany && !hasApsObtained) {
      tasks.push({
        id: "doc-aps-germany",
        title: "Apply for Germany APS Certificate",
        description: "German Embassy Baridhara requires an APS certificate for study visas. Wait times for student visa appointments in Dhaka are 2.5+ years; apply for your APS (6-8 weeks) immediately.",
        type: "DOCUMENT_DELAY",
        urgency: "HIGH",
        link: "/dashboard/documents",
      });
    }

    // Police Clearance Check
    if (!hasObtainedDoc("POLICE_CLEARANCE")) {
      const isUrgent = daysToEarliestDeadline !== null && daysToEarliestDeadline <= 90;
      tasks.push({
        id: "doc-pcc-bd",
        title: "Apply for Police Clearance Certificate",
        description: "Obtaining a PCC in Bangladesh (via Ramna HQ) takes 2–6 weeks. " +
          (isUrgent 
            ? `Your earliest application deadline is in ${daysToEarliestDeadline} days. Apply immediately at pcc.police.gov.bd.`
            : "Plan to request yours 2 months before submitting university applications."),
        type: "DOCUMENT_DELAY",
        urgency: isUrgent ? "HIGH" : "LOW",
        link: "/dashboard/documents",
      });
    }

    // IELTS test registration alert
    if (!hasObtainedDoc("IELTS") && !hasObtainedDoc("TOEFL")) {
      const isUrgent = daysToEarliestDeadline !== null && daysToEarliestDeadline <= 120;
      tasks.push({
        id: "doc-ielts-take",
        title: "Schedule and take IELTS/TOEFL exam",
        description: "No language certificate found in your Documents vault. Results take 13 days, and test seats in Dhaka/Chittagong fill up 6–8 weeks in advance.",
        type: "DOCUMENT_DELAY",
        urgency: isUrgent ? "HIGH" : "MEDIUM",
        link: "/dashboard/documents",
      });
    }

    // 4. University Deadline Proximity Alerts
    universities.forEach((u) => {
      if (u.deadline) {
        const dDate = new Date(u.deadline);
        const daysLeft = Math.ceil((dDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0) {
          if (daysLeft <= 30) {
            tasks.push({
              id: `deadline-urgent-${u.id}`,
              title: `Submit application: ${u.name}`,
              description: `Critical: Only ${daysLeft} days remaining before ${u.name} closes applications (${dDate.toLocaleDateString()}).`,
              type: "SCHOLARSHIP_DEADLINE",
              urgency: "HIGH",
              link: "/dashboard/applications",
            });
          } else if (daysLeft <= 90) {
            tasks.push({
              id: `deadline-warning-${u.id}`,
              title: `Finalize documents for ${u.name}`,
              description: `Deadline is in ${daysLeft} days. Check recommendations, secure LORs, and finish your SOP draft.`,
              type: "SCHOLARSHIP_DEADLINE",
              urgency: "MEDIUM",
              link: "/dashboard/applications",
            });
          }
        }
      }
    });

    // Sort tasks by urgency (HIGH first, then MEDIUM, then LOW)
    const URGENCY_WEIGHT = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    tasks.sort((a, b) => URGENCY_WEIGHT[b.urgency as keyof typeof URGENCY_WEIGHT] - URGENCY_WEIGHT[a.urgency as keyof typeof URGENCY_WEIGHT]);

    // ─── B. UNIVERSITY READINESS SCORES ──────────────────────────────────────

    universities.forEach((u) => {
      let cgpaScore = 25;
      let ieltsScore = 25;

      const cgpaCriteria = {
        met: true,
        required: u.minCgpa || null,
        actual: profile?.cgpa || null,
      };

      const ieltsCriteria = {
        met: true,
        required: u.minIelts || null,
        actual: profile?.ieltsScore || null,
      };

      // CGPA check
      if (u.minCgpa !== null && u.minCgpa !== undefined) {
        if (!profile || profile.cgpa === null || profile.cgpa < u.minCgpa) {
          cgpaCriteria.met = false;
          cgpaScore = 0;
        }
      }

      // IELTS check
      if (u.minIelts !== null && u.minIelts !== undefined) {
        if (!profile || profile.ieltsScore === null || profile.ieltsScore < u.minIelts) {
          ieltsCriteria.met = false;
          ieltsScore = 0;
        }
      }

      // Core Documents list based on target country
      const countryLower = u.country.toLowerCase();
      const coreDocsList = ["CV", "SOP", "TRANSCRIPT", "LOR"];
      if (countryLower.includes("germany")) {
        coreDocsList.push("APS");
      }
      if (countryLower.includes("canada") || countryLower.includes("australia")) {
        coreDocsList.push("BANK_STATEMENT");
      }

      const totalDocs = coreDocsList.length;
      let obtainedDocs = 0;
      const missingDocs: string[] = [];

      // CV Check
      if (obtainedTypes.has("CV" as any)) obtainedDocs++;
      else missingDocs.push("CV");

      // SOP Check
      if (obtainedTypes.has("SOP" as any)) obtainedDocs++;
      else missingDocs.push("SOP");

      // TRANSCRIPT Check
      if (obtainedTypes.has("TRANSCRIPT" as any)) obtainedDocs++;
      else missingDocs.push("Academic Transcript");

      // LOR Check
      if (obtainedTypes.has("LOR" as any)) obtainedDocs++;
      else missingDocs.push("Letters of Recommendation (LOR)");

      // Germany APS Check
      if (countryLower.includes("germany")) {
        if (hasApsObtained) obtainedDocs++;
        else missingDocs.push("APS Certificate");
      }

      // Canada / Australia Financial Check
      if (countryLower.includes("canada") || countryLower.includes("australia")) {
        if (hasBankObtained) obtainedDocs++;
        else missingDocs.push("Proof of Funding / Bank Statement");
      }

      const docScore = 50 * (obtainedDocs / totalDocs);
      const totalReadiness = Math.round(cgpaScore + ieltsScore + docScore);

      // Compute status
      let daysLeft: number | null = null;
      if (u.deadline) {
        daysLeft = Math.ceil((new Date(u.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      let decisionStatus: "APPLY_NOW" | "PREPARE_MORE" | "TOO_EARLY" | "IN_PROGRESS" = "IN_PROGRESS";
      
      if (daysLeft !== null && daysLeft > 0) {
        if (daysLeft <= 90) {
          decisionStatus = totalReadiness >= 75 ? "APPLY_NOW" : "PREPARE_MORE";
        } else if (daysLeft > 180) {
          decisionStatus = "TOO_EARLY";
        }
      } else {
        // Fallback status if no deadline is set
        if (!profile?.targetIntake) {
          decisionStatus = "TOO_EARLY";
        }
      }

      readiness.push({
        universityId: u.id,
        universityName: u.name,
        country: u.country,
        program: u.program || "Graduate Program",
        tier: u.tier,
        readinessScore: totalReadiness,
        status: decisionStatus,
        deadline: u.deadline || null,
        daysRemaining: daysLeft,
        criteria: {
          cgpa: cgpaCriteria,
          ielts: ieltsCriteria,
          documents: {
            met: obtainedDocs === totalDocs,
            missing: missingDocs,
            totalCount: totalDocs,
            obtainedCount: obtainedDocs,
          },
        },
      });
    });

    // Calculate generic summaries
    const highUrgencyCount = tasks.filter((t) => t.urgency === "HIGH").length;
    const avgReadiness =
      readiness.length > 0
        ? Math.round(readiness.reduce((sum, r) => sum + r.readinessScore, 0) / readiness.length)
        : 0;

    res.json({
      tasks,
      readiness,
      summary: {
        totalApplicationsTracked: universities.length,
        averageReadiness: avgReadiness,
        highUrgencyTasksCount: highUrgencyCount,
      },
    });
  } catch (error) {
    console.error("GET /decision-engine error:", error);
    res.status(500).json({ error: "Failed to generate decision engine items" });
  }
});

export default router;
