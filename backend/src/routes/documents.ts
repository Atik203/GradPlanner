import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { DocumentType, DocumentStatus } from "../generated/prisma/enums.js";

const router: Router = Router();

// GET /api/v1/documents
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(documents);
  } catch (error) {
    console.error("GET /documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// POST /api/v1/documents
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, type, country, status, fileUrl, expiresAt, notes } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Document name and type are required" });
    }

    const document = await prisma.document.create({
      data: {
        userId,
        name,
        type: type as DocumentType,
        country: country || null,
        status: (status as DocumentStatus) || "PENDING",
        fileUrl: fileUrl || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes: notes || null,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("POST /documents error:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// PUT /api/v1/documents/:id
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, type, country, status, fileUrl, expiresAt, notes } = req.body;

    // Verify ownership
    const existing = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Document not found" });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? (type as DocumentType) : existing.type,
        country: country !== undefined ? country : existing.country,
        status: status !== undefined ? (status as DocumentStatus) : existing.status,
        fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existing.expiresAt,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("PUT /documents/:id error:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
});

// DELETE /api/v1/documents/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    // Verify ownership
    const existing = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Document not found" });
    }

    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("DELETE /documents/:id error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
