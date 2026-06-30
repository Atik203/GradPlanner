"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      message={error.message || "Something went wrong loading this page."}
      onRetry={reset}
      onBack="/dashboard"
    />
  );
}
