"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PiggyBank,
  Loader2,
  AlertCircle,
  DollarSign,
  Coins,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { University, Application } from "@/types";

const BDT_RATES: Record<string, number> = {
  USD: 125, EUR: 136, CAD: 92, AUD: 83, GBP: 160, SEK: 11.9, NOK: 11.7, DKK: 18.2,
  CHF: 138, NZD: 76, JPY: 0.81, KRW: 0.091, SGD: 93, CNY: 17.3, AED: 34.0,
};

interface CountrySummary { id: string; country: string; countryCode: string; }

export default function SavedTrackersPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [unis, apps] = await Promise.all([
          fetchApi("/api/v1/universities") as Promise<University[]>,
          fetchApi("/api/v1/applications") as Promise<Application[]>,
        ]);
        setUniversities(unis || []);
        setApplications(apps || []);
      } catch (err) {
        setError("Failed to load funding tracker data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const trackedApps = useMemo(() => {
    return applications.filter((a) => a.scholarshipAmt || a.status !== "PLANNING");
  }, [applications]);

  const totalScholarship = useMemo(() => {
    let total = 0;
    trackedApps.forEach((a) => {
      if (a.scholarshipAmt) {
        const num = parseFloat(a.scholarshipAmt.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) total += num;
      }
    });
    return total;
  }, [trackedApps]);

  const appsWithScholarships = trackedApps.filter((a) => a.scholarshipAmt);
  const appsWithoutScholarships = trackedApps.filter((a) => !a.scholarshipAmt && a.status !== "PLANNING");

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
        icon={PiggyBank}
        title="Saved Trackers"
        description="Your personalized funding watchlist — track application fees, scholarship deadlines, and expense forecasts."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Target} label="Tracked Apps" value={trackedApps.length} color="default" />
        <MetricCard icon={DollarSign} label="Total Scholarship" value={totalScholarship > 0 ? `$${totalScholarship.toLocaleString()}` : "None"} color="success" />
        <MetricCard icon={Coins} label="With Funding" value={appsWithScholarships.length} color="success" />
        <MetricCard icon={TrendingUp} label="Needs Funding" value={appsWithoutScholarships.length} color="warning" />
      </div>

      {trackedApps.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No applications tracked"
          description="Add applications to your pipeline to track funding and scholarships."
          actionLabel="Go to App Pipeline"
          onAction={() => window.location.href = "/dashboard/applications"}
        />
      ) : (
        <div className="space-y-6">
          {appsWithScholarships.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Coins className="h-4 w-4 text-emerald-400" />
                Applications with Scholarships
              </h3>
              <div className="space-y-2">
                {appsWithScholarships.map((app) => (
                  <Card key={app.id} className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">{app.university?.name || "University"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {app.university?.country} · {app.status.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-emerald-400">{app.scholarshipAmt}</p>
                        <p className="text-[9px] text-muted-foreground">scholarship</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {appsWithoutScholarships.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Needs Scholarship
              </h3>
              <div className="space-y-2">
                {appsWithoutScholarships.map((app) => (
                  <Card key={app.id} className="border-border/60 bg-card/25">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">{app.university?.name || "University"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {app.university?.country} · {app.status.replace(/_/g, " ")}
                          {app.university?.tuitionPerYr && ` · Tuition: ${app.university.tuitionPerYr}`}
                        </p>
                      </div>
                      <Link
                        href="/dashboard/funding/scholarships"
                        className="text-[10px] text-primary hover:text-primary/80 font-semibold flex items-center gap-1 shrink-0"
                      >
                        Find Scholarships
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/dashboard/funding/matrix" className="block">
              <Card className="border-border/60 bg-card/25 hover:bg-card/40 hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">Funding Matrix</p>
                    <p className="text-[10px] text-muted-foreground">Compare costs across universities</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/funding/scholarships" className="block">
              <Card className="border-border/60 bg-card/25 hover:bg-card/40 hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Coins className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">Active Scholarships</p>
                    <p className="text-[10px] text-muted-foreground">Browse and filter available scholarships</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/funding/budget" className="block">
              <Card className="border-border/60 bg-card/25 hover:bg-card/40 hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <PiggyBank className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">Budget Planner</p>
                    <p className="text-[10px] text-muted-foreground">Check program affordability & loan ceilings</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
