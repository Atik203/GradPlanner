"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Award,
  Loader2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Globe,
  ExternalLink,
  Star,
  Coins,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import type { Scholarship } from "@/types/countries";

interface CountrySummary {
  id: string;
  country: string;
  countryCode: string;
}

const COMPETITION_COLORS: Record<string, string> = {
  VERY_LOW: "bg-emerald-500/10 text-emerald-400",
  LOW: "bg-emerald-500/10 text-emerald-400",
  MODERATE: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  VERY_HIGH: "bg-destructive/10 text-destructive",
  EXTREMELY_HIGH: "bg-destructive/10 text-destructive",
};

export default function ActiveScholarshipsPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [fullyFundedOnly, setFullyFundedOnly] = useState(false);
  const [bdEligibleOnly, setBdEligibleOnly] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const countryList = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(countryList || []);

        const allS: Scholarship[] = [];
        for (const c of countryList || []) {
          try {
            const detail = await fetchApi(`/api/v1/countries/${c.countryCode}`);
            if (detail?.scholarships && Array.isArray(detail.scholarships)) {
              allS.push(...detail.scholarships);
            }
          } catch {
            // skip countries with no scholarship data
          }
        }
        setAllScholarships(allS);
      } catch (err) {
        setError("Failed to load scholarship data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return allScholarships.filter((s) => {
      if (filterCountry !== "All" && s.countryCode !== filterCountry) return false;
      if (filterLevel !== "All") {
        const levels = s.degreeLevel || s.degreeLevels || [];
        if (!levels.some((l) => l.toLowerCase().includes(filterLevel.toLowerCase()))) return false;
      }
      if (fullyFundedOnly) {
        const type = s.type || s.fundingType || "";
        if (!type.includes("FULL")) return false;
      }
      if (bdEligibleOnly && s.bangladeshEligible === false && s.eligibilityForBD === false) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (s.scholarshipName || "").toLowerCase();
        const provider = (s.provider || "").toLowerCase();
        const fields = (s.fieldsCovered || []).join(" ").toLowerCase();
        if (!name.includes(q) && !provider.includes(q) && !fields.includes(q)) return false;
      }
      return true;
    });
  }, [allScholarships, filterCountry, filterLevel, fullyFundedOnly, bdEligibleOnly, searchQuery]);

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
        icon={Award}
        title="Active Scholarships"
        description="Browse active scholarships filtered by country, field of study, and eligibility for Bangladeshi students."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, provider, or field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border text-foreground text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
              >
                <option value="All">All Countries</option>
                {countries.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
                ))}
              </select>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="MSc">MSc</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={fullyFundedOnly}
                onChange={(e) => setFullyFundedOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
              />
              Fully Funded Only
            </label>
            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={bdEligibleOnly}
                onChange={(e) => setBdEligibleOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
              />
              Bangladesh Eligible
            </label>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {filtered.length} results
            </span>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Award}
          title={allScholarships.length === 0 ? "No scholarship data loaded" : "No scholarships match your filters"}
          description={allScholarships.length === 0 ? "Scholarship data is being prepared. Check back soon." : "Try broadening your search or clearing filters."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 48).map((s, idx) => {
            const type = s.type || s.fundingType || "";
            const isFullyFunded = type.includes("FULL");
            const levels = s.degreeLevel || s.degreeLevels || [];
            const compColor = COMPETITION_COLORS[s.competitionLevel] || "bg-muted text-muted-foreground";

            return (
              <Card key={s.id || idx} className="border-border/60 bg-card/25 hover:bg-card/40 hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isFullyFunded ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"
                    }`}>
                      {isFullyFunded ? "FULLY FUNDED" : (type || "SCHOLARSHIP").replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold shrink-0">{s.country}</span>
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground line-clamp-2">{s.scholarshipName}</CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground">{s.provider || ""}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-3 pt-0">
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-border/30 pt-3">
                    <div className="bg-muted/30 p-1.5 rounded">
                      <span className="text-muted-foreground block">Level</span>
                      <span className="font-bold text-foreground">{levels.join(", ") || "N/A"}</span>
                    </div>
                    <div className="bg-muted/30 p-1.5 rounded">
                      <span className="text-muted-foreground block">Awards/yr</span>
                      <span className="font-bold text-foreground">{s.annualAwards || "N/A"}</span>
                    </div>
                    <div className="bg-muted/30 p-1.5 rounded">
                      <span className="text-muted-foreground block">Competition</span>
                      <span className={`font-bold ${compColor.split(" ")[1]}`}>
                        {(s.competitionLevel || "").replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="bg-muted/30 p-1.5 rounded">
                      <span className="text-muted-foreground block">Success Rate</span>
                      <span className="font-bold text-foreground">{s.successRateEstimate || "N/A"}</span>
                    </div>
                  </div>

                  {s.bangladeshEligible !== false && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span className="font-semibold">Bangladesh Eligible</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
