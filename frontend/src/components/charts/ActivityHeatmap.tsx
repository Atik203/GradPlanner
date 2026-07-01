"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";

interface Props {
  timeline: Array<{ date: string; count: number }>;
}

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(count: number): string {
  if (count === 0) return "bg-muted/20";
  if (count <= 2) return "bg-emerald-500/20";
  if (count <= 5) return "bg-emerald-500/40";
  return "bg-emerald-500/70";
}

function getTooltip(count: number): string {
  if (count === 0) return "No activity";
  if (count === 1) return "1 action";
  return `${count} actions`;
}

export function ActivityHeatmap({ timeline }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; text: string; x: number; y: number } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    if (timeline.length === 0) return { weeks: [], monthLabels: [] };

    const weeks: Array<Array<{ date: string; count: number } | null>> = [];
    let currentWeek: Array<{ date: string; count: number } | null> = [];

    const firstDate = new Date(timeline[0].date);
    const dayOfWeek = firstDate.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push(null);
    }

    const labels: Array<{ index: number; label: string }> = [];
    let lastMonth = -1;

    for (const day of timeline) {
      const d = new Date(day.date);
      const month = d.getMonth();
      if (month !== lastMonth) {
        labels.push({ index: weeks.length, label: MONTHS[month] });
        lastMonth = month;
      }

      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { weeks, monthLabels: labels };
  }, [timeline]);

  const totalActions = useMemo(() => timeline.reduce((s, d) => s + d.count, 0), [timeline]);

  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Activity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="No activity yet"
            description="Start tracking universities, professors, and documents to build your activity heatmap."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Activity Heatmap
        </CardTitle>
        <CardDescription className="text-xs">
          {totalActions} action{totalActions !== 1 ? "s" : ""} in the last 365 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-[600px]">
            <div className="flex flex-col gap-1 pt-5 pr-1">
              {DAYS.map((d, i) => (
                <span key={i} className="h-3 text-[8px] text-muted-foreground leading-3">
                  {d}
                </span>
              ))}
            </div>
            <div className="flex-1">
              <div className="flex gap-0.5 mb-1" style={{ paddingLeft: "0px" }}>
                {monthLabels.length > 0 && weeks.map((_, wi) => {
                  const label = monthLabels.find((m) => m.index === wi);
                  return (
                    <span
                      key={wi}
                      className="text-[8px] text-muted-foreground"
                      style={{ width: "12px", visibility: label ? "visible" : "hidden" }}
                    >
                      {label?.label || ""}
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-0.5">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-0.5">
                    {week.map((day, di) => {
                      if (!day) return <div key={di} className="w-3 h-3" />;
                      return (
                        <div
                          key={day.date}
                          className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/30`}
                          onMouseEnter={(e) => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setTooltip({
                              date: day.date,
                              text: `${day.date} — ${getTooltip(day.count)}`,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3 justify-end text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted/20" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/20" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
          <span>More</span>
        </div>

        {tooltip && (
          <div
            className="fixed z-50 px-2 py-1 text-[10px] font-medium bg-popover border border-border rounded shadow-sm pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            {tooltip.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
