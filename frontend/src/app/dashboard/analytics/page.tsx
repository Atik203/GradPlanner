import React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

export default function AnalyticsFitPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Analytics & Fit</h2>
        <p className="text-muted-foreground text-sm">
          Personalized fit score analysis, admission probability estimates, and data-driven university recommendations.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-border/60 border-dashed rounded-xl bg-muted/10">
        <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">Coming Soon</span>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Data-driven analytics that match your profile against admission requirements, showing your fit score and probability for each program.
        </p>
      </div>
    </div>
  );
}
