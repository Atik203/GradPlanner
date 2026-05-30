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

export const authClient = createAuthClient({
  /**
   * The Express backend origin where better-auth is mounted.
   * In production, set NEXT_PUBLIC_API_URL to your deployed backend URL.
   */
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api/v1/auth",
});

// Named re-exports for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
