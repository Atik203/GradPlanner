"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  Building,
  AlertTriangle,
  School,
  ArrowUpRight
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { FundingSkeleton } from "@/components/skeletons/FundingSkeleton";
import Link from "next/link";
import type { University, UserProfile } from "@/types";

const BDT_RATES: Record<string, number> = {
  USD: 125, EUR: 136, CAD: 92, AUD: 83, GBP: 160, SEK: 11.9, NOK: 11.7, DKK: 18.2,
  CHF: 138, NZD: 76, JPY: 0.81, KRW: 0.091, SGD: 93, CNY: 17.3, AED: 34.0,
};

const getCountryCurrency = (country: string) => {
  const c = country.toLowerCase().trim();
  if (c.includes("usa") || c.includes("united states")) return "USD";
  if (c.includes("germany") || c.includes("netherlands") || c.includes("ireland") || c.includes("finland") || c.includes("europe") || c.includes("netherland")) return "EUR";
  if (c.includes("canada")) return "CAD";
  if (c.includes("australia")) return "AUD";
  if (c.includes("united kingdom") || c.includes("uk") || c.includes("great britain")) return "GBP";
  if (c.includes("sweden")) return "SEK";
  if (c.includes("norway")) return "NOK";
  if (c.includes("denmark")) return "DKK";
  if (c.includes("switzerland")) return "CHF";
  if (c.includes("new zealand")) return "NZD";
  if (c.includes("japan")) return "JPY";
  if (c.includes("korea") || c.includes("south korea")) return "KRW";
  if (c.includes("singapore")) return "SGD";
  if (c.includes("china")) return "CNY";
  if (c.includes("uae") || c.includes("united arab emirates")) return "AED";
  return "USD";
};

const convertToBdt = (costStr: string | null | undefined, country: string): number => {
  if (!costStr) return 0;
  const cleaned = costStr.replace(/[^0-9.]/g, "");
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;
  
  let currency = getCountryCurrency(country);
  const costUpper = costStr.toUpperCase();
  if (costUpper.includes("$") || costUpper.includes("USD")) {
    if (costUpper.includes("CAD")) currency = "CAD";
    else if (costUpper.includes("AUD")) currency = "AUD";
    else currency = "USD";
  } else if (costUpper.includes("€") || costUpper.includes("EUR")) {
    currency = "EUR";
  } else if (costUpper.includes("£") || costUpper.includes("GBP")) {
    currency = "GBP";
  } else if (costUpper.includes("SEK")) {
    currency = "SEK";
  } else if (costUpper.includes("AED")) {
    currency = "AED";
  }
  
  return amount * (BDT_RATES[currency] || 125);
};

const formatBdt = (amount: number): string => {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)} Lakh BDT`;
  }
  return `${amount.toLocaleString()} BDT`;
};

export default function BudgetPlannerPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [unis, profData] = await Promise.all([
          fetchApi("/api/v1/universities") as Promise<University[]>,
          fetchApi("/api/v1/profile").catch(() => null) as Promise<UserProfile | null>,
        ]);
        setUniversities(unis || []);
        setProfile(profData);
        
        // Default BDT budget: profile's monthlyBudgetUSD * 12 * 125, or fallback to BDT 1,500,000 (15 Lakhs)
        if (profData?.monthlyBudgetUSD) {
          setBudgetInput(String(profData.monthlyBudgetUSD * 12 * 125));
        } else {
          setBudgetInput("1500000"); // 15 Lakh BDT default
        }
      } catch (err) {
        setError("Failed to load budget parameters.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const budgetBdt = useMemo(() => {
    return parseFloat(budgetInput) || 0;
  }, [budgetInput]);

  const ratedUnis = useMemo(() => {
    return universities
      .map((uni) => {
        const tuitionBdt = convertToBdt(uni.tuitionPerYr, uni.country);
        const livingBdt = convertToBdt(uni.livingCostPerYr, uni.country);
        const totalBdt = tuitionBdt + livingBdt;
        const gap = totalBdt > budgetBdt ? totalBdt - budgetBdt : 0;
        const affordable = totalBdt <= budgetBdt;
        return {
          ...uni,
          tuitionBdt,
          livingBdt,
          totalBdt,
          gap,
          affordable,
        };
      })
      .sort((a, b) => a.totalBdt - b.totalBdt);
  }, [universities, budgetBdt]);

  const affordableCount = useMemo(() => {
    return ratedUnis.filter((u) => u.affordable).length;
  }, [ratedUnis]);

  if (loading) {
    return <FundingSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={PiggyBank}
        title="Interactive Budget Planner"
        description="Verify university tuition and living costs against your funding limits, and check eligibility for studies abroad."
        backHref="/dashboard/funding"
        backLabel="Back to Saved Trackers"
      />

      {error && (
        <ApiErrorAlert error={error} />
      )}

      {/* Profile & Parameter Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Self-Funded available Budget</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Enter your total maximum available annual budget in Bangladeshi Taka (BDT) to calculate admissions feasibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="bdtBudget" className="text-xs text-muted-foreground font-semibold">Annual Budget in BDT</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-muted-foreground font-bold">BDT</span>
                  <Input
                    id="bdtBudget"
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="pl-12 bg-background border-border text-foreground font-extrabold"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/30">
                💡 Current conversion: <strong>1 USD = 125 BDT</strong>.
                {profile?.monthlyBudgetUSD && (
                  <p className="mt-1">Profile monthly target: ${profile.monthlyBudgetUSD} USD/mo (${(profile.monthlyBudgetUSD * 12).toLocaleString()} USD/yr).</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan ceiling rules info */}
        <Card className="border-border bg-card/40 backdrop-blur-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Building className="h-4 w-4" /> Study Loan Ceiling
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[10px] leading-relaxed mt-1">
              Bangladesh Bank guidelines dictate study loan availability and boundaries for international graduates.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed flex-1">
            <p>Maximum Study Loan Cap: <strong>BDT 20 Lakhs</strong> (2,000,000 BDT) is the standard commercial study loan limit in Bangladesh without excessive collateral requirements.</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={School} label="Total Tracked" value={universities.length} color="default" />
        <MetricCard icon={ShieldCheck} label="Affordable Programs" value={affordableCount} color="success" />
        <MetricCard icon={TrendingUp} label="Need Funding" value={universities.length - affordableCount} color="warning" />
        <MetricCard icon={Coins} label="Current Budget" value={`${(budgetBdt / 100000).toFixed(1)}L BDT`} color="success" />
      </div>

      {/* Affiliate Feasibility grid */}
      <div className="space-y-4">
        <h3 className="text-md font-bold text-foreground flex items-center gap-2">
          <School className="h-4.5 w-4.5 text-primary" />
          Tracked University Affordability Matrix ({ratedUnis.length})
        </h3>

        {universities.length === 0 ? (
          <EmptyState
            icon={School}
            title="No tracked universities"
            description="Track universities to start calculating budget and loan feasibility matches."
            actionLabel="Find Universities"
            onAction={() => window.location.href = "/dashboard/universities"}
          />
        ) : (
          <div className="space-y-4">
            {ratedUnis.map((uni) => (
              <Card key={uni.id} className={`border-border bg-card/25 transition-all ${uni.affordable ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left info */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">{uni.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        uni.tier === "DREAM" ? "bg-[var(--tier-dream-bg)] text-[var(--tier-dream)]" :
                        uni.tier === "MATCH" ? "bg-[var(--tier-match-bg)] text-[var(--tier-match)]" :
                        "bg-[var(--tier-safety-bg)] text-[var(--tier-safety)]"
                      }`}>
                        {uni.tier}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Program: <strong className="text-foreground">{uni.program || "General Graduate Track"}</strong> · Country: {uni.country}</p>
                    
                    {/* Costs row */}
                    <div className="grid grid-cols-2 gap-4 text-xs pt-2 max-w-md">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Tuition Cost / Yr:</span>
                        <span className="font-semibold text-foreground">{uni.tuitionPerYr || "Free / Not specified"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Living Cost / Yr:</span>
                        <span className="font-semibold text-foreground">{uni.livingCostPerYr || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right cost conversions and indicators */}
                  <div className="shrink-0 flex flex-col md:items-end justify-between gap-3 md:text-right">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Net Annual Cost BDT equivalent:</span>
                      <span className="font-extrabold text-sm text-foreground">{formatBdt(uni.totalBdt)}/yr</span>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {/* Affordability Badge */}
                      {uni.affordable ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          ✓ Affordable
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-black text-[10px] border border-destructive/20" title={`Funding gap: ${formatBdt(uni.gap)}`}>
                          ⚠️ Gap: {formatBdt(uni.gap)}
                        </span>
                      )}

                      {/* Loan feasibility indicator */}
                      {!uni.affordable && (
                        uni.gap <= 2000000 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20" title="Funding gap is within the BDT 20 Lakh study loan limit">
                            ✓ Loan Feasible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-black text-[10px] border border-destructive/30" title="Warning: Gap exceeds the BDT 20 Lakh education loan limit. Fully funded scholarship or supervisor TA/RA funding is critical">
                            🚨 Loan Limit Exceeded
                          </span>
                        )
                      )}
                    </div>
                    
                    {!uni.affordable && (
                      <div className="flex gap-2 items-center">
                        <Link href="/dashboard/funding/scholarships" className="text-[10px] text-primary hover:text-primary/80 font-bold flex items-center gap-0.5 mt-0.5 transition-all">
                          Find scholarships
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
