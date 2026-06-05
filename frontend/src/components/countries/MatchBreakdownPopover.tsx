"use client";

import React, { useState } from "react";
import { MatchResult, matchScoreColor, matchScoreLabel } from "@/lib/matchScore";
import { AlertTriangle, Info, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface MatchBreakdownPopoverProps {
  result: MatchResult;
  countryName: string;
}

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-foreground w-8 text-right shrink-0">
        {value}/{max}
      </span>
    </div>
  );
}

const DIM_META = [
  { key: "funding",    label: "💰 Funding",    max: 25, color: "bg-emerald-400" },
  { key: "admission",  label: "🎓 Admission",  max: 20, color: "bg-blue-400"   },
  { key: "research",   label: "🔬 Research",   max: 15, color: "bg-purple-400" },
  { key: "prPathway",  label: "🛂 PR Path",    max: 20, color: "bg-amber-400"  },
  { key: "ielts",      label: "📋 IELTS",      max: 10, color: "bg-cyan-400"   },
  { key: "family",     label: "👨‍👩‍👧 Family",   max: 10, color: "bg-pink-400"   },
] as const;

export function MatchBreakdownPopover({ result, countryName }: MatchBreakdownPopoverProps) {
  const [open, setOpen] = useState(false);
  const sc = matchScoreColor(result.score);

  return (
    <div className="relative">
      {/* Trigger badge */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer
          ${result.score >= 75
            ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20"
            : result.score >= 55
            ? "bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400/20"
            : "bg-red-400/10 border-red-400/30 text-red-400 hover:bg-red-400/20"
          }`}
        aria-label={`Match score breakdown for ${countryName}`}
      >
        <span className={sc}>{result.score}%</span>
        <span className="text-muted-foreground">match</span>
        {open ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-8 z-50 w-72 rounded-xl border border-border bg-card shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div>
                <p className="text-xs font-bold text-foreground">{countryName} — Your Match</p>
                <p className="text-[10px] text-muted-foreground">{matchScoreLabel(result.score)}</p>
              </div>
              <span className={`text-2xl font-black ${sc}`}>{result.score}%</span>
            </div>

            {/* Dimension bars */}
            <div className="space-y-2">
              {DIM_META.map(({ key, label, max, color }) => (
                <div key={key} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                  <ScoreBar
                    value={result.breakdown[key]}
                    max={max}
                    color={color}
                  />
                </div>
              ))}
            </div>

            {/* Positive reasons */}
            {result.reasons.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-border/40">
                {result.reasons.map((r, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <Info className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-emerald-400/90 leading-tight">{r}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Cautions */}
            {result.cautions.length > 0 && (
              <div className="space-y-1">
                {result.cautions.map((c, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-400/90 leading-tight">{c}</p>
                  </div>
                ))}
              </div>
            )}

            {/* BD-specific hard warnings */}
            {result.bdWarnings.map((w, i) => (
              <div
                key={i}
                className={`rounded-lg p-2.5 space-y-0.5 ${
                  w.type === "error"
                    ? "bg-red-500/10 border border-red-500/20"
                    : w.type === "warning"
                    ? "bg-amber-400/10 border border-amber-400/20"
                    : "bg-blue-400/10 border border-blue-400/20"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {w.type === "error" ? (
                    <AlertCircle className="h-3 w-3 text-red-400 shrink-0" />
                  ) : w.type === "warning" ? (
                    <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="h-3 w-3 text-blue-400 shrink-0" />
                  )}
                  <p className={`text-[10px] font-bold ${
                    w.type === "error" ? "text-red-400" : w.type === "warning" ? "text-amber-400" : "text-blue-400"
                  }`}>{w.title}</p>
                </div>
                <p className="text-[9px] text-muted-foreground leading-tight pl-4">{w.body}</p>
              </div>
            ))}

            {/* Incomplete profile nudge */}
            {!result.profileComplete && (
              <p className="text-[9px] text-muted-foreground text-center pt-1 border-t border-border/40">
                ℹ️ Complete your profile (IELTS, budget, research interests) for a more accurate score
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
