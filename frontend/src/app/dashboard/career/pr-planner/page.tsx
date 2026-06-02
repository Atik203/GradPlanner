import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

export default function PRRoutePlannerPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <Link href="/dashboard/career/job-market" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Career Hub
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">PR Route Planner</h2>
        <p className="text-muted-foreground text-sm">
          Step-by-step permanent residency pathways, points calculators, and timeline estimates for each target country.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-border/60 border-dashed rounded-xl bg-muted/10">
        <MapPin className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">Coming Soon</span>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Interactive PR route planner with points-based calculators, timeline estimates, and document checklists for each immigration pathway.
        </p>
      </div>
    </div>
  );
}
