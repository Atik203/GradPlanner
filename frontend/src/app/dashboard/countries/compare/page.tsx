"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  Globe, 
  Plus, 
  X, 
  Coins, 
  FileText, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Users,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

interface CountryListEntry {
  id: string;
  country: string;
  countryCode: string;
  overallScore: number;
  summary: any;
}

// BDT Conversion Rates (Approximate)
const BDT_RATES: Record<string, number> = {
  USD: 118,
  EUR: 128,
  CAD: 87,
  AUD: 78,
  SEK: 11.2,
  NOK: 11.0,
  DKK: 17.2,
  CHF: 130,
  NZD: 72,
  JPY: 0.76,
  KRW: 0.086,
  SGD: 88,
  CNY: 16.3,
  AED: 32.1,
  GBP: 150
};

export default function CountryComparePage() {
  const [countries, setCountries] = useState<CountryListEntry[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [comparedData, setComparedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCountries() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries");
        setCountries(list || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load country list.");
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
  }, []);

  // Fetch full details when selectedCodes changes
  useEffect(() => {
    if (selectedCodes.length === 0) {
      setComparedData([]);
      return;
    }

    async function loadComparedDetails() {
      try {
        setFetchingDetails(true);
        const details = await Promise.all(
          selectedCodes.map((code) => fetchApi(`/api/v1/countries/${code.toLowerCase()}`))
        );
        setComparedData(details);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch country comparison details.");
      } finally {
        setFetchingDetails(false);
      }
    }

    loadComparedDetails();
  }, [selectedCodes]);

  const toggleSelectCountry = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else {
      if (selectedCodes.length >= 3) {
        return; // Max 3 countries
      }
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const getCurrencyRate = (currencyStr: string) => {
    // Extract base currency like "EUR/month" -> "EUR"
    const base = currencyStr?.split("/")[0]?.trim() || "USD";
    return BDT_RATES[base] || 1;
  };

  const convertToBdt = (amount: number, currencyStr: string) => {
    const rate = getCurrencyRate(currencyStr);
    const result = amount * rate;
    if (result >= 100000) {
      return `${(result / 100000).toFixed(1)}L BDT`;
    }
    return `${result.toLocaleString()} BDT`;
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Compare Countries</h2>
          <p className="text-muted-foreground text-sm">Select up to 3 countries to run side-by-side admission and immigration simulations.</p>
        </div>
      </div>

      {/* Selector Grid */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Select Countries ({selectedCodes.length}/3)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Select countries below to compare details instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => {
              const isSelected = selectedCodes.includes(c.countryCode);
              return (
                <button
                  key={c.countryCode}
                  onClick={() => toggleSelectCountry(c.countryCode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-xs"
                      : "bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.country}
                  {isSelected ? (
                    <X className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Comparisons */}
      {fetchingDetails ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : comparedData.length > 0 ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Comparison Matrix Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${comparedData.length} gap-6`}>
            {comparedData.map((data) => {
              const summary = data.summary || {};
              const visa = data.visa || {};
              const pr = data.prPathways || {};
              const citizenship = data.citizenship || {};
              const jobMarket = data.jobMarket || {};
              const family = data.family || {};

              return (
                <Card key={data.countryCode} className="border-border/60 bg-card/20 backdrop-blur-md flex flex-col h-full hover:border-primary/30 transition-all">
                  
                  {/* Card Header Info */}
                  <CardHeader className="border-b border-border/60 pb-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                        Fit Match: {data.overallScore}%
                      </span>
                      <span className="text-xs text-muted-foreground font-mono font-bold">{data.countryCode}</span>
                    </div>
                    <CardTitle className="text-xl font-black text-foreground">{data.country}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 h-8">
                      {summary.summary}
                    </CardDescription>
                  </CardHeader>

                  {/* Matrix Detail Modules */}
                  <CardContent className="p-6 space-y-6 flex-1">
                    
                    {/* Module 1: Finances */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5" />
                        Finances & Costs
                      </h4>
                      <div className="bg-muted/40 p-3 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Living Cost:</span>
                          <span className="font-bold text-foreground">
                            {summary.averageLivingCost ? `${summary.averageLivingCost} ${summary.averageLivingCostCurrency}` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BDT Equiv:</span>
                          <span className="font-bold text-emerald-400">
                            {summary.averageLivingCost ? convertToBdt(summary.averageLivingCost, summary.averageLivingCostCurrency) : "N/A"} / mo
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border/40 pt-1.5 mt-1.5">
                          <span className="text-muted-foreground font-semibold">Typical Tuition:</span>
                          <span className="font-semibold text-foreground">
                            {data.livingCosts?.tuitionFeesRange || "Varies"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Module 2: PR & Settlement */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        PR & Immigration
                      </h4>
                      <div className="bg-muted/40 p-3 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PR Score:</span>
                          <span className="font-bold text-foreground">{summary.prScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PR Timeline:</span>
                          <span className="font-bold text-foreground">{pr.estimatedYearsFromGraduation || "2-4"} Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">To Citizenship:</span>
                          <span className="font-bold text-foreground">{summary.citizenshipYears || "5"} Years</span>
                        </div>
                        <div className="flex flex-col border-t border-border/40 pt-1.5 mt-1.5 space-y-1">
                          <span className="text-[10px] text-muted-foreground">Primary PR Route:</span>
                          <span className="font-semibold text-foreground truncate">{pr.primaryPathwayName || "Skilled Immigration"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Module 3: Dhaka Visa Risks */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Dhaka Visa & Constraints
                      </h4>
                      <div className="bg-muted/40 p-3 rounded-lg space-y-2 text-xs">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground">Dhaka Wait Time:</span>
                          <span className="font-bold text-destructive">{visa.dhakaEmbassyWaitTime || "2-3 Months"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rejection Rate:</span>
                          <span className="font-semibold text-foreground">{visa.rejectionRateDisplay || "Moderate"}</span>
                        </div>
                        {visa.requiredDocumentShortlist && (
                          <div className="flex flex-col border-t border-border/40 pt-1.5 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">Critical Document:</span>
                            <span className="text-foreground font-semibold leading-tight mt-0.5">
                              {visa.requiredDocumentShortlist[0] || "Police Clearance"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Module 4: Job Market & Salaries */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        AI Job Market & Careers
                      </h4>
                      <div className="bg-muted/40 p-3 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Market Score:</span>
                          <span className="font-bold text-foreground">{summary.jobMarketScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Median Salary:</span>
                          <span className="font-bold text-foreground">
                            {summary.medianSalary ? `${summary.medianSalary.toLocaleString()} ${summary.medianSalaryCurrency}` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BDT Equiv:</span>
                          <span className="font-bold text-emerald-400">
                            {summary.medianSalary ? convertToBdt(summary.medianSalary, summary.medianSalaryCurrency) : "N/A"} / yr
                          </span>
                        </div>
                        <div className="flex flex-col border-t border-border/40 pt-1.5 mt-1.5 space-y-1">
                          <span className="text-[10px] text-muted-foreground">Top AI Hub:</span>
                          <span className="font-semibold text-foreground truncate">{jobMarket.majorHubs?.[0] || "Capital Region"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Module 5: Family Rights */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Family Relocation
                      </h4>
                      <div className="bg-muted/40 p-3 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Allows Spouse Work:</span>
                          <span className={`font-bold ${summary.allowsSpouseWork ? "text-emerald-400" : "text-destructive"}`}>
                            {summary.allowsSpouseWork ? "YES" : "NO"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dependent Children:</span>
                          <span className={`font-bold ${summary.allowsDependentChildren ? "text-emerald-400" : "text-destructive"}`}>
                            {summary.allowsDependentChildren ? "YES" : "NO"}
                          </span>
                        </div>
                        <div className="flex flex-col border-t border-border/40 pt-1.5 mt-1.5 space-y-1">
                          <span className="text-[10px] text-muted-foreground">Best Time to Relocate:</span>
                          <span className="font-semibold text-foreground truncate">{family.spouseVisaDetails || "Post Graduation"}</span>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Visual SVG Comparison Chart */}
          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Score Visual Matrix</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Visual parameter scores compared side-by-side.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {comparedData.map((data) => {
                const summary = data.summary || {};
                return (
                  <div key={data.countryCode} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{data.country}</span>
                      <span className="text-muted-foreground">Overall Score: {data.overallScore}/100</span>
                    </div>
                    {/* Visual bar comparisons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      {/* PR Score */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>PR Ease</span>
                          <span>{summary.prScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${summary.prScore}%` }} />
                        </div>
                      </div>
                      {/* Job Market */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>AI Job Market</span>
                          <span>{summary.jobMarketScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${summary.jobMarketScore}%` }} />
                        </div>
                      </div>
                      {/* Living cost relative */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Living Cost Index</span>
                          <span>{summary.housingScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${summary.housingScore}%` }} />
                        </div>
                      </div>
                      {/* Future proof */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Future Outlook</span>
                          <span>{summary.futureProofScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${summary.futureProofScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="Select Countries to Compare"
          description="Use the country checklist selector above to add up to 3 countries for side-by-side matrices."
          className="py-16"
        />
      )}

    </div>
  );
}
