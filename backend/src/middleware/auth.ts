import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { unauthorized, serverError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export interface AuthenticatedRequest extends Request {
  user?: typeof auth.$Infer.Session.user;
  session?: typeof auth.$Infer.Session.session;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session) {
      return unauthorized(res, "Authentication required");
    }
    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    logger.error("Auth middleware error", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return serverError(res, "Authentication failed");
  }
}
