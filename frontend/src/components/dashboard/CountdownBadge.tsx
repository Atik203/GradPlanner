"use client";

import React from "react";
import { Clock } from "lucide-react";

interface CountdownBadgeProps {
  date: string | null | undefined;
  label?: string;
  className?: string;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function CountdownBadge({ date, label, className = "" }: CountdownBadgeProps) {
  if (!date) return null;

  const days = daysUntil(date);
  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 7;
  const isWarning = days > 7 && days <= 30;

  const colorClasses = isOverdue
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : isUrgent
    ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
    : isWarning
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-muted/30 text-muted-foreground border-border/40";

  const displayText = isOverdue
    ? `${Math.abs(days)}d overdue`
    : days === 0
    ? "Today!"
    : `${days}d left`;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClasses} ${className}`}>
      <Clock className="h-3 w-3" />
      <span>{label ? `${label}: ${displayText}` : displayText}</span>
    </div>
  );
}

export { daysUntil };
