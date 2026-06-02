import React from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function FutureOutlookPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <Link href="/dashboard/countries" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Country Explorer
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Future Outlook</h2>
        <p className="text-muted-foreground text-sm">
          Projected immigration policy shifts, post-study work visa changes, and 5-year economic forecasts for target countries.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-border/60 border-dashed rounded-xl bg-muted/10">
        <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">Coming Soon</span>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          This module will analyze future immigration policy trends, economic outlooks, and job market projections to help you plan long-term.
        </p>
      </div>
    </div>
  );
}
