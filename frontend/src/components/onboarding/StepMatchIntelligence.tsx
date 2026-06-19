"use client";

import React from "react";
import type { WizardData } from "./OnboardingWizard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BdtConverter } from "@/components/shared/BdtConverter";
import { Brain, X } from "lucide-react";

const RESEARCH_SUGGESTIONS = [
  "NLP", "LLM", "Computer Vision", "Reinforcement Learning",
  "Deep Learning", "Robotics", "ML Theory", "Healthcare AI",
  "Generative AI", "Federated Learning", "Explainable AI",
  "Autonomous Systems", "Data Science", "Quantum ML",
];

const PR_PRIORITY_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: "Low", desc: "Returning after studies" },
  2: { label: "Moderate", desc: "Open if opportunity arises" },
  3: { label: "High", desc: "Aiming for PR" },
  4: { label: "Critical", desc: "PR is primary goal" },
  5: { label: "Essential", desc: "Citizenship non-negotiable" },
};

interface Props {
  data: WizardData;
  updateData: (patch: Partial<WizardData>) => void;
}

export function StepMatchIntelligence({ data, updateData }: Props) {
  const addTag = (tag: string) => {
    if (
      tag &&
      !data.researchInterests.includes(tag) &&
      data.researchInterests.length < 8
    ) {
      updateData({ researchInterests: [...data.researchInterests, tag] });
    }
  };

  const removeTag = (tag: string) => {
    updateData({
      researchInterests: data.researchInterests.filter((t) => t !== tag),
    });
  };

  const budgetNum = data.monthlyBudgetUSD
    ? parseFloat(data.monthlyBudgetUSD)
    : null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          What matters to you?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* IELTS */}
        <div>
          <Label htmlFor="ielts" className="text-xs text-muted-foreground">
            IELTS Score
          </Label>
          <Input
            id="ielts"
            type="number"
            min="0"
            max="9"
            step="0.5"
            placeholder="7.0"
            value={data.ieltsScore}
            onChange={(e) => updateData({ ieltsScore: e.target.value })}
            className="bg-background border-border"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            6.5+ recommended for English-speaking countries
          </p>
        </div>

        {/* Budget */}
        <div>
          <Label htmlFor="budget" className="text-xs text-muted-foreground">
            Monthly Budget (USD)
          </Label>
          <Input
            id="budget"
            type="number"
            min="0"
            placeholder="1500"
            value={data.monthlyBudgetUSD}
            onChange={(e) => updateData({ monthlyBudgetUSD: e.target.value })}
            className="bg-background border-border"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            <BdtConverter usd={budgetNum} />
          </p>
        </div>

        {/* Research Tags */}
        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">
            Research Interests
          </Label>
          <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
            {data.researchInterests.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RESEARCH_SUGGESTIONS.filter(
              (s) => !data.researchInterests.includes(s)
            ).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                disabled={data.researchInterests.length >= 8}
                className="px-2.5 py-1 text-xs rounded-full border border-border bg-muted/50 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* PR Priority */}
        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">
            PR Priority: {data.prPriority} —{" "}
            {PR_PRIORITY_LABELS[data.prPriority]?.label ?? "High"}
          </Label>
          <input
            type="range"
            min="1"
            max="5"
            value={data.prPriority}
            onChange={(e) =>
              updateData({ prPriority: parseInt(e.target.value, 10) })
            }
            className="w-full mt-1 accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            {Object.entries(PR_PRIORITY_LABELS).map(([key, v]) => (
              <span key={key} className="text-center w-12">
                {v.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
