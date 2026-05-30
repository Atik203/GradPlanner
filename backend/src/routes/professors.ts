import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { ProfessorStatus } from "../generated/prisma/enums";

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
        lastFollowUp: lastFollowUp ? new Date(lastFollowUp) : null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        suggestedContact: suggestedContact || null,
        futureFundingNote: futureFundingNote || null,
        notes: notes || null,
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
        lastFollowUp: lastFollowUp !== undefined ? (lastFollowUp ? new Date(lastFollowUp) : null) : existing.lastFollowUp,
        nextFollowUp: nextFollowUp !== undefined ? (nextFollowUp ? new Date(nextFollowUp) : null) : existing.nextFollowUp,
        interviewDate: interviewDate !== undefined ? (interviewDate ? new Date(interviewDate) : null) : existing.interviewDate,
        suggestedContact: suggestedContact !== undefined ? suggestedContact : existing.suggestedContact,
        futureFundingNote: futureFundingNote !== undefined ? futureFundingNote : existing.futureFundingNote,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        university: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("PUT /professors/:id error:", error);
    res.status(500).json({ error: "Failed to update professor" });
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
