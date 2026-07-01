import React from "react";
import { SkeletonCard } from "./SkeletonCard";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading analytics">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard className="h-80" />
        <SkeletonCard className="h-80" />
      </div>
      <SkeletonCard className="h-72" />
      <SkeletonCard className="h-52" />
      <SkeletonCard className="h-32" />
      <span className="sr-only">Loading analytics, please wait…</span>
    </div>
  );
}
