"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { UniversityRanking } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, School, ExternalLink, Star, BarChart3, Users, Briefcase,
  Globe, BookOpen, Loader2, Trophy, Building2, AlertTriangle, Lightbulb, Wallet, FileCheck
} from "lucide-react";
import { CountryIntelligence } from "@/lib/countryData";

function RankBadge({ rank, display, source, color }: { rank?: number | null; display?: string | null; source: string; color: string }) {
  const label = display || (rank ? `#${rank}` : "—");
  const hasRank = !!rank;
  return (
    <div className={`flex flex-col items-center p-5 rounded-xl border ${hasRank ? color : "bg-muted/30 border-border/40"}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{source}</span>
      <span className={`text-3xl font-black ${hasRank ? "" : "text-muted-foreground/40"}`}>{label}</span>
      <span className="text-xs text-muted-foreground mt-1">{hasRank ? "World Rank" : "Not Ranked"}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value?: number | null }) {
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function UniversityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [university, setUniversity] = useState<UniversityRanking | null>(null);
  const [intel, setIntel] = useState<CountryIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchApi(`/api/v1/rankings/${id}`)
      .then(async data => {
        setUniversity(data);
        if (data && data.country) {
          try {
            const countryData = await fetchApi(`/api/v1/countries/${data.country}`);
            setIntel(countryData);
          } catch (err) {
            console.error("Failed to load country intelligence:", err);
          }
        }
      })
      .catch(() => setError("University not found or failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading university data...</span>
        </div>
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <School className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">{error || "University not found."}</p>
          <Link href="/universities" className="text-primary text-sm hover:underline">← Back to Rankings</Link>
        </div>
      </div>
    );
  }

  const hasQs = university.inQs && university.qs2026Rank;
  const hasThe = university.inThe && university.the2026Rank;
  const hasArwu = university.inArwu && university.arwu2025Rank;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
          <Link
            href="/universities"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rankings
          </Link>
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <School className="h-5 w-5 text-primary" />
            <span>GradPlanner</span>
          </div>
          <div className="w-9" /> {/* spacer for alignment */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        {/* Hero */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                {university.institutionName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {university.country}
                  {university.region && <span className="opacity-70">({university.region})</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Track CTA */}
          <Link
            href={`/dashboard/universities/new?name=${encodeURIComponent(university.institutionName)}&country=${encodeURIComponent(university.country)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Star className="h-4 w-4" />
            Track This University
          </Link>
        </div>

        {/* Rankings Row */}
        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl shadow-primary/5">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
              World Rankings Comparison
            </CardTitle>
            <p className="text-sm text-muted-foreground">QS 2026 · THE 2026 · ARWU 2025</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <RankBadge
                rank={university.qs2026Rank}
                display={university.qs2026RankDisplay}
                source="QS 2026"
                color="bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
              />
              <RankBadge
                rank={university.the2026Rank}
                display={university.the2026RankDisplay}
                source="THE 2026"
                color="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
              />
              <RankBadge
                rank={university.arwu2025Rank}
                source="ARWU 2025"
                color="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              />
            </div>

            {/* Summary note */}
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-xs text-muted-foreground">
                {!hasQs && !hasThe && !hasArwu
                  ? "This university does not appear in QS, THE, or ARWU top rankings. Rankings are not the only measure — funding availability and admission probability matter more for scholarship-dependent students."
                  : `Appears in ${[hasQs && "QS", hasThe && "THE", hasArwu && "ARWU"].filter(Boolean).join(", ")} rankings. Funding availability > ranking for scholarship-dependent Bangladeshi students.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* QS Subscores */}
        {(university.qsArScore || university.qsErScore || university.qsFsrScore || university.qsCpfScore) && (
          <Card className="border-border bg-card/50 backdrop-blur-xl shadow-md">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                QS Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreBar label="Academic Reputation" value={university.qsArScore} />
              <ScoreBar label="Employer Reputation" value={university.qsErScore} />
              <ScoreBar label="Faculty / Student Ratio" value={university.qsFsrScore} />
              <ScoreBar label="Citations per Faculty" value={university.qsCpfScore} />
              <ScoreBar label="International Faculty Ratio" value={university.qsIfrScore} />
              <ScoreBar label="International Student Ratio" value={university.qsIsrScore} />
              <ScoreBar label="Employment Outcomes" value={university.qsEoScore} />
              <ScoreBar label="Sustainability" value={university.qsSusScore} />
            </CardContent>
          </Card>
        )}

        {/* THE Subscores */}
        {(university.theTeaching || university.theResearchEnv || university.theResearchQuality) && (
          <Card className="border-border bg-card/50 backdrop-blur-xl shadow-md">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-blue-500" />
                THE Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreBar label="Teaching" value={university.theTeaching} />
              <ScoreBar label="Research Environment" value={university.theResearchEnv} />
              <ScoreBar label="Research Quality" value={university.theResearchQuality} />
              <ScoreBar label="Industry" value={university.theIndustry} />
              <ScoreBar label="International Outlook" value={university.theInternational} />
            </CardContent>
          </Card>
        )}

        {/* ARWU Subscores */}
        {(university.arwuAlumni || university.arwuAward || university.arwuHici) && (
          <Card className="border-border bg-card/50 backdrop-blur-xl shadow-md">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-emerald-500" />
                ARWU Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreBar label="Alumni (Nobel / Fields)" value={university.arwuAlumni} />
              <ScoreBar label="Award (Staff Nobel / Fields)" value={university.arwuAward} />
              <ScoreBar label="HiCi (Highly Cited Researchers)" value={university.arwuHici} />
              <ScoreBar label="N&S (Nature & Science Papers)" value={university.arwuNs} />
              <ScoreBar label="Pub (Publications)" value={university.arwuPub} />
              <ScoreBar label="PCP (Per-Capita Performance)" value={university.arwuPcp} />
            </CardContent>
          </Card>
        )}

        {/* --- INTELLIGENCE SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          {/* Country Reality Check */}
          <Card className="border-border bg-card/50 backdrop-blur-xl lg:col-span-2">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-blue-500" />
                Country Reality Check: {university.country}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {!intel ? (
                <div className="flex items-center justify-center p-6 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm">Loading Country Intelligence...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-primary/10 text-primary">
                      {intel.summary?.overallScore || 0}/100 Match Score
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-blue-500/10 text-blue-500">
                      {intel.jobMarket?.majorHubs?.[0] || "Tech Hub"}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-emerald-500/10 text-emerald-500">
                      {intel.postStudyWork?.visaDuration || "PSW Available"}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Visa & Immigration
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {intel.visa?.studentVisa?.tips || "Review embassy guidelines carefully."}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                        PR Pathway for BD Nationals
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {intel.prPathways?.pathways?.[0]?.description || "Pathway depends on duration of stay and employment."}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                        <Wallet className="h-4 w-4 text-purple-500" />
                        Funding Sources
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {intel.funding?.fundingAvailability || "Varies by university and department."}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actionable Next Steps */}
          <div className="space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  "What It Takes" Estimator
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Based on global competitiveness, here is a realistic profile estimator for a fully-funded BD applicant:
                </p>
                <div className="p-3 bg-muted/40 border border-border/50 rounded-lg text-sm space-y-2">
                  {(() => {
                    const bestRank = Math.min(
                      university.qs2026Rank || 9999,
                      university.the2026Rank || 9999,
                      university.arwu2025Rank || 9999
                    );
                    if (bestRank <= 50) return (
                      <>
                        <div className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">CGPA</span>
                          <span className="font-semibold text-foreground">3.85+</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">IELTS</span>
                          <span className="font-semibold text-foreground">7.5+</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-muted-foreground">Other</span>
                          <span className="font-semibold text-foreground text-right">Q1 Publications <br/>Direct Prof. Outreach</span>
                        </div>
                      </>
                    );
                    if (bestRank <= 200) return (
                      <>
                        <div className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">CGPA</span>
                          <span className="font-semibold text-foreground">3.60+</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">IELTS</span>
                          <span className="font-semibold text-foreground">7.0+</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-muted-foreground">Other</span>
                          <span className="font-semibold text-foreground text-right">Research Exp. <br/>Strong SOP</span>
                        </div>
                      </>
                    );
                    return (
                      <>
                        <div className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">CGPA</span>
                          <span className="font-semibold text-foreground">3.30+</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">IELTS</span>
                          <span className="font-semibold text-foreground">6.5+</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-muted-foreground">Other</span>
                          <span className="font-semibold text-foreground text-right">Relevant Work Exp.</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-base text-primary">
                  <FileCheck className="h-4 w-4" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 text-primary text-xs">1</div>
                  <p className="text-muted-foreground">Track this university to your dashboard to set your target degree.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 text-primary text-xs">2</div>
                  <p className="text-muted-foreground">Look up professors in your target department for potential TA/RA.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 text-primary text-xs">3</div>
                  <p className="text-muted-foreground">Check exact net-annual cost for your specific program on the official website.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
