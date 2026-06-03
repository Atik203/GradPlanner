"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Loader2,
  AlertCircle,
  Globe,
  TrendingUp,
  ArrowRight,
  PiggyBank,
  Wallet,
} from "lucide-react";
import type { SalaryData } from "@/types/countries/salary-data";

interface CountrySummary { id: string; country: string; countryCode: string; }

const BDT_RATES: Record<string, number> = {
  USD: 118, EUR: 128, CAD: 87, AUD: 78, GBP: 150, SEK: 11.2, NOK: 11, DKK: 17.2,
  CHF: 130, NZD: 72, JPY: 0.76, KRW: 0.086, SGD: 88, CNY: 16.3, AED: 32.1,
};

export default function SalaryIntelligencePage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [salaryData, setSalaryData] = useState<Record<string, SalaryData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experience, setExperience] = useState<"entry" | "mid" | "senior">("entry");
  const [degree, setDegree] = useState<"msc" | "phd">("msc");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        
        // Fetch all salary data in parallel
        const fetchPromises = (list || []).map(async (c) => {
          try {
            const data = await fetchApi(`/api/v1/countries/${c.countryCode}`);
            if (data?.salary) {
              setSalaryData((prev) => ({ ...prev, [c.countryCode]: data.salary }));
            }
          } catch (err) {
            console.error(`Failed to load salary for ${c.countryCode}:`, err);
          }
        });
        
        await Promise.all(fetchPromises);
      } catch (err) {
        setError("Failed to load salary data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getSalary = (s: SalaryData | undefined) => {
    if (!s) return null;
    if (experience === "entry") {
      const entry = s.entryLevel;
      if (degree === "phd" && entry?.phdGraduate) return entry.phdGraduate;
      if (entry?.mscGraduate) return entry.mscGraduate;
      return null;
    }
    if (experience === "mid") return s.midLevel3to5yrs;
    if (experience === "senior") return s.seniorLevel;
    return null;
  };

  const toBDT = (amount: number, currency: string): number => {
    const rate = BDT_RATES[currency] || 1;
    return amount * rate;
  };

  const formatBDT = (amount: number): string => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    return Math.round(amount).toLocaleString();
  };

  const comparison = useMemo(() => {
    return Object.entries(salaryData).map(([code, s]) => {
      const band = getSalary(s);
      const currency = s.currency || "USD";
      const median = band?.median || 0;
      const net = band?.afterTax || median;
      return {
        country: countries.find((c) => c.countryCode === code)?.country || code,
        code,
        currency,
        median,
        net,
        bdt: toBDT(median, currency),
        bdtNet: toBDT(net, currency),
        pppScore: s.purchasingPowerScore,
      };
    }).sort((a, b) => b.bdt - a.bdt);
  }, [salaryData, countries, experience, degree]);

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
        icon={DollarSign}
        title="Salary Intelligence"
        description="Compare post-graduation salaries, PPP-adjusted earnings, and ROI analysis for MSc/PhD graduates."
        backHref="/dashboard/career/job-market"
        backLabel="Back to AI Job Market"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value as any)}
          className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
        >
          <option value="entry">Entry Level</option>
          <option value="mid">Mid-Level (3-5yr)</option>
          <option value="senior">Senior (8+yr)</option>
        </select>
        <select
          value={degree}
          onChange={(e) => setDegree(e.target.value as any)}
          className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
        >
          <option value="msc">MSc Graduate</option>
          <option value="phd">PhD Graduate</option>
        </select>
      </div>

      {comparison.length === 0 ? (
        <EmptyState icon={DollarSign} title="No salary data available" description="Salary data is being prepared for selected countries." />
      ) : (
        <>
          <div className="space-y-3">
            {comparison.map((row) => (
              <Card key={row.code} className="border-border/60 bg-card/25">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-bold text-foreground min-w-[80px]">{row.country}</span>
                    <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((row.bdt / (comparison[0]?.bdt || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-foreground shrink-0">
                      {row.currency} {row.median.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <span className="text-muted-foreground block">BDT Equivalent</span>
                      <span className="font-bold text-foreground">BDT {formatBDT(row.bdt)}/yr</span>
                    </div>
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <span className="text-muted-foreground block">After Tax (est)</span>
                      <span className="font-bold text-foreground">{row.currency} {row.net.toLocaleString()}</span>
                    </div>
                    <div className="p-1.5 rounded bg-muted/30 text-center">
                      <span className="text-muted-foreground block">PPP Score</span>
                      <span className={`font-bold ${row.pppScore >= 70 ? "text-emerald-400" : row.pppScore >= 45 ? "text-amber-400" : "text-destructive"}`}>
                        {row.pppScore}/100
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">Salary Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 text-muted-foreground font-semibold">Country</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Entry</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Mid (3-5yr)</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Senior</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-semibold">PPP Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(salaryData).map(([code, s]) => {
                      const c = countries.find((x) => x.countryCode === code);
                      return (
                        <tr key={code} className="border-b border-border/20">
                          <td className="py-2 font-bold text-foreground">{c?.country || code}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            {s.currency} {s.entryLevel?.mscGraduate?.median?.toLocaleString() || "N/A"}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {s.currency} {s.midLevel3to5yrs?.median?.toLocaleString() || "N/A"}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {s.currency} {s.seniorLevel?.median?.toLocaleString() || "N/A"}
                          </td>
                          <td className="py-2 px-3 text-right font-bold">{s.purchasingPowerScore}/100</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
