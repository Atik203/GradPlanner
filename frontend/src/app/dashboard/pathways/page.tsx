"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Route,
  AlertTriangle,
  ShieldAlert,
  Info,
  ExternalLink,
  Loader2,
  ArrowRightLeft,
  X,
  Globe,
  DollarSign,
  Clock,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { EmptyState } from "@/components/shared/EmptyState";
import { PathwayTimeline, PathwayTimelineSkeleton } from "@/components/dashboard/pathways/PathwayTimeline";
import { ComparisonView } from "@/components/dashboard/pathways/ComparisonView";
import type { PathwayData } from "@/types";
import Link from "next/link";

interface CountryOption {
  id: string;
  country: string;
  countryCode: string;
}

export default function PathwaysPage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [selectedCode, setSelectedCode] = useState("");
  const [compareCode, setCompareCode] = useState("");
  const [compareMode, setCompareMode] = useState(false);

  const [pathway, setPathway] = useState<PathwayData | null>(null);
  const [comparePathway, setComparePathway] = useState<PathwayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/api/v1/countries")
      .then((data: CountryOption[]) => {
        setCountries(data);
        if (data.length > 0) {
          setSelectedCode(data[0].countryCode);
        }
      })
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, []);

  const loadPathway = useCallback(async (code: string): Promise<PathwayData | null> => {
    try {
      const data = await fetchApi<PathwayData>(`/api/v1/pathways/${code}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!selectedCode) return;
    setLoading(true);
    setError(null);
    loadPathway(selectedCode)
      .then((data) => {
        if (data) setPathway(data);
        else setError("Failed to load pathway data.");
      })
      .finally(() => setLoading(false));
  }, [selectedCode, loadPathway]);

  useEffect(() => {
    if (!compareMode || !compareCode) {
      setComparePathway(null);
      setCompareError(null);
      return;
    }
    setCompareLoading(true);
    setCompareError(null);
    loadPathway(compareCode)
      .then((data) => {
        if (data) setComparePathway(data);
        else setCompareError("Failed to load comparison data.");
      })
      .finally(() => setCompareLoading(false));
  }, [compareCode, compareMode, loadPathway]);

  const riskGradient = (level: string) => {
    if (level.includes("HIGH") || level.includes("CRITICAL")) return "from-red-500/10 to-red-500/5 border-red-500/20";
    if (level.includes("MODERATE") || level.includes("MEDIUM")) return "from-amber-500/10 to-amber-500/5 border-amber-500/20";
    return "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20";
  };

  const riskTextClass = (level: string) => {
    if (level.includes("HIGH") || level.includes("CRITICAL")) return "text-red-400";
    if (level.includes("MODERATE") || level.includes("MEDIUM")) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-page-title font-black tracking-tight text-foreground flex items-center gap-2">
            <Route className="h-6 w-6 text-primary" />
            PR & Visa Pathway Simulator
          </h2>
          <p className="text-muted-foreground text-sm">
            BD-specific immigration pathways from student visa to citizenship.
          </p>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-400/90 leading-relaxed">
          <strong className="text-amber-400">Disclaimer:</strong> This is a strategic estimate based on 2026 data, not legal immigration advice.
          Immigration rules change frequently. Always verify with official government sources.
        </p>
      </div>

      {/* Country Selectors */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="space-y-1 flex-1 w-full sm:w-auto">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Select Country
          </label>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="w-full min-h-11 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            disabled={countriesLoading}
          >
            {countriesLoading ? (
              <option>Loading...</option>
            ) : (
              countries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.country}
                </option>
              ))
            )}
          </select>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setCompareMode(!compareMode);
            if (!compareMode) setCompareCode("");
          }}
          className="min-h-11 text-xs border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {compareMode ? "Remove Comparison" : "Compare Countries"}
        </Button>
      </div>

      {/* Comparison Country Selector */}
      {compareMode && (
        <div className="space-y-1 -mt-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowRightLeft className="h-3 w-3" />
            Compare with
          </label>
          <select
            value={compareCode}
            onChange={(e) => setCompareCode(e.target.value)}
            className="w-full min-h-11 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            disabled={countriesLoading}
          >
            <option value="">Select a country...</option>
            {countries
              .filter((c) => c.countryCode !== selectedCode)
              .map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.country}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Comparison Mode */}
      {compareMode && compareCode && comparePathway && pathway ? (
        <ComparisonView countryA={pathway} countryB={comparePathway} />
      ) : compareLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PathwayTimelineSkeleton />
          <PathwayTimelineSkeleton />
        </div>
      ) : compareError ? (
        <ApiErrorAlert error={compareError} />
      ) : null}

      {/* Single Country Mode */}
      {!compareMode && (
        <>
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 w-60 bg-muted rounded animate-pulse" />
              <PathwayTimelineSkeleton />
            </div>
          ) : error ? (
            <ApiErrorAlert error={error} onRetry={() => setSelectedCode(selectedCode)} />
          ) : !pathway ? (
            <EmptyState
              icon={Globe}
              title="No pathway data"
              description="Select a country to view its immigration pathway."
            />
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                      <Globe className="h-3 w-3" />
                      Visa Difficulty
                    </div>
                    <p className="text-sm font-bold text-foreground">{pathway.studentVisa?.difficulty ?? "N/A"}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                      <Clock className="h-3 w-3" />
                      Avg PR Timeline
                    </div>
                    <p className="text-sm font-bold text-foreground">{pathway.prOverview?.averageYears ?? "?"} years</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                      <Info className="h-3 w-3" />
                      PR Score
                    </div>
                    <p className="text-sm font-bold text-foreground">{pathway.prOverview?.overallScore ?? "N/A"}/100</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                      <AlertTriangle className="h-3 w-3" />
                      BD Rejection Risk
                    </div>
                    <p className="text-sm font-bold text-foreground">{pathway.studentVisa?.rejectionRiskBD ?? "N/A"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Risk & Reality Card */}
              {pathway.risks && (
                <Card className={`border bg-gradient-to-br ${riskGradient(pathway.risks.riskLevel)}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Risk & Reality Assessment
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskGradient(pathway.risks.riskLevel)} ${riskTextClass(pathway.risks.riskLevel)}`}>
                        {pathway.risks.riskLevel}
                      </span>
                    </div>

                    {pathway.risks.warnings.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Warnings</p>
                        <ul className="space-y-1">
                          {pathway.risks.warnings.map((w, i) => (
                            <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {pathway.risks.dimensions.slice(0, 8).map((d) => {
                        const isHigh = d.score >= 60;
                        return (
                          <div key={d.name} className="rounded-lg bg-muted/20 p-2 border border-border/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-muted-foreground font-semibold uppercase truncate">{d.name}</span>
                              <span className={`text-[9px] font-bold ${isHigh ? "text-red-400" : "text-emerald-400"}`}>
                                {d.score}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isHigh ? "bg-red-400" : "bg-emerald-400"}`}
                                style={{ width: `${d.score}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{d.summary.slice(0, 80)}...</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              {pathway.timeline && (
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-4">
                    <PathwayTimeline timeline={pathway.timeline} citizenship={pathway.citizenship} />
                  </CardContent>
                </Card>
              )}

              {/* Cost Mapping */}
              {pathway.costs.length > 0 && (
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                      Immigration Costs (Estimated USD)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/40">
                            <th className="text-left py-2 font-bold text-muted-foreground uppercase tracking-wider">Item</th>
                            <th className="text-right py-2 font-bold text-muted-foreground uppercase tracking-wider">Amount (USD)</th>
                            <th className="text-right py-2 font-bold text-muted-foreground uppercase tracking-wider">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pathway.costs.map((c, i) => (
                            <tr key={i} className="border-b border-border/20">
                              <td className="py-2 text-foreground">{c.item}</td>
                              <td className="py-2 text-right font-bold text-foreground">${c.amountUSD.toLocaleString()}</td>
                              <td className="py-2 text-right text-muted-foreground">{c.notes}</td>
                            </tr>
                          ))}
                          <tr className="bg-muted/20">
                            <td className="py-2 font-bold text-foreground">Total Estimated</td>
                            <td className="py-2 text-right font-bold text-primary">
                              ${pathway.costs.reduce((sum, c) => sum + c.amountUSD, 0).toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-muted-foreground" />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Does not include tuition or living costs. Currency conversions approximate.
                      Last updated: {pathway.lastUpdated}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* PR Pathways Detail */}
              {pathway.prPathways.length > 0 && (
                <Card className="border-border/60 bg-card/30">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      PR Pathways
                    </h3>
                    <div className="space-y-3">
                      {pathway.prPathways.map((pr, i) => (
                        <div key={i} className="rounded-lg border border-border/40 bg-muted/10 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground">{pr.pathwayName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                              pr.difficulty.includes("High") || pr.difficulty.includes("Extreme") || pr.difficulty.includes("Very")
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : pr.difficulty.includes("Moderate")
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {pr.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{pr.description}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-muted-foreground">Est. Years</span>
                              <p className="font-bold text-foreground">{pr.estimatedYears}yrs</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">Language</span>
                              <p className="font-bold text-foreground text-[11px]">{pr.languageRequired || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">Job Required</span>
                              <p className="font-bold text-foreground">{pr.jobRequired ? "Yes" : "No"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">Cost</span>
                              <p className="font-bold text-foreground">{pr.costEstimate ? `${pr.costCurrency ?? "USD"} ${pr.costEstimate}` : "Varies"}</p>
                            </div>
                          </div>
                          {pr.strengths.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Strengths</p>
                              <ul className="space-y-0.5">
                                {pr.strengths.map((s, j) => (
                                  <li key={j} className="text-xs text-foreground/80 flex items-start gap-1.5">
                                    <span className="text-emerald-400">+</span> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {pr.weaknesses.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Weaknesses</p>
                              <ul className="space-y-0.5">
                                {pr.weaknesses.map((w, j) => (
                                  <li key={j} className="text-xs text-foreground/80 flex items-start gap-1.5">
                                    <span className="text-red-400">-</span> {w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {pr.strategicAdvice && (
                            <div className="rounded bg-blue-500/5 border border-blue-500/20 p-2">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Strategic Advice</p>
                              <p className="text-xs text-foreground/80 leading-relaxed">{pr.strategicAdvice}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bottom Disclaimer */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-400/90 leading-relaxed">
                  Data accurate as of {pathway.lastUpdated}. Immigration policies change frequently.
                  Verify all requirements with official government sources before making decisions.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
