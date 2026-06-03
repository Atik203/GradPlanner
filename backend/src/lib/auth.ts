/**
 * auth.ts — better-auth server configuration
 *
 * Runs inside the Express backend.
 * Mounted via: app.all("/api/v1/auth/*splat", toNodeHandler(auth))
 *
 * ARCHITECTURE — Cross-Domain OAuth (why the proxy pattern matters):
 * ─────────────────────────────────────────────────────────────────
 * Frontend (gradplanner.vercel.app) ←→ Next.js /api/* rewrites ←→ Backend (gradplanner-api.vercel.app)
 *
 * All browser auth requests go through the FRONTEND proxy. This means:
 * 1. State cookies are set on the FRONTEND domain (same-origin, no blocking)
 * 2. Google callback also hits the FRONTEND /api/v1/auth/callback/google
 * 3. Next.js rewrite forwards the request (with Cookie header) to the backend
 * 4. Backend finds the state cookie → validation passes → no state_mismatch
 *
 * If we set redirectURI to the BACKEND domain, browsers block the state cookie
 * (cross-origin Set-Cookie with SameSite=Lax) → state is lost → state_mismatch.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

// The backend's own public URL (e.g. https://gradplanner-api.vercel.app in prod, http://localhost:5000 in dev)
const BACKEND_BASE = (process.env.BETTER_AUTH_URL ?? "http://localhost:5000").replace(/['"]/g, "");
// The frontend's public URL (e.g. https://gradplanner.vercel.app in prod, http://localhost:3000 in dev)
const FRONTEND_BASE = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/['"]/g, "");

export const auth = betterAuth({
  // ── Database ───────────────────────────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Base URL ───────────────────────────────────────────────────────────────
  // This is the backend's own base URL used internally by better-auth.
  // NOTE: OAuth redirects (redirectURI) use the FRONTEND URL so everything
  // flows through the Next.js proxy — see architecture note above.
  baseURL: BACKEND_BASE + "/api/v1/auth",

  trustedProxyHeaders: true,

  // ── Secret used to sign session tokens ────────────────────────────────────
  secret: process.env.BETTER_AUTH_SECRET,

  // ── Email & Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },

  // ── CORS — allow the Next.js frontend ─────────────────────────────────────
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_BASE,
  ].filter((v, i, arr) => arr.indexOf(v) === i), // deduplicate

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,        // 7 days
    updateAge: 60 * 60 * 24,            // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                   // cache session cookie for 5 min
    },
  },

  // ── Google OAuth ──────────────────────────────────────────────────────────
  // IMPORTANT: redirectURI points to FRONTEND (not backend) so the callback
  // goes through the Next.js proxy. This keeps the state cookie on the same
  // domain as where it was created → no state_mismatch.
  //
  // Google Cloud Console → OAuth credentials → Authorized redirect URIs must include:
  //   Production: https://<your-frontend>.vercel.app/api/v1/auth/callback/google
  //   Local dev:  http://localhost:3000/api/v1/auth/callback/google
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${FRONTEND_BASE}/api/v1/auth/callback/google`,
    },
  },
});

export type Auth = typeof auth;
