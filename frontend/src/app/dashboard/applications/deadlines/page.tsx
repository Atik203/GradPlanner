"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { CountdownBadge } from "@/components/dashboard/CountdownBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { GenericPageSkeleton } from "@/components/skeletons/GenericPageSkeleton";
import type { Application, Document } from "@/types";

interface DeadlineItem {
  id: string;
  type: "application" | "document";
  title: string;
  subtitle: string;
  date: string;
  status: string;
  universityName?: string;
  docType?: string;
}

function parseDate(str: string | null | undefined): string | null {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return str;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const URGENCY_CLASSES = (days: number) => {
  if (days < 0) return "border-l-2 border-destructive/60 bg-destructive/5";
  if (days <= 7) return "border-l-2 border-destructive/60 bg-destructive/5 animate-pulse";
  if (days <= 30) return "border-l-2 border-amber-500/60 bg-amber-500/5";
  return "";
};

export default function UpcomingDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grouped">("list");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [apps, docs] = await Promise.all([
          fetchApi("/api/v1/applications") as Promise<Application[]>,
          fetchApi("/api/v1/documents") as Promise<Document[]>,
        ]);

        const items: DeadlineItem[] = [];

        (apps || []).forEach((app) => {
          const date = parseDate(app.deadline);
          if (date) {
            items.push({
              id: app.id,
              type: "application",
              title: app.university?.name || "University",
              subtitle: `Application — ${app.status.replace(/_/g, " ")}`,
              date,
              status: app.status,
              universityName: app.university?.name,
            });
          }
        });

        (docs || []).forEach((doc) => {
          const date = parseDate(doc.expiresAt);
          if (date) {
            items.push({
              id: doc.id,
              type: "document",
              title: doc.name,
              subtitle: `${doc.type.replace(/_/g, " ")} — ${doc.status.replace(/_/g, " ")}`,
              date,
              status: doc.status,
              docType: doc.type,
            });
          }
        });

        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDeadlines(items);
      } catch (err) {
        setError("Failed to load deadlines.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, DeadlineItem[]> = {};
    deadlines.forEach((d) => {
      const date = new Date(d.date);
      const key = date.toLocaleString("default", { month: "long", year: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  }, [deadlines]);

  const now = new Date();
  const upcoming = deadlines.filter((d) => new Date(d.date) >= now);

  if (loading) {
    return <GenericPageSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={CalendarClock}
        title="Upcoming Deadlines"
        description="Timeline view of all upcoming application deadlines, document submission dates, and interview schedules."
        backHref="/dashboard/applications"
        backLabel="Back to App Pipeline"
      />

      {error && (
        <ApiErrorAlert error={error} />
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("list")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            view === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setView("grouped")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            view === "grouped" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Grouped by Month
        </button>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {upcoming.length} upcoming · {deadlines.length} total
        </span>
      </div>

      {deadlines.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No deadlines found"
          description="Add applications with deadlines or track documents with expiry dates to see them here."
        />
      ) : view === "list" ? (
        <div className="space-y-2">
          {deadlines.map((item) => {
            const days = daysUntil(item.date);
            return (
              <Card key={item.id} className={`border-border/60 bg-card/25 hover:bg-card/40 transition-all ${URGENCY_CLASSES(days)}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.type === "application" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                      }`}>
                        {item.type === "application" ? "Application" : "Document"}
                      </span>
                      <span className="text-sm font-bold text-foreground truncate">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <CountdownBadge date={item.date} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([month, items]) => (
            <div key={month}>
              <h3 className="text-sm font-bold text-foreground mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                {month}
              </h3>
              <div className="space-y-2">
                {items.map((item) => {
                  const days = daysUntil(item.date);
                  return (
                    <Card key={item.id} className={`border-border/60 bg-card/25 hover:bg-card/40 transition-all ${URGENCY_CLASSES(days)}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.type === "application" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                            }`}>
                              {item.type === "application" ? "App" : "Doc"}
                            </span>
                            <span className="text-sm font-bold text-foreground truncate">{item.title}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <CountdownBadge date={item.date} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
