import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// ─── ANSI colour helpers ──────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

function methodColor(method: string): string {
  switch (method) {
    case "GET":    return `${C.bold}${C.green}`;
    case "POST":   return `${C.bold}${C.cyan}`;
    case "PUT":
    case "PATCH":  return `${C.bold}${C.yellow}`;
    case "DELETE": return `${C.bold}${C.red}`;
    default:       return `${C.bold}${C.magenta}`;
  }
}

function statusColor(status: number): string {
  if (status >= 500) return `${C.bold}${C.red}`;
  if (status >= 400) return `${C.bold}${C.yellow}`;
  if (status >= 300) return `${C.bold}${C.cyan}`;
  if (status >= 200) return `${C.bold}${C.green}`;
  return C.white;
}

function durationColor(ms: number): string {
  if (ms > 1000) return C.red;
  if (ms > 300)  return C.yellow;
  return C.green;
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 23);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "-";
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}kB`;
}

// ─── Logger middleware ────────────────────────────────────────────────────────
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startAt = process.hrtime.bigint();
  const ts = timestamp();

  let responseSize = 0;
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body: unknown) => {
    try {
      responseSize = Buffer.byteLength(JSON.stringify(body), "utf8");
    } catch { /* ignore */ }
    return originalJson(body);
  };

  res.send = (body: unknown) => {
    try {
      if (typeof body === "string") responseSize = Buffer.byteLength(body, "utf8");
      else if (Buffer.isBuffer(body)) responseSize = body.length;
    } catch { /* ignore */ }
    return originalSend(body);
  };

  const ip = (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  ).replace("::ffff:", "");

  const mc = methodColor(req.method);
  const bodySize = req.headers["content-length"]
    ? formatBytes(parseInt(req.headers["content-length"], 10))
    : "-";

  // Use console.log here intentionally: this is dev output, not a structured log.
  // The structured logger in utils/logger.ts is for application errors / events.
  // eslint-disable-next-line no-console
  console.log(
    `${C.gray}${ts}${C.reset} ` +
    `${mc}${req.method.padEnd(7)}${C.reset} ` +
    `${C.white}${req.path}${C.reset}` +
    (Object.keys(req.query).length ? `${C.gray}?${new URLSearchParams(req.query as Record<string, string>).toString()}${C.reset}` : "") +
    ` ${C.gray}[in:${bodySize} ip:${ip}]${C.reset}`
  );

  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
    const sanitized = sanitizeBody(req.body);
    // eslint-disable-next-line no-console
    console.log(
      `${C.gray}  └─ body: ${JSON.stringify(sanitized).substring(0, 300)}${
        JSON.stringify(sanitized).length > 300 ? "…" : ""
      }${C.reset}`
    );
  }

  res.on("finish", () => {
    const elapsed = Number(process.hrtime.bigint() - startAt) / 1_000_000;
    const status = res.statusCode;
    const sc = statusColor(status);
    const dc = durationColor(elapsed);

    const line =
      `${C.gray}${timestamp()}${C.reset} ` +
      `${mc}${req.method.padEnd(7)}${C.reset} ` +
      `${C.white}${req.path}${C.reset} ` +
      `${sc}${status}${C.reset} ` +
      `${dc}${elapsed.toFixed(1)}ms${C.reset} ` +
      `${C.gray}out:${formatBytes(responseSize)}${C.reset}`;

    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(line);
    } else if (status >= 400) {
      // eslint-disable-next-line no-console
      console.warn(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }
  });

  next();
}

const SENSITIVE = new Set(["password", "token", "secret", "apiKey", "api_key", "authorization", "cookie"]);

function sanitizeBody(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      SENSITIVE.has(k.toLowerCase()) ? "[REDACTED]" : v,
    ])
  );
}

// ─── Error logger ─────────────────────────────────────────────────────────────
// Usage: app.use(errorLogger) AFTER routes, BEFORE error handlers
// Now delegates to the structured logger in utils/logger.ts for consistent parsing
// by Vercel Log Drains / Datadog / Sentry.
export function errorLogger(
  err: Error,
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  logger.error("Request error", {
    method: req.method,
    path: req.path,
    error: err,
  });
  next(err);
}
