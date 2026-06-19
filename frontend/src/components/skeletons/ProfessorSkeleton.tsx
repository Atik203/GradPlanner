import React from "react";
import { SkeletonCard } from "./SkeletonCard";

export function ProfessorSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading professors">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="animate-pulse rounded-md bg-muted/60 h-5 w-24" />
            {[0, 1].map((j) => (
              <SkeletonCard key={j} className="h-40" />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading professors, please wait…</span>
    </div>
  );
}
