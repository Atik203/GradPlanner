/**
 * auth-client.ts — better-auth browser/client configuration
 *
 * CRITICAL: Cross-Domain OAuth State Mismatch Fix
 * ─────────────────────────────────────────────────
 * Problem: When the browser makes a cross-origin fetch to the backend to initiate OAuth
 * (signIn.social), the backend sets a state cookie with SameSite=Lax. Modern browsers
 * BLOCK Set-Cookie headers from cross-origin fetch responses (third-party cookie blocking).
 * The state cookie is silently dropped → Google redirects back → backend can't find the
 * state cookie → "state_mismatch" error.
 *
 * Solution: Route ALL browser auth requests through the Next.js /api/* proxy (same-origin).
 * Cookies are then set on the frontend domain and forwarded with every subsequent request
 * (including the Google callback which also goes through the proxy via next.config.ts rewrites).
 *
 * URL Strategy:
 *   Browser  → window.location.origin + /api/v1/auth  (same-origin, Next.js proxies to backend)
 *   Server   → NEXT_BACKEND_URL + /api/v1/auth         (direct to backend — no cookies needed)
 */

import { createAuthClient } from "better-auth/react";

const isServer = typeof window === "undefined";

// Server-side (SSR/RSC): call backend directly — session tokens are passed via headers, no cookies
// Browser (client): use the current origin so requests go through Next.js /api/* rewrites
// This is the ONLY way to avoid cross-origin cookie blocking that causes state_mismatch in OAuth
const BASE_URL = isServer
  ? (process.env.NEXT_BACKEND_URL ?? "http://localhost:5000")
  : window.location.origin;

export const authClient = createAuthClient({
  baseURL: BASE_URL + "/api/v1/auth",
});

// Named re-exports for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
