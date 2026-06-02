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
    const { university, cgpa, targetIntake, graduationDate, targetDegree } = req.body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        university: university || null,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        targetIntake: targetIntake || null,
        graduationDate: graduationDate || null,
        targetDegree: targetDegree || null,
      },
      create: {
        userId,
        university: university || null,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        targetIntake: targetIntake || null,
        graduationDate: graduationDate || null,
        targetDegree: targetDegree || null,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error("PUT /profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
