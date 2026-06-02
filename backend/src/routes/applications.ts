import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { ApplicationStatus } from "@prisma/client";

const router: Router = Router();

// GET /api/v1/applications
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const applications = await prisma.application.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        university: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (error) {
    console.error("GET /applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// POST /api/v1/applications
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      universityId,
      status,
      deadline,
      submittedAt,
      decisionDate,
      offerReceived,
      scholarshipAmt,
      notes,
    } = req.body;

    if (!universityId) {
      return res.status(400).json({ error: "University ID is required" });
    }

    // Verify user owns the university
    const university = await prisma.university.findFirst({
      where: { id: universityId, userId, deletedAt: null },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found or unauthorized" });
    }

    // Check if application already exists for this university
    const existing = await prisma.application.findFirst({
      where: { universityId, userId, deletedAt: null },
    });

    if (existing) {
      return res.status(400).json({ error: "Application already tracked for this university" });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        universityId,
        status: (status as ApplicationStatus) || "PLANNING",
        deadline: deadline ? new Date(deadline) : null,
        submittedAt: submittedAt ? new Date(submittedAt) : null,
        decisionDate: decisionDate ? new Date(decisionDate) : null,
        offerReceived: offerReceived !== undefined ? !!offerReceived : false,
        scholarshipAmt: scholarshipAmt || null,
        notes: notes || null,
      },
      include: {
        university: true,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("POST /applications error:", error);
    res.status(500).json({ error: "Failed to create application" });
  }
});

// PUT /api/v1/applications/:id
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const {
      status,
      deadline,
      submittedAt,
      decisionDate,
      offerReceived,
      scholarshipAmt,
      notes,
    } = req.body;

    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application tracker not found" });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status !== undefined ? (status as ApplicationStatus) : existing.status,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existing.deadline,
        submittedAt: submittedAt !== undefined ? (submittedAt ? new Date(submittedAt) : null) : existing.submittedAt,
        decisionDate: decisionDate !== undefined ? (decisionDate ? new Date(decisionDate) : null) : existing.decisionDate,
        offerReceived: offerReceived !== undefined ? !!offerReceived : existing.offerReceived,
        scholarshipAmt: scholarshipAmt !== undefined ? scholarshipAmt : existing.scholarshipAmt,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        university: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("PUT /applications/:id error:", error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// DELETE /api/v1/applications/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application tracker not found" });
    }

    // Soft delete
    await prisma.application.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE /applications/:id error:", error);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

export default router;
