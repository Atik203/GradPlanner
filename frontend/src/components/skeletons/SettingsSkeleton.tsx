"use client";

/**
 * SettingsSkeleton.tsx — Skeleton loader matching the Settings page layout.
 *
 * Phase 1 introduces a single page-specific skeleton. Future phases (Phase 3) will
 * create a full skeleton library; for now this is the only one we need.
 *
 * Shape: Header → 3 cards (Theme, Notifications, Strategy) with skeleton placeholders.
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Bar({
  className = "",
  width = "w-full",
  height = "h-3",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        width,
        height,
        className
      )}
      aria-hidden="true"
    />
  );
}

export function SettingsSkeleton() {
  return (
    <div
      className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500"
      role="status"
      aria-label="Loading settings"
    >
      {/* Header */}
      <div className="space-y-2">
        <Bar width="w-3/4" height="h-7" />
        <Bar width="w-1/2" height="h-3" />
      </div>

      {/* Theme card */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardHeader>
          <Bar width="w-40" height="h-4" />
          <Bar width="w-64" height="h-3" className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-border/60 bg-muted/30"
              >
                <div className="h-full w-full animate-pulse rounded-xl bg-muted/40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications card */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardHeader>
          <Bar width="w-48" height="h-4" />
          <Bar width="w-72" height="h-3" className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3",
                i > 0 && "border-t border-border/40 pt-4"
              )}
            >
              <div className="mt-0.5 h-4 w-4 animate-pulse rounded bg-muted/60" />
              <div className="flex-1 space-y-2">
                <Bar width="w-48" height="h-3" />
                <Bar width="w-72" height="h-2.5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strategy card */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardHeader>
          <Bar width="w-44" height="h-4" />
          <Bar width="w-64" height="h-3" className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Bar width="w-32" height="h-3" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-muted/60" />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-border/60">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted/60" />
      </div>

      <span className="sr-only">Loading settings, please wait…</span>
    </div>
  );
}
