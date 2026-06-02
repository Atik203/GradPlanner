"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Globe,
  Star,
  Clock,
  ShieldAlert,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import type { PrPathways, PrPathway } from "@/types/countries/pr-pathways";

interface CountrySummary { id: string; country: string; countryCode: string; }

export default function PRRoutePlannerPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selected, setSelected] = useState<CountrySummary | null>(null);
  const [prData, setPrData] = useState<PrPathways | null>(null);
  const [visaData, setVisaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        if (list?.length > 0) setSelected(list[0]);
      } catch (err) {
        setError("Failed to load PR data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function load() {
      try {
        const data = await fetchApi(`/api/v1/countries/${selected!.countryCode}`);
        setPrData(data?.prPathways || null);
        setVisaData(data?.visa || null);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [selected]);

  const pathways = useMemo(() => prData?.pathways || [], [prData]);

  const difficultyColor = (d: string) => {
    const lower = d.toLowerCase();
    if (lower.includes("low") || lower.includes("easy")) return "text-emerald-400 bg-emerald-500/10";
    if (lower.includes("moderate") || lower.includes("medium")) return "text-amber-400 bg-amber-500/10";
    if (lower.includes("high") || lower.includes("hard")) return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted";
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={MapPin}
        title="PR Route Planner"
        description="Step-by-step permanent residency pathways, points calculators, and timeline estimates for each target country."
        backHref="/dashboard/career/job-market"
        backLabel="Back to Career Hub"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary shrink-0" />
          <select
            value={selected?.countryCode || ""}
            onChange={(e) => {
              const c = countries.find((x) => x.countryCode === e.target.value);
              if (c) setSelected(c);
            }}
            className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer flex-1"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {!prData ? (
        <EmptyState icon={MapPin} title="No PR data available" description={`PR pathway data for ${selected?.country || "this country"} is being prepared.`} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={Star} label="Overall PR Score" value={prData.overallPRScore || "N/A"} color="success" />
            <MetricCard icon={Clock} label="Difficulty Level" value={prData.overallPRDifficulty || "N/A"} color="default" />
            <MetricCard icon={ShieldAlert} label="Pathways" value={pathways.length} color="warning" />
            <MetricCard icon={CheckCircle} label="Recommended" value={prData.recommendedPathway || "N/A"} color="info" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Available Pathways</h3>
            <div className="space-y-4">
              {pathways.map((pw, idx) => (
                <Card key={idx} className={`border-border/60 bg-card/25 hover:bg-card/40 transition-all ${idx === 0 ? "ring-1 ring-primary/30" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {idx === 0 && <Star className="h-4 w-4 text-primary fill-primary" />}
                          <CardTitle className="text-sm font-bold text-foreground">{pw.pathwayName}</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-2">{pw.description}</CardDescription>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${difficultyColor(pw.difficulty)}`}>
                        {pw.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div className="p-1.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Est. Years</span>
                        <span className="font-bold text-foreground">{pw.estimatedYears}</span>
                      </div>
                      <div className="p-1.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Job Required</span>
                        <span className={`font-bold ${pw.jobRequired ? "text-amber-400" : "text-emerald-400"}`}>
                          {pw.jobRequired ? "Yes" : "No"}
                        </span>
                      </div>
                      {pw.costEstimate && (
                        <div className="p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground block">Cost Est.</span>
                          <span className="font-bold text-foreground">{pw.costCurrency} {pw.costEstimate.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="p-1.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Processing</span>
                        <span className="font-bold text-foreground">{pw.processingTime || "N/A"}</span>
                      </div>
                    </div>

                    {pw.strengths && pw.strengths.length > 0 && (
                      <div className="border-t border-border/30 pt-2">
                        <div className="flex flex-wrap gap-1">
                          {pw.strengths.map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {pw.strategicAdvice && (
                      <p className="text-[10px] text-muted-foreground italic mt-1">Tip: {pw.strategicAdvice}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {prData.criticalWarnings && prData.criticalWarnings.length > 0 && (
            <Card className="border-destructive/10 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Critical Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {prData.criticalWarnings.map((warning, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive font-bold shrink-0">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {visaData && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Visa Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {visaData.studentVisa && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Student Visa</span>
                      <p className="font-bold text-foreground">{visaData.studentVisa.visaName}</p>
                      <p className="text-[10px] text-muted-foreground">Processing: {visaData.studentVisa.processingTime}</p>
                      <p className="text-[10px] text-muted-foreground">Risk for BD: {visaData.studentVisa.rejectionRiskBangladesh}</p>
                    </div>
                  )}
                  {visaData.postStudyVisa && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Post-Study Visa</span>
                      <p className="font-bold text-foreground">{visaData.postStudyVisa.visaName}</p>
                      <p className="text-[10px] text-muted-foreground">Duration: {visaData.postStudyVisa.duration}</p>
                    </div>
                  )}
                  {visaData.workVisa && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Work Visa</span>
                      <p className="font-bold text-foreground">{visaData.workVisa.visaName || "See pathways"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
