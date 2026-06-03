/**
 * auth-client.ts — better-auth browser/client configuration
 *
 * Import this in Client Components and Server Actions.
 *
 * Usage:
 *   import { authClient } from "@/lib/auth-client";
 *
 *   // Sign up
 *   await authClient.signUp.email({ name, email, password });
 *
 *   // Sign in
 *   await authClient.signIn.email({ email, password });
 *
 *   // Sign out
 *   await authClient.signOut();
 *
 *   // Get current session (reactive in client components)
 *   const { data: session } = authClient.useSession();
 */

import { createAuthClient } from "better-auth/react";

const isServer = typeof window === "undefined";

export const authClient = createAuthClient({
  /**
   * Server-side (SSR/RSC): use NEXT_BACKEND_URL — the private env var that points to the
   * deployed Express backend (e.g. https://gradplanner-api.vercel.app).
   * This is NOT exposed to the browser.
   *
   * Client-side: use a relative path so the browser's request goes through
   * Next.js /api/* rewrites which proxy to the backend. This also ensures
   * session cookies are sent correctly (same-origin).
   */
  baseURL: isServer
    ? (process.env.NEXT_BACKEND_URL ?? "http://127.0.0.1:5000") + "/api/v1/auth"
    : "/api/v1/auth",
});

// Named re-exports for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
