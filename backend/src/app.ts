import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware/auth.js";

import profileRouter from "./routes/profile.js";
import rankingsRouter from "./routes/rankings.js";
import universitiesRouter from "./routes/universities.js";
import professorsRouter from "./routes/professors.js";
import applicationsRouter from "./routes/applications.js";
import documentsRouter from "./routes/documents.js";
import statsRouter from "./routes/stats.js";
import countriesRouter from "./routes/countries.js";

const app: express.Application = express();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.all("/api/v1/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/profile", requireAuth, profileRouter);
app.use("/api/v1/rankings", rankingsRouter);
app.use("/api/v1/countries", countriesRouter);
app.use("/api/v1/universities", requireAuth, universitiesRouter);
app.use("/api/v1/professors", requireAuth, professorsRouter);
app.use("/api/v1/applications", requireAuth, applicationsRouter);
app.use("/api/v1/documents", requireAuth, documentsRouter);
app.use("/api/v1/dashboard/stats", requireAuth, statsRouter);

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

process.on("uncaughtException", (error) => {
  console.error("Critical: Uncaught Exception detected:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Critical: Unhandled Rejection at Promise:", promise, "reason:", reason);
});

export default app;
