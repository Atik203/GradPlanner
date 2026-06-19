/**
 * logger.ts — Structured logger for backend routes.
 *
 * Replaces the bare `console.error` calls scattered across route files with a single
 * logger that emits JSON-shaped records (parseable by Vercel Log Drains, Datadog, Sentry)
 * while remaining human-readable in dev.
 *
 * Usage:
 *   import { logger } from "../utils/logger.js";
 *   logger.info("University created", { userId, universityId });
 *   logger.error("Failed to create university", { error, userId });
 *
 * Format (production / structured):
 *   { "ts": "2026-06-19T12:00:00.000Z", "level": "error", "msg": "...", "userId": "...", ... }
 *
 * Format (development / human-readable):
 *   2026-06-19 12:00:00.000Z [ERROR] Failed to create university  userId=user-123
 */

import process from "node:process";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
};

function timestamp(): string {
  return new Date().toISOString();
}

function shouldEmit(level: LogLevel): boolean {
  const min = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");
  return LEVEL_ORDER[level] >= (LEVEL_ORDER[min] ?? 0);
}

function emit(level: LogLevel, msg: string, context?: Record<string, unknown>) {
  if (!shouldEmit(level)) return;
  const ts = timestamp();
  const ctx = context && Object.keys(context).length > 0 ? context : undefined;

  // Production: single-line JSON. Vercel log drain, Datadog, Sentry can parse this.
  if (process.env.NODE_ENV === "production") {
    const record = { ts, level, msg, ...(ctx || {}) };
    const line = JSON.stringify(record);
    if (level === "error" || level === "warn") {
      // eslint-disable-next-line no-console
      console.error(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }
    return;
  }

  // Development: human-readable with colour.
  const levelLabel =
    level === "error" ? `${ANSI.bold}${ANSI.red}ERROR${ANSI.reset}` :
    level === "warn"  ? `${ANSI.bold}${ANSI.yellow}WARN${ANSI.reset}`  :
    level === "info"  ? `${ANSI.bold}${ANSI.cyan}INFO${ANSI.reset}`   :
                        `${ANSI.dim}DEBUG${ANSI.reset}`;

  const ctxStr = ctx
    ? "  " + Object.entries(ctx)
        .map(([k, v]) => {
          if (v instanceof Error) {
            return `${ANSI.dim}${k}=${ANSI.reset}${ANSI.red}${v.message}${ANSI.reset}`;
          }
          return `${ANSI.dim}${k}=${ANSI.reset}${ANSI.green}${JSON.stringify(v)}${ANSI.reset}`;
        })
        .join(" ")
    : "";

  const line = `${ANSI.gray}${ts}${ANSI.reset} ${levelLabel} ${msg}${ctxStr}`;
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (msg: string, context?: Record<string, unknown>) => emit("debug", msg, context),
  info:  (msg: string, context?: Record<string, unknown>) => emit("info",  msg, context),
  warn:  (msg: string, context?: Record<string, unknown>) => emit("warn",  msg, context),
  error: (msg: string, context?: Record<string, unknown>) => emit("error", msg, context),
} as const;
