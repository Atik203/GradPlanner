/**
 * rateLimit.ts — Pre-configured express-rate-limit instances for the API.
 *
 * Three tiers of protection:
 *   1. globalLimiter      — every /api/* request, generous 100/min per IP
 *   2. authLimiter        — /api/v1/auth/* stricter 10/min to slow credential stuffing
 *   3. writeLimiter       — POST/PUT/PATCH/DELETE 30/min per IP
 *
 * All limits are overridable via environment variables:
 *   RATE_LIMIT_GLOBAL_WINDOW_MS, RATE_LIMIT_GLOBAL_MAX
 *   RATE_LIMIT_AUTH_WINDOW_MS,   RATE_LIMIT_AUTH_MAX
 *   RATE_LIMIT_WRITE_WINDOW_MS,  RATE_LIMIT_WRITE_MAX
 *
 * Memory store is used (default). It's per-process, which is acceptable on Vercel
 * serverless because each function instance is short-lived and the limits reset on
 * cold start. For multi-instance horizontal scaling, swap to a Redis-backed store
 * (e.g. @upstash/ratelimit) in a future phase.
 */

import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { rateLimited } from "../utils/apiResponse.js";

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Normalize an IP address for use as a rate-limit key.
 * v7's default keyGenerator normalizes IPv6-mapped IPv4 addresses (::ffff:1.2.3.4 → 1.2.3.4)
 * and is the recommended approach. We re-implement it here in a tiny shim to keep
 * this file self-contained.
 */
function normalizeIp(ip: string | undefined): string {
  if (!ip) return "unknown";
  return ip.replace(/^::ffff:/, "");
}

/**
 * Build a key generator that prefers req.user.id (when set by requireAuth) and
 * falls back to the client IP. This prevents one user from starving another behind
 * a shared NAT.
 */
function userOrIpKey(req: Request): string {
  const user = (req as Request & { user?: { id?: string } }).user;
  if (user?.id) return `u:${user.id}`;
  return `ip:${normalizeIp(req.ip)}`;
}

function ipOnlyKey(req: Request): string {
  return `ip:${normalizeIp(req.ip)}`;
}

function retryAfterSeconds(windowMs: number): number {
  return Math.ceil(windowMs / 1000);
}

function setRetryAfter(res: Response, windowMs: number): void {
  res.setHeader("Retry-After", retryAfterSeconds(windowMs).toString());
}

// ─── 1. Global limiter (every /api/* except auth) ───────────────────────────
export const globalLimiter = rateLimit({
  windowMs: intFromEnv("RATE_LIMIT_GLOBAL_WINDOW_MS", 60 * 1000),
  max: intFromEnv("RATE_LIMIT_GLOBAL_MAX", 100),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (req, res, _next, options) => {
    setRetryAfter(res, options.windowMs);
    rateLimited(res, `Rate limit exceeded. Try again in ${retryAfterSeconds(options.windowMs)}s.`);
  },
});

// ─── 2. Auth limiter (only /api/v1/auth/*) ──────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: intFromEnv("RATE_LIMIT_AUTH_WINDOW_MS", 60 * 1000),
  max: intFromEnv("RATE_LIMIT_AUTH_MAX", 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: ipOnlyKey,
  handler: (req, res, _next, options) => {
    setRetryAfter(res, options.windowMs);
    rateLimited(res, `Too many auth attempts. Try again in ${retryAfterSeconds(options.windowMs)}s.`);
  },
});

// ─── 3. Write limiter (POST/PUT/PATCH/DELETE) ────────────────────────────────
export const writeLimiter = rateLimit({
  windowMs: intFromEnv("RATE_LIMIT_WRITE_WINDOW_MS", 60 * 1000),
  max: intFromEnv("RATE_LIMIT_WRITE_MAX", 30),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  skip: (req) => req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS",
  handler: (req, res, _next, options) => {
    setRetryAfter(res, options.windowMs);
    rateLimited(res, `Too many write requests. Try again in ${retryAfterSeconds(options.windowMs)}s.`);
  },
});
