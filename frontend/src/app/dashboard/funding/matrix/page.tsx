"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table2, DollarSign, Coins, PiggyBank } from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { FundingSkeleton } from "@/components/skeletons/FundingSkeleton";
import type { University, Application } from "@/types";

const BDT_RATES: Record<string, number> = {
  USD: 125, EUR: 136, CAD: 92, AUD: 83, GBP: 160, SEK: 11.9, NOK: 11.7, DKK: 18.2,
  CHF: 138, NZD: 76, JPY: 0.81, KRW: 0.091, SGD: 93, CNY: 17.3, AED: 34.0,
};

function parseCurrency(str: string): { amount: number; currency: string } | null {
  if (!str) return null;
  const match = str.match(/^([A-Z]{2,3})\s*([\d,]+)/i) || str.match(/^([\d,]+)\s*([A-Z]{2,3})/i);
  if (match) {
    const currency = match[1].toUpperCase();
    const amount = parseFloat(match[2].replace(/,/g, ""));
    if (!isNaN(amount)) return { amount, currency };
  }
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (!isNaN(num)) return { amount: num, currency: "USD" };
  return null;
}

function parseRange(str: string): { min: number; max: number; currency: string } | null {
  if (!str) return null;
  const match = str.match(/([A-Z]{2,3})?\s*([\d,]+)[–-\s]*([\d,]+)/i);
  if (match) {
    const currency = (match[1] || "USD").toUpperCase();
    const min = parseFloat(match[2].replace(/,/g, ""));
    const max = parseFloat(match[3].replace(/,/g, ""));
    if (!isNaN(min) && !isNaN(max)) return { min, max, currency };
  }
  const single = parseCurrency(str);
  if (single) return { min: single.amount, max: single.amount, currency: single.currency };
  return null;
}

function toBDT(amount: number, currency: string): number {
  const rate = BDT_RATES[currency] || 1;
  return amount * rate;
}

function formatBDT(amount: number): string {
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  return `${Math.round(amount).toLocaleString()}`;
}

export default function FundingMatrixPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyMode, setCurrencyMode] = useState<"original" | "bdt">("bdt");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [unis, apps] = await Promise.all([
          fetchApi("/api/v1/universities") as Promise<University[]>,
          fetchApi("/api/v1/applications") as Promise<Application[]>,
        ]);
        setUniversities(unis || []);
        setApplications(apps || []);
      } catch (err) {
        setError("Failed to load funding data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const matrix = useMemo(() => {
    return universities.map((uni) => {
      const app = applications.find((a) => a.universityId === uni.id);
      const tuition = parseRange(uni.tuitionPerYr || "") || { min: 0, max: 0, currency: "USD" };
      return {
        id: uni.id,
        name: uni.name,
        country: uni.country,
        tier: uni.tier,
        tuition,
        scholarship: app?.scholarshipAmt || null,
        livingCostEst: null as number | null,
      };
    });
  }, [universities, applications]);

  const formatAmount = (amount: number, currency: string) => {
    if (currencyMode === "bdt") {
      const bdt = toBDT(amount, currency);
      return `BDT ${formatBDT(bdt)}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const stats = useMemo(() => {
    const dream = matrix.filter((m) => m.tier === "DREAM");
    const match = matrix.filter((m) => m.tier === "MATCH");
    const calcAvg = (items: typeof matrix) => {
      if (items.length === 0) return null;
      const totals = items
        .filter((i) => i.tuition.min > 0)
        .map((i) => toBDT(i.tuition.min, i.tuition.currency))
        .filter((v) => v > 0);
      if (totals.length === 0) return null;
      return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    };
    return { dreamAvg: calcAvg(dream), matchAvg: calcAvg(match) };
  }, [matrix]);

  if (loading) {
    return <FundingSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={Table2}
        title="Funding Matrix"
        description="Compare tuition, living costs, stipends, and total out-of-pocket expenses across universities side by side."
        backHref="/dashboard/funding/scholarships"
        backLabel="Back to Scholarships"
      />

      {error && (
        <ApiErrorAlert error={error} />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrencyMode("bdt")}
            className={`text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              currencyMode === "bdt" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            BDT (৳)
          </button>
          <button
            onClick={() => setCurrencyMode("original")}
            className={`text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              currencyMode === "original" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {matrix.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No universities to compare"
          description="Add universities to populate the funding comparison matrix."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={DollarSign} label="Universities" value={matrix.length} color="default" />
            <MetricCard
              icon={Coins}
              label="Dream Avg Tuition"
              value={stats.dreamAvg ? `BDT ${formatBDT(stats.dreamAvg)}/yr` : "N/A"}
              color="info"
            />
            <MetricCard
              icon={PiggyBank}
              label="Match Avg Tuition"
              value={stats.matchAvg ? `BDT ${formatBDT(stats.matchAvg)}/yr` : "N/A"}
              color="warning"
            />
          </div>

          <Card className="border-border/60 bg-card/25 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left py-3 px-4 text-muted-foreground font-bold">University</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-bold">Country</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-bold">Tier</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-bold">Tuition/yr</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-bold">Scholarship</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{row.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{row.country}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.tier === "DREAM" ? "bg-purple-500/10 text-purple-400" :
                          row.tier === "MATCH" ? "bg-emerald-500/10 text-emerald-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {row.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-foreground">
                        {row.tuition.min > 0
                          ? row.tuition.min === row.tuition.max
                            ? formatAmount(row.tuition.min, row.tuition.currency)
                            : `${formatAmount(row.tuition.min, row.tuition.currency)} – ${formatAmount(row.tuition.max, row.tuition.currency)}`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.scholarship ? (
                          <span className="text-emerald-400 font-bold">{row.scholarship}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
