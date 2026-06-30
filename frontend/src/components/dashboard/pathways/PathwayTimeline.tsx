"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  GraduationCap,
  Briefcase,
  FileCheck,
  Globe,
  Award,
} from "lucide-react";
import type { PathwayPhase, PathwayTimeline as PathwayTimelineType } from "@/types";

interface PathwayTimelineProps {
  timeline: PathwayTimelineType;
  citizenship?: {
    yearsRequired: number;
    difficulty: string;
    dualAllowed: boolean;
    languageRequired: string;
    passportStrength: string;
  } | null;
}

const phaseIcons: Record<string, React.ReactNode> = {
  application: <FileCheck className="h-4 w-4" />,
  study: <GraduationCap className="h-4 w-4" />,
  postStudyWork: <Briefcase className="h-4 w-4" />,
  pr: <Globe className="h-4 w-4" />,
  citizenship: <Award className="h-4 w-4" />,
};

const riskColors: Record<string, { dot: string; badge: string; text: string }> = {
  Low: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", text: "text-emerald-400" },
  Moderate: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", text: "text-amber-400" },
  High: { dot: "bg-red-500", badge: "bg-red-500/10 text-red-400 border-red-500/20", text: "text-red-400" },
};

function getRiskStyle(level: string) {
  return riskColors[level] ?? riskColors.Moderate;
}

export function PathwayTimeline({ timeline, citizenship }: PathwayTimelineProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  if (!timeline || !timeline.phases.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary" />
          Lifecycle Timeline
        </h3>
        <span className="text-[10px] text-muted-foreground">
          Total: <strong className="text-foreground">{timeline.totalJourneyYears}</strong>
        </span>
      </div>

      <div className="relative">
        {timeline.phases.map((phase, idx) => {
          const isLast = idx === timeline.phases.length - 1;
          const isExpanded = expandedPhase === phase.id;
          const risk = getRiskStyle(phase.riskLevel);

          return (
            <div key={phase.id} className="relative flex gap-4 pb-2">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-background ${risk.dot} bg-opacity-20 shrink-0`}>
                  <div className="text-white">
                    {phaseIcons[phase.id] ?? <Info className="h-4 w-4" />}
                  </div>
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 min-h-8 bg-border mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6 min-w-0">
                <button
                  type="button"
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  className="w-full text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-foreground truncate">
                        {phase.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${risk.badge} shrink-0`}>
                        {phase.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-medium">{phase.duration}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                    {phase.milestones.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Milestones</p>
                        <ul className="space-y-1">
                          {phase.milestones.map((m, i) => (
                            <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.id === "citizenship" && citizenship && (
                      <div className="bg-muted/20 rounded-lg p-2.5 space-y-1.5 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Citizenship Details</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Residency Required:</span>
                          <span className="text-foreground font-medium">{citizenship.yearsRequired} years</span>
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="text-foreground font-medium">{citizenship.difficulty}</span>
                          <span className="text-muted-foreground">Dual Citizenship:</span>
                          <span className="text-foreground font-medium">{citizenship.dualAllowed ? "Allowed" : "Not Allowed"}</span>
                          <span className="text-muted-foreground">Language:</span>
                          <span className="text-foreground font-medium">{citizenship.languageRequired}</span>
                        </div>
                        {citizenship.passportStrength && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-border/30 mt-1">
                            <Award className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] text-muted-foreground">{citizenship.passportStrength}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PathwayTimelineSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
