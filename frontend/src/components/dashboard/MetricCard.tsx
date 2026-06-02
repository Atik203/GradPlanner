"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

const colorMap = {
  default: { bg: "bg-muted/30", text: "text-foreground", icon: "text-foreground/60" },
  success: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "text-emerald-400" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "text-amber-400" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", icon: "text-destructive" },
  info: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "text-blue-400" },
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  trendValue,
  color = "default",
  className = "",
}: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`rounded-xl border border-border/60 bg-card/30 backdrop-blur-md p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${
            trend === "up" ? "text-emerald-400" :
            trend === "down" ? "text-destructive" :
            "text-muted-foreground"
          }`}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${colors.text}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
