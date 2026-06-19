import React from "react";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "./SkeletonTable";

export function RankingTableSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading rankings">
      <div className="flex gap-4">
        <div className="animate-pulse rounded-md bg-muted/60 h-10 flex-1" />
        <div className="animate-pulse rounded-md bg-muted/60 h-10 w-32" />
      </div>
      <div className="rounded-xl border border-border/60 bg-card/30 p-4">
        <SkeletonTable rows={10} cols={6} />
      </div>
      <span className="sr-only">Loading rankings, please wait…</span>
    </div>
  );
}
