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

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto" role="status" aria-label="Loading profile">
      {/* Header */}
      <div className="space-y-2">
        <Bar width="w-3/4" height="h-7" />
        <Bar width="w-1/2" height="h-3" />
      </div>
      {/* Completeness bar */}
      <div className="rounded-xl border border-border/60 bg-card/30 p-6 space-y-3">
        <Bar width="w-40" height="h-3" />
        <div className="h-2 w-full rounded-full bg-muted/60 animate-pulse" />
      </div>
      {/* Form cards */}
      <SkeletonCard className="h-72" />
      <SkeletonCard className="h-96" />
      {/* Save button */}
      <div className="flex justify-end">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted/60" />
      </div>
      <span className="sr-only">Loading profile, please wait…</span>
    </div>
  );
}
