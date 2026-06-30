"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, ERROR_CODES, type ErrorCode } from "@/lib/api";

interface ErrorStateProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
  onBack?: string;
}

function describe(error: unknown): {
  title: string;
  message: string;
  isNetwork: boolean;
} {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        title: "Connection problem",
        message:
          "Unable to reach the server. Check your internet connection and try again.",
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
        message:
          error.message ||
          "You've been making requests too quickly. Please wait a moment and try again.",
        isNetwork: false,
      };
    }
    if (error.code === (ERROR_CODES.NOT_FOUND as ErrorCode)) {
      return {
        title: "Not found",
        message:
          error.message || "The requested resource was not found.",
        isNetwork: false,
      };
    }
    if (error.code === (ERROR_CODES.VALIDATION_ERROR as ErrorCode)) {
      return {
        title: "Please check your input",
        message:
          error.message ||
          "Some fields are invalid. Review the highlighted fields and try again.",
        isNetwork: false,
      };
    }
    return {
      title: "Something went wrong",
      message:
        error.message ||
        "An unexpected error occurred. Please try again.",
      isNetwork: false,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      message:
        error.message ||
        "An unexpected error occurred. Please try again.",
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

export function ErrorState({
  message,
  title,
  onRetry,
  onBack,
}: ErrorStateProps) {
  const info = message
    ? { title: title ?? "Something went wrong", message, isNetwork: false }
    : null;

  const { title: autoTitle, message: autoMessage, isNetwork } =
    info ?? { title: "", message: "", isNetwork: false };
  const Icon = isNetwork ? WifiOff : AlertCircle;
  const displayTitle = title ?? autoTitle;
  const displayMessage = message ?? autoMessage;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-destructive/30">
        <CardContent className="flex flex-col items-center text-center py-12 px-6">
          <div className="rounded-full bg-destructive/10 p-4 mb-5">
            <Icon
              className="h-8 w-8 text-destructive"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {displayTitle}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {displayMessage}
          </p>
          <div className="flex items-center gap-3">
            {onRetry && (
              <Button
                type="button"
                variant="default"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
            )}
            {onBack && (
              <Link href={onBack}>
                <Button type="button" variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  Go Back
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
