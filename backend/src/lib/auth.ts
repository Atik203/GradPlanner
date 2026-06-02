/**
 * auth.ts — better-auth server configuration
 *
 * Runs inside the Express backend.
 * Mounted via: app.all("/api/auth/*", toNodeHandler(auth))
 *
 * Phase 1: email + password only
 * Phase 2: add Google OAuth (do NOT enable until GOOGLE_CLIENT_ID is configured)
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
  // ── Database ───────────────────────────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Base URL (backend origin, NOT the Next.js frontend) ───────────────────
  baseURL: (process.env.BETTER_AUTH_URL ?? "http://localhost:5000") + "/api/v1/auth",

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
    // Password reset email — configure sendResetPassword when Resend is ready
    // sendResetPassword: async ({ user, url }) => { ... }
  },

  // ── CORS — allow the Next.js frontend ─────────────────────────────────────
  trustedOrigins: [
    (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/['"]/g, ""),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: process.env.GOOGLE_CALLBACK_URL,
    },
  },
});

export type Auth = typeof auth;
