import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck } from "lucide-react";

export default function DecisionTrackerPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <Link href="/dashboard/applications" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to App Pipeline
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Decision Tracker</h2>
        <p className="text-muted-foreground text-sm">
          Track offer letters, rejections, waitlists, and scholarship decisions across all your applications.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-border/60 border-dashed rounded-xl bg-muted/10">
        <CheckCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">Coming Soon</span>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Visualize your admission outcomes, compare offers, and make informed decisions with side-by-side comparisons.
        </p>
      </div>
    </div>
  );
}
