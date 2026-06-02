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
   * Use absolute URL on the server (for node fetch) and relative URL on the client (for proxy/cookies).
   */
  baseURL: isServer
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000") + "/api/v1/auth"
    : "/api/v1/auth",
});

// Named re-exports for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
