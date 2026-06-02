"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { CountdownBadge } from "@/components/dashboard/CountdownBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GanttChart,
  Loader2,
  AlertCircle,
  Globe,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Landmark,
  FileCheck,
  Plane,
  Clock,
} from "lucide-react";
import type { Application, Document } from "@/types";

interface TimelinePhase {
  label: string;
  icon: React.ReactNode;
  startYear: number;
  durationYears: number;
  color: string;
  items?: { label: string; date: string; color: string }[];
}

const PHASE_COLORS = [
  "bg-blue-400", "bg-purple-400", "bg-amber-400",
  "bg-emerald-400", "bg-blue-400", "bg-purple-400",
];

interface CountrySummary { id: string; country: string; countryCode: string; }

const DEFAULT_PHASES: Record<string, { label: string; duration: number }[]> = {
  generic: [
    { label: "IELTS/GRE Prep", duration: 6 },
    { label: "Applications", duration: 8 },
    { label: "Visa Processing", duration: 4 },
    { label: "MSc Study", duration: 24 },
    { label: "Post-Study Work", duration: 36 },
    { label: "PR Processing", duration: 24 },
  ],
};

export default function TimelinePlannerPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [apps, docs, countryList] = await Promise.all([
          fetchApi("/api/v1/applications") as Promise<Application[]>,
          fetchApi("/api/v1/documents") as Promise<Document[]>,
          fetchApi("/api/v1/countries") as Promise<CountrySummary[]>,
        ]);
        setApplications(apps || []);
        setDocuments(docs || []);
        setCountries(countryList || []);
      } catch (err) {
        setError("Failed to load timeline data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const startYear = useMemo(() => {
    if (profile?.graduationDate) {
      const d = new Date(profile.graduationDate);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return new Date().getFullYear();
  }, [profile]);

  const phases = useMemo((): TimelinePhase[] => {
    const phases = DEFAULT_PHASES.generic;
    let year = startYear;
    return phases.map((p, idx) => {
      const start = year;
      const duration = p.duration / 12;
      year += duration;
      return {
        label: p.label,
        icon: idx === 0 ? <FileCheck className="h-3 w-3" /> :
              idx === 1 ? <Clock className="h-3 w-3" /> :
              idx === 2 ? <Plane className="h-3 w-3" /> :
              idx === 3 ? <GraduationCap className="h-3 w-3" /> :
              idx === 4 ? <Briefcase className="h-3 w-3" /> :
              <Landmark className="h-3 w-3" />,
        startYear: start,
        durationYears: duration,
        color: PHASE_COLORS[idx % PHASE_COLORS.length],
      };
    });
  }, [startYear]);

  const minYear = useMemo(() => Math.min(...phases.map((p) => p.startYear)), [phases]);
  const maxYear = useMemo(() => {
    const last = phases[phases.length - 1];
    return Math.ceil((last?.startYear || startYear) + (last?.durationYears || 0));
  }, [phases, startYear]);
  const yearRange = useMemo(() => {
    const years: number[] = [];
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    return years;
  }, [minYear, maxYear]);

  const milestones = useMemo(() => {
    const items: { label: string; date: string }[] = [];
    applications.forEach((app) => {
      if (app.deadline) items.push({
        label: `${app.university?.name || "App"} Deadline`,
        date: app.deadline,
      });
    });
    documents.forEach((doc) => {
      if (doc.expiresAt) items.push({
        label: `${doc.name} Expires`,
        date: doc.expiresAt,
      });
    });
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return items.slice(0, 15);
  }, [applications, documents]);

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
        icon={GanttChart}
        title="Timeline Planner"
        description="Plan your entire journey from GRE/IELTS prep to graduation — with milestones, dependencies, and deadline tracking."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!profile?.graduationDate && !profile?.targetIntake ? (
        <EmptyState
          icon={GanttChart}
          title="Set your profile to build timeline"
          description="Add your graduation date and target intake in Settings to auto-generate your journey timeline."
        />
      ) : (
        <>
          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">
                Your Journey: Bangladesh → Abroad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[auto_1fr] gap-0 overflow-x-auto">
                <div className="border-r border-border/40 pr-3 pt-8 space-y-6 shrink-0">
                  {phases.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-foreground h-6">
                      {p.icon}
                      <span className="truncate max-w-[120px]">{p.label}</span>
                    </div>
                  ))}
                </div>
                <div className="min-w-[600px] overflow-x-auto">
                  <div className="flex border-b border-border/40">
                    {yearRange.map((year) => (
                      <div key={year} className="flex-1 text-center text-[10px] font-bold text-muted-foreground py-2 border-r border-border/20">
                        {year}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6 pt-2">
                    {phases.map((p, idx) => {
                      const totalCols = yearRange.length;
                      const startCol = p.startYear - minYear;
                      const spanCols = Math.max(p.durationYears, 0.5);
                      return (
                        <div key={idx} className="flex h-6 relative">
                          <div
                            className={`absolute rounded-full ${p.color} opacity-80 flex items-center justify-center text-[8px] font-black text-white truncate px-2`}
                            style={{
                              left: `${(startCol / totalCols) * 100}%`,
                              width: `${(spanCols / totalCols) * 100}%`,
                              minWidth: "40px",
                            }}
                          >
                            {p.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {milestones.length > 0 && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <span className="text-xs text-foreground truncate">{m.label}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <CountdownBadge date={m.date} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
