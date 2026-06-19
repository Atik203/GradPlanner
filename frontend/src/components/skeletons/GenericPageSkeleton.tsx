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

export function GenericPageSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading page">
      <div className="space-y-2">
        <Bar width="w-3/4" height="h-7" />
        <Bar width="w-1/2" height="h-3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} className="h-48" />
        ))}
      </div>
      <span className="sr-only">Loading, please wait…</span>
    </div>
  );
}
