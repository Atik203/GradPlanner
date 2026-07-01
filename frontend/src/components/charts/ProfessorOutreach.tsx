"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { GraduationCap, ThumbsUp, ThumbsDown, Mail, BarChart3, Users } from "lucide-react";

interface Props {
  total: number;
  contacted: number;
  repliedPositive: number;
  repliedNegative: number;
  noResponse: number;
  responseRate: number;
  averageFitScore: number;
  followUpEfficacy: number;
}

const COLORS = {
  positive: "oklch(0.523 0.153 163)",
  negative: "oklch(0.577 0.245 27.325)",
  noResponse: "oklch(0.556 0 0 / 0.3)",
};

export function ProfessorOutreach({ total, contacted, repliedPositive, repliedNegative, noResponse, responseRate, averageFitScore, followUpEfficacy }: Props) {
  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Professor Outreach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={GraduationCap}
            title="No professors tracked"
            description="Add professors and start emailing to see outreach analytics."
          />
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Positive", value: repliedPositive, color: COLORS.positive },
    { name: "Negative", value: repliedNegative, color: COLORS.negative },
    { name: "No Response", value: noResponse, color: COLORS.noResponse },
  ].filter((d) => d.value > 0);

  const metrics = [
    { icon: Mail, label: "Contacted", value: `${contacted}/${total}` },
    { icon: ThumbsUp, label: "Response Rate", value: `${responseRate}%` },
    { icon: BarChart3, label: "Avg Fit Score", value: averageFitScore > 0 ? `${averageFitScore}/10` : "—" },
    { icon: Users, label: "Follow-up Efficacy", value: `${followUpEfficacy}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Professor Outreach
        </CardTitle>
        <CardDescription className="text-xs">{total} professor{total !== 1 ? "s" : ""} tracked</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
              <m.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-xs font-bold text-foreground">{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {pieData.length > 0 && (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
