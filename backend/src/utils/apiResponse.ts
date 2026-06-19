/**
 * apiResponse.ts — Response builders enforcing the ApiResponse<T> contract.
 *
 * Every backend route MUST return responses built via these helpers. This is the single
 * place where the success/error envelope shape is defined, so all routes stay consistent.
 *
 * Example:
 *   res.status(200).json(success(universities));
 *   res.status(404).json(notFound("University not found"));
 *   res.status(422).json(validationError("Invalid body", fieldErrors));
 */

import type { Response } from "express";
import type { ApiResponse, ErrorCode } from "../types/api.js";
import { ERROR_CODES } from "../types/api.js";

/**
 * Build a successful response payload.
 * Use with: res.status(200).json(success(data))
 *           res.status(201).json(success(data, 201))  // for create
 */
export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

/**
 * Build an error response payload.
 * Defaults to INTERNAL_ERROR (500). Use the typed helpers below for clearer code.
 */
export function errorResponse(
  message: string,
  code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
  fieldErrors?: Record<string, string[]>
): ApiResponse<never> {
  const payload: ApiResponse<never> = {
    success: false,
    error: message,
    code,
  };
  if (fieldErrors) {
    payload.fieldErrors = fieldErrors;
  }
  return payload;
}

/**
 * Helper that writes the response and returns the Express Response for chaining.
 * Most routes should prefer the typed helpers below for clarity.
 */
function send<T>(res: Response, status: number, payload: ApiResponse<T>): Response {
  return res.status(status).json(payload);
}

// ─── Typed convenience helpers ────────────────────────────────────────────────

export const ok = <T>(res: Response, data: T) =>
  send(res, 200, success(data));

export const created = <T>(res: Response, data: T) =>
  send(res, 201, success(data));

export const noContent = (res: Response) => res.status(204).end();

export const validationError = (
  res: Response,
  message: string,
  fieldErrors?: Record<string, string[]>
) => send(res, 422, errorResponse(message, ERROR_CODES.VALIDATION_ERROR, fieldErrors));

export const notFound = (res: Response, message = "Resource not found") =>
  send(res, 404, errorResponse(message, ERROR_CODES.NOT_FOUND));

export const unauthorized = (res: Response, message = "Unauthorized") =>
  send(res, 401, errorResponse(message, ERROR_CODES.UNAUTHORIZED));

export const forbidden = (res: Response, message = "Forbidden") =>
  send(res, 403, errorResponse(message, ERROR_CODES.FORBIDDEN));

export const conflict = (res: Response, message: string) =>
  send(res, 409, errorResponse(message, ERROR_CODES.CONFLICT));

export const rateLimited = (res: Response, message = "Too many requests") =>
  send(res, 429, errorResponse(message, ERROR_CODES.RATE_LIMITED));

export const serverError = (res: Response, message = "Internal server error") =>
  send(res, 500, errorResponse(message, ERROR_CODES.INTERNAL_ERROR));

/**
 * Convert a Zod ZodError (or any { fieldErrors: {...} }-shaped error) into the
 * fieldErrors record expected by ApiResponse.
 */
export function zodToFieldErrors(err: unknown): Record<string, string[]> {
  if (!err || typeof err !== "object") return {};
  const e = err as { issues?: Array<{ path: (string | number)[]; message: string }> };
  if (!Array.isArray(e.issues)) return {};

  const out: Record<string, string[]> = {};
  for (const issue of e.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_root";
    if (!out[key]) out[key] = [];
    out[key].push(issue.message);
  }
  return out;
}
