import React from "react";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "./SkeletonCard";

function Bar({ className, width = "w-full", height = "h-3" }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", width, height, className)}
      aria-hidden="true"
    />
  );
}

export function ScholarshipSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading scholarships">
      {/* Tab bar */}
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <Bar key={i} width="w-32" height="h-9" />
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-48" />
        ))}
      </div>
      <span className="sr-only">Loading scholarships, please wait…</span>
    </div>
  );
}
