/**
 * auth.ts — better-auth server configuration
 *
 * Runs inside the Express backend.
 * Mounted via: app.all("/api/auth/*", toNodeHandler(auth))
 *
 * Phase 1: email + password only
 * Phase 2: Google OAuth
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

// The backend's own public URL (e.g. https://gradplanner-api.vercel.app in prod, http://localhost:5000 in dev)
const BACKEND_BASE = (process.env.BETTER_AUTH_URL ?? "http://localhost:5000").replace(/['\"]/g, "");
// The frontend's public URL (e.g. https://gradplanner.vercel.app in prod, http://localhost:3000 in dev)
const FRONTEND_BASE = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/['\"]/g, "");

export const auth = betterAuth({
  // ── Database ───────────────────────────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Base URL (backend origin, NOT the Next.js frontend) ───────────────────
  // better-auth uses this to construct callback URLs, so it MUST be the backend URL.
  baseURL: BACKEND_BASE + "/api/v1/auth",

  trustedProxyHeaders: true,

  // ── Secret used to sign session tokens ────────────────────────────────────
  secret: process.env.BETTER_AUTH_SECRET,

  // ── Email & Password (Phase 1) ────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Revoke all other sessions when a password is reset
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
    updateAge: 60 * 60 * 24,            // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                   // cache session in cookie for 5 min
    },
  },

  // ── Google OAuth ─────────────────────────────────────────────────────────
  // The redirectURI MUST point to the BACKEND callback endpoint.
  // Flow: Google → backend /api/v1/auth/callback/google → redirect to frontend /dashboard
  // Never set redirectURI to the frontend URL — better-auth handles the final redirect itself.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${BACKEND_BASE}/api/v1/auth/callback/google`,
    },
  },
});

export type Auth = typeof auth;
