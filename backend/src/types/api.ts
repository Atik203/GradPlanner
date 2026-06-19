/**
 * api.ts — Shared API contract types
 *
 * Used by BOTH backend (responses) and frontend (consumers via fetchApi).
 * Keep this file dependency-free so it can be safely imported anywhere.
 */

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

/**
 * The single response shape every backend route returns.
 *
 * Successful responses:
 *   { success: true, data: T }
 *
 * Error responses:
 *   { success: false, error: string, code: ErrorCode, fieldErrors?: Record<string, string[]> }
 *
 * `fieldErrors` is only present on VALIDATION_ERROR and is keyed by request body field name.
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code: ErrorCode;
      fieldErrors?: Record<string, string[]>;
    };

/**
 * Type guard helpers for consumers that want to narrow without re-parsing.
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  return response.success === true;
}

export function isApiError<T>(
  response: ApiResponse<T>
): response is {
  success: false;
  error: string;
  code: ErrorCode;
  fieldErrors?: Record<string, string[]>;
} {
  return response.success === false;
}
