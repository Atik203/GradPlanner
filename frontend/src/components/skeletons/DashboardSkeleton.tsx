import React from "react";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "./SkeletonCard";
import { SkeletonMetric } from "./SkeletonMetric";

function Bar({ className, width = "w-full", height = "h-3" }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", width, height, className)}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-8 space-y-6">
        <Bar width="w-40" height="h-4" />
        <Bar width="w-60" height="h-7" />
        <Bar width="w-96" height="h-3" />
        <div className="pt-6 border-t border-border/60">
          <Bar width="w-44" height="h-3" />
          <div className="mt-2 h-2 w-full rounded-full bg-muted/60 animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>

      {/* Country recommendations skeleton (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} className="h-64" />
        ))}
      </div>

      {/* Deadlines + PR grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard className="h-48" />
        </div>
        <div className="space-y-8">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
        </div>
      </div>

      <span className="sr-only">Loading dashboard, please wait…</span>
    </div>
  );
}
