import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware/auth.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";
import { globalLimiter, authLimiter, writeLimiter } from "./middleware/rateLimit.js";

import profileRouter from "./routes/profile.js";
import rankingsRouter from "./routes/rankings.js";
import universitiesRouter from "./routes/universities.js";
import professorsRouter from "./routes/professors.js";
import applicationsRouter from "./routes/applications.js";
import documentsRouter from "./routes/documents.js";
import statsRouter from "./routes/stats.js";
import countriesRouter from "./routes/countries.js";
import decisionEngineRouter from "./routes/decisionEngine.js";
import scholarshipsRouter from "./routes/scholarships.js";
import timelineRouter from "./routes/timeline.js";
import settingsRouter from "./routes/settings.js";
import notificationsRouter from "./routes/notifications.js";
import searchRouter from "./routes/search.js";
import { ok, serverError } from "./utils/apiResponse.js";
import { logger } from "./utils/logger.js";

const app: express.Application = express();
const rawFrontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const FRONTEND_URL = rawFrontendUrl.replace(/['"]/g, "");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  FRONTEND_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn("CORS blocked request", { origin });
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body parsers with explicit size limits (prevents memory exhaustion) ─────
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ limit: "256kb", extended: true }));

// ─── HTTP request / response logger ─────────────────────────────────────────
app.use(requestLogger);

// ─── Auth routes: stricter rate limit, bypass global limiter ────────────────
app.all("/api/v1/auth/*splat", authLimiter, toNodeHandler(auth));

// ─── Global rate limit on all other /api/* traffic ──────────────────────────
app.use("/api", globalLimiter);

// ─── Write rate limit on mutating methods (applied per-route via writeLimiter) ─
app.use("/api/v1", writeLimiter);

// ─── Domain routes ──────────────────────────────────────────────────────────
app.use("/api/v1/profile", requireAuth, profileRouter);
app.use("/api/v1/rankings", rankingsRouter);
app.use("/api/v1/countries", countriesRouter);
app.use("/api/v1/universities", requireAuth, universitiesRouter);
app.use("/api/v1/professors", requireAuth, professorsRouter);
app.use("/api/v1/applications", requireAuth, applicationsRouter);
app.use("/api/v1/documents", requireAuth, documentsRouter);
app.use("/api/v1/dashboard/stats", requireAuth, statsRouter);
app.use("/api/v1/decision-engine", requireAuth, decisionEngineRouter);
app.use("/api/v1/scholarships", requireAuth, scholarshipsRouter);
app.use("/api/v1/timeline", requireAuth, timelineRouter);
app.use("/api/v1/settings", requireAuth, settingsRouter);
app.use("/api/v1/notifications", requireAuth, notificationsRouter);
app.use("/api/v1/search", requireAuth, searchRouter);

app.get("/api/v1/health", async (_req: Request, res: Response) => {
  try {
    const rankingCount = await prisma.universityRanking.count();
    return ok(res, {
      status: "OK",
      database: "Connected",
      universityRankings: rankingCount,
    });
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Health check failed");
  }
});

// ─── 404 fallback for unknown /api/* routes ────────────────────────────────
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    code: "NOT_FOUND",
  });
});

// ─── Error logger (must be after all routes) ────────────────────────────────
app.use(errorLogger);

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    error: error instanceof Error ? error : new Error(String(error)),
  });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", {
    error: reason instanceof Error ? reason : new Error(String(reason)),
  });
});

export default app;
