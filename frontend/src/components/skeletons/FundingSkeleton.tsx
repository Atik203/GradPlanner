import React from "react";
import { SkeletonCard } from "./SkeletonCard";
import { SkeletonMetric } from "./SkeletonMetric";

export function FundingSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading funding">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-32" />
        ))}
      </div>
      <span className="sr-only">Loading funding overview, please wait…</span>
    </div>
  );
}
