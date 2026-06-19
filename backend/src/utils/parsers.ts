/**
 * parsers.ts — Shared parsing helpers for query params, form fields, and Prisma inputs.
 *
 * The Prisma schema accepts strict types (Float, Int, Boolean, DateTime), but the
 * incoming request body / query string always arrives as strings, undefined, null,
 * or empty. These helpers centralize the "convert to nullable typed value" logic
 * that was previously duplicated in universities.ts and professors.ts.
 */

/**
 * Convert a value to a float, or null if it's empty / invalid.
 * Accepts: number, numeric string, "", null, undefined.
 */
export function toFloatOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Convert a value to an integer, or null if it's empty / invalid.
 */
export function toIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : null;
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Convert a value to a boolean, or null if it's undefined.
 * Accepts: true, false, "true", "false", "1", "0", 1, 0, "yes", "no".
 * Returns null ONLY when the value is null or undefined.
 */
export function toBoolOrNull(value: unknown): boolean | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(v)) return true;
    if (["false", "0", "no", "n", "off"].includes(v)) return false;
  }
  return null;
}

/**
 * Convert a value to a Date, or null if it's empty / invalid.
 * Accepts: Date, ISO string, numeric timestamp, "", null, undefined.
 */
export function toDateOrNull(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Convert a value to a non-empty string, or null if it's empty / not a string.
 */
export function toStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Coerce a value to a positive integer with a fallback default.
 * Useful for pagination `limit` / `page` query params.
 */
export function toPositiveInt(value: unknown, fallback: number, max?: number): number {
  const n = toIntOrNull(value);
  if (n === null || n < 1) return fallback;
  if (max !== undefined && n > max) return max;
  return n;
}
