import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonMetricProps {
  className?: string;
}

export function SkeletonMetric({ className }: SkeletonMetricProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2",
        className
      )}
      aria-hidden="true"
    >
      <div className="animate-pulse rounded-md bg-muted/60 h-8 w-16" />
      <div className="animate-pulse rounded-md bg-muted/60 h-3 w-24" />
      <div className="animate-pulse rounded-md bg-muted/60 h-1 w-full rounded-full mt-3" />
    </div>
  );
}
