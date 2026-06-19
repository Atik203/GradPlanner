"use client";

import React from "react";
import type { WizardData } from "./OnboardingWizard";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { BdtConverter } from "@/components/shared/BdtConverter";

interface Props {
  data: WizardData;
  onEdit: (step: number) => void;
  onComplete: () => void;
  submitting: boolean;
  error: string | null;
}

function completenessPct(data: WizardData): number {
  const fields = [
    !!data.university,
    !!data.cgpa,
    !!data.targetDegree,
    !!data.targetIntake,
    !!data.graduationMonth && !!data.graduationYear,
    !!data.ieltsScore,
    !!data.monthlyBudgetUSD,
    data.researchInterests.length > 0,
    data.prPriority !== 0,
    data.familyRelocation !== null,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function StepSummary({ data, onEdit, onComplete, submitting, error }: Props) {
  const pct = completenessPct(data);
  const budgetNum = data.monthlyBudgetUSD
    ? parseFloat(data.monthlyBudgetUSD)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <h2 className="text-xl font-bold text-foreground">
          Here&apos;s your profile
        </h2>
      </div>

      {/* Completeness gauge */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-primary transition-all duration-1000"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black text-foreground">{pct}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Profile completeness</p>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        {/* Section 1: Academic */}
        <SummarySection
          title="Academic Profile"
          onEdit={() => onEdit(0)}
          items={[
            { label: "University", value: data.university },
            { label: "CGPA", value: data.cgpa },
            { label: "Target Degree", value: data.targetDegree },
            {
              label: "Graduation",
              value:
                data.graduationMonth && data.graduationYear
                  ? `${data.graduationMonth} ${data.graduationYear}`
                  : null,
            },
            { label: "Intake", value: data.targetIntake },
          ]}
        />

        {/* Section 2: Match Intelligence */}
        <SummarySection
          title="Match Intelligence"
          onEdit={() => onEdit(1)}
          items={[
            { label: "IELTS", value: data.ieltsScore },
            {
              label: "Budget",
              value: budgetNum ? `$${budgetNum}/mo` : null,
              extra: budgetNum ? <BdtConverter usd={budgetNum} /> : null,
            },
            {
              label: "Research Interests",
              value:
                data.researchInterests.length > 0
                  ? data.researchInterests.join(", ")
                  : null,
            },
            { label: "PR Priority", value: `${data.prPriority}/5` },
          ]}
        />

        {/* Section 3: Priorities */}
        <SummarySection
          title="Priorities"
          onEdit={() => onEdit(2)}
          items={[
            {
              label: "Travel",
              value: data.familyRelocation ? "With family" : "Solo",
            },
            {
              label: "Priority",
              value: Object.entries(data.priorityRanking)
                .sort(([, a], [, b]) => a - b)
                .map(([k]) => k)
                .join(" > "),
            },
          ]}
        />
      </div>

      {pct < 80 && (
        <p className="text-xs text-muted-foreground text-center">
          You can always complete your profile later in Settings.
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onComplete}
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer animate-pulse"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Launch Your Workspace →"
        )}
      </button>
    </div>
  );
}

function SummarySection({
  title,
  onEdit,
  items,
}: {
  title: string;
  onEdit: () => void;
  items: { label: string; value: string | null | undefined; extra?: React.ReactNode }[];
}) {
  const hasData = items.some((i) => i.value);

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[10px] text-primary hover:text-primary/80 font-semibold cursor-pointer"
        >
          Edit
        </button>
      </div>
      {hasData ? (
        <div className="space-y-1">
          {items.map(
            (item) =>
              item.value && (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {item.label}:
                  </span>
                  <span className="text-xs text-foreground text-right truncate">
                    {item.value}
                    {item.extra && (
                      <span className="ml-1">{item.extra}</span>
                    )}
                  </span>
                </div>
              )
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 italic">All skipped</p>
      )}
    </div>
  );
}
