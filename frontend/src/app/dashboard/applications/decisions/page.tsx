"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CheckCheck,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Clock,
  FileText,
} from "lucide-react";
import type { Application, ApplicationStatus } from "@/types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  PLANNING:       "bg-muted text-muted-foreground",
  IN_PROGRESS:    "bg-blue-500/10 text-blue-400",
  SUBMITTED:      "bg-purple-500/10 text-purple-400",
  UNDER_REVIEW:   "bg-amber-500/10 text-amber-400",
  OFFER_RECEIVED: "bg-emerald-500/10 text-emerald-400",
  ACCEPTED:       "bg-emerald-500/10 text-emerald-400",
  REJECTED:       "bg-destructive/10 text-destructive",
  WITHDRAWN:      "bg-muted text-muted-foreground",
};

const FUNNEL_ORDER: ApplicationStatus[] = [
  "PLANNING", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "OFFER_RECEIVED", "ACCEPTED",
];

const FUNNEL_LABELS: Record<ApplicationStatus, string> = {
  PLANNING: "Planning", IN_PROGRESS: "In Progress", SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review", OFFER_RECEIVED: "Offer!", ACCEPTED: "Accepted",
  REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

export default function DecisionTrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchApi("/api/v1/applications") as Application[];
        setApplications(data || []);
      } catch (err) {
        setError("Failed to load application decisions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      PLANNING: 0, IN_PROGRESS: 0, SUBMITTED: 0, UNDER_REVIEW: 0,
      OFFER_RECEIVED: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0,
    };
    applications.forEach((a) => { counts[a.status]++; });
    return counts;
  }, [applications]);

  const submittedCount = statusCounts.SUBMITTED + statusCounts.UNDER_REVIEW + statusCounts.OFFER_RECEIVED + statusCounts.ACCEPTED + statusCounts.REJECTED;
  const offerCount = statusCounts.OFFER_RECEIVED + statusCounts.ACCEPTED;
  const offerRate = submittedCount > 0 ? Math.round((offerCount / submittedCount) * 100) : 0;

  const maxFunnelCount = Math.max(...FUNNEL_ORDER.map((s) => statusCounts[s]), 1);
  const funnelBars = FUNNEL_ORDER.map((status) => ({
    status,
    count: statusCounts[status],
    pct: maxFunnelCount > 0 ? (statusCounts[status] / maxFunnelCount) * 100 : 0,
  }));

  const offers = applications.filter((a) => a.status === "OFFER_RECEIVED" || a.status === "ACCEPTED");
  const rejected = applications.filter((a) => a.status === "REJECTED");
  const pending = applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW");

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
        icon={CheckCheck}
        title="Decision Tracker"
        description="Track offer letters, rejections, waitlists, and scholarship decisions across all your applications."
        backHref="/dashboard/applications"
        backLabel="Back to App Pipeline"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <EmptyState
          icon={CheckCheck}
          title="No applications to track"
          description="Add applications to your pipeline to start tracking decisions."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={FileText} label="Total Apps" value={applications.length} color="default" />
            <MetricCard icon={Clock} label="Pending" value={pending.length} color="warning" />
            <MetricCard
              icon={Check}
              label="Offers"
              value={offerCount}
              color="success"
              trend={offerRate > 0 ? "up" : "neutral"}
              trendValue={`${offerRate}%`}
            />
            <MetricCard icon={X} label="Rejected" value={rejected.length} color="destructive" />
          </div>

          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">Application Funnel</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Track progress through your application pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {funnelBars.map(({ status, count, pct }) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground w-20 shrink-0">{FUNNEL_LABELS[status]}</span>
                  <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2 text-[10px] font-black text-white ${
                        status === "OFFER_RECEIVED" || status === "ACCEPTED" ? "bg-emerald-400" :
                        status === "SUBMITTED" || status === "UNDER_REVIEW" ? "bg-blue-400" :
                        "bg-muted-foreground/40"
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {offers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                Offers Received ({offers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {offers.map((app) => (
                  <Card key={app.id} className="border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">{app.university?.name || "University"}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">{app.university?.country}</CardDescription>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          OFFER
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-1.5">
                      <div className="flex gap-4 text-[11px]">
                        {app.scholarshipAmt && (
                          <span className="text-emerald-400 font-bold">Scholarship: {app.scholarshipAmt}</span>
                        )}
                        {app.decisionDate && (
                          <span className="text-muted-foreground">
                            Decision: {new Date(app.decisionDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {app.university?.tuitionPerYr && (
                        <p className="text-[10px] text-muted-foreground">Tuition: {app.university.tuitionPerYr}/yr</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {rejected.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                Rejected ({rejected.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rejected.map((app) => (
                  <Card key={app.id} className="border-destructive/10 bg-destructive/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">{app.university?.name || "University"}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">{app.university?.country}</CardDescription>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                          REJECTED
                        </span>
                      </div>
                    </CardHeader>
                    {app.decisionDate && (
                      <CardContent className="pb-3 text-[10px] text-muted-foreground">
                        Decision: {new Date(app.decisionDate).toLocaleDateString()}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {offers.length >= 2 && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Offer Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left py-2 text-muted-foreground font-semibold">Criteria</th>
                        {offers.map((app) => (
                          <th key={app.id} className="text-left py-2 px-3 text-foreground font-bold">{app.university?.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/20">
                        <td className="py-2 text-muted-foreground">Tier</td>
                        {offers.map((app) => (
                          <td key={app.id} className="py-2 px-3 font-bold">{app.university?.tier || "—"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/20">
                        <td className="py-2 text-muted-foreground">Tuition/yr</td>
                        {offers.map((app) => (
                          <td key={app.id} className="py-2 px-3">{app.university?.tuitionPerYr || "—"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/20">
                        <td className="py-2 text-muted-foreground">Scholarship</td>
                        {offers.map((app) => (
                          <td key={app.id} className="py-2 px-3 font-bold text-emerald-400">{app.scholarshipAmt || "None"}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 text-muted-foreground">Country</td>
                        {offers.map((app) => (
                          <td key={app.id} className="py-2 px-3">{app.university?.country || "—"}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
