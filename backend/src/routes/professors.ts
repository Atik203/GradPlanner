import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { ProfessorStatus } from "@prisma/client";

const router: Router = Router();

// GET /api/v1/professors
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const professors = await prisma.professor.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        university: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(professors);
  } catch (error) {
    console.error("GET /professors error:", error);
    res.status(500).json({ error: "Failed to fetch professors" });
  }
});

// POST /api/v1/professors
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      universityId,
      name,
      email,
      profileUrl,
      researchInterests,
      emailSentDate,
      emailSubject,
      replyReceived,
      replyDate,
      status,
      fundingStatus,
      researchFitScore,
      lastFollowUp,
      nextFollowUp,
      interviewDate,
      suggestedContact,
      futureFundingNote,
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Professor name is required" });
    }

    const professor = await prisma.professor.create({
      data: {
        userId,
        universityId: universityId || null,
        name,
        email: email || null,
        profileUrl: profileUrl || null,
        researchInterests: researchInterests || null,
        emailSentDate: emailSentDate ? new Date(emailSentDate) : null,
        emailSubject: emailSubject || null,
        replyReceived: replyReceived !== undefined ? !!replyReceived : false,
        replyDate: replyDate ? new Date(replyDate) : null,
        status: (status as ProfessorStatus) || "NOT_CONTACTED",
        fundingStatus: fundingStatus || "UNKNOWN",
        researchFitScore: researchFitScore ? parseInt(researchFitScore, 10) : null,
        lastFollowUp: lastFollowUp ? new Date(lastFollowUp) : null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        suggestedContact: suggestedContact || null,
        futureFundingNote: futureFundingNote || null,
        notes: notes || null,
        customFields: req.body.customFields || {},
      },
      include: {
        university: true,
      },
    });

    res.status(201).json(professor);
  } catch (error) {
    console.error("POST /professors error:", error);
    res.status(500).json({ error: "Failed to add professor" });
  }
});

// PUT /api/v1/professors/:id
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const {
      universityId,
      name,
      email,
      profileUrl,
      researchInterests,
      emailSentDate,
      emailSubject,
      replyReceived,
      replyDate,
      status,
      fundingStatus,
      researchFitScore,
      lastFollowUp,
      nextFollowUp,
      interviewDate,
      suggestedContact,
      futureFundingNote,
      notes,
    } = req.body;

    // Verify ownership
    const existing = await prisma.professor.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "Professor not found" });
    }

    const updated = await prisma.professor.update({
      where: { id },
      data: {
        universityId: universityId !== undefined ? universityId : existing.universityId,
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email : existing.email,
        profileUrl: profileUrl !== undefined ? profileUrl : existing.profileUrl,
        researchInterests: researchInterests !== undefined ? researchInterests : existing.researchInterests,
        emailSentDate: emailSentDate !== undefined ? (emailSentDate ? new Date(emailSentDate) : null) : existing.emailSentDate,
        emailSubject: emailSubject !== undefined ? emailSubject : existing.emailSubject,
        replyReceived: replyReceived !== undefined ? !!replyReceived : existing.replyReceived,
        replyDate: replyDate !== undefined ? (replyDate ? new Date(replyDate) : null) : existing.replyDate,
        status: status !== undefined ? (status as ProfessorStatus) : existing.status,
        fundingStatus: fundingStatus !== undefined ? fundingStatus : existing.fundingStatus,
        researchFitScore: researchFitScore !== undefined ? (researchFitScore ? parseInt(researchFitScore, 10) : null) : existing.researchFitScore,
        lastFollowUp: lastFollowUp !== undefined ? (lastFollowUp ? new Date(lastFollowUp) : null) : existing.lastFollowUp,
        nextFollowUp: nextFollowUp !== undefined ? (nextFollowUp ? new Date(nextFollowUp) : null) : existing.nextFollowUp,
        interviewDate: interviewDate !== undefined ? (interviewDate ? new Date(interviewDate) : null) : existing.interviewDate,
        suggestedContact: suggestedContact !== undefined ? suggestedContact : existing.suggestedContact,
        futureFundingNote: futureFundingNote !== undefined ? futureFundingNote : existing.futureFundingNote,
        notes: notes !== undefined ? notes : existing.notes,
        customFields: req.body.customFields !== undefined ? req.body.customFields : existing.customFields,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("PUT /professors/:id error:", error);
    res.status(500).json({ error: "Failed to update professor" });
  }
});

// POST /api/v1/professors/:id/log-email
router.post("/:id/log-email", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { subject, body } = req.body;

    // Verify ownership
    const existing = await prisma.professor.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "Professor not found" });
    }

    const now = new Date();

    // Check if initial email has been sent
    if (existing.emailSentDate === null) {
      // First email sent
      const nextFollowUp = new Date(now);
      nextFollowUp.setDate(nextFollowUp.getDate() + 14);

      const updated = await prisma.professor.update({
        where: { id },
        data: {
          status: "EMAILED",
          emailSentDate: now,
          emailSubject: subject || "Graduate Research Assistant Opportunities",
          nextFollowUp,
          followUpCount: 0,
        },
        include: {
          university: true,
        },
      });
      return res.json(updated);
    }

    // Logging a follow-up email
    if (existing.followUpCount >= 2) {
      return res.status(400).json({
        error: "Hard limit reached: Maximum of 2 follow-up emails (3 emails total) allowed per professor."
      });
    }

    const lastEmailDate = existing.lastFollowUp || existing.emailSentDate;
    if (lastEmailDate) {
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      if (new Date(lastEmailDate) > fourteenDaysAgo) {
        const diffTime = now.getTime() - new Date(lastEmailDate).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return res.status(400).json({
          error: `Minimum 14 days required between follow-ups. Only ${diffDays} days have passed since your last email.`
        });
      }
    }

    const nextFollowUpCount = existing.followUpCount + 1;
    const nextFollowUp = new Date(now);
    nextFollowUp.setDate(nextFollowUp.getDate() + 14);

    const updated = await prisma.professor.update({
      where: { id },
      data: {
        status: "AWAITING_REPLY",
        lastFollowUp: now,
        emailSubject: subject || existing.emailSubject,
        followUpCount: nextFollowUpCount,
        nextFollowUp: nextFollowUpCount >= 2 ? null : nextFollowUp, // No next follow-up after the second follow-up
      },
      include: {
        university: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("POST /professors/:id/log-email error:", error);
    res.status(500).json({ error: "Failed to log email" });
  }
});

// DELETE /api/v1/professors/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    // Verify ownership
    const existing = await prisma.professor.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "Professor not found" });
    }

    // Soft delete
    await prisma.professor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Professor deleted successfully" });
  } catch (error) {
    console.error("DELETE /professors/:id error:", error);
    res.status(500).json({ error: "Failed to delete professor" });
  }
});

export default router;
