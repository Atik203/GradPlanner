"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { setMatchScores } from "@/lib/store/slices/countryMatchSlice";
import { computeCountryMatchScore } from "@/lib/matchScore";
import { MatchBreakdownPopover } from "@/components/countries/MatchBreakdownPopover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Globe,
  ArrowRight,
  SlidersHorizontal,
  ArrowUpDown,
  User,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import Link from "next/link";
import { CountryFlag } from "@/components/shared/CountryFlag";
import { CountrySkeleton } from "@/components/skeletons/CountrySkeleton";

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
    scholarshipScore: number;
    admissionScore: number;
    familyScore: number;
    allowsSpouseWork: boolean;
  };
}

const BDT_RATES: Record<string, number> = {
  USD: 125, EUR: 136, CAD: 92, AUD: 83, SEK: 11.9,
  NOK: 11.7, DKK: 18.2, CHF: 138, NZD: 76, JPY: 0.81,
  KRW: 0.091, SGD: 93, CNY: 17.3, AED: 34.0, GBP: 160,
};

type SortMode = "match" | "overall" | "pr" | "funding";

export default function CountryExplorerPage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile.profile);
  const matchScores = useAppSelector((s) => s.countryMatch.scores);

  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("match");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, profileData] = await Promise.all([
          fetchApi("/api/v1/countries"),
          fetchApi("/api/v1/profile"),
        ]);
        const countryList: CountryEntry[] = data || [];
        setCountries(countryList);
        dispatch(setProfile(profileData));

        // Compute match scores for all countries
        const scores: Record<string, ReturnType<typeof computeCountryMatchScore>> = {};
        for (const c of countryList) {
          scores[c.countryCode] = computeCountryMatchScore(profileData || {}, {
            countryCode: c.countryCode,
            overallScore: c.overallScore,
            summary: c.summary as any,
          });
        }
        dispatch(setMatchScores(scores));
      } catch (err) {
        console.error(err);
        setError("Failed to load country explorer data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  const convertToBdtMonthly = (amount: number, currencyStr: string) => {
    const base = currencyStr?.split("/")[0]?.trim() || "USD";
    const rate = BDT_RATES[base] || 1;
    const result = amount * rate;
    if (result >= 100000) return `${(result / 100000).toFixed(1)}L BDT/mo`;
    return `${Math.round(result).toLocaleString()} BDT/mo`;
  };

  const profileHasMatchData = !!(
    profile?.cgpa || profile?.ieltsScore || (profile?.researchInterests?.length ?? 0) > 0
  );

  const filteredAndSorted = useMemo(() => {
    let list = countries.filter((c) => {
      const matchesSearch = c.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === "All" || c.summary?.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "match") {
        const sa = matchScores[a.countryCode]?.score ?? a.overallScore;
        const sb = matchScores[b.countryCode]?.score ?? b.overallScore;
        return sb - sa;
      }
      if (sortMode === "pr")      return (b.summary?.prScore ?? 0) - (a.summary?.prScore ?? 0);
      if (sortMode === "funding") return (b.summary?.scholarshipScore ?? 0) - (a.summary?.scholarshipScore ?? 0);
      return b.overallScore - a.overallScore;
    });
    return list;
  }, [countries, searchQuery, selectedContinent, sortMode, matchScores]);

  const continents = ["All", ...Array.from(new Set(countries.map((c) => c.summary?.continent).filter(Boolean)))];

  if (loading) {
    return <CountrySkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent sm:text-3xl">
            Country Explorer
          </h2>
          <p className="text-muted-foreground text-sm">
            {profileHasMatchData
              ? "Sorted by your personal match score — based on CGPA, IELTS, research interests & priorities."
              : "Showing generic scores. Complete your profile to see personalised match scores."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {!profileHasMatchData && (
            <Link href="/dashboard/profile">
              <Button variant="outline" className="h-9 text-xs flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer">
                <User className="h-3.5 w-3.5" />
                Complete Profile
              </Button>
            </Link>
          )}
          <Link href="/dashboard/countries/compare">
            <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-sm cursor-pointer h-9">
              Launch Compare Tool
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <ApiErrorAlert error={error} />
      )}

      {/* Filter / Search Bar */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
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
                <option key={cont} value={cont}>{cont}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
            >
              <option value="match">Sort: Your Match %</option>
              <option value="overall">Sort: Overall Score</option>
              <option value="pr">Sort: PR Pathway</option>
              <option value="funding">Sort: Funding</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Countries Grid */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredAndSorted.map((c) => {
            const sum = c.summary || {};
            const matchResult = matchScores[c.countryCode];
            const displayScore = matchResult?.score ?? c.overallScore;
            const isPersonalised = !!matchResult;

            return (
              <Card
                key={c.countryCode}
                className="border-border/60 bg-card/25 hover:bg-card/45 hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-xs group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    {/* Personal match badge with popover */}
                    {matchResult ? (
                      <MatchBreakdownPopover result={matchResult} countryName={c.country} />
                    ) : (
                      <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                        Score: {c.overallScore}%
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-semibold">{sum.continent}</span>
                  </div>
                  <CardTitle className="text-lg font-black text-foreground flex items-center gap-2.5">
                    <CountryFlag country={c.countryCode} className="h-6 w-9 rounded border border-border/20 shadow-sm shrink-0" />
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
                        {sum.averageLivingCost
                          ? convertToBdtMonthly(sum.averageLivingCost, sum.averageLivingCostCurrency)
                          : "N/A"}
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
          <p className="text-sm font-semibold text-foreground">No countries match your filters.</p>
          <Button
            variant="ghost"
            onClick={() => { setSearchQuery(""); setSelectedContinent("All"); }}
            className="text-primary text-xs mt-2 cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      )}

    </div>
  );
}
