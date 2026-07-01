/**
 * validators/index.ts — Reusable Zod middleware factories.
 *
 * Usage:
 *   import { validateBody, validateQuery, validateParams } from "../validators/index.js";
 *
 *   router.post("/", validateBody(universityCreateSchema), handler);
 *   router.get("/",  validateQuery(scholarshipQuerySchema), handler);
 *   router.put("/:id", validateParams(idParamSchema), validateBody(universityUpdateSchema), handler);
 *
 * On failure, the middleware short-circuits with a 422 + { success: false, error, code, fieldErrors }.
 * On success, it writes the parsed (and possibly transformed) value back to the request:
 *   - validateBody  → req.body
 *   - validateQuery → req.query
 *   - validateParams → req.params
 *
 * The route handler can then read typed data from req.body / req.query / req.params
 * without ever doing its own `parseFloat` / null-coalescing dance.
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { validationError } from "../utils/apiResponse.js";

type Source = "body" | "query" | "params";

/**
 * Core factory. Selects a request slot, runs schema.safeParse, writes result back on success,
 * short-circuits with 422 on failure.
 */
function makeValidator<T>(
  source: Source,
  schema: ZodType<T>,
  errorMessage: string
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.length > 0 ? String(issue.path[0]) : "_root";
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return validationError(res, errorMessage, fieldErrors);
    }
    // Overwrite with the parsed (and possibly transformed / default-filled) value.
    // Express 5 typing is awkward here, but the runtime assignment is safe.
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
}

/** Validate req.body. Use for POST / PUT / PATCH handlers. */
export function validateBody<T>(
  schema: ZodType<T>,
  msg: string = "Invalid request body"
): (req: Request, res: Response, next: NextFunction) => void {
  return makeValidator("body", schema, msg);
}

/** Validate req.query. Use for GET handlers that accept filters / pagination. */
export function validateQuery<T>(
  schema: ZodType<T>,
  msg: string = "Invalid query parameters"
): (req: Request, res: Response, next: NextFunction) => void {
  return makeValidator("query", schema, msg);
}

/** Validate req.params. Use for handlers with `:id` in the route. */
export function validateParams<T>(
  schema: ZodType<T>,
  msg: string = "Invalid path parameters"
): (req: Request, res: Response, next: NextFunction) => void {
  return makeValidator("params", schema, msg);
}

// ─── Re-exports for convenience ──────────────────────────────────────────────
export * from "./common.js";
export * from "./profile.js";
export * from "./university.js";
export * from "./professor.js";
export * from "./application.js";
export * from "./document.js";
export * from "./settings.js";
export * from "./notification.js";
