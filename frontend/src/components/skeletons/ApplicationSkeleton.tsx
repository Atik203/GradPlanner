import React from "react";
import { SkeletonCard } from "./SkeletonCard";
import { SkeletonMetric } from "./SkeletonMetric";

export function ApplicationSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading applications">
      {/* Pipeline summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-44" />
        ))}
      </div>
      <span className="sr-only">Loading applications, please wait…</span>
    </div>
  );
}
