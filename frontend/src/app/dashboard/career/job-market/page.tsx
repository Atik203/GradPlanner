"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Bot,
  Loader2,
  AlertCircle,
  Globe,
  Building2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import type { JobMarket } from "@/types/countries/job-market";
import type { AiEcosystem } from "@/types/countries/ai-ecosystem";

interface CountrySummary { id: string; country: string; countryCode: string; }

export default function AIJobMarketPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selected, setSelected] = useState<CountrySummary[]>([]);
  const [marketData, setMarketData] = useState<Record<string, JobMarket>>({});
  const [ecoData, setEcoData] = useState<Record<string, AiEcosystem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        const top3 = (list || []).slice(0, 3);
        setSelected(top3);
        for (const c of top3) {
          try {
            const data = await fetchApi(`/api/v1/countries/${c.countryCode}`);
            if (data?.jobMarket) setMarketData((prev) => ({ ...prev, [c.countryCode]: data.jobMarket }));
            if (data?.aiEcosystem) setEcoData((prev) => ({ ...prev, [c.countryCode]: data.aiEcosystem }));
          } catch {}
        }
      } catch (err) {
        setError("Failed to load job market data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
        icon={Bot}
        title="AI Job Market"
        description="Real-time AI/ML job market analytics — demand, salary trends, and hiring patterns across target countries."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selected.length === 0 ? (
        <EmptyState icon={Bot} title="Loading countries..." description="Country data is being prepared." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selected.map((c) => {
              const mkt = marketData[c.countryCode];
              const eco = ecoData[c.countryCode];
              return (
                <Card key={c.countryCode} className="border-border/60 bg-card/25 hover:bg-card/40 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-foreground">{c.country}</CardTitle>
                      {mkt && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mkt.overallJobMarketScore >= 75 ? "bg-emerald-500/10 text-emerald-400" :
                          mkt.overallJobMarketScore >= 50 ? "bg-amber-500/10 text-amber-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          Score: {mkt.overallJobMarketScore}/100
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  {mkt ? (
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground block">Demand</span>
                          <span className="font-bold text-foreground">{mkt.demandLevel}</span>
                        </div>
                        <div className="p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground block">AI/ML Openings</span>
                          <span className="font-bold text-foreground">{mkt.aiMlSpecificOpenings?.toLocaleString() || "N/A"}/yr</span>
                        </div>
                        <div className="p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground block">Saturation</span>
                          <span className="font-bold text-foreground">{mkt.marketSaturation}</span>
                        </div>
                        <div className="p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground block">Time to Job</span>
                          <span className="font-bold text-foreground">{mkt.averageTimeToJob}</span>
                        </div>
                      </div>
                      {mkt.topEmployers && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {mkt.topEmployers.slice(0, 4).map((e, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-muted/30 text-[9px] font-semibold text-muted-foreground">{e}</span>
                          ))}
                        </div>
                      )}
                      {eco?.aiEcosystemScore !== undefined && (
                        <div className="border-t border-border/30 pt-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">AI Ecosystem</span>
                            <span className="font-bold text-purple-400">{eco.aiEcosystemScore}/100</span>
                          </div>
                          {eco.aiCompanies && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {eco.aiCompanies.slice(0, 4).map((ac: { name: string; location: string; focus: string; hires: string }, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-semibold">{ac.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  ) : (
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Job market data loading...</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {selected.length > 0 && Object.values(marketData).length > 0 && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Skills Demand Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(marketData).map(([code, mkt]) => (
                  <div key={code}>
                    <p className="text-[10px] font-bold text-muted-foreground mb-1">
                      {countries.find((c) => c.countryCode === code)?.country || code}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(mkt.skillsInDemand || []).slice(0, 10).map((skill, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-semibold">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
