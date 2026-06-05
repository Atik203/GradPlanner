"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  Loader2,
  AlertCircle,
  Globe,
  TrendingUp,
  ArrowRight,
  PiggyBank,
  Wallet,
  Users,
  Briefcase,
  Plane,
  Coins,
  ShieldAlert,
  ChevronRight,
  Heart,
  Calendar
} from "lucide-react";
import type { SalaryData } from "@/types/countries/salary-data";

interface CountrySummary { id: string; country: string; countryCode: string; }

const BDT_RATES: Record<string, number> = {
  USD: 125, EUR: 136, CAD: 92, AUD: 83, GBP: 160, SEK: 11.9, NOK: 11.7, DKK: 18.2,
  CHF: 138, NZD: 76, JPY: 0.81, KRW: 0.091, SGD: 93, CNY: 17.3, AED: 34.0,
};

export default function SalaryIntelligencePage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [countriesData, setCountriesData] = useState<Record<string, any>>({});
  const [salaryData, setSalaryData] = useState<Record<string, SalaryData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experience, setExperience] = useState<"entry" | "mid" | "senior">("entry");
  const [degree, setDegree] = useState<"msc" | "phd">("msc");

  // Calculator inputs
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [rentTier, setRentTier] = useState<"shared" | "private" | "studio">("shared");
  const [includeSpouse, setIncludeSpouse] = useState<boolean>(false);
  const [customExpense, setCustomExpense] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        
        if (list?.length > 0) {
          setSelectedCountryCode(list[0].countryCode);
        }

        // Fetch all country data in parallel
        const fetchPromises = (list || []).map(async (c) => {
          try {
            const data = await fetchApi(`/api/v1/countries/${c.countryCode}`);
            if (data) {
              setCountriesData((prev) => ({ ...prev, [c.countryCode]: data }));
              if (data.salary) {
                setSalaryData((prev) => ({ ...prev, [c.countryCode]: data.salary }));
              }
            }
          } catch (err) {
            console.error(`Failed to load data for ${c.countryCode}:`, err);
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
        pppScore: s.purchasingPowerScore || 50,
      };
    }).sort((a, b) => b.bdt - a.bdt);
  }, [salaryData, countries, experience, degree]);

  // Calculations for selected country savings & milestones
  const selectedCountryName = useMemo(() => {
    return countries.find((c) => c.countryCode === selectedCountryCode)?.country || "";
  }, [countries, selectedCountryCode]);

  const activeSalaryObject = useMemo(() => {
    return salaryData[selectedCountryCode];
  }, [salaryData, selectedCountryCode]);

  const activeSalaryData = useMemo(() => {
    return getSalary(activeSalaryObject);
  }, [activeSalaryObject, experience, degree]);

  const activeCurrency = useMemo(() => {
    return activeSalaryObject?.currency || "USD";
  }, [activeSalaryObject]);

  const activeMonthlyNet = useMemo(() => {
    if (!activeSalaryData) return 0;
    const annualNet = activeSalaryData.afterTax || activeSalaryData.median || 0;
    return Math.round(annualNet / 12);
  }, [activeSalaryData]);

  const activeLivingCosts = useMemo(() => {
    return countriesData[selectedCountryCode]?.livingCosts;
  }, [countriesData, selectedCountryCode]);

  const expensesBreakdown = useMemo(() => {
    if (!activeLivingCosts) return { rent: 0, other: 0, total: 0 };
    const breakdown = activeLivingCosts.studentPhase?.monthlyBreakdown || activeLivingCosts.monthlyBreakdown;
    if (!breakdown) return { rent: 0, other: 0, total: 0 };
    
    let rent = 0;
    if (rentTier === "shared" && breakdown.rent?.sharedRoom) rent = breakdown.rent.sharedRoom.localCurrency;
    else if (rentTier === "private" && breakdown.rent?.privateRoom) rent = breakdown.rent.privateRoom.localCurrency;
    else if (rentTier === "studio" && breakdown.rent?.studio1BR) rent = breakdown.rent.studio1BR.localCurrency;
    else rent = (breakdown.rent?.sharedRoom?.localCurrency || 0);

    let other = 0;
    if (breakdown.food?.total?.localCurrency) other += breakdown.food.total.localCurrency;
    if (breakdown.transport?.localCurrency) other += breakdown.transport.localCurrency;
    if (breakdown.utilities?.localCurrency) other += breakdown.utilities.localCurrency;
    if (breakdown.internet?.localCurrency) other += breakdown.internet.localCurrency;
    if (breakdown.phone?.localCurrency) other += breakdown.phone.localCurrency;
    if (breakdown.healthcare?.localCurrency) other += breakdown.healthcare.localCurrency;
    if (breakdown.miscellaneous?.localCurrency) other += breakdown.miscellaneous.localCurrency;
    
    if (other === 0 && breakdown.totalMinimum?.localCurrency) {
      other = Math.max(0, breakdown.totalMinimum.localCurrency - rent);
    }
    if (other === 0) {
      // Fallback
      other = 400 * (activeLivingCosts.usdExchangeRate || 1);
    }

    if (includeSpouse) {
      // Spouse surcharge (75% increase in non-rent living costs for food, insurance, transport)
      other = Math.round(other * 1.75);
    }

    return { rent, other, total: rent + other };
  }, [activeLivingCosts, rentTier, includeSpouse]);

  const totalMonthlyExpense = useMemo(() => {
    return expensesBreakdown.total + (customExpense || 0);
  }, [expensesBreakdown, customExpense]);

  const netMonthlySavings = useMemo(() => {
    return Math.max(0, activeMonthlyNet - totalMonthlyExpense);
  }, [activeMonthlyNet, totalMonthlyExpense]);

  const netMonthlySavingsBDT = useMemo(() => {
    return toBDT(netMonthlySavings, activeCurrency);
  }, [netMonthlySavings, activeCurrency]);

  const savingsRate = useMemo(() => {
    if (activeMonthlyNet === 0) return 0;
    return Math.round((netMonthlySavings / activeMonthlyNet) * 100);
  }, [netMonthlySavings, activeMonthlyNet]);

  // Bangladeshi Milestones
  const milestones = useMemo(() => {
    const goals = [
      { name: "🕋 Parents' Hajj Package", target: 1000000, color: "from-emerald-500 to-teal-600" },
      { name: "🏢 Dhaka Apartment Downpayment", target: 3000000, color: "from-blue-500 to-indigo-600" },
      { name: "🚗 Toyota Axio (BD Car)", target: 2500000, color: "from-amber-500 to-orange-600" },
    ];

    if (netMonthlySavingsBDT <= 0) {
      return goals.map(g => ({ ...g, months: 999, years: 999, progress: 0 }));
    }

    return goals.map(g => {
      const months = Math.ceil(g.target / netMonthlySavingsBDT);
      const years = parseFloat((months / 12).toFixed(1));
      const progress = Math.min((netMonthlySavingsBDT / (g.target / 12)) * 100, 100); // Progress in 1 year
      return { ...g, months, years, progress };
    });
  }, [netMonthlySavingsBDT]);

  // Spouse Work Rights Alerts
  const spouseWorkAdvisory = useMemo(() => {
    const code = selectedCountryCode.toLowerCase();
    if (code === "us") {
      return {
        severity: "destructive",
        title: "⚠️ F-2 dependent visa work prohibition",
        text: "Spouses of F-1 students in the USA are strictly banned from employment. Your spouse cannot contribute income, and health insurance averages $150-$300/month per dependent.",
      };
    }
    if (code === "ca") {
      return {
        severity: "success",
        title: "✅ Spouse Open Work Permit (SOWP)",
        text: "Canada grants Open Work Permits to spouses of full-time MSc/PhD students, allowing them to work unrestricted and offset local living costs entirely.",
      };
    }
    if (code === "au") {
      return {
        severity: "success",
        title: "✅ Subclass 500 dependent work rights",
        text: "Australia grants unlimited work rights to spouses of students enrolled in Master's by research or PhD programs, with highly competitive local minimum wages (~AUD 23/hr).",
      };
    }
    if (code === "de") {
      return {
        severity: "warning",
        title: "🟡 German Family Reunion Language Check",
        text: "German reunion visas allow spouses to work, but the spouse must demonstrate basic A1 level German proficiency before visa issuance. High rent prices require careful city selection.",
      };
    }
    return {
      severity: "default",
      title: "ℹ️ Dependent Work Rights",
      text: "Dependents are generally allowed to work part-time or full-time depending on the host country regulations. Ensure you review local registration and language thresholds.",
    };
  }, [selectedCountryCode]);

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
        title="Salary & Savings Intelligence"
        description="Calculate after-tax savings rates, plan dependent sponsorship, and estimate timelines for Bangladesh financial milestones."
        backHref="/dashboard/career/job-market"
        backLabel="Back to AI Job Market"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Global Selectors */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/20 border border-border/40 p-4 rounded-xl">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Career Experience Level</Label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value as any)}
            className="w-48 bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
          >
            <option value="entry">Entry Level Graduate</option>
            <option value="mid">Mid-Level (3-5yr Exp)</option>
            <option value="senior">Senior (8+yr Exp)</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Degree Level Completed</Label>
          <select
            value={degree}
            onChange={(e) => setDegree(e.target.value as any)}
            className="w-48 bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
          >
            <option value="msc">MSc Graduate</option>
            <option value="phd">PhD Graduate</option>
          </select>
        </div>
      </div>

      {comparison.length === 0 ? (
        <EmptyState icon={DollarSign} title="No salary data available" description="Salary data is being prepared for selected countries." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT/MID COLUMN: Comparison & Progression */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground">Global Salary Comparison (Annual)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Sorted by gross BDT equivalent. High purchasing power mitigates local tax brackets.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {comparison.map((row) => (
                  <div key={row.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.country}
                      </span>
                      <span className="font-bold text-foreground">
                        {row.currency} {row.median.toLocaleString()}{" "}
                        <span className="text-muted-foreground font-normal text-[10px]">
                          (BDT {formatBDT(row.bdt)})
                        </span>
                      </span>
                    </div>
                    <div className="relative w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-primary/60 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((row.bdt / (comparison[0]?.bdt || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Salary Progression Table */}
            <Card className="border-border bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground">Salary Growth & Progression Curve</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Estimated median annual salaries across career milestones.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border/60 pb-2 text-muted-foreground font-semibold">
                        <th className="py-2">Country</th>
                        <th className="py-2 px-3 text-right">Entry Level</th>
                        <th className="py-2 px-3 text-right">Mid-Career (3-5yr)</th>
                        <th className="py-2 px-3 text-right">Senior (8+yr)</th>
                        <th className="py-2 px-3 text-right">PPP Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {Object.entries(salaryData).map(([code, s]) => {
                        const c = countries.find((x) => x.countryCode === code);
                        return (
                          <tr key={code} className="hover:bg-muted/10 transition-colors">
                            <td className="py-2.5 font-bold text-foreground">{c?.country || code}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                              {s.currency} {s.entryLevel?.mscGraduate?.median?.toLocaleString() || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                              {s.currency} {s.midLevel3to5yrs?.median?.toLocaleString() || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-foreground font-bold">
                              {s.currency} {s.seniorLevel?.median?.toLocaleString() || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                s.purchasingPowerScore >= 70 ? "text-emerald-400 bg-emerald-500/10" :
                                s.purchasingPowerScore >= 45 ? "text-amber-400 bg-amber-500/10" :
                                "text-destructive bg-destructive/10"
                              }`}>
                                {s.purchasingPowerScore}/100
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Interactive Savings & Milestones Calculator */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5 shadow-xl">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Savings & Sponsorship Calculator
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Simulate your cost structures, spouse relocation costs, and savings output.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {/* Select Country */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Target Country</Label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>
                        {c.country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Accommodation Tier */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Accommodation Preference</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={rentTier === "shared" ? "default" : "outline"}
                      className="h-9 text-xs"
                      onClick={() => setRentTier("shared")}
                    >
                      Shared Room
                    </Button>
                    <Button
                      type="button"
                      variant={rentTier === "private" ? "default" : "outline"}
                      className="h-9 text-xs"
                      onClick={() => setRentTier("private")}
                    >
                      Private Room
                    </Button>
                    <Button
                      type="button"
                      variant={rentTier === "studio" ? "default" : "outline"}
                      className="h-9 text-xs"
                      onClick={() => setRentTier("studio")}
                    >
                      Studio / 1BR
                    </Button>
                  </div>
                </div>

                {/* Spouse Toggle */}
                <div className="flex items-center space-x-3 bg-muted/20 border border-border/40 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    id="spouseSponsored"
                    checked={includeSpouse}
                    onChange={(e) => setIncludeSpouse(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="spouseSponsored" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> Sponsor Spouse / Partner
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Increases living expenses proportionately.</p>
                  </div>
                </div>

                {/* Custom Extra Expenses */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Custom Monthly Bills ({activeCurrency})
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. Loans, gym, dining out"
                    value={customExpense || ""}
                    onChange={(e) => setCustomExpense(e.target.value ? parseFloat(e.target.value) : 0)}
                    className="bg-background border-border text-foreground h-10"
                  />
                </div>

                {/* Spouse Warning box */}
                {includeSpouse && (
                  <div className={`p-3 rounded-lg border text-xs leading-normal flex items-start gap-2 ${
                    spouseWorkAdvisory.severity === "destructive" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    spouseWorkAdvisory.severity === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    spouseWorkAdvisory.severity === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    "bg-muted border-border/40 text-muted-foreground"
                  }`}>
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">{spouseWorkAdvisory.title}</strong>
                      {spouseWorkAdvisory.text}
                    </div>
                  </div>
                )}

                {/* Savings output card */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/10 space-y-3.5">
                  <div className="flex justify-between border-b border-primary/10 pb-2 text-xs">
                    <span className="text-muted-foreground">Monthly Net Salary:</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeCurrency} {activeMonthlyNet.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-primary/10 pb-2 text-xs">
                    <span className="text-muted-foreground">Total Living Costs:</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeCurrency} {totalMonthlyExpense.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Est. Monthly Savings:</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      {activeCurrency} {netMonthlySavings.toLocaleString()}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        (BDT {formatBDT(netMonthlySavingsBDT)})
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t border-primary/10 pt-2 text-muted-foreground">
                    <span>Savings Efficiency:</span>
                    <span className="font-extrabold text-foreground bg-primary/20 px-2 py-0.5 rounded-full text-[11px]">
                      {savingsRate}%
                    </span>
                  </div>
                </div>

                {/* Savings Milestones */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">BD Savings Milestones</h4>
                  {netMonthlySavingsBDT <= 0 ? (
                    <div className="text-center py-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                      Negative or zero savings rate. Unable to save for Dhaka milestones.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((m) => (
                        <div key={m.name} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">{m.name}</span>
                            <span className="font-bold text-emerald-400">{m.years} yrs</span>
                          </div>
                          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`absolute top-0 bottom-0 left-0 bg-linear-to-r ${m.color} rounded-full transition-all duration-500`}
                              style={{ width: `${m.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>Cost: BDT {formatBDT(m.target)}</span>
                            <span>Saves {m.progress.toFixed(0)}% / yr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
