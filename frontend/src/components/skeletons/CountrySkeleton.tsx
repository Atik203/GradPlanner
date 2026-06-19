import React from "react";
import { SkeletonCard } from "./SkeletonCard";

export function CountrySkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading country explorer">
      <div className="animate-pulse rounded-md bg-muted/60 h-10 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} className="h-56" />
        ))}
      </div>
      <span className="sr-only">Loading country explorer, please wait…</span>
    </div>
  );
}
