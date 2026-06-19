import React from "react";
import { cn } from "@/lib/utils";

function Bar({ className, width = "w-full", height = "h-3" }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", width, height, className)}
      aria-hidden="true"
    />
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading timeline">
      <Bar width="w-48" height="h-7" />
      <div className="space-y-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted/60" />
              <div className="flex-1 w-0.5 animate-pulse bg-muted/60" />
            </div>
            <div className="flex-1 space-y-2 pb-6">
              <Bar width="w-48" height="h-4" />
              <Bar width="w-64" height="h-3" />
              <Bar width="w-40" height="h-3" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading timeline, please wait…</span>
    </div>
  );
}
