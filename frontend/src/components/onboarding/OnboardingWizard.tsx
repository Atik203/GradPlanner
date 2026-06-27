"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { profileApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { StepAcademicProfile } from "./StepAcademicProfile";
import { StepMatchIntelligence } from "./StepMatchIntelligence";
import { StepPriorities } from "./StepPriorities";
import { StepSummary } from "./StepSummary";

export interface WizardData {
  university: string;
  cgpa: string;
  targetDegree: string;
  targetIntake: string;
  graduationMonth: string;
  graduationYear: string;
  ieltsScore: string;
  monthlyBudgetUSD: string;
  researchInterests: string[];
  prPriority: number;
  familyRelocation: boolean;
  countryPreferences: string[];
  priorityRanking: Record<string, number>;
}

const STEPS = [
  "Academic Profile",
  "Match Intelligence",
  "Priorities",
  "Summary & Launch",
];

function storageKey(userId: string) {
  return `onboarding_wizard_${userId}`;
}

function defaultData(): WizardData {
  return {
    university: "",
    cgpa: "",
    targetDegree: "",
    targetIntake: "",
    graduationMonth: "",
    graduationYear: "",
    ieltsScore: "",
    monthlyBudgetUSD: "",
    researchInterests: [],
    prPriority: 3,
    familyRelocation: false,
    countryPreferences: [],
    priorityRanking: { Funding: 1, PR: 2, "Job Market": 3, Ranking: 4, Cost: 5 },
  };
}

export function OnboardingWizard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.profile.profile);
  const userId = user?.userId ?? "guest";

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(defaultData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey(userId));
      if (saved) {
        const parsed = JSON.parse(saved) as {
          step?: number;
          data?: Partial<WizardData>;
        };
        if (parsed.step != null) setCurrentStep(parsed.step);
        if (parsed.data) setData((prev) => ({ ...prev, ...parsed.data }));
      }
    } catch {
      // sessionStorage unavailable — start fresh
    }
  }, [userId]);

  // Persist session
  const persist = useCallback(
    (step: number, formData: WizardData) => {
      try {
        sessionStorage.setItem(
          storageKey(userId),
          JSON.stringify({ step, data: formData })
        );
      } catch {
        // storage full or unavailable — ignore
      }
    },
    [userId]
  );

  const updateData = (patch: Partial<WizardData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      persist(currentStep, next);
      return next;
    });
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setStepError(null);
    persist(step, data);
  };

  /** Validates hard-constraint fields for the current step.
   *  Returns an error message or null if valid. Steps other than 0 and 1
   *  have no required fields — the wizard is intentionally skippable. */
  const validateStep = (step: number): string | null => {
    if (step === 0 && data.cgpa) {
      const cgpa = parseFloat(data.cgpa);
      if (Number.isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) {
        return "CGPA must be between 0.00 and 4.00.";
      }
    }
    if (step === 1 && data.ieltsScore) {
      const ielts = parseFloat(data.ieltsScore);
      if (Number.isNaN(ielts) || ielts < 0 || ielts > 9.0) {
        return "IELTS score must be between 0.0 and 9.0.";
      }
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setStepError(validationError);
      return;
    }
    goToStep(currentStep + 1);
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (data.university) body.university = data.university;
      if (data.cgpa) body.cgpa = parseFloat(data.cgpa);
      if (data.targetDegree) body.targetDegree = data.targetDegree;
      if (data.targetIntake) body.targetIntake = data.targetIntake;
      if (data.graduationMonth && data.graduationYear) {
        body.graduationDate = `${data.graduationMonth} ${data.graduationYear}`;
      }
      if (data.ieltsScore) body.ieltsScore = parseFloat(data.ieltsScore);
      if (data.monthlyBudgetUSD) body.monthlyBudgetUSD = parseInt(data.monthlyBudgetUSD, 10);
      if (data.researchInterests.length > 0) body.researchInterests = data.researchInterests;
      body.prPriority = data.prPriority;
      body.familyRelocation = data.familyRelocation;

      const profile = await profileApi.completeOnboarding(body);
      dispatch(setProfile(profile));
      try {
        sessionStorage.removeItem(storageKey(userId));
      } catch { /* ignore */ }
      toast.success("Welcome aboard! Your workspace is ready.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    try {
      sessionStorage.removeItem(storageKey(userId));
    } catch { /* ignore */ }
    if (user) {
      dispatch(setProfile({ ...user, isOnboarded: true }));
    }
  };

  const renderStep = () => {
    const stepProps = {
      data,
      updateData,
    };

    switch (currentStep) {
      case 0:
        return <StepAcademicProfile {...stepProps} />;
      case 1:
        return <StepMatchIntelligence {...stepProps} />;
      case 2:
        return <StepPriorities {...stepProps} />;
      case 3:
        return (
          <StepSummary
            data={data}
            onEdit={goToStep}
            onComplete={handleComplete}
            submitting={submitting}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[640px] mx-auto bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Step indicator */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Let&apos;s set up your profile
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-xs text-muted-foreground sm:hidden">
              Step {currentStep + 1}/{STEPS.length}
            </span>
          </div>

          {/* Step pills - desktop */}
          <div className="hidden sm:flex gap-1 mb-3">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                  i < currentStep
                    ? "bg-primary"
                    : i === currentStep
                    ? "bg-primary/60"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Progress bar - mobile */}
          <div className="sm:hidden w-full bg-muted rounded-full h-1.5 mb-3">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between">
            <div>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={() => goToStep(currentStep - 1)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}
            </div>
            <div className="flex items-center gap-4">
              {stepError && (
                <p className="text-xs text-destructive max-w-[200px] text-right">{stepError}</p>
              )}
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg transition-all cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="px-6 pb-4">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
