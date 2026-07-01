"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  School,
  FileText,
  GraduationCap,
  CheckCircle,
  User,
  AlertTriangle,
  Target,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { AnalyticsSkeleton } from "@/components/skeletons/AnalyticsSkeleton";
import dynamic from "next/dynamic";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import type { AnalyticsResponse } from "@/types";

const ApplicationFunnel = dynamic(() => import("@/components/charts/ApplicationFunnel").then((m) => ({ default: m.ApplicationFunnel })), { ssr: false });
const FinancialROI = dynamic(() => import("@/components/charts/FinancialROI").then((m) => ({ default: m.FinancialROI })), { ssr: false });
const ProfessorOutreach = dynamic(() => import("@/components/charts/ProfessorOutreach").then((m) => ({ default: m.ProfessorOutreach })), { ssr: false });

export default function AnalyticsFitPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchApi<AnalyticsResponse>("/api/v1/analytics");
      setData(result);
    } catch (err) {
      setError("Failed to load analytics data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  const totalApplications = data ? Object.values(data.applicationFunnel).reduce((s, v) => s + v, 0) : 0;
  const totalUniversities = data?.financial.breakdownByUniversity.length || 0;
  const totalProfessors = data?.professorOutreach.total || 0;
  const docProgress = totalUniversities > 0
    ? Math.round((data!.financial.scholarshipsTotal > 0 ? 1 : 0) * 100)
    : 0;

  const profileGaps: string[] = (() => {
    if (!profile) return ["Complete your profile in Settings"];
    const gaps: string[] = [];
    if (!profile.university) gaps.push("University name not set");
    if (!profile.cgpa) gaps.push("CGPA not set");
    if (!profile.targetIntake) gaps.push("Target intake not set");
    if (!profile.graduationDate) gaps.push("Graduation date not set");
    if (!profile.targetDegree) gaps.push("Target degree not set");
    return gaps;
  })();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={BarChart3}
        title="Analytics & ROI"
        description="Application funnel, financial ROI, professor outreach, and activity overview."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <ApiErrorAlert error={error} onRetry={loadAnalytics} />
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
                  (data?.profileCompleteness ?? 0) >= 80
                    ? "bg-emerald-400"
                    : (data?.profileCompleteness ?? 0) >= 50
                      ? "bg-amber-400"
                      : "bg-destructive"
                }`}
                style={{ width: `${data?.profileCompleteness ?? 0}%` }}
              />
            </div>
            <span className="text-sm font-black text-foreground">{data?.profileCompleteness ?? 0}%</span>
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
        <MetricCard icon={School} label="Universities" value={totalUniversities} color="default" />
        <MetricCard icon={FileText} label="Applications" value={totalApplications} color="default" />
        <MetricCard icon={GraduationCap} label="Professors" value={totalProfessors} color="default" />
        <MetricCard
          icon={CheckCircle}
          label="Profile"
          value={`${data?.profileCompleteness ?? 0}%`}
          color={(data?.profileCompleteness ?? 0) >= 60 ? "success" : "warning"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApplicationFunnel funnel={data?.applicationFunnel ?? {}} total={totalApplications} />
        <ProfessorOutreach
          total={data?.professorOutreach.total ?? 0}
          contacted={data?.professorOutreach.contacted ?? 0}
          repliedPositive={data?.professorOutreach.repliedPositive ?? 0}
          repliedNegative={data?.professorOutreach.repliedNegative ?? 0}
          noResponse={data?.professorOutreach.noResponse ?? 0}
          responseRate={data?.professorOutreach.responseRate ?? 0}
          averageFitScore={data?.professorOutreach.averageFitScore ?? 0}
          followUpEfficacy={data?.professorOutreach.followUpEfficacy ?? 0}
        />
      </div>

      <FinancialROI
        breakdownByUniversity={data?.financial.breakdownByUniversity ?? []}
        totalEstimatedCost={data?.financial.totalEstimatedCost ?? 0}
        scholarshipsTotal={data?.financial.scholarshipsTotal ?? 0}
        fundingGap={data?.financial.fundingGap ?? 0}
        avgPostGradSalary={data?.financial.avgPostGradSalary ?? 0}
        roiScore={data?.financial.roiScore ?? 0}
      />

      <ActivityHeatmap timeline={data?.activityTimeline ?? []} />

      <Card className="border-border/60 bg-card/25">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Profile Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {profileGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{gap}</span>
              </li>
            ))}
            {profileGaps.length === 0 && (
              <li className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                All profile fields are complete!
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
