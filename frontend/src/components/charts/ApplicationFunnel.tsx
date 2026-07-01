"use client";

import React, { useMemo } from "react";
import { Funnel, FunnelChart, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

interface Props {
  funnel: Record<string, number>;
  total: number;
}

const STAGE_ORDER = ["PLANNING", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "OFFER_RECEIVED", "ACCEPTED"];

const STAGE_COLORS: Record<string, string> = {
  PLANNING: "oklch(0.55 0 0 / 0.2)",
  IN_PROGRESS: "oklch(0.7 0.15 75 / 0.4)",
  SUBMITTED: "oklch(0.523 0.153 163 / 0.4)",
  UNDER_REVIEW: "oklch(0.55 0.2 295 / 0.3)",
  OFFER_RECEIVED: "oklch(0.523 0.153 163 / 0.6)",
  ACCEPTED: "oklch(0.523 0.153 163)",
};

const STAGE_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  OFFER_RECEIVED: "Offer",
  ACCEPTED: "Accepted",
};

export function ApplicationFunnel({ funnel, total }: Props) {
  const data = useMemo(() => {
    return STAGE_ORDER.map((status) => ({
      name: STAGE_LABELS[status],
      value: funnel[status] || 0,
      fill: STAGE_COLORS[status],
    }));
  }, [funnel]);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Application Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="No applications yet"
            description="Add universities and start tracking applications to see your funnel."
          />
        </CardContent>
      </Card>
    );
  }

  const rates = useMemo(() => {
    const r: string[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      const from = data[i].value;
      const to = data[i + 1].value;
      if (from > 0) r.push(`${Math.round((to / from) * 100)}%`);
      else r.push("—");
    }
    return r;
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Application Funnel
        </CardTitle>
        <CardDescription className="text-xs">
          {total} application{total !== 1 ? "s" : ""} tracked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1">
          <ResponsiveContainer width="70%" height={280}>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value} applications`, ""]}
              />
              <Funnel dataKey="value" data={data} isAnimationActive>
                <LabelList
                  position="right"
                  fill="hsl(var(--foreground))"
                  stroke="none"
                  fontSize={11}
                  fontWeight={600}
                  formatter={(value) => (typeof value === "number" && value > 0 ? value : "")}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-around pb-4 ml-2 text-[10px] text-muted-foreground space-y-1">
            {rates.map((rate, i) => (
              <span key={i} className="font-mono">
                {rate} conv.
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
