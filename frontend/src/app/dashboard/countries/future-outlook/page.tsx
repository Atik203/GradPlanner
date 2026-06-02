"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  TrendingUp,
  Loader2,
  AlertCircle,
  Globe,
  Bot,
  Building2,
  Target,
  Star,
  TrendingDown,
} from "lucide-react";
import type { JobMarket } from "@/types/countries/job-market";

interface CountrySummary { id: string; country: string; countryCode: string; overallScore: number; }

export default function FutureOutlookPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selected, setSelected] = useState<CountrySummary | null>(null);
  const [jobData, setJobData] = useState<JobMarket | null>(null);
  const [countryData, setCountryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        if (list?.length > 0) {
          setSelected(list[0]);
        }
      } catch (err) {
        setError("Failed to load country data.");
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
        setCountryData(data);
        setJobData(data?.jobMarket as JobMarket);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [selected]);

  const futureData = countryData?.futureProofing;
  const risks = countryData?.risks;
  const timeline = countryData?.timeline;

  const riskDimensions = useMemo(() => {
    if (!risks?.risks) return [];
    const r = risks.risks;
    return [
      { label: "Housing Risk", ...r.housingRisk },
      { label: "Economic Risk", ...r.economicRisk },
      { label: "Inflation", ...r.inflationRisk },
      { label: "Anti-Immigration", ...r.antiImmigrationRisk },
      { label: "Climate Risk", ...r.climateRisk },
      { label: "Job Market", ...r.jobMarketRisk },
      { label: "Political", ...r.politicalRisk },
    ].filter((d) => d.score !== undefined);
  }, [risks]);

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
        icon={TrendingUp}
        title="Future Outlook"
        description="Projected immigration policy shifts, post-study work visa changes, and 5-year economic forecasts for target countries."
        backHref="/dashboard/countries"
        backLabel="Back to Country Explorer"
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
          {selected && (
            <span className="text-xs text-muted-foreground shrink-0">Fit: {selected.overallScore}%</span>
          )}
        </CardContent>
      </Card>

      {!countryData ? (
        <EmptyState icon={TrendingUp} title="No forecast data available" description={`Forecast data for ${selected?.country || "this country"} is being prepared.`} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              icon={Star}
              label="Future Proof Score"
              value={futureData?.futureProofScore || futureData?.overallFutureScore || "N/A"}
              color={futureData?.futureProofScore && futureData.futureProofScore >= 70 ? "success" : "warning"}
            />
            <MetricCard
              icon={Bot}
              label="AI Investment"
              value={futureData?.aiInvestment?.score || "N/A"}
              color="info"
            />
            <MetricCard
              icon={Target}
              label="Immigration Need"
              value={futureData?.agingPopulationNeed?.score || "N/A"}
              color="default"
            />
            <MetricCard
              icon={TrendingDown}
              label="Risk Score"
              value={risks?.overallRiskScore || "N/A"}
              color={risks?.overallRiskScore && risks.overallRiskScore > 50 ? "destructive" : "success"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskDimensions.length > 0 && (
              <Card className="border-border/60 bg-card/25">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">Risk Landscape</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {riskDimensions.map((r, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground">{r.label}</span>
                        <span className={`text-[10px] font-bold ${
                          r.score > 50 ? "text-destructive" : r.score > 30 ? "text-amber-400" : "text-emerald-400"
                        }`}>{r.score}/100 {r.level && `· ${r.level}`}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            r.score > 50 ? "bg-destructive" : r.score > 30 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                      {r.summary && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{r.summary}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {jobData && (
              <Card className="border-border/60 bg-card/25">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">AI/ML Job Market</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">Job Score</span>
                      <span className="font-bold text-foreground text-xs">{jobData.overallJobMarketScore}/100</span>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">Demand</span>
                      <span className="font-bold text-foreground text-xs">{jobData.demandLevel}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">Openings/yr</span>
                      <span className="font-bold text-foreground text-xs">{jobData.aiMlSpecificOpenings?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">Time to Job</span>
                      <span className="font-bold text-foreground text-xs">{jobData.averageTimeToJob}</span>
                    </div>
                  </div>
                  {jobData.skillsInDemand && (
                    <div className="flex flex-wrap gap-1">
                      {jobData.skillsInDemand.slice(0, 8).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-semibold">{s}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {futureData?.forecast2035 && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">2035 Forecast</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{futureData.forecast2035}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
