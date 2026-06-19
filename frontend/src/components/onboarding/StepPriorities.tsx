"use client";

import React from "react";
import type { WizardData } from "./OnboardingWizard";
import { Label } from "@/components/ui/label";
import { Target, Users, User } from "lucide-react";

interface Props {
  data: WizardData;
  updateData: (patch: Partial<WizardData>) => void;
}

const PRIORITY_ITEMS = ["Funding", "PR", "Job Market", "Ranking", "Cost"];
const RANK_OPTIONS = [1, 2, 3, 4, 5];

function useUniqueRank(
  current: Record<string, number>,
  key: string,
  value: number
): Record<string, number> {
  const next = { ...current };
  // Remove the value from whoever had it
  for (const k of Object.keys(next)) {
    if (next[k] === value) {
      next[k] = current[key];
    }
  }
  next[key] = value;
  return next;
}

export function StepPriorities({ data, updateData }: Props) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Your Priorities
        </h2>
      </div>

      {/* Family Relocation */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Traveling with Family?
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateData({ familyRelocation: false })}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.familyRelocation === false
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:border-muted-foreground/30"
            }`}
          >
            <User className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Solo</span>
            <span className="text-[10px] text-muted-foreground text-center">
              Traveling alone
            </span>
          </button>
          <button
            type="button"
            onClick={() => updateData({ familyRelocation: true })}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.familyRelocation === true
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:border-muted-foreground/30"
            }`}
          >
            <Users className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Family</span>
            <span className="text-[10px] text-muted-foreground text-center">
              Bringing spouse/children
            </span>
          </button>
        </div>
      </div>

      {/* Priority Ranking */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          What matters most? (Rank 1–5)
        </Label>
        <div className="space-y-2">
          {PRIORITY_ITEMS.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60"
            >
              <span className="text-sm font-medium text-foreground">
                {item}
              </span>
              <select
                value={data.priorityRanking[item] ?? 3}
                onChange={(e) =>
                  updateData({
                    priorityRanking: useUniqueRank(
                      data.priorityRanking,
                      item,
                      parseInt(e.target.value, 10)
                    ),
                  })
                }
                className="h-9 rounded-lg border border-border bg-background text-foreground text-sm px-2 cursor-pointer"
              >
                {RANK_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
