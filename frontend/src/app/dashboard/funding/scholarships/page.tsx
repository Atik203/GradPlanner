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
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import type { Scholarship } from "@/types/countries";

interface CountrySummary {
  id: string;
  country: string;
  countryCode: string;
}

const COMPETITION_COLORS: Record<string, string> = {
  VERY_LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MODERATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  VERY_HIGH: "bg-destructive/10 text-destructive border-destructive/20",
  EXTREMELY_HIGH: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatBDT(amount: number): string {
  if (amount >= 100000) return `${(amount / 100000).toFixed(2)} Lakh`;
  return `${Math.round(amount).toLocaleString()}`;
}

export default function ScholarshipHubPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [activeTab, setActiveTab] = useState<"checker" | "browse">("checker");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Checker inputs
  const [checkerInputs, setCheckerInputs] = useState({
    degreeLevel: "MSc",
    cgpa: 3.5,
    ielts: 6.5,
    workExp: 0,
    publications: 0,
  });

  const [checkerResults, setCheckerResults] = useState<any[]>([]);
  const [checkerLoading, setCheckerLoading] = useState(false);

  // Expandable calculator cost panel ID
  const [expandedCostId, setExpandedCostId] = useState<string | null>(null);

  // Browse Tab states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [fullyFundedOnly, setFullyFundedOnly] = useState(false);
  const [bdEligibleOnly, setBdEligibleOnly] = useState(true);

  // Initialize inputs from user profile if available
  useEffect(() => {
    if (profile) {
      setCheckerInputs({
        degreeLevel: profile.targetDegree?.toLowerCase().includes("phd") ? "PhD" : "MSc",
        cgpa: profile.cgpa ?? 3.5,
        ielts: profile.ieltsScore ?? 6.5,
        workExp: 0,
        publications: 0,
      });
    }
  }, [profile]);

  // Load countries reference list
  useEffect(() => {
    async function loadCountries() {
      try {
        const countryList = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(countryList || []);
      } catch (err) {
        console.error("Failed to load country summaries", err);
      }
    }
    loadCountries();
  }, []);

  // Fetch Checker Results with a 300ms debounce when parameters change
  useEffect(() => {
    let active = true;
    setCheckerLoading(true);

    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          degreeLevel: checkerInputs.degreeLevel,
          cgpa: checkerInputs.cgpa.toString(),
          ielts: checkerInputs.ielts.toString(),
          workExp: checkerInputs.workExp.toString(),
          publications: checkerInputs.publications.toString(),
        }).toString();

        const data = await fetchApi(`/api/v1/scholarships/checker?${query}`);
        if (active && data?.results) {
          setCheckerResults(data.results);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (active) setError("Failed to compute scholarship eligibility calculations.");
      } finally {
        if (active) {
          setCheckerLoading(false);
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [checkerInputs]);

  // Browse list filtered dataset
  const browseFiltered = useMemo(() => {
    return checkerResults.map(r => r.scholarship).filter((s: Scholarship) => {
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
  }, [checkerResults, filterCountry, filterLevel, fullyFundedOnly, bdEligibleOnly, searchQuery]);

  // Overall metric cards for Checker Results
  const checkerStats = useMemo(() => {
    const total = checkerResults.length;
    const eligible = checkerResults.filter((r) => r.isEligible).length;
    const fullyFunded = checkerResults.filter((r) => {
      const type = r.scholarship.type || r.scholarship.fundingType || "";
      return type.includes("FULL") && r.isEligible;
    }).length;
    const averageMatch = total > 0 
      ? Math.round(checkerResults.reduce((acc, r) => acc + r.matchPercent, 0) / total) 
      : 0;

    return { total, eligible, fullyFunded, averageMatch };
  }, [checkerResults]);

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
        title="Scholarship Hub"
        description="Personalized scholarship checker and out-of-pocket funding gap calculator for Bangladeshi CS applicants."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-border/40 pb-2">
        <div className="flex bg-muted/40 p-1 rounded-xl border border-border/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("checker")}
            className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
              activeTab === "checker"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Eligibility Checker
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
              activeTab === "browse"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Browse Database
          </button>
        </div>
      </div>

      {activeTab === "checker" ? (
        <div className="space-y-6">
          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={Award} label="Total Scholarships" value={checkerStats.total} color="default" />
            <MetricCard icon={ShieldCheck} label="Eligible Programs" value={checkerStats.eligible} color="success" />
            <MetricCard icon={Coins} label="Eligible Fully Funded" value={checkerStats.fullyFunded} color="info" />
            <MetricCard icon={Star} label="Avg Match Score" value={`${checkerStats.averageMatch}%`} color="warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Parameters Controller (1/3 Width) */}
            <Card className="border-border/60 bg-card/25 backdrop-blur-md lg:sticky lg:top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Profile Parameters
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Adjust sliders to recalculate match percentages and financial gaps dynamically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Degree Target */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Target Degree</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["MSc", "PhD"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setCheckerInputs((prev) => ({ ...prev, degreeLevel: lvl }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                          checkerInputs.degreeLevel === lvl
                            ? "bg-primary border-primary text-primary-foreground shadow"
                            : "bg-background border-border text-foreground hover:bg-muted/45"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CGPA Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">CGPA (4.00 Scale)</label>
                    <span className="text-xs font-black text-primary">{checkerInputs.cgpa.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="2.00"
                    max="4.00"
                    step="0.05"
                    value={checkerInputs.cgpa}
                    onChange={(e) => setCheckerInputs((prev) => ({ ...prev, cgpa: parseFloat(e.target.value) }))}
                    className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>2.00</span>
                    <span>3.00</span>
                    <span>4.00</span>
                  </div>
                </div>

                {/* IELTS Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">IELTS Target/Score</label>
                    <span className="text-xs font-black text-primary">{checkerInputs.ielts.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.5"
                    value={checkerInputs.ielts}
                    onChange={(e) => setCheckerInputs((prev) => ({ ...prev, ielts: parseFloat(e.target.value) }))}
                    className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>4.0</span>
                    <span>6.5</span>
                    <span>9.0</span>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Work Experience</label>
                  <select
                    value={checkerInputs.workExp}
                    onChange={(e) => setCheckerInputs((prev) => ({ ...prev, workExp: parseInt(e.target.value, 10) }))}
                    className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5].map((val, idx) => (
                      <option key={idx} value={idx}>{val} {idx === 1 ? "Year" : "Years"}{idx === 5 ? "+" : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Research Publications */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Publications count</label>
                  <select
                    value={checkerInputs.publications}
                    onChange={(e) => setCheckerInputs((prev) => ({ ...prev, publications: parseInt(e.target.value, 10) }))}
                    className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5].map((val, idx) => (
                      <option key={idx} value={idx}>{val} {idx === 1 ? "Paper" : "Papers"}{idx === 5 ? "+" : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Reset button */}
                {profile && (
                  <button
                    onClick={() => setCheckerInputs({
                      degreeLevel: profile.targetDegree?.toLowerCase().includes("phd") ? "PhD" : "MSc",
                      cgpa: profile.cgpa ?? 3.5,
                      ielts: profile.ieltsScore ?? 6.5,
                      workExp: 0,
                      publications: 0,
                    })}
                    className="w-full py-2 px-3 rounded-lg border border-border bg-muted/20 text-[10px] font-black text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer"
                  >
                    Reset to Profile Defaults
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Right Matching List (2/3 Width) */}
            <div className="lg:col-span-2 space-y-4">
              {checkerLoading ? (
                <div className="flex h-[30vh] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : checkerResults.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No scholarships found"
                  description="We couldn't retrieve any scholarship entries. Verify your connection or try again."
                />
              ) : (
                checkerResults.map((r, idx) => {
                  const s = r.scholarship as Scholarship;
                  const financials = r.financials;
                  const matchPercent = r.matchPercent;
                  const isEligible = r.isEligible;
                  
                  const isFullyFunded = s.type?.includes("FULL") || s.fundingType?.includes("FULL");
                  const levels = s.degreeLevel || s.degreeLevels || [];
                  const compColor = COMPETITION_COLORS[s.competitionLevel] || "bg-muted text-muted-foreground border-border/20";
                  
                  // Score color scheme
                  const scoreColor = matchPercent >= 85 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : matchPercent >= 60 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                    : "bg-destructive/10 border-destructive/20 text-destructive-foreground text-red-400";

                  const isExpanded = expandedCostId === s.id;

                  return (
                    <Card 
                      key={s.id || idx} 
                      className={`border transition-all duration-300 ${
                        isEligible 
                          ? "border-emerald-500/20 bg-emerald-500/[0.01] hover:bg-emerald-500/[0.03] hover:border-emerald-500/40" 
                          : "border-border/60 bg-card/25 hover:bg-card/45 hover:border-primary/20"
                      }`}
                    >
                      <CardContent className="p-5 space-y-4">
                        {/* Title Section */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                isFullyFunded ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-muted/50 text-muted-foreground border-border/30"
                              }`}>
                                {isFullyFunded ? "FULLY FUNDED" : (s.type || "PARTIAL").replace(/_/g, " ")}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-bold">{s.country}</span>
                            </div>
                            <h3 className="text-sm font-black text-foreground">{s.scholarshipName}</h3>
                            <p className="text-[10px] text-muted-foreground">{s.provider || "Bilateral Program"}</p>
                          </div>

                          {/* Match Gauge */}
                          <div className="shrink-0 text-right">
                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-black border ${scoreColor}`}>
                              {matchPercent}% Match
                            </span>
                            <span className="block text-[8px] text-muted-foreground mt-1 font-bold">
                              {isEligible ? "ELIGIBLE" : "GAPS IDENTIFIED"}
                            </span>
                          </div>
                        </div>

                        {/* Met Strengths */}
                        {r.strengths && r.strengths.length > 0 && (
                          <div className="bg-emerald-500/[0.03] border border-emerald-500/10 text-[10px] text-emerald-300 rounded-lg p-3 space-y-1">
                            <span className="font-black block uppercase text-[8px] tracking-wider text-emerald-400 mb-1">Met Eligibility Criteria:</span>
                            {r.strengths.map((str: string, sIdx: number) => (
                              <div key={sIdx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Missing Gaps */}
                        {r.gaps && r.gaps.length > 0 && (
                          <div className="bg-amber-500/[0.03] border border-amber-500/10 text-[10px] text-amber-200/90 rounded-lg p-3 space-y-1">
                            <span className="font-black block uppercase text-[8px] tracking-wider text-amber-400 mb-1">Missing / Gap Requirements:</span>
                            {r.gaps.map((gap: string, gIdx: number) => (
                              <div key={gIdx} className="flex items-start gap-1.5">
                                <XCircle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                                <span>{gap}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cost & Funding Calculator Button */}
                        <div className="border-t border-border/30 pt-3">
                          <button
                            onClick={() => setExpandedCostId(isExpanded ? null : (s.id || ""))}
                            className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-primary/80 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                Hide Cost & Funding Calculator
                                <ChevronUp className="h-3.5 w-3.5" />
                              </>
                            ) : (
                              <>
                                Show Cost & Funding Calculator
                                <ChevronDown className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>

                          {/* Cost Calculator Expanded Panel */}
                          {isExpanded && (
                            <div className="mt-3 bg-muted/20 border border-border/30 rounded-lg p-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-2 gap-3 text-[10px] border-b border-border/20 pb-2.5">
                                <div>
                                  <span className="text-muted-foreground block font-bold">Estimated Annual Cost</span>
                                  <div className="space-y-0.5 mt-1">
                                    <div className="flex justify-between text-[9px]">
                                      <span>Tuition Cost:</span>
                                      <span className="font-semibold text-foreground">${financials.annualTuitionCostUSD.toLocaleString()} / yr</span>
                                    </div>
                                    <div className="flex justify-between text-[9px]">
                                      <span>Living Costs (Shared):</span>
                                      <span className="font-semibold text-foreground">${financials.annualLivingCostUSD.toLocaleString()} / yr</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] border-t border-border/10 pt-1 font-bold">
                                      <span>Total Cost:</span>
                                      <span className="text-foreground">${financials.annualTotalCostUSD.toLocaleString()} / yr</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-l border-border/20 pl-3">
                                  <span className="text-muted-foreground block font-bold">Scholarship Coverage</span>
                                  <div className="space-y-0.5 mt-1">
                                    <div className="flex justify-between text-[9px]">
                                      <span>Tuition Covered:</span>
                                      <span className="font-semibold text-emerald-400">${financials.annualTuitionCoverageUSD.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px]">
                                      <span>Stipend Coverage:</span>
                                      <span className="font-semibold text-emerald-400">${financials.annualStipendCoverageUSD.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] border-t border-border/10 pt-1 font-bold">
                                      <span>Total Funding:</span>
                                      <span className="text-emerald-400">${financials.annualTotalCoverageUSD.toLocaleString()} / yr</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Net out of pocket gap */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[9px] font-black uppercase text-muted-foreground block">Net Out-of-Pocket Gap</span>
                                  <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-sm font-black text-foreground">
                                      ${financials.netAnnualGapUSD.toLocaleString()} / yr
                                    </span>
                                    <span className={`text-[10px] font-black ${financials.netAnnualGapBDT === 0 ? "text-emerald-400" : "text-destructive"}`}>
                                      (৳{formatBDT(financials.netAnnualGapBDT)} / yr)
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  {financials.netAnnualGapUSD === 0 ? (
                                    <span className="inline-flex px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-black text-[9px] border border-emerald-500/20">
                                      100% FUNDED
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 rounded bg-destructive/10 text-red-400 font-black text-[9px] border border-destructive/20">
                                      PARTIAL GAP
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* General details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] border-t border-border/30 pt-3">
                          <div className="bg-muted/15 p-2 rounded border border-border/10">
                            <span className="text-muted-foreground block">Academic Level</span>
                            <span className="font-black text-foreground">{levels.join(", ") || "Graduate"}</span>
                          </div>
                          <div className="bg-muted/15 p-2 rounded border border-border/10">
                            <span className="text-muted-foreground block">Annual Awards</span>
                            <span className="font-black text-foreground">{s.annualAwards || "Unspecified"}</span>
                          </div>
                          <div className="bg-muted/15 p-2 rounded border border-border/10">
                            <span className="text-muted-foreground block">Competition</span>
                            <span className={`font-black uppercase ${compColor.split(" ")[1]}`}>
                              {(s.competitionLevel || "").replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="bg-muted/15 p-2 rounded border border-border/10">
                            <span className="text-muted-foreground block">Success Rate</span>
                            <span className="font-black text-foreground">{s.successRateEstimate || "Highly competitive"}</span>
                          </div>
                        </div>

                        {/* Recommendation Callout */}
                        {s.recommendation && (
                          <div className="text-[9px] border-t border-border/20 pt-2 flex items-start gap-1.5 text-muted-foreground">
                            <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>
                              <strong className="text-foreground">Recommendation: </strong>
                              {s.recommendation}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Legacy Browse Tab Dataset */
        <div className="space-y-6">
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
                    className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
                  >
                    <option value="All">All Countries</option>
                    {countries.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
                    ))}
                  </select>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
                  >
                    <option value="All">All Levels</option>
                    <option value="MSc">MSc</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={fullyFundedOnly}
                    onChange={(e) => setFullyFundedOnly(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                  />
                  Fully Funded Only
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={bdEligibleOnly}
                    onChange={(e) => setBdEligibleOnly(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                  />
                  Bangladesh Eligible Only
                </label>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {browseFiltered.length} results
                </span>
              </div>
            </CardContent>
          </Card>

          {browseFiltered.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No scholarships match your filters"
              description="Try broadening your search or clearing filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {browseFiltered.map((s, idx) => {
                const isFullyFunded = s.type?.includes("FULL") || s.fundingType?.includes("FULL");
                const levels = s.degreeLevel || s.degreeLevels || [];
                const compColor = COMPETITION_COLORS[s.competitionLevel] || "bg-muted text-muted-foreground border-border/20";

                return (
                  <Card key={s.id || idx} className="border-border/60 bg-card/25 hover:bg-card/40 hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          isFullyFunded ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-muted/50 text-muted-foreground border-border/30"
                        }`}>
                          {isFullyFunded ? "FULLY FUNDED" : (s.type || "SCHOLARSHIP").replace(/_/g, " ")}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-black shrink-0">{s.country}</span>
                      </div>
                      <CardTitle className="text-xs font-black text-foreground line-clamp-2">{s.scholarshipName}</CardTitle>
                      <CardDescription className="text-[9px] text-muted-foreground line-clamp-1">{s.provider || ""}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end space-y-3 pt-0">
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] border-t border-border/30 pt-3">
                        <div className="bg-muted/15 p-1.5 rounded border border-border/10">
                          <span className="text-muted-foreground block text-[8px]">Level</span>
                          <span className="font-black text-foreground">{levels.join(", ") || "N/A"}</span>
                        </div>
                        <div className="bg-muted/15 p-1.5 rounded border border-border/10">
                          <span className="text-muted-foreground block text-[8px]">Awards/yr</span>
                          <span className="font-black text-foreground">{s.annualAwards || "N/A"}</span>
                        </div>
                        <div className="bg-muted/15 p-1.5 rounded border border-border/10">
                          <span className="text-muted-foreground block text-[8px]">Competition</span>
                          <span className={`font-black ${compColor.split(" ")[1]}`}>
                            {(s.competitionLevel || "").replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="bg-muted/15 p-1.5 rounded border border-border/10">
                          <span className="text-muted-foreground block text-[8px]">Success Rate</span>
                          <span className="font-black text-foreground">{s.successRateEstimate || "N/A"}</span>
                        </div>
                      </div>

                      {s.bangladeshEligible !== false && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-black pt-1">
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>Bangladesh Eligible</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
