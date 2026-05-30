import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { requireAuth } from "./middleware/auth";

// Import routers
import profileRouter from "./routes/profile";
import rankingsRouter from "./routes/rankings";
import universitiesRouter from "./routes/universities";
import professorsRouter from "./routes/professors";
import applicationsRouter from "./routes/applications";
import documentsRouter from "./routes/documents";
import statsRouter from "./routes/stats";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

// ── CORS — must be before any route handlers ──────────────────────────────────
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,               // required for session cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Better-auth handler — MUST come before express.json() ─────────────────────
// better-auth parses its own request body
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

// ── Body parsers (applied after auth routes) ───────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Registered protected routes ────────────────────────────────────────────────
app.use("/api/v1/profile", requireAuth, profileRouter);
app.use("/api/v1/rankings", requireAuth, rankingsRouter);
app.use("/api/v1/universities", requireAuth, universitiesRouter);
app.use("/api/v1/professors", requireAuth, professorsRouter);
app.use("/api/v1/applications", requireAuth, applicationsRouter);
app.use("/api/v1/documents", requireAuth, documentsRouter);
app.use("/api/v1/dashboard/stats", requireAuth, statsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/v1/health", async (_req: Request, res: Response) => {
  try {
    const rankingCount = await prisma.universityRanking.count();
    res.json({
      status: "OK",
      database: "Connected",
      universityRankings: rankingCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error", message: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
});
