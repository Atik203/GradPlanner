"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  School,
  FileText,
  CheckCircle,
  GraduationCap,
  User,
  AlertTriangle,
  ArrowRight,
  Target,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { AnalyticsSkeleton } from "@/components/skeletons/AnalyticsSkeleton";
import type { University, Application, Document } from "@/types";

interface DashboardStats {
  universities: { total: number; dream: number; match: number; safety: number };
  professors: { total: number; emailed: number; repliedPositive: number };
  applications: { total: number; submitted: number; offerReceived: number; accepted: number };
  documents: { total: number; obtained: number; progressPercentage: number };
}

export default function AnalyticsFitPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [statsData, unis, docs] = await Promise.all([
          fetchApi("/api/v1/dashboard/stats") as Promise<DashboardStats>,
          fetchApi("/api/v1/universities") as Promise<University[]>,
          fetchApi("/api/v1/documents") as Promise<Document[]>,
        ]);
        setStats(statsData);
        setUniversities(unis || []);
        setDocuments(docs || []);
      } catch (err) {
        setError("Failed to load analytics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const profileCompleteness = useMemo(() => {
    if (!profile) return 0;
    const fields = [profile.university, profile.cgpa, profile.targetIntake, profile.graduationDate, profile.targetDegree];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / 5) * 100);
  }, [profile]);

  const profileGaps: string[] = useMemo(() => {
    if (!profile) return ["Complete your profile in Settings"];
    const gaps: string[] = [];
    if (!profile.university) gaps.push("University name not set");
    if (!profile.cgpa) gaps.push("CGPA not set — needed for fit score calculation");
    if (!profile.targetIntake) gaps.push("Target intake not set — affects timeline planning");
    if (!profile.graduationDate) gaps.push("Graduation date not set");
    if (!profile.targetDegree) gaps.push("Target degree not set (MSc/PhD)");
    return gaps;
  }, [profile]);

  const docGaps = useMemo(() => {
    if (!stats?.documents) return [];
    const gaps: string[] = [];
    const obtained = stats.documents.obtained || 0;
    const total = stats.documents.total || 0;
    if (total === 0) gaps.push("No documents tracked");
    if (obtained < total) gaps.push(`${total - obtained} documents still pending`);
    return gaps;
  }, [stats]);

  const tierDistribution = useMemo(() => {
    if (!stats?.universities) return { dream: 0, match: 0, safety: 0 };
    const total = stats.universities.total || 1;
    return {
      dream: Math.round(((stats.universities.dream || 0) / total) * 100),
      match: Math.round(((stats.universities.match || 0) / total) * 100),
      safety: Math.round(((stats.universities.safety || 0) / total) * 100),
    };
  }, [stats]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={BarChart3}
        title="Analytics & Fit"
        description="Personalized fit score analysis, admission probability estimates, and data-driven university recommendations."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <ApiErrorAlert error={error} />
      )}

      <Card className="border-border/60 bg-card/25">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  profileCompleteness >= 80 ? "bg-emerald-400" : profileCompleteness >= 50 ? "bg-amber-400" : "bg-destructive"
                }`}
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <span className="text-sm font-black text-foreground">{profileCompleteness}%</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
            {profile?.cgpa && (
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground block">CGPA</span>
                <span className="font-bold text-foreground">{profile.cgpa}</span>
              </div>
            )}
            {profile?.targetDegree && (
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground block">Target Degree</span>
                <span className="font-bold text-foreground">{profile.targetDegree}</span>
              </div>
            )}
            {profile?.targetIntake && (
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground block">Target Intake</span>
                <span className="font-bold text-foreground">{profile.targetIntake}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={School} label="Universities" value={stats?.universities.total || 0} color="default" />
        <MetricCard icon={FileText} label="Applications" value={stats?.applications.total || 0} color="default" />
        <MetricCard icon={GraduationCap} label="Professors" value={stats?.professors.total || 0} color="default" />
        <MetricCard
          icon={CheckCircle}
          label="Doc Progress"
          value={`${stats?.documents.progressPercentage || 0}%`}
          color={stats?.documents.progressPercentage && stats.documents.progressPercentage >= 60 ? "success" : "warning"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/25">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-purple-400 w-14">DREAM</span>
              <div className="flex-1 h-5 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-purple-400/50 rounded-lg transition-all duration-700 flex items-center px-2 text-[10px] font-black"
                  style={{ width: `${Math.max(tierDistribution.dream, tierDistribution.dream > 0 ? 8 : 0)}%` }}
                >
                  {tierDistribution.dream > 0 && `${tierDistribution.dream}%`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-emerald-400 w-14">MATCH</span>
              <div className="flex-1 h-5 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-emerald-400/50 rounded-lg transition-all duration-700 flex items-center px-2 text-[10px] font-black"
                  style={{ width: `${Math.max(tierDistribution.match, tierDistribution.match > 0 ? 8 : 0)}%` }}
                >
                  {tierDistribution.match > 0 && `${tierDistribution.match}%`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground w-14">SAFETY</span>
              <div className="flex-1 h-5 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-muted-foreground/30 rounded-lg transition-all duration-700 flex items-center px-2 text-[10px] font-black"
                  style={{ width: `${Math.max(tierDistribution.safety, tierDistribution.safety > 0 ? 8 : 0)}%` }}
                >
                  {tierDistribution.safety > 0 && `${tierDistribution.safety}%`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/25">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Profile & Document Gaps
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Areas that need attention to improve your fit score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...profileGaps, ...docGaps].map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </li>
              ))}
              {profileGaps.length === 0 && docGaps.length === 0 && (
                <li className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  All profile fields and documents are in good shape!
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {universities.length > 0 && (
        <Card className="border-border/60 bg-card/25">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              University Quick Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {universities.slice(0, 10).map((uni) => (
                <div key={uni.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{uni.name}</p>
                    <p className="text-[10px] text-muted-foreground">{uni.country} · {uni.program || "No program set"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {uni.minCgpa && profile?.cgpa && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        profile.cgpa >= uni.minCgpa
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        CGPA {profile.cgpa >= uni.minCgpa ? "✓" : "✗"}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      uni.tier === "DREAM" ? "bg-purple-500/10 text-purple-400" :
                      uni.tier === "MATCH" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {uni.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
