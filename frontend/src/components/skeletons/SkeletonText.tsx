import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  widths?: string[];
}

export function SkeletonText({ lines = 3, className, widths }: SkeletonTextProps) {
  const defaultWidths = ["w-full", "w-5/6", "w-4/6"];
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-md bg-muted/60 h-3",
            widths?.[i] ?? defaultWidths[i % defaultWidths.length]
          )}
        />
      ))}
    </div>
  );
}
