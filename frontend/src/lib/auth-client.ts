/**
 * auth-client.ts — better-auth browser/client configuration
 *
 * Import this in Client Components and Server Actions.
 *
 * IMPORTANT: better-auth's createAuthClient requires an ABSOLUTE URL on both
 * server and client. A relative path like "/api/v1/auth" is not valid.
 *
 * URL strategy:
 *   Server-side (SSR/RSC): NEXT_BACKEND_URL  — private env var, runtime, never sent to browser
 *   Client-side (browser):  NEXT_PUBLIC_API_URL — baked into JS bundle at build time
 *
 * Both must be set to the deployed backend URL in Vercel's env settings.
 */

import { createAuthClient } from "better-auth/react";

const isServer = typeof window === "undefined";

// Server-side: use the private NEXT_BACKEND_URL (runtime, not exposed to browser)
// Client-side: use NEXT_PUBLIC_API_URL (build-time baked, must be the backend URL on Vercel)
const BASE_URL = isServer
  ? (process.env.NEXT_BACKEND_URL ?? "http://localhost:5000")
  : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000");

export const authClient = createAuthClient({
  baseURL: BASE_URL + "/api/v1/auth",
});

// Named re-exports for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

