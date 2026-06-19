import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonTable({ rows = 8, cols = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-border/40">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse rounded-md bg-muted/60 h-4",
              i === 0 ? "w-1/4" : "w-1/6"
            )}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={cn(
                "animate-pulse rounded-md bg-muted/60 h-3",
                c === 0 ? "w-1/4" : "w-1/6"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
