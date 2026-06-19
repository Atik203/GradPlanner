"use client";

/**
 * ApiErrorAlert.tsx — User-friendly error display with optional retry action.
 *
 * Drop-in replacement for the inline `<div>error...</div>` patterns used across
 * dashboard pages. Renders a destructive alert with an icon, a friendly message,
 * and a retry button if `onRetry` is provided.
 *
 * Translates ApiError codes into human-friendly messages so call sites don't
 * need to maintain their own copy.
 */

import React from "react";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, ERROR_CODES, type ErrorCode } from "@/lib/api";

interface ApiErrorAlertProps {
  /** A thrown error (typically caught in a try/catch) OR a plain string. */
  error: unknown;
  /** Optional retry handler. When provided, a "Try Again" button is shown. */
  onRetry?: () => void;
  /** Override the auto-detected title. */
  title?: string;
  /** Compact variant — removes the icon container padding for tight spaces. */
  compact?: boolean;
  className?: string;
}

function describe(error: unknown): { title: string; message: string; isNetwork: boolean } {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        title: "Connection problem",
        message: "Unable to reach the server. Check your internet connection and try again.",
        isNetwork: true,
      };
    }
    if (error.code === (ERROR_CODES.UNAUTHORIZED as ErrorCode)) {
      return {
        title: "Session expired",
        message: "Please sign in again to continue.",
        isNetwork: false,
      };
    }
    if (error.code === (ERROR_CODES.RATE_LIMITED as ErrorCode)) {
      return {
        title: "Too many requests",
        message: error.message || "You've been making requests too quickly. Please wait a moment and try again.",
        isNetwork: false,
      };
    }
    if (error.code === (ERROR_CODES.NOT_FOUND as ErrorCode)) {
      return {
        title: "Not found",
        message: error.message || "The requested resource was not found.",
        isNetwork: false,
      };
    }
    if (error.code === (ERROR_CODES.VALIDATION_ERROR as ErrorCode)) {
      return {
        title: "Please check your input",
        message: error.message || "Some fields are invalid. Review the highlighted fields and try again.",
        isNetwork: false,
      };
    }
    // Fallback for any other ApiError.
    return {
      title: "Something went wrong",
      message: error.message || "An unexpected error occurred. Please try again.",
      isNetwork: false,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      message: error.message || "An unexpected error occurred. Please try again.",
      isNetwork: false,
    };
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return {
      title: "Something went wrong",
      message: error,
      isNetwork: false,
    };
  }

  return {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    isNetwork: false,
  };
}

export function ApiErrorAlert({
  error,
  onRetry,
  title,
  compact = false,
  className = "",
}: ApiErrorAlertProps) {
  const { title: autoTitle, message, isNetwork } = describe(error);
  const Icon = isNetwork ? WifiOff : AlertCircle;
  const finalTitle = title ?? autoTitle;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive ${compact ? "p-3" : "p-4"} ${className}`}
    >
      <Icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={`${compact ? "text-xs" : "text-sm"} font-semibold leading-tight`}>{finalTitle}</p>
        <p className={`${compact ? "text-xs" : "text-sm"} text-destructive/80 mt-0.5`}>{message}</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRetry}
          className="shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Try Again
        </Button>
      )}
    </div>
  );
}
