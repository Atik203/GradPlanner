"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { DollarSign } from "lucide-react";
import type { UnivBreakdown } from "@/types";

interface Props {
  breakdownByUniversity: UnivBreakdown[];
  totalEstimatedCost: number;
  scholarshipsTotal: number;
  fundingGap: number;
  avgPostGradSalary: number;
  roiScore: number;
}

export function FinancialROI({ breakdownByUniversity, totalEstimatedCost, scholarshipsTotal, fundingGap, avgPostGradSalary, roiScore }: Props) {
  if (breakdownByUniversity.length === 0 || totalEstimatedCost === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Financial ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={DollarSign}
            title="No financial data yet"
            description="Add tuition and living costs to your tracked universities to see your ROI."
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = breakdownByUniversity.map((u) => ({
    name: u.name.length > 18 ? u.name.slice(0, 16) + "…" : u.name,
    tuition: u.tuition,
    livingCost: u.livingCost,
    scholarship: u.scholarship,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Financial ROI
        </CardTitle>
        <CardDescription className="text-xs">Estimated costs and funding across your universities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-[10px] text-muted-foreground">Est. Total Cost</p>
            <p className="text-lg font-black text-foreground">${totalEstimatedCost.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-[10px] text-muted-foreground">Scholarships</p>
            <p className="text-lg font-black text-emerald-400">${scholarshipsTotal.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-[10px] text-muted-foreground">Funding Gap</p>
            <p className={`text-lg font-black ${fundingGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
              ${fundingGap.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-[10px] text-muted-foreground">ROI Score</p>
            <p className="text-lg font-black text-foreground">
              {roiScore}x
              <span className="text-[10px] text-muted-foreground ml-1">salary/cost</span>
            </p>
          </div>
        </div>

        {avgPostGradSalary > 0 && (
          <p className="text-xs text-muted-foreground">
            Avg. post-grad salary: <span className="font-bold text-foreground">${avgPostGradSalary.toLocaleString()}/yr</span>
          </p>
        )}

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={24} barGap={2}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
              iconSize={8}
            />
            <Bar dataKey="tuition" name="Tuition" stackId="a" fill="oklch(0.523 0.153 163 / 0.5)" />
            <Bar dataKey="livingCost" name="Living" stackId="a" fill="oklch(0.7 0.15 75 / 0.4)" />
            <Bar dataKey="scholarship" name="Scholarship" fill="oklch(0.523 0.153 163 / 0.7)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
