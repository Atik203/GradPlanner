import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/30 p-4 space-y-3",
        className
      )}
      aria-hidden="true"
    >
      {children ?? (
        <>
          <div className="animate-pulse rounded-md bg-muted/60 h-4 w-3/4" />
          <div className="animate-pulse rounded-md bg-muted/60 h-3 w-full" />
          <div className="animate-pulse rounded-md bg-muted/60 h-3 w-5/6" />
        </>
      )}
    </div>
  );
}
