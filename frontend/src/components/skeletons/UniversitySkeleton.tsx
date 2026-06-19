import React from "react";
import { SkeletonCard } from "./SkeletonCard";

export function UniversitySkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading universities">
      <div className="animate-pulse rounded-md bg-muted/60 h-10 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-52" />
        ))}
      </div>
      <span className="sr-only">Loading universities, please wait…</span>
    </div>
  );
}
