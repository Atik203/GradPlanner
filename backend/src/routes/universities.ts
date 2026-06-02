import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { Tier } from "@prisma/client";

const router: Router = Router();

// GET /api/v1/universities
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const universities = await prisma.university.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        application: true,
        ranking: true,
        professors: {
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(universities);
  } catch (error) {
    console.error("GET /universities error:", error);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

// POST /api/v1/universities
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      country,
      tier,
      program,
      tuitionPerYr,
      deadline,
      intake,
      website,
      notes,
    } = req.body;

    if (!name || !country || !tier) {
      return res.status(400).json({ error: "Name, country, and tier are required" });
    }

    const ranking = await prisma.universityRanking.findFirst({
      where: {
        institutionName: { equals: name, mode: "insensitive" },
      },
    });

    const university = await prisma.university.create({
      data: {
        userId,
        name,
        country,
        tier: tier as Tier,
        program: program || null,
        tuitionPerYr: tuitionPerYr || null,
        deadline: deadline || null,
        intake: intake || null,
        website: website || null,
        notes: notes || null,
        rankingId: ranking?.id || null,
      },
      include: {
        ranking: true,
      }
    });

    res.status(201).json(university);
  } catch (error) {
    console.error("POST /universities error:", error);
    res.status(500).json({ error: "Failed to add university" });
  }
});

// PUT /api/v1/universities/:id
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const {
      name,
      country,
      tier,
      program,
      tuitionPerYr,
      deadline,
      intake,
      website,
      notes,
    } = req.body;

    // Verify ownership
    const existing = await prisma.university.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "University not found" });
    }

    const updated = await prisma.university.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        country: country !== undefined ? country : existing.country,
        tier: tier !== undefined ? (tier as Tier) : existing.tier,
        program: program !== undefined ? program : existing.program,
        tuitionPerYr: tuitionPerYr !== undefined ? tuitionPerYr : existing.tuitionPerYr,
        deadline: deadline !== undefined ? deadline : existing.deadline,
        intake: intake !== undefined ? intake : existing.intake,
        website: website !== undefined ? website : existing.website,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("PUT /universities/:id error:", error);
    res.status(500).json({ error: "Failed to update university" });
  }
});

// DELETE /api/v1/universities/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    // Verify ownership
    const existing = await prisma.university.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ error: "University not found" });
    }

    // Soft delete
    await prisma.university.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Also soft-delete associated applications and professors if any
    await prisma.application.updateMany({
      where: { universityId: id, userId },
      data: { deletedAt: new Date() },
    });

    await prisma.professor.updateMany({
      where: { universityId: id, userId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "University deleted successfully" });
  } catch (error) {
    console.error("DELETE /universities/:id error:", error);
    res.status(500).json({ error: "Failed to delete university" });
  }
});

export default router;
