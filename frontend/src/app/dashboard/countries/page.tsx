"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Search, 
  Globe, 
  ArrowRight, 
  SlidersHorizontal, 
  Coins, 
  ShieldCheck, 
  TrendingUp 
} from "lucide-react";
import Link from "next/link";

interface CountryEntry {
  id: string;
  country: string;
  countryCode: string;
  overallScore: number;
  summary: {
    summary: string;
    continent: string;
    averageLivingCost: number;
    averageLivingCostCurrency: string;
    prScore: number;
    jobMarketScore: number;
    allowsSpouseWork: boolean;
  };
}

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

export default function CountryExplorerPage() {
  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All");

  useEffect(() => {
    async function loadCountries() {
      try {
        setLoading(true);
        const data = await fetchApi("/api/v1/countries");
        setCountries(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load country explorer data.");
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
  }, []);

  const getCurrencyRate = (currencyStr: string) => {
    const base = currencyStr?.split("/")[0]?.trim() || "USD";
    return BDT_RATES[base] || 1;
  };

  const convertToBdtMonthly = (amount: number, currencyStr: string) => {
    const rate = getCurrencyRate(currencyStr);
    const result = amount * rate;
    if (result >= 100000) {
      return `${(result / 100000).toFixed(1)}L BDT/mo`;
    }
    return `${Math.round(result).toLocaleString()} BDT/mo`;
  };

  // Filter countries
  const filteredCountries = countries.filter((c) => {
    const matchesSearch = c.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContinent = selectedContinent === "All" || c.summary?.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  const continents = ["All", ...Array.from(new Set(countries.map((c) => c.summary?.continent).filter(Boolean)))];

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
          <h2 className="text-2xl font-bold tracking-tight text-gradient bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent sm:text-3xl">
            Country Explorer
          </h2>
          <p className="text-muted-foreground text-sm">
            Evaluate cost of living, AI job market, visa constraints, and PR pathways tailored for Bangladeshi students.
          </p>
        </div>
        <Link href="/dashboard/countries/compare">
          <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-sm cursor-pointer h-9">
            Launch Compare Tool
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Filter / Search Bar */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by country name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border text-foreground text-xs h-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
            >
              {continents.map((cont) => (
                <option key={cont} value={cont}>
                  {cont}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Countries Grid */}
      {filteredCountries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCountries.map((c) => {
            const sum = c.summary || {};
            return (
              <Card key={c.countryCode} className="border-border/60 bg-card/25 hover:bg-card/45 hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-xs group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                      Fit Match: {c.overallScore}%
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{sum.continent}</span>
                  </div>
                  <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                    <span>📍</span>
                    {c.country}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-3 h-12 mt-1">
                    {sum.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-end space-y-4 pt-0">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] border-t border-border/30 pt-3">
                    <div className="bg-muted/40 p-1.5 rounded-md">
                      <span className="text-muted-foreground block font-semibold">Living Cost</span>
                      <span className="font-extrabold text-foreground block truncate mt-0.5">
                        {sum.averageLivingCost ? convertToBdtMonthly(sum.averageLivingCost, sum.averageLivingCostCurrency) : "N/A"}
                      </span>
                    </div>
                    <div className="bg-muted/40 p-1.5 rounded-md">
                      <span className="text-muted-foreground block font-semibold">PR Score</span>
                      <span className="font-extrabold text-blue-400 block mt-0.5">{sum.prScore}/100</span>
                    </div>
                    <div className="bg-muted/40 p-1.5 rounded-md">
                      <span className="text-muted-foreground block font-semibold">AI Market</span>
                      <span className="font-extrabold text-purple-400 block mt-0.5">{sum.jobMarketScore}/100</span>
                    </div>
                  </div>

                  <Link href={`/dashboard/countries/${c.country.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                    <Button className="w-full bg-muted border border-border hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all">
                      Analyze Advisor Report
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/10 border border-border/60 border-dashed rounded-xl">
          <Globe className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">No countries match your search filters.</p>
          <Button variant="ghost" onClick={() => { setSearchQuery(""); setSelectedContinent("All"); }} className="text-primary text-xs mt-2 cursor-pointer">
            Reset Filters
          </Button>
        </div>
      )}

    </div>
  );
}
