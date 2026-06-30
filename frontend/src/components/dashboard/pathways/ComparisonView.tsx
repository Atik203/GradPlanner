"use client";

import React from "react";
import { ArrowRightLeft, AlertTriangle } from "lucide-react";
import { PathwayTimeline } from "./PathwayTimeline";
import type { PathwayData } from "@/types";

interface ComparisonViewProps {
  countryA: PathwayData;
  countryB: PathwayData;
}

export function ComparisonView({ countryA, countryB }: ComparisonViewProps) {
  const aRisks = countryA.risks;
  const bRisks = countryB.risks;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ArrowRightLeft className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Side-by-Side: {countryA.country} vs {countryB.country}
        </h3>
      </div>

      {/* Risk comparison at top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country A */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/30 p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">{countryA.country}</h4>
            {aRisks && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Risk Level</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    aRisks.riskLevel.includes("HIGH") || aRisks.riskLevel.includes("MODERATE-HIGH")
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : aRisks.riskLevel.includes("MODERATE")
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>{aRisks.riskLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">PR Score</span>
                  <span className="text-xs font-bold text-foreground">{countryA.prOverview?.overallScore ?? "N/A"}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Avg PR Timeline</span>
                  <span className="text-xs font-bold text-foreground">{countryA.prOverview?.averageYears ?? "?"} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Visa Difficulty</span>
                  <span className="text-xs font-bold text-foreground">{countryA.studentVisa?.difficulty ?? "?"}</span>
                </div>
              </div>
            )}
          </div>
          {countryA.timeline && <PathwayTimeline timeline={countryA.timeline} citizenship={countryA.citizenship} />}
        </div>

        {/* Country B */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/30 p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">{countryB.country}</h4>
            {bRisks && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Risk Level</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    bRisks.riskLevel.includes("HIGH") || bRisks.riskLevel.includes("MODERATE-HIGH")
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : bRisks.riskLevel.includes("MODERATE")
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>{bRisks.riskLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">PR Score</span>
                  <span className="text-xs font-bold text-foreground">{countryB.prOverview?.overallScore ?? "N/A"}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Avg PR Timeline</span>
                  <span className="text-xs font-bold text-foreground">{countryB.prOverview?.averageYears ?? "?"} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Visa Difficulty</span>
                  <span className="text-xs font-bold text-foreground">{countryB.studentVisa?.difficulty ?? "?"}</span>
                </div>
              </div>
            )}
          </div>
          {countryB.timeline && <PathwayTimeline timeline={countryB.timeline} citizenship={countryB.citizenship} />}
        </div>
      </div>
    </div>
  );
}
