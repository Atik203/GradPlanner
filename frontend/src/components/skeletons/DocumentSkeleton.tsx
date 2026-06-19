import React from "react";
import { SkeletonCard } from "./SkeletonCard";

export function DocumentSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading documents">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} className="h-32" />
        ))}
      </div>
      <span className="sr-only">Loading documents, please wait…</span>
    </div>
  );
}
