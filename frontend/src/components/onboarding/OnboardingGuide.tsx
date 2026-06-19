"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/store";

const TOURS = [
  {
    id: "recommendations",
    message: "Your top country matches are here",
    selector: "#ai-fit-recommendations",
    position: "bottom" as const,
  },
  {
    id: "universities",
    message: "Track universities you're interested in",
    selector: "[data-nav='universities']",
    position: "right" as const,
  },
  {
    id: "professors",
    message: "Email professors directly",
    selector: "[data-nav='professors']",
    position: "right" as const,
  },
];

function guideKey(userId: string) {
  return `onboarding_guide_dismissed_${userId}`;
}

export function OnboardingGuide() {
  const user = useAppSelector((s) => s.profile.profile);
  const userId = user?.userId ?? "guest";
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const val = localStorage.getItem(guideKey(userId));
      if (val !== "true") {
        // Show after a brief delay so the dashboard renders
        const timer = setTimeout(() => setDismissed(false), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, [userId]);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(guideKey(userId), "true");
    } catch { /* ignore */ }
  };

  const next = () => {
    if (step < TOURS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (dismissed) return null;

  const tour = TOURS[step];
  if (!tour) return null;

  // Find the target element
  const el =
    typeof document !== "undefined"
      ? document.querySelector(tour.selector)
      : null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Dark overlay behind tooltip */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Tooltip */}
      <div
        className="absolute z-50 pointer-events-auto bg-card border border-border rounded-xl shadow-2xl p-4 max-w-xs animate-in fade-in zoom-in duration-200"
        style={
          el
            ? getTooltipPosition(el, tour.position)
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        }
      >
        <p className="text-sm text-foreground font-medium mb-3">
          {tour.message}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {step + 1} of {TOURS.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Skip tour
            </button>
            <button
              type="button"
              onClick={next}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              {step < TOURS.length - 1 ? "Got it" : "Finish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTooltipPosition(
  el: Element,
  position: "bottom" | "right"
): React.CSSProperties {
  const rect = el.getBoundingClientRect();
  const gap = 12;

  switch (position) {
    case "bottom":
      return {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + gap,
        transform: "translateY(-50%)",
      };
  }
}
