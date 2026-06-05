"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { setUniversities } from "@/lib/store/slices/universitySlice";
import { setMatchScores } from "@/lib/store/slices/countryMatchSlice";
import { computeCountryMatchScore } from "@/lib/matchScore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  School, 
  GraduationCap, 
  FolderGit2, 
  FileText, 
  Plus, 
  Calendar,
  AlertCircle,
  TrendingUp,
  User,
  Globe,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { TierBadge } from "@/components/badges/TierBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountryFlag } from "@/components/shared/CountryFlag";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { WhatNextToday } from "@/components/dashboard/WhatNextToday";


interface Stats {
  universities: { total: number; dream: number; match: number; safety: number };
  professors: { total: number; notContacted: number; emailed: number; awaitingReply: number; repliedPositive: number; repliedNegative: number; interviewed: number; totalReplies: number };
  applications: { total: number; planning: number; inProgress: number; submitted: number; underReview: number; offerReceived: number; accepted: number; rejected: number; withdrawn: number };
  documents: { total: number; pending: number; inProgress: number; obtained: number; expired: number; notRequired: number; progressPercentage: number };
}

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { data: session } = authClient.useSession();
  const profile = useAppSelector((state) => state.profile.profile);
  const universities = useAppSelector((state) => state.universities.items);

  const matchScores = useAppSelector((state) => state.countryMatch.scores);

  const [stats, setStats] = useState<Stats | null>(null);
  const [countriesSummary, setCountriesSummary] = useState<any[]>([]);
  const [decisionData, setDecisionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile editing state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [university, setUniversityName] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, profileData, uniData, countriesRes, engineData] = await Promise.all([
          fetchApi("/api/v1/dashboard/stats"),
          fetchApi("/api/v1/profile"),
          fetchApi("/api/v1/universities"),
          fetchApi("/api/v1/countries"),
          fetchApi("/api/v1/decision-engine").catch(() => null)
        ]);
        setStats(statsData);
        setDecisionData(engineData);
        dispatch(setProfile(profileData));
        dispatch(setUniversities(uniData));
        if (countriesRes) {
          setCountriesSummary(countriesRes);
          // Compute personal match scores for all countries
          const scores: Record<string, ReturnType<typeof computeCountryMatchScore>> = {};
          for (const c of countriesRes) {
            scores[c.countryCode] = computeCountryMatchScore(profileData || {}, {
              countryCode: c.countryCode,
              overallScore: c.overallScore,
              summary: c.summary,
            });
          }
          dispatch(setMatchScores(scores));
        }

        // Prefill profile edit fields
        if (profileData) {
          setUniversityName(profileData.university || "");
          setCgpa(profileData.cgpa ? String(profileData.cgpa) : "");
          setTargetDegree(profileData.targetDegree || "");
          setTargetIntake(profileData.targetIntake || "");
          setGraduationDate(profileData.graduationDate || "");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [dispatch]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const updatedProfile = await fetchApi("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({
          university,
          cgpa: cgpa ? parseFloat(cgpa) : null,
          targetIntake,
          graduationDate,
          targetDegree,
        }),
      });
      dispatch(setProfile(updatedProfile));
      setEditProfileOpen(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to save profile. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setProfileSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate profile completeness
  let completeness = 0;
  if (profile) {
    if (profile.university) completeness += 20;
    if (profile.cgpa) completeness += 20;
    if (profile.targetDegree) completeness += 20;
    if (profile.targetIntake) completeness += 20;
    if (profile.graduationDate) completeness += 20;
  }

  // Top 3 countries by personal match score (falls back to overallScore)
  const getRecommendations = () => {
    if (countriesSummary.length === 0) return [];
    return [...countriesSummary]
      .sort((a, b) => {
        const sa = matchScores[a.countryCode]?.score ?? a.overallScore;
        const sb = matchScores[b.countryCode]?.score ?? b.overallScore;
        return sb - sa;
      })
      .slice(0, 3);
  };

  const recommendations = getRecommendations();

  // Deadlines parsing
  const upcomingDeadlines = universities
    .filter((u) => u.deadline && !u.deletedAt)
    .map((u) => {
      // Simple parse check
      let isNear = false;
      try {
        const deadlineDate = new Date(u.deadline!);
        const diffTime = deadlineDate.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays < 30) {
          isNear = true;
        }
      } catch (_) {}
      return {
        name: u.name,
        program: u.program || "MSc Computer Science",
        deadline: u.deadline!,
        tier: u.tier,
        isNear,
      };
    })
    .slice(0, 4);

  // Average PR Index of target countries
  const trackedCountries = Array.from(new Set(universities.map(u => u.country)));
  const getAveragePrScore = () => {
    if (trackedCountries.length === 0) return 0;
    let sum = 0;
    let count = 0;
    trackedCountries.forEach(tcName => {
      const found = countriesSummary.find(c => c.country.toLowerCase() === tcName.toLowerCase());
      if (found && found.summary) {
        sum += found.summary.prScore || 0;
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };
  const prScoreAvg = getAveragePrScore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner / Command Center Header */}
      <div className="relative rounded-2xl border border-border/80 bg-linear-to-r from-muted/50 to-primary/5 p-8 overflow-hidden shadow-xs">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Admissions Command Center
            </div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">
              Hello, {session?.user?.name || "Future Scholar"}!
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Track your profile metrics, application milestones, visa rules, and country immigration stats in real-time.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            <Button 
              onClick={() => setEditProfileOpen(true)}
              className="bg-primary hover:bg-primary/95 text-primary-foreground h-10 px-5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-sm transition-all cursor-pointer"
            >
              <User className="h-4 w-4" />
              Update Profile Details
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Intake Target: {profile?.targetIntake || "September 2028"}</p>
          </div>
        </div>

        {/* Profile Completeness & Readiness bar */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Profile Completeness & Readiness
            </span>
            <span className="text-xs font-bold text-primary">{completeness}% Complete</span>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <div 
              className="bg-linear-to-r from-primary to-emerald-400 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <p className="text-[11px] text-muted-foreground mt-2">
              ⚠️ Complete your undergrad profile (CGPA, degree target) to unlock highly accurate country matches.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Section: What Next Today Decision Engine */}
      <WhatNextToday data={decisionData} loading={loading} />

      {/* Section A: Application Pipeline Visualizer */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Application Pipeline</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Follow your admissions tracking workflow.</CardDescription>
            </div>
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer">
                Manage Applications
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Planning */}
              <div className="bg-muted/30 border border-border/55 rounded-xl p-4 flex flex-col items-center justify-center text-center relative group hover:border-border transition-colors">
                <span className="text-2xl font-black text-foreground">{stats.applications.planning}</span>
                <span className="text-xs text-muted-foreground font-semibold mt-1">Planning</span>
                <span className="h-1 w-8 rounded-full bg-amber-400 mt-2" />
              </div>
              {/* In Progress */}
              <div className="bg-muted/30 border border-border/55 rounded-xl p-4 flex flex-col items-center justify-center text-center relative group hover:border-border transition-colors">
                <span className="text-2xl font-black text-foreground">{stats.applications.inProgress}</span>
                <span className="text-xs text-muted-foreground font-semibold mt-1">Drafting</span>
                <span className="h-1 w-8 rounded-full bg-blue-400 mt-2" />
              </div>
              {/* Submitted */}
              <div className="bg-muted/30 border border-border/55 rounded-xl p-4 flex flex-col items-center justify-center text-center relative group hover:border-border transition-colors">
                <span className="text-2xl font-black text-foreground">{stats.applications.submitted + stats.applications.underReview}</span>
                <span className="text-xs text-muted-foreground font-semibold mt-1">Submitted</span>
                <span className="h-1 w-8 rounded-full bg-purple-400 mt-2" />
              </div>
              {/* Decisions */}
              <div className="bg-muted/30 border border-border/55 rounded-xl p-4 flex flex-col items-center justify-center text-center relative group hover:border-border transition-colors">
                <span className="text-2xl font-black text-foreground">{stats.applications.offerReceived + stats.applications.accepted}</span>
                <span className="text-xs text-muted-foreground font-semibold mt-1">Offers / Accepted</span>
                <span className="h-1 w-8 rounded-full bg-emerald-400 mt-2" />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground">No applications statistics found.</div>
          )}
        </CardContent>
      </Card>

      {/* Section B: Fit-based Country Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Fit Recommendations
            </h3>
            <p className="text-xs text-muted-foreground">Top countries matched to your CGPA, IELTS, research interests & priorities.</p>
          </div>
          <Link href="/dashboard/countries">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer">
              View All 20 Countries
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((country) => {
              const info = country.summary || {};
              return (
                <Card key={country.countryCode} className="border-border/60 bg-card/25 hover:bg-card/45 hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-xs group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        (matchScores[country.countryCode]?.score ?? country.overallScore) >= 75
                          ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                          : (matchScores[country.countryCode]?.score ?? country.overallScore) >= 55
                          ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                          : "bg-red-400/10 border-red-400/30 text-red-400"
                      }`}>
                        {matchScores[country.countryCode] ? "Your Match" : "Score"}: {matchScores[country.countryCode]?.score ?? country.overallScore}%
                      </span>
                      <CountryFlag country={country.countryCode} className="h-5 w-8 rounded border border-border/20 shadow-sm" />
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">{country.country}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                      {info.summary || "No country summary available."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-muted/40 p-2 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">PR Timeline</span>
                        <span className="font-bold text-foreground">{info.citizenshipYears || "5"} Years</span>
                      </div>
                      <div className="bg-muted/40 p-2 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Monthly Cost</span>
                        <span className="font-bold text-foreground">
                          {info.averageLivingCost ? `${info.averageLivingCost} ${info.medianSalaryCurrency}` : "Varies"}
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/countries/${country.country.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                      <Button className="w-full bg-muted border border-border hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all">
                        Analyze Advisor Report
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Globe}
            title="Recommendations Not Available"
            description="We could not find seeded countries in the database. Ensure seeding finished successfully."
          />
        )}
      </div>

      {/* Main Grid: Deadlines, PR Index & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Section C: Upcoming Deadlines */}
        <Card className="border-border/60 bg-card/25 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Keep an eye on critical target application cutoff dates.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No deadlines tracked yet"
                description="Add target universities with cutoff deadlines to display them here."
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                      item.isNear 
                        ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50" 
                        : "border-border/60 bg-muted/20 hover:border-border"
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                        {item.isNear && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                            <Clock className="h-2 w-2" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.program}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <TierBadge tier={item.tier} />
                      <span className={`text-xs font-semibold ${item.isNear ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                        {item.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section D & E: PR Index & Document Progress */}
        <div className="space-y-8">
          
          {/* PR Readiness Index Gauge */}
          <Card className="border-border/60 bg-card/25">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">PR Transition Ease</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Average PR pathway feasibility across your tracked universities.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4">
              {trackedCountries.length > 0 ? (
                <div className="relative flex items-center justify-center">
                  {/* Custom SVG Radial Gauge */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-border/30"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-primary transition-all duration-1000"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - prScoreAvg / 100)}`}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-foreground">{prScoreAvg}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">PR Score</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Track universities to compute PR transition score.
                </div>
              )}
              {prScoreAvg > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {prScoreAvg >= 75 ? (
                      <span className="text-emerald-400 font-semibold">Excellent: Highly favorable PR routes (Canada/Germany/Sweden)</span>
                    ) : prScoreAvg >= 50 ? (
                      <span className="text-amber-400 font-semibold">Moderate: Structure points or language required (Netherlands/Japan)</span>
                    ) : (
                      <span className="text-destructive font-semibold">Low/Difficult: Stringent quotas or no PR (USA/UAE/China)</span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section E: BD Document Checklist */}
          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">BD Document Timelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Academic Transcripts</p>
                  <p className="text-muted-foreground">3-7 days request from UIU registrar</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Police Clearance Certificate</p>
                  <p className="text-muted-foreground">2-6 weeks processing (Ramna HQ, Dhaka)</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">German APS Certificate</p>
                  <p className="text-muted-foreground">Mandatory for DE. 6-8 weeks wait in Baridhara</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <AlertCircle className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Blocked Account / GIC Setup</p>
                  <p className="text-muted-foreground">Fintiba/Coracle: 2-3 weeks wire transfer in BD banks</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Update Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Update Profile Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="undergradUni" className="text-xs text-muted-foreground">Current/Previous Undergrad University</Label>
                <Input
                  id="undergradUni"
                  type="text"
                  placeholder="UIU Dhaka"
                  value={university}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cgpaInput" className="text-xs text-muted-foreground">CGPA</Label>
                  <Input
                    id="cgpaInput"
                    type="number"
                    step="0.01"
                    placeholder="3.8"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="degreeInput" className="text-xs text-muted-foreground">Target Degree</Label>
                  <Input
                    id="degreeInput"
                    type="text"
                    placeholder="MSc ML/AI"
                    value={targetDegree}
                    onChange={(e) => setTargetDegree(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="intakeInput" className="text-xs text-muted-foreground">Target Intake</Label>
                  <Input
                    id="intakeInput"
                    type="text"
                    placeholder="Sep 2028"
                    value={targetIntake}
                    onChange={(e) => setTargetIntake(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gradInput" className="text-xs text-muted-foreground">Graduation Date</Label>
                  <Input
                    id="gradInput"
                    type="text"
                    placeholder="Nov 2027"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  onClick={() => setEditProfileOpen(false)}
                  className="bg-transparent hover:bg-muted text-muted-foreground border border-border h-9 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={profileSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 cursor-pointer"
                >
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
