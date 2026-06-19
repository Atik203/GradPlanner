"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountryFlag } from "@/components/shared/CountryFlag";
import {
  Bot,
  Loader2,
  Globe,
  Building2,
  TrendingUp,
  Clock,
  Zap,
  Briefcase,
  FlameKindling,
  BarChart2,
  Star,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { GenericPageSkeleton } from "@/components/skeletons/GenericPageSkeleton";
import type { JobMarket } from "@/types/countries/job-market";
import type { AiEcosystem } from "@/types/countries/ai-ecosystem";

/* ─────────────────── types ─────────────────── */
interface CountrySummary {
  id: string;
  country: string;
  countryCode: string;
}

/* ─────────────────── helpers ─────────────────── */
function scoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 65) return "#3b82f6"; // blue-500
  if (score >= 50) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Moderate";
  return "Weak";
}

/** 0-indexed heatmap intensity: first skill = hottest */
function heatClass(idx: number, total: number): string {
  const ratio = total <= 1 ? 0 : idx / (total - 1);
  if (ratio < 0.2) return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  if (ratio < 0.4) return "bg-orange-500/15 text-orange-300 border-orange-500/25";
  if (ratio < 0.6) return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  if (ratio < 0.8) return "bg-blue-500/10 text-blue-300 border-blue-500/20";
  return "bg-muted/30 text-muted-foreground border-border/30";
}

/** Circular SVG score ring */
function ScoreRing({
  score,
  size = 64,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-muted/30"
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* center text */}
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="800"
          fill={color}
        >
          {score}
        </text>
      </svg>
      {label && (
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}

/** Skeleton card shown while data loads */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 overflow-hidden animate-pulse">
      <div className="h-[72px] bg-muted/20" />
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/20" />
          ))}
        </div>
        <div className="h-px bg-border/20" />
        <div className="space-y-2">
          <div className="h-3 w-28 bg-muted/30 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-5 w-14 rounded-full bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── main component ─────────────────── */
export default function AIJobMarketPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [marketData, setMarketData] = useState<Record<string, JobMarket>>({});
  const [ecoData, setEcoData] = useState<Record<string, AiEcosystem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = (await fetchApi("/api/v1/countries")) as CountrySummary[];
        setCountries(list || []);

        // Fetch all country details in parallel
        await Promise.all(
          (list || []).map(async (c) => {
            try {
              const data = await fetchApi(`/api/v1/countries/${c.countryCode}`);
              if (data?.jobMarket) {
                setMarketData((prev) => ({
                  ...prev,
                  [c.countryCode]: data.jobMarket,
                }));
              }
              if (data?.aiEcosystem) {
                setEcoData((prev) => ({
                  ...prev,
                  [c.countryCode]: data.aiEcosystem,
                }));
              }
            } catch (err) {
              console.error(`Failed to load details for ${c.countryCode}:`, err);
            }
          })
        );
      } catch (err) {
        setError("Failed to load job market data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── page header ── */}
      <SectionHeader
        icon={Bot}
        title="AI Job Market Intelligence"
        description="Country-by-country AI/ML demand, salary outlook, skills heatmap, and ecosystem analysis for Bangladeshi graduates."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {/* ── error banner ── */}
      {error && (
        <ApiErrorAlert error={error} />
      )}

      {/* ── legend ── */}
      {!loading && countries.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/70 uppercase tracking-wider">
            Skills heat:
          </span>
          {[
            { cls: "bg-rose-500/20 text-rose-300 border-rose-500/30", label: "🔥 Hottest" },
            { cls: "bg-orange-500/15 text-orange-300 border-orange-500/25", label: "High" },
            { cls: "bg-amber-500/10 text-amber-300 border-amber-500/20", label: "Medium" },
            { cls: "bg-blue-500/10 text-blue-300 border-blue-500/20", label: "Low" },
            { cls: "bg-muted/30 text-muted-foreground border-border/30", label: "Entry" },
          ].map(({ cls, label }) => (
            <span
              key={label}
              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${cls}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ── cards grid ── */}
      {loading ? (
        <GenericPageSkeleton />
      ) : countries.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No countries found"
          description="Country data has not been seeded yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {countries.map((c) => {
            const mkt = marketData[c.countryCode];
            const eco = ecoData[c.countryCode];

            return (
              <article
                key={c.countryCode}
                className="group relative flex flex-col rounded-2xl border border-border/40 bg-card/40 shadow-lg hover:shadow-2xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                {/* ─── card gradient header ─── */}
                <div
                  className="relative px-5 pt-5 pb-4 flex items-start justify-between gap-3"
                  style={{
                    background: mkt
                      ? `linear-gradient(135deg, hsl(var(--card)) 0%, ${scoreColor(mkt.overallJobMarketScore)}18 100%)`
                      : undefined,
                  }}
                >
                  {/* country name + code */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag country={c.countryCode} className="h-5 w-8 rounded border border-border/20 shadow-sm shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-foreground leading-tight truncate">
                        {c.country}
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {c.countryCode.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* score ring */}
                  {mkt ? (
                    <ScoreRing score={mkt.overallJobMarketScore} size={58} label={scoreLabel(mkt.overallJobMarketScore)} />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted/20 animate-pulse shrink-0" />
                  )}
                </div>

                {/* ─── card body ─── */}
                {mkt ? (
                  <div className="flex flex-col flex-1 divide-y divide-border/20">
                    {/* section: quick metrics */}
                    <div className="px-5 py-4 grid grid-cols-2 gap-2">
                      {/* demand level */}
                      <div className="flex flex-col gap-1 rounded-xl bg-muted/20 border border-border/30 p-3">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Demand
                        </span>
                        <span className="text-xs font-extrabold text-foreground leading-none">
                          {mkt.demandLevel}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {mkt.demandTrend}
                        </span>
                      </div>

                      {/* AI/ML openings */}
                      <div className="flex flex-col gap-1 rounded-xl bg-muted/20 border border-border/30 p-3">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          AI/ML Jobs
                        </span>
                        <span className="text-xs font-extrabold text-foreground font-mono leading-none">
                          {mkt.aiMlSpecificOpenings?.toLocaleString() ?? "N/A"}
                        </span>
                        <span className="text-[9px] text-muted-foreground">openings/yr</span>
                      </div>

                      {/* time to job */}
                      <div className="flex flex-col gap-1 rounded-xl bg-muted/20 border border-border/30 p-3">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Time to Job
                        </span>
                        <span className="text-xs font-extrabold text-foreground leading-none">
                          {mkt.averageTimeToJob}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          avg. search time
                        </span>
                      </div>

                      {/* saturation */}
                      <div className="flex flex-col gap-1 rounded-xl bg-muted/20 border border-border/30 p-3">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          <BarChart2 className="h-3 w-3" />
                          Saturation
                        </span>
                        <span className="text-xs font-extrabold text-foreground leading-none">
                          {mkt.marketSaturation}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          competition level
                        </span>
                      </div>
                    </div>

                    {/* section: skills demand heatmap — merged inline */}
                    {mkt.skillsInDemand && mkt.skillsInDemand.length > 0 && (
                      <div className="px-5 py-4 space-y-2.5">
                        <div className="flex items-center gap-1.5">
                          <FlameKindling className="h-3.5 w-3.5 text-rose-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                            Skills Demand Heatmap
                          </span>
                          <span className="ml-auto text-[9px] text-muted-foreground">
                            {mkt.skillsInDemand.length} skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {mkt.skillsInDemand.slice(0, 10).map((skill, idx) => (
                            <span
                              key={idx}
                              title={`Rank #${idx + 1} in demand`}
                              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold leading-none cursor-default transition-transform hover:scale-105 ${heatClass(idx, Math.min(mkt.skillsInDemand.length, 10))}`}
                            >
                              {idx === 0 && "🔥 "}
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* section: AI ecosystem */}
                    {eco && eco.aiEcosystemScore !== undefined && (
                      <div className="px-5 py-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                              AI Ecosystem
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                            style={{
                              color: scoreColor(eco.aiEcosystemScore),
                              borderColor: `${scoreColor(eco.aiEcosystemScore)}40`,
                              background: `${scoreColor(eco.aiEcosystemScore)}12`,
                            }}
                          >
                            {eco.aiEcosystemScore}/100
                          </span>
                        </div>
                        {eco.aiCompanies && eco.aiCompanies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {eco.aiCompanies.slice(0, 5).map((ac, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-bold"
                              >
                                {ac.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {eco.keyStrengths && eco.keyStrengths.length > 0 && (
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                            {eco.keyStrengths.slice(0, 2).join(" · ")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* section: top employers */}
                    {mkt.topEmployers && mkt.topEmployers.length > 0 && (
                      <div className="px-5 py-4 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-sky-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                            Top Tech Employers
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {mkt.topEmployers.slice(0, 5).map((emp, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-sky-500/8 text-sky-300 border border-sky-500/20 text-[9px] font-semibold"
                            >
                              {emp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* section: salary snapshot */}
                    {mkt.salaryExpectations && (
                      <div className="px-5 py-4 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                            Salary Snapshot
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <span className="text-muted-foreground">MSc entry</span>
                          <span className="font-bold text-foreground text-right font-mono">
                            {mkt.salaryExpectations.mscEntryLevel}
                          </span>
                          <span className="text-muted-foreground">PhD entry</span>
                          <span className="font-bold text-foreground text-right font-mono">
                            {mkt.salaryExpectations.phdEntryLevel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* loading state for individual card */
                  <div className="flex flex-col flex-1 items-center justify-center py-12 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-[11px] text-muted-foreground">
                      Loading intelligence…
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
