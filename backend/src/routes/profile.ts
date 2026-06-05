import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const router: Router = Router();

// GET /api/v1/profile
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Return default empty profile if none exists
      return res.json({
        userId,
        university: "",
        cgpa: null,
        targetIntake: "",
        graduationDate: "",
        targetDegree: "",
        ieltsScore: null,
        monthlyBudgetUSD: null,
        researchInterests: [],
        prPriority: null,
        familyRelocation: null,
      });
    }

    res.json(profile);
  } catch (error) {
    console.error("GET /profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/v1/profile
router.put("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      university,
      cgpa,
      targetIntake,
      graduationDate,
      targetDegree,
      // ── Match Intelligence fields ─────────────────────────────────────
      ieltsScore,
      monthlyBudgetUSD,
      researchInterests,
      prPriority,
      familyRelocation,
    } = req.body;

    const data = {
      university: university || null,
      cgpa: cgpa !== undefined && cgpa !== null && cgpa !== "" ? parseFloat(cgpa) : null,
      targetIntake: targetIntake || null,
      graduationDate: graduationDate || null,
      targetDegree: targetDegree || null,
      ieltsScore: ieltsScore !== undefined && ieltsScore !== null && ieltsScore !== "" ? parseFloat(ieltsScore) : null,
      monthlyBudgetUSD: monthlyBudgetUSD !== undefined && monthlyBudgetUSD !== null && monthlyBudgetUSD !== "" ? parseInt(monthlyBudgetUSD, 10) : null,
      researchInterests: Array.isArray(researchInterests) ? researchInterests : [],
      prPriority: prPriority !== undefined && prPriority !== null && prPriority !== "" ? parseInt(prPriority, 10) : null,
      familyRelocation: familyRelocation !== undefined && familyRelocation !== null ? Boolean(familyRelocation) : null,
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    res.json(profile);
  } catch (error) {
    console.error("PUT /profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
