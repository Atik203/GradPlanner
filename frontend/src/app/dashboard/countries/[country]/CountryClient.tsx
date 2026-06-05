"use client";

import React, { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/store";
import { 
  Globe, School, Award, TrendingUp, Sparkles, Briefcase, Coins,
  FileText, ShieldCheck, Users, MapPin, Calculator, AlertTriangle,
  Clock, CheckCircle2, Calendar, ArrowLeft, ArrowRight, ArrowUpRight,
  UserCheck, HelpCircle, GraduationCap, Percent, DollarSign, Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TierBadge } from "@/components/badges/TierBadge";
import { FundingStatusBadge } from "@/components/badges/FundingStatusBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

// BDT Conversion Rates
const BDT_RATES: Record<string, number> = {
  USD: 125,
  EUR: 136,
  CAD: 92,
  AUD: 83,
  SEK: 11.9,
  NOK: 11.7,
  DKK: 18.2,
  CHF: 138,
  NZD: 76,
  JPY: 0.81,
  KRW: 0.091,
  SGD: 93,
  CNY: 17.3,
  AED: 34.0,
  GBP: 160
};

interface TabConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabsList: TabConfig[] = [
  { id: "overview", name: "Overview", icon: Globe },
  { id: "education", name: "Education", icon: School },
  { id: "scholarships", name: "Scholarships", icon: Award },
  { id: "research", name: "Research", icon: GraduationCap },
  { id: "ai-ecosystem", name: "AI Ecosystem", icon: Sparkles },
  { id: "job-market", name: "Job Market", icon: Briefcase },
  { id: "salary", name: "Salary Details", icon: Coins },
  { id: "visa", name: "Visa Process", icon: FileText },
  { id: "pr", name: "PR Pathway", icon: ShieldCheck },
  { id: "citizenship", name: "Citizenship", icon: UserCheck },
  { id: "family", name: "Family Migration", icon: Users },
  { id: "housing", name: "Housing Market", icon: MapPin },
  { id: "taxes", name: "Tax Calculator", icon: Calculator },
  { id: "risks", name: "Country Risks", icon: AlertTriangle },
  { id: "outlook", name: "Future Outlook", icon: Clock },
  { id: "docs", name: "Required Docs", icon: CheckCircle2 },
  { id: "timeline", name: "Application Timeline", icon: Calendar }
];

export function CountryClient({ countryData, slug }: { countryData: any, slug: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Dynamic user data from Redux
  const universities = useAppSelector((state) => state.universities.items) || [];
  const professors = useAppSelector((state) => state.professors.items) || [];
  const documents = useAppSelector((state) => state.documents.items) || [];

  if (!countryData) {
    notFound();
  }

  // Filter local user metrics for this country
  const countryName = countryData.summary?.country || slug;
  const countryUnis = universities.filter((u) => u.country.toLowerCase() === countryName.toLowerCase());
  const countryUniIds = new Set(countryUnis.map((u) => u.id));
  const countryProfs = professors.filter((p) => p.universityId && countryUniIds.has(p.universityId));
  const countryDocs = documents.filter((d) => !d.country || d.country.toLowerCase() === countryName.toLowerCase());

  const summary = countryData.summary || {};
  const currency = summary.medianSalaryCurrency || "USD";
  const rate = BDT_RATES[currency] || 1;

  // Local state for the dynamic tax calculator
  const [grossInput, setGrossInput] = useState<string>(() => {
    return summary.medianSalary ? String(summary.medianSalary) : "80000";
  });

  const getCurrencyRate = (currencyStr: string) => {
    const base = currencyStr?.split("/")[0]?.trim() || "USD";
    return BDT_RATES[base] || 1;
  };

  const formatBdt = (val: number, cur: string) => {
    const convRate = getCurrencyRate(cur);
    const result = val * convRate;
    if (result >= 100000) {
      return `${(result / 100000).toFixed(1)} Lakh BDT`;
    }
    return `${result.toLocaleString()} BDT`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Back to explore */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <span className="text-xs text-muted-foreground font-mono">Reference ID: {countryData.id}</span>
      </div>

      {/* 1. Hero & Header Section */}
      <div className="relative rounded-2xl border border-border/80 bg-linear-to-r from-muted/50 to-primary/5 p-8 overflow-hidden shadow-xs">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl shadow-xs">📍</span>
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight sm:text-4xl">
                  {countryData.country}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Continent: {summary.continent} · Population: {(summary.population / 1000000).toFixed(1)}M</p>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              {summary.summary}
            </p>

            {/* Sub-Metrics Progress Indicators */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">AI/ML Job Market:</span>
                  <span className="text-primary">{summary.jobMarketScore}%</span>
                </div>
                <div className="w-full bg-accent rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${summary.jobMarketScore}%` }} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">PR Pathway Speed:</span>
                  <span className="text-blue-400">{summary.prScore}%</span>
                </div>
                <div className="w-full bg-accent rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${summary.prScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Family Relocation:</span>
                  <span className="text-teal-400">{summary.familyScore}%</span>
                </div>
                <div className="w-full bg-accent rounded-full h-1.5">
                  <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${summary.familyScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Future-Proof Score:</span>
                  <span className="text-amber-400">{summary.futureProofScore}%</span>
                </div>
                <div className="w-full bg-accent rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${summary.futureProofScore}%` }} />
                </div>
              </div>
            </div>

          </div>

          {/* Radial Fit Ring (Overall Match) */}
          <div className="flex flex-col items-center justify-center bg-muted/40 rounded-xl p-6 border border-border/50 shadow-xs relative">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-border/30"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-primary transition-all duration-1000"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - countryData.overallScore / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-foreground">{countryData.overallScore}%</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Match Score</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 text-center">Calculated based on funding ratios, admissions ease, and PR accessibility for Bangladesh passport holders.</p>
          </div>

        </div>
      </div>

      {/* 2. Quick Insight Parameter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card/30 border border-border/60 rounded-xl p-4 text-center shadow-xs">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-widest">Average Tuition</span>
          <span className="font-extrabold text-sm text-foreground block mt-1 truncate">
            {countryData.livingCosts?.tuitionFeesRange || "Varies"}
          </span>
        </div>
        
        <div className="bg-card/30 border border-border/60 rounded-xl p-4 text-center shadow-xs">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-widest">Average Living Cost</span>
          <span className="font-extrabold text-sm text-emerald-400 block mt-1">
            {summary.averageLivingCost ? formatBdt(summary.averageLivingCost, summary.averageLivingCostCurrency) : "Unknown"} / mo
          </span>
        </div>

        <div className="bg-card/30 border border-border/60 rounded-xl p-4 text-center shadow-xs">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-widest">Tech Median Salary</span>
          <span className="font-extrabold text-sm text-foreground block mt-1">
            {summary.medianSalary ? `${summary.medianSalary.toLocaleString()} ${currency}` : "Unknown"}
          </span>
        </div>

        <div className="bg-card/30 border border-border/60 rounded-xl p-4 text-center shadow-xs">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-widest">Stay-Back Stay</span>
          <span className="font-extrabold text-sm text-foreground block mt-1">
            {countryData.postStudyWork?.durationStayBack || "18 Months"}
          </span>
        </div>

        <div className="bg-card/30 border border-border/60 rounded-xl p-4 text-center shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-widest">Citizenship Route</span>
          <span className="font-extrabold text-sm text-foreground block mt-1">
            {summary.citizenshipYears || "5"} Years
          </span>
        </div>
      </div>

      {/* 3. Side-by-Side tabbed layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar (Vertical Tabs) */}
        <div className="space-y-1 lg:col-span-1 overflow-x-auto lg:overflow-x-visible flex lg:flex-col gap-1 pb-2 border-b border-border/60 lg:border-b-0 lg:border-r lg:border-border/60 lg:pr-4 shrink-0 scrollbar-none">
          {tabsList.map((t) => {
            const IsActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all text-left ${
                  IsActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3 min-w-0">
          <Card className="border-border/60 bg-card/25 shadow-xs h-full">
            
            {/* Dynamic tab contents */}
            {activeTab === "overview" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Country Intelligence Overview</h3>
                  <p className="text-xs text-muted-foreground">General study and immigration evaluation parameters.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <p>{summary.evidenceSummary || "Detailed evidence summary is not found for this country."}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Primary Languages</h4>
                    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                      {summary.language?.map((lang: string) => (
                        <li key={lang}>{lang}</li>
                      )) || <li>English</li>}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Key Indicators</h4>
                    <div className="text-xs text-muted-foreground space-y-1.5">
                      <p>allows Spouse Work: <span className="font-semibold text-foreground">{summary.allowsSpouseWork ? "Yes" : "No"}</span></p>
                      <p>allows Dependent Children: <span className="font-semibold text-foreground">{summary.allowsDependentChildren ? "Yes" : "No"}</span></p>
                      <p>Years to citizenship: <span className="font-semibold text-foreground">{summary.citizenshipYears || "5"} Years</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            {activeTab === "education" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Education Ecosystem</h3>
                  <p className="text-xs text-muted-foreground">University tiers, averages and qualification benchmarks.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/40 p-4 rounded-xl text-center border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">QS Avg Rank</span>
                    <span className="text-xl font-black text-foreground block mt-1">#{countryData.ranking?.qsRankAvg || "—"}</span>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl text-center border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">THE Avg Rank</span>
                    <span className="text-xl font-black text-foreground block mt-1">#{countryData.ranking?.theRankAvg || "—"}</span>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl text-center border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">ARWU Avg Rank</span>
                    <span className="text-xl font-black text-foreground block mt-1">#{countryData.ranking?.arwuRankAvg || "—"}</span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission Criteria Summary</h4>
                  <div className="text-xs text-muted-foreground space-y-2 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/40">
                    <p><strong>Min GPA Criteria:</strong> Typically {countryData.ranking?.dimensionScores?.admissionFeasibility ? `${countryData.ranking.dimensionScores.admissionFeasibility}/100 admission feasibility score` : "3.0 / 4.0 GPA equivalent"}</p>
                    <p><strong>Language requirements:</strong> {countryData.language?.admissionRequirements?.english?.ielts?.overall ? `IELTS minimum score: ${countryData.language.admissionRequirements.english.ielts.overall}` : "IELTS 6.5+ average for tech courses"}</p>
                  </div>
                </div>
              </CardContent>
            )}

            {activeTab === "scholarships" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Scholarships & Funding Options</h3>
                  <p className="text-xs text-muted-foreground font-semibold text-primary">Fully funded or tuition waivers targeted at international graduates.</p>
                </div>
                {countryData.scholarships?.length > 0 ? (
                  <div className="space-y-4">
                    {countryData.scholarships.map((s: any, idx: number) => {
                      // Resolve field names — the seeded data uses scholarshipName, competitionLevel, etc.
                      const schName = s.scholarshipName || s.name || "Unnamed Scholarship";
                      const compLevel = s.competitionLevel || s.competitiveness || "High";
                      const fundingValue = s.funding?.totalAnnualValueUSD || s.amount || "See scholarship page";
                      // eligibility may be an object {gpa, languageRequirement, ...} or a string
                      const eligibilityText: string = typeof s.eligibility === "string"
                        ? s.eligibility
                        : [
                            s.eligibility?.gpa ? `GPA: ${s.eligibility.gpa}` : null,
                            s.eligibility?.languageRequirement ? `Language: ${s.eligibility.languageRequirement}` : null,
                            s.eligibility?.bangladeshSpecific ? `BD Note: ${s.eligibility.bangladeshSpecific}` : null,
                            s.eligibility?.supervisorRequired ? `Supervisor: ${s.eligibility.supervisorRequired}` : null,
                          ].filter(Boolean).join(" · ") || "See scholarship page for full eligibility criteria";
                      const successProb = s.strategicValue?.probabilityAssessment || s.bangladeshiSuccess || "Moderate";
                      const schType = s.type || "";
                      return (
                        <div key={idx} className="border border-border/55 rounded-xl p-4 bg-muted/20 hover:border-border transition-colors space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{schName}</h4>
                              {schType && <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">{schType.replace(/_/g, " ")}</span>}
                            </div>
                            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold shrink-0">
                              {compLevel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{eligibilityText}</p>
                          <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-border/30">
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Annual Funding Value:</span>
                              <span className="font-bold text-foreground">{fundingValue}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block">BD Success Probability:</span>
                              <span className="font-bold text-foreground text-xs line-clamp-2">{successProb}</span>
                            </div>
                          </div>
                          {s.recommendation && (
                            <p className="text-[10px] text-primary/80 font-semibold leading-relaxed border-t border-border/30 pt-2">{s.recommendation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Award}
                    title="No Scholarships Found"
                    description="No country-specific scholarships registered."
                    className="py-12"
                  />
                )}
              </CardContent>
            )}

            {activeTab === "research" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">STEM & AI Research Facilities</h3>
                  <p className="text-xs text-muted-foreground">National research agendas, hubs and supervisor outreach advice.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p><strong>Funding Level:</strong> {countryData.research?.researchFundingLevel || "High"}</p>
                  <p><strong>National Research Institutes:</strong> {countryData.research?.keyInstitutes?.join(", ") || "Various national universities"}</p>
                  <p><strong>Collaboration Opportunities:</strong> {countryData.research?.collaborationOpportunities || "Good industry connection"}</p>
                </div>
                {countryData.funding && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TA / RA stipends</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {countryData.funding.taRaAvailability || "TA and RA assistantships are typical for thesis track MSc and PhD. Contact professors directly prior to applying."}
                    </p>
                  </div>
                )}
              </CardContent>
            )}

            {activeTab === "ai-ecosystem" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">AI Ecosystem</h3>
                  <p className="text-xs text-muted-foreground">National AI strategy, investments and top tech hubs.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p><strong>National Strategy:</strong> {countryData.aiEcosystem?.nationalAiStrategy || "Focuses on industrial AI integration, smart healthcare, and autonomous systems."}</p>
                  <p><strong>Major Research Hubs:</strong> {countryData.aiEcosystem?.researchHubs?.join(", ") || "Varies by major city"}</p>
                  <p><strong>Major Companies hiring AI/ML:</strong> {countryData.aiEcosystem?.majorCompanies?.join(", ") || "Global technology companies"}</p>
                </div>
              </CardContent>
            )}

            {activeTab === "job-market" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Job Market Analytics</h3>
                  <p className="text-xs text-muted-foreground">Demand level, hotspots, and timeline to job placement.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/40 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Demand Level</span>
                    <span className="text-lg font-extrabold text-foreground block mt-1">{countryData.jobMarket?.demandLevel || "High"}</span>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/40 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Placement Time</span>
                    <span className="text-lg font-extrabold text-foreground block mt-1">{countryData.jobMarket?.averageTimeToJob || "3-6 Months"}</span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Hiring Hotspots</h4>
                  <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                    {countryData.jobMarket?.majorHubs?.map((spot: string) => (
                      <li key={spot} className="font-semibold text-foreground">{spot}</li>
                    )) || <li>Capital Region</li>}
                  </ul>
                </div>
              </CardContent>
            )}

            {activeTab === "salary" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Salary Intelligence</h3>
                  <p className="text-xs text-muted-foreground">Estimated gross annual salaries for AI/ML roles.</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Entry Level AI Developer:</span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{countryData.salary?.entryLevelSalary?.toLocaleString() || "N/A"} {currency}</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">{countryData.salary?.entryLevelSalary ? formatBdt(countryData.salary.entryLevelSalary, currency) : ""}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Mid Level AI Developer:</span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{countryData.salary?.midLevelSalary?.toLocaleString() || "N/A"} {currency}</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">{countryData.salary?.midLevelSalary ? formatBdt(countryData.salary.midLevelSalary, currency) : ""}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pb-1">
                      <span className="text-muted-foreground">Senior AI / Staff Scientist:</span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{countryData.salary?.seniorLevelSalary?.toLocaleString() || "N/A"} {currency}</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">{countryData.salary?.seniorLevelSalary ? formatBdt(countryData.salary.seniorLevelSalary, currency) : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            {activeTab === "visa" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Visa Rules & Application Process</h3>
                  <p className="text-xs text-muted-foreground">Dhaka Embassy wait times, fees, and processing roadmaps.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-destructive uppercase font-bold tracking-wider">Dhaka Wait Time</span>
                    <span className="text-sm font-black text-foreground block">{countryData.visa?.dhakaEmbassyWaitTime || "2-4 Months"}</span>
                  </div>
                  <div className="bg-muted/40 border border-border/40 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Embassy Rejection Risk</span>
                    <span className="text-sm font-bold text-foreground block">{countryData.visa?.rejectionRateDisplay || "Moderate"}</span>
                  </div>
                </div>

                {/* Steps flowchart */}
                {countryData.visa?.steps && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visa Application Steps</h4>
                    <div className="relative border-l border-border/60 pl-6 ml-3 space-y-4 text-xs text-muted-foreground">
                      {countryData.visa.steps.map((step: string, idx: number) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <p className="font-semibold text-foreground pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}

            {activeTab === "pr" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">PR Pathway Route</h3>
                  <p className="text-xs text-muted-foreground font-semibold text-primary">Ease of transition from post-graduate stay-back to Permanent Residence.</p>
                </div>

                {/* BD passport alerts */}
                {(() => {
                  const countryNameLower = countryData.country.toLowerCase();
                  if (countryNameLower.includes("united states") || countryNameLower === "us" || countryNameLower === "usa") {
                    return (
                      <div className="flex gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                        <AlertTriangle className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <p className="font-bold text-foreground">⚠️ Bangladesh Passport Constraint: USA Green Card Backlog</p>
                          <p className="mt-1">EB-2 and EB-3 permanent residency backlogs are currently estimated at <strong>70–90 years</strong> for Bangladeshi passport holders. The USA F-1 to H-1B to Green Card path is NOT a viable PR pathway for BD nationals. If permanent settlement is your primary goal, avoid targeting the USA.</p>
                        </div>
                      </div>
                    );
                  }
                  if (countryNameLower.includes("united arab emirates") || countryNameLower === "ae" || countryNameLower === "uae") {
                    return (
                      <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">⚠️ UAE Golden Visa ≠ Permanent Residency</p>
                          <p className="mt-1">The UAE has NO traditional PR path or citizenship routes. The Golden Visa is a 10-year renewable residency visa, but it does not lead to public benefits, rights of permanent settlement, or a UAE passport.</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Local Language requirement notification */}
                {(() => {
                  const countryNameLower = countryData.country.toLowerCase();
                  if (countryNameLower.includes("germany")) {
                    return (
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl text-xs text-muted-foreground leading-relaxed">
                        <p className="font-bold text-foreground">🗣️ Language Requirement (German B1/B2)</p>
                        <p className="mt-1">For EU Blue Card holders, Permanent Residence can be obtained in <strong>21 months</strong> if you pass German B1, or <strong>33 months</strong> if you do not have German language proficiency.</p>
                      </div>
                    );
                  }
                  if (countryNameLower.includes("netherlands") || countryNameLower.includes("netherland")) {
                    return (
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl text-xs text-muted-foreground leading-relaxed">
                        <p className="font-bold text-foreground">🗣️ Language Requirement (NT2 Dutch)</p>
                        <p className="mt-1">Netherlands PR and citizenship pathways require passing the <strong>NT2 Dutch language integration exams</strong> after 5 years of legal residence.</p>
                      </div>
                    );
                  }
                  if (countryNameLower.includes("sweden") || countryNameLower.includes("finland")) {
                    return (
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl text-xs text-muted-foreground leading-relaxed">
                        <p className="font-bold text-foreground">🗣️ Language Requirement (Swedish/Finnish)</p>
                        <p className="mt-1">Under recent immigration reforms, passing local language proficiency tests is practically required for Permanent Residence conversion.</p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Interactive Flowchart Timeline */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study-to-Citizenship Pathway Flowchart</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {/* Step 1 */}
                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl relative flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Step 1</span>
                        <h5 className="font-bold text-sm text-foreground mt-2">Study Phase</h5>
                        <p className="text-[11px] text-muted-foreground mt-1">1–2 Years Master's degree. Maintain GPA and clear university credits.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl relative flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Step 2</span>
                        <h5 className="font-bold text-sm text-foreground mt-2">Stay-back Work</h5>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {countryData.postStudyWork?.durationStayBack || "18 Months"} Post-study work visa to secure CSE/AI job contract.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl relative flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Step 3</span>
                        <h5 className="font-bold text-sm text-foreground mt-2">Permanent Residence</h5>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Est: {countryData.prPathways?.estimatedYearsFromGraduation || "2-4"} years from graduation. Apply via {countryData.prPathways?.primaryPathwayName || "points-system"}.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-card/40 border border-border/40 p-4 rounded-xl relative flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Step 4</span>
                        <h5 className="font-bold text-sm text-foreground mt-2">Citizenship</h5>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Est: {summary.citizenshipYears || "5"} years total legal residence to qualify for the passport.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Country Compare */}
                <div className="bg-muted/15 border border-border/40 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PR Timelines Comparison Box</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                      <span className="font-bold text-foreground block">🍁 Canada</span>
                      <span className="text-[10px] text-muted-foreground">Express Entry CEC: <strong>3 years</strong> post-grad PR</span>
                    </div>
                    <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                      <span className="font-bold text-foreground block">🦘 Australia</span>
                      <span className="text-[10px] text-muted-foreground">485 Work Visa: <strong>3–5 years</strong> skilled PR</span>
                    </div>
                    <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                      <span className="font-bold text-foreground block">🥨 Germany</span>
                      <span className="text-[10px] text-muted-foreground">EU Blue Card: <strong>21 months</strong> (with B1 German)</span>
                    </div>
                    <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                      <span className="font-bold text-foreground block">🍀 Ireland</span>
                      <span className="text-[10px] text-muted-foreground">Stamp 1G to Stamp 4: <strong>5 years</strong> to PR</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-3 text-xs text-muted-foreground">
                  <p><strong>Primary PR Route Name:</strong> {countryData.prPathways?.primaryPathwayName || "Skilled Migration Points-based System"}</p>
                  <p><strong>Estimated Years from Graduation:</strong> {countryData.prPathways?.estimatedYearsFromGraduation || "2-4"} Years</p>
                  <p><strong>Difficulty Level:</strong> {countryData.prPathways?.difficulty || "Medium"}</p>
                </div>
                {countryData.prPathways?.prRules && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-semibold">PR Requirements Checklist</h4>
                    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1.5">
                      {countryData.prPathways.prRules.map((rule: string, idx: number) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}

            {activeTab === "citizenship" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Citizenship Rules</h3>
                  <p className="text-xs text-muted-foreground">Time frame, dual passport policies, and language thresholds.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-2.5 text-xs text-muted-foreground">
                  <p><strong>Residency years to qualify:</strong> {countryData.citizenship?.yearsToCitizenship || "5"} Years</p>
                  <p><strong>Dual nationality allowed:</strong> {countryData.citizenship?.dualCitizenshipAllowed ? "YES" : "NO"}</p>
                </div>
                {countryData.citizenship?.requirements && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Integration Requirements</h4>
                    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1.5">
                      {countryData.citizenship.requirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}

            {activeTab === "family" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Family Relocation Rights</h3>
                  <p className="text-xs text-muted-foreground">Spouse open work permits and child dependent visa options.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p><strong>Spouse work permit rules:</strong> {countryData.family?.spouseVisaDetails || "Spouse open work permit is available for full-time research master's or PhD graduates."}</p>
                  <p><strong>Dependent children rules:</strong> {countryData.family?.childrenDependentVisaRules || "Children can be included in the primary visa package with free public education rights."}</p>
                  <p><strong>Parent relocation options:</strong> {countryData.family?.parentRelocationOptions || "Parents can visit on tourist/super visas. Sponsorship queue is lengthy."}</p>
                </div>
              </CardContent>
            )}

            {activeTab === "housing" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Housing Market</h3>
                  <p className="text-xs text-muted-foreground">Student rental guides, index numbers and typical deposits.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-3 text-xs text-muted-foreground">
                  <p><strong>Average Rent Index:</strong> {countryData.housing?.averageRent || "Varies significantly by city"}</p>
                  <p><strong>Student Housing availability:</strong> {countryData.housing?.studentHousingAvailability || "Limited in capital cities. Expect to use private shared rooms."}</p>
                  <p><strong>Key Rental Advice:</strong> {countryData.housing?.keyAdvice || "Start search 2-3 months prior to arrival. Watch out for deposit scams in student forums."}</p>
                </div>
              </CardContent>
            )}

            {activeTab === "taxes" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Tax Deductions & Net Income Calculator</h3>
                  <p className="text-xs text-muted-foreground">Instantly compute monthly net income in BDT based on country brackets.</p>
                </div>
                
                {/* Calculator Inputs */}
                <div className="space-y-4 bg-muted/20 p-5 rounded-xl border border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="grossCalc" className="text-xs text-muted-foreground">Annual Gross Salary ({currency})</Label>
                      <Input
                        id="grossCalc"
                        type="number"
                        value={grossInput}
                        onChange={(e) => setGrossInput(e.target.value)}
                        className="bg-background border-border text-foreground text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Country Effective Tax Rate</Label>
                      <div className="h-9 flex items-center bg-background border border-border px-3 rounded-lg text-xs font-bold text-primary">
                        {countryData.taxation?.effectiveTaxRate || "25%"}
                      </div>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  {(() => {
                    const gross = parseFloat(grossInput) || 0;
                    // parse percent like "35%" -> 0.35
                    const taxPctStr = countryData.taxation?.effectiveTaxRate || "25%";
                    const taxPct = parseFloat(taxPctStr?.replace("%", "")) / 100 || 0.25;
                    const taxAmount = gross * taxPct;
                    const netAnnual = gross - taxAmount;
                    const netMonthly = netAnnual / 12;

                    return (
                      <div className="pt-4 border-t border-border/40 space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax Deductions:</span>
                          <span className="font-semibold text-destructive">-{taxAmount.toLocaleString()} {currency}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/30 pb-2">
                          <span className="text-muted-foreground">Annual Net Income:</span>
                          <span className="font-bold text-foreground">{netAnnual.toLocaleString()} {currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-semibold">Monthly Net Income:</span>
                          <span className="font-black text-foreground text-sm">{Math.round(netMonthly).toLocaleString()} {currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Net BDT Equivalent:</span>
                          <span className="font-black text-emerald-400 text-sm">
                            {formatBdt(netMonthly, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            )}

            {activeTab === "risks" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Country Risks & Warnings</h3>
                  <p className="text-xs text-muted-foreground">Crucial constraints to look out for prior to committing.</p>
                </div>
                <div className="space-y-4">
                  {countryData.risks?.housingRisk && (
                    <div className="flex gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                      <AlertTriangle className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
                      <p><strong>Housing risk warnings:</strong> {countryData.risks.housingRisk}</p>
                    </div>
                  )}
                  {countryData.risks?.politicalAntiImmigrantTrend && (
                    <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <p><strong>Immigration Policy shifts:</strong> {countryData.risks.politicalAntiImmigrantTrend}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}

            {activeTab === "outlook" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Future Outlook Projections</h3>
                  <p className="text-xs text-muted-foreground">2035 & 2045 market developments, automation and climate trends.</p>
                </div>
                <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p><strong>2035 Outlook:</strong> {summary.futureOutlook2035 || "Positive. AI and semiconductor integrations will keep job markets highly favorable."}</p>
                  <p><strong>2045 Outlook:</strong> {summary.futureOutlook2045 || "Strong. Demographic labor shortages ensure persistent skilled migration requirements."}</p>
                  <p><strong>Automation risk resilience:</strong> {countryData.futureProofing?.automationRiskResilience || "Excellent. Top-tier STEM economies remain highly resilient."}</p>
                </div>
              </CardContent>
            )}

            {activeTab === "docs" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Required Documents Checklist</h3>
                  <p className="text-xs text-muted-foreground">List of BD-specific document pipelines.</p>
                </div>
                {countryData.documents?.bdChecklist ? (
                  <div className="space-y-3">
                    {countryData.documents.bdChecklist.map((doc: string, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start bg-muted/30 border border-border/40 p-3 rounded-xl">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                        <span className="text-xs text-foreground font-semibold">{doc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground space-y-2 bg-muted/20 p-4 rounded-xl border border-border/40">
                    <p>Standard document sequence for BD nationals:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Police Clearance Certificate (2-6 weeks)</li>
                      <li>Academic Transcripts & Certificates (sealed copies)</li>
                      <li>IELTS/TOEFL standard reports</li>
                      <li>Financial Proof / Blocked Account Setup</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            )}

            {activeTab === "timeline" && (
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Application Sequence Timeline</h3>
                  <p className="text-xs text-muted-foreground">Milestones mapped to the September intake cycle.</p>
                </div>
                
                {/* Horizontal steps timeline */}
                {countryData.timeline?.sampleTimeline_MSc ? (
                  <div className="relative border-l border-border/60 pl-6 ml-3 space-y-4 text-xs text-muted-foreground">
                    {countryData.timeline.sampleTimeline_MSc.map((step: any, idx: number) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                          {step.year}
                        </span>
                        <p className="font-bold text-foreground pt-0.5">{step.event}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/20 p-4 border border-border/40 rounded-xl space-y-2 text-xs text-muted-foreground">
                    <p><strong>Timeline Guidance:</strong> Start preparation 12-18 months prior to target intake.</p>
                    <p><strong>Admissions window:</strong> September - January (for Fall intake).</p>
                    <p><strong>Visa processing slot:</strong> April - July.</p>
                  </div>
                )}
              </CardContent>
            )}

          </Card>
        </div>

      </div>

      {/* 4. Active user metrics grids (Universities, Professors, Documents) */}
      <div className="space-y-8 pt-8 border-t border-border/60">
        
        {/* Section 4.1: Tracked Universities in Country */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Your Tracked Universities ({countryUnis.length})
            </h3>
            <Link href="/dashboard/universities/new">
              <Button size="sm" className="text-xs bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1 cursor-pointer shadow-sm font-semibold">
                <Plus className="h-3 w-3" />
                Add University
              </Button>
            </Link>
          </div>

          {countryUnis.length === 0 ? (
            <EmptyState
              icon={School}
              title={`No universities tracked in ${countryName} yet`}
              description="Track target universities to start calculating your admissions fit score."
              className="py-10 bg-card/10 border-border/40"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countryUnis.map((uni) => (
                <Card key={uni.id} className="border-border/60 bg-card/25 hover:border-border transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{uni.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{uni.program || "General Track"}</p>
                      </div>
                      <TierBadge tier={uni.tier} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground border-t border-border/30 pt-3">
                      <div>Tuition / Yr: <span className="text-foreground font-semibold">{uni.tuitionPerYr || "Unknown"}</span></div>
                      <div>Min CGPA: <span className="text-foreground font-semibold">{uni.minCgpa || "N/A"}</span></div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/30">
                      <Link href={`/universities/${uni.id}`}>
                        <Button variant="ghost" size="sm" className="text-[10px] text-primary hover:text-primary/80 h-7 cursor-pointer flex items-center gap-0.5">
                          View details
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 4.2: Professor Outreach in Country */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              Supervisor Cold Outreach ({countryProfs.length})
            </h3>
            <Link href="/dashboard/professors">
              <Button size="sm" className="text-xs bg-muted border border-border hover:bg-accent text-foreground flex items-center gap-1 cursor-pointer">
                Manage Outreach
              </Button>
            </Link>
          </div>

          {countryProfs.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No professors contacted yet"
              description="Secure supervisor funding agreements by initiating professor outreach."
              className="py-10 bg-card/10 border-border/40"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countryProfs.map((prof) => (
                <Card key={prof.id} className="border-border/60 bg-card/25 hover:border-border transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{prof.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{prof.researchInterests || "various research"}</p>
                      </div>
                      <FundingStatusBadge status={prof.fundingStatus} />
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/30 text-xs">
                      <StatusBadge status={prof.status} />
                      {prof.researchFitScore && (
                        <span className="font-bold text-primary">Fit Match: {prof.researchFitScore}/10</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
