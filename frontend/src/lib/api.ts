/**
 * api.ts — Centralized client for all backend API calls.
 *
 * The backend now returns every response wrapped in the `ApiResponse<T>` envelope:
 *   { success: true,  data: T }
 *   { success: false, error, code, fieldErrors? }
 *
 * `fetchApi` transparently unwraps `data` on success and throws a typed `ApiError`
 * on failure — call sites keep the simple `return fetchApi(...)` pattern.
 *
 * Use `apiGet<T>` / `apiPost<T>` / `apiPut<T>` / `apiDelete<T>` for explicit typing,
 * or use the exported `*Api` helper objects (e.g. `settingsApi.get()`) for
 * domain-specific endpoints.
 */

const isServer = typeof window === "undefined";
// NEXT_BACKEND_URL is a private server-only env var (not prefixed NEXT_PUBLIC_) pointing to
// the deployed Express backend. On the client, leave BACKEND_URL empty so fetchApi uses
// relative paths which are proxied by next.config.ts rewrites.
const BACKEND_URL = isServer ? (process.env.NEXT_BACKEND_URL ?? "") : "";

// ─── Error codes (must match backend/src/types/api.ts) ────────────────────────
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Field-level errors keyed by request body field name. Only present on VALIDATION_ERROR. */
export type FieldErrors = Record<string, string[]>;

/**
 * Error thrown by `fetchApi` when the backend returns a non-2xx status.
 * Carries the `code` and (optionally) `fieldErrors` for richer UI handling.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fieldErrors?: FieldErrors;

  constructor(opts: {
    message: string;
    status: number;
    code: ErrorCode;
    fieldErrors?: FieldErrors;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    if (opts.fieldErrors) this.fieldErrors = opts.fieldErrors;
  }

  /** True if the error came from a backend validation failure with field details. */
  isValidation(): boolean {
    return this.code === ERROR_CODES.VALIDATION_ERROR;
  }

  /** Returns the first field error message for a given field, or undefined. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors?.[field]?.[0];
  }
}

/**
 * The shape of every backend response. Exported for type-safety in helpers.
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode; fieldErrors?: FieldErrors };

/**
 * Low-level fetch wrapper used by all helpers.
 * - On 204: returns null
 * - On 2xx with envelope: returns `data` (auto-unwrapped)
 * - On non-2xx: throws an `ApiError` with parsed `code` and `fieldErrors`
 * - On network error: throws a generic `ApiError` with code `INTERNAL_ERROR`
 *
 * Default `<T = any>` preserves backward compatibility with the previous
 * implementation so the 30+ existing call sites continue to compile.
 * New code SHOULD pass an explicit type parameter:
 *   const uni = await fetchApi<University>("/api/v1/universities/123");
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchApi<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (networkError) {
    throw new ApiError({
      message:
        networkError instanceof Error
          ? `Unable to reach the server. Check your connection. (${networkError.message})`
          : "Unable to reach the server. Check your connection.",
      status: 0,
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }

  if (res.status === 204) {
    return null as T;
  }

  // Try to parse the body as JSON. Some endpoints may not return JSON at all.
  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Non-JSON response. Treat as plain text error.
      if (!res.ok) {
        throw new ApiError({
          message: text || `HTTP error! status: ${res.status}`,
          status: res.status,
          code: ERROR_CODES.INTERNAL_ERROR,
        });
      }
      // 2xx non-JSON: return raw text cast to T.
      return text as unknown as T;
    }
  }

  if (!res.ok) {
    // The backend wraps every error in ApiResponse. Try to extract fields.
    const errBody = (body ?? {}) as {
      error?: string;
      code?: ErrorCode;
      fieldErrors?: FieldErrors;
    };
    throw new ApiError({
      message: errBody.error || `HTTP error! status: ${res.status}`,
      status: res.status,
      code: errBody.code || ERROR_CODES.INTERNAL_ERROR,
      fieldErrors: errBody.fieldErrors,
    });
  }

  // Successful response. Unwrap the envelope.
  if (body && typeof body === "object" && "success" in body) {
    const envelope = body as ApiResponse<T>;
    if (envelope.success === true) {
      return envelope.data;
    }
    // Defensive: success===false but res.ok — shouldn't happen, but handle it.
    throw new ApiError({
      message: envelope.error || "Unknown error",
      status: res.status,
      code: envelope.code,
      fieldErrors: envelope.fieldErrors,
    });
  }

  // No envelope (e.g. legacy route or non-wrapped response). Return body as-is.
  return body as T;
}

// ─── Typed convenience helpers ───────────────────────────────────────────────

export const apiGet = <T>(path: string, options?: RequestInit) =>
  fetchApi<T>(path, { ...options, method: "GET" });

export const apiPost = <T>(path: string, body?: unknown, options?: RequestInit) =>
  fetchApi<T>(path, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T>(path: string, body?: unknown, options?: RequestInit) =>
  fetchApi<T>(path, {
    ...options,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T>(path: string, options?: RequestInit) =>
  fetchApi<T>(path, { ...options, method: "DELETE" });

// ─── Domain-specific API helpers ─────────────────────────────────────────────

import type { UserSettings, UserProfile, NotificationItem, SearchResults } from "@/types";

export const settingsApi = {
  get: () => apiGet<UserSettings>("/api/v1/settings"),
  update: (patch: Partial<Pick<UserSettings, "emailDeadlineAlerts" | "timelineNotifications" | "strategyPreference">>) =>
    apiPut<UserSettings>("/api/v1/settings", patch),
};

export const profileApi = {
  get: () => apiGet<UserProfile>("/api/v1/profile"),
  update: (patch: Partial<UserProfile>) =>
    apiPut<UserProfile>("/api/v1/profile", patch),
  completeOnboarding: (data: Record<string, unknown>) =>
    apiPost<UserProfile>("/api/v1/profile/complete-onboarding", data),
};

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
}

export const notificationApi = {
  list: (limit = 20, offset = 0) =>
    apiGet<NotificationListResponse>(`/api/v1/notifications?limit=${limit}&offset=${offset}`),
  unreadCount: () => apiGet<{ count: number }>("/api/v1/notifications/unread-count"),
  markRead: (id: string) => apiPut(`/api/v1/notifications/${id}/read`),
  markAllRead: () => apiPut("/api/v1/notifications/read-all"),
  delete: (id: string) => apiDelete(`/api/v1/notifications/${id}`),
  clearAll: () => apiDelete("/api/v1/notifications/clear-all"),
};

export const searchApi = {
  search: (q: string) => apiGet<SearchResults>(`/api/v1/search?q=${encodeURIComponent(q)}`),
};
