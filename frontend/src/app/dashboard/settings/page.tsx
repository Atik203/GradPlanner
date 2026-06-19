"use client";

/**
 * /dashboard/settings — User preferences page.
 *
 * Phase 1 changes:
 *   - Theme selector unchanged (client-only via next-themes, no API).
 *   - Notification toggles + strategy selector now persist via /api/v1/settings.
 *   - Form state managed by react-hook-form. Client-side validation via Zod's
 *     safeParse in onSubmit (the zodResolver@Zod-v4 type detection currently
 *     leaks `unknown` into the form's JSX-bound types).
 *   - Loading: SettingsSkeleton (matches the page shape).
 *   - Error: ApiErrorAlert with retry.
 *   - Success: Sonner toast.
 *   - Mobile: full-width sections, 44px toggle hit areas.
 *
 * The backend GET upserts a default row on first call, so the form is never
 * in an "empty" state on initial load.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  KeyRound,
  Loader2,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { settingsApi } from "@/lib/api";
import type { StrategyPreference } from "@/types";

// ─── Zod schema (mirrors backend settingsUpdateSchema) ──────────────────────

const strategyEnum = z.enum(["PR speed", "AI Market", "No Tuition", "Scholarship"]);

const settingsFormSchema = z.object({
  emailDeadlineAlerts: z.boolean(),
  timelineNotifications: z.boolean(),
  strategyPreference: strategyEnum,
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// ─── Strategy options (display copy) ─────────────────────────────────────────

const STRATEGY_OPTIONS: Array<{ value: StrategyPreference; label: string }> = [
  { value: "PR speed", label: "Fastest Route to PR & Citizenship (e.g. Canada / Germany)" },
  { value: "AI Market", label: "AI/ML Job Market & Maximum Salaries (e.g. USA / Switzerland)" },
  { value: "No Tuition", label: "Zero Tuition Fees / Budget Programs (e.g. Germany / Europe)" },
  { value: "Scholarship", label: "Maximum Stipends & Funding (e.g. UAE / Japan)" },
];

// ─── Toggle component (touch-friendly, accessible) ───────────────────────────

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

function Toggle({ id, checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full
        border border-border transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-primary" : "bg-muted"}
        min-h-[44px] min-w-[44px] p-0
      `}
    >
      <span
        aria-hidden="true"
        className={`
          inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0
          transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      emailDeadlineAlerts: true,
      timelineNotifications: true,
      strategyPreference: "PR speed" as StrategyPreference,
    },
  });

  const emailAlerts = watch("emailDeadlineAlerts");
  const timelineNotices = watch("timelineNotifications");
  const prPriority = watch("strategyPreference");

  // ── Hydration / SSR safety ────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load current settings ─────────────────────────────────────────────────
  async function loadSettings() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await settingsApi.get();
      reset({
        emailDeadlineAlerts: data.emailDeadlineAlerts,
        timelineNotifications: data.timelineNotifications,
        strategyPreference: data.strategyPreference,
      });
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  async function onSubmit(values: SettingsFormValues) {
    // Client-side validation as a fast pre-check. Backend is the source of truth.
    const parsed = settingsFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please check your input", {
        description: parsed.error.issues[0]?.message ?? "Validation failed.",
      });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await settingsApi.update(parsed.data);
      reset(parsed.data);
      toast.success("Settings saved", {
        description: "Your preferences have been updated.",
      });
    } catch (err) {
      setSubmitError(err);
      toast.error("Could not save settings", {
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render: hydration / first paint ───────────────────────────────────────
  if (!mounted || loading) {
    return <SettingsSkeleton />;
  }

  if (loadError) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h2>
        </div>
        <ApiErrorAlert error={loadError} onRetry={loadSettings} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Customize your preferences, theme options, and notification alerts.
        </p>
      </div>

      {submitError && !submitting ? (
        <ApiErrorAlert
          error={submitError}
          title="Save failed"
          compact
          onRetry={() => {
            void handleSubmit(onSubmit)();
          }}
        />
      ) : null}

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="space-y-6"
        noValidate
      >
        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <SettingsIcon className="h-4 w-4 text-primary" />
              Aesthetic & Theme Preferences
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select how GradPlanner looks on your device. Theme is saved locally to your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                  theme === "light"
                    ? "bg-primary/5 border-primary text-primary font-bold shadow-xs"
                    : "bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                  theme === "dark"
                    ? "bg-primary/5 border-primary text-primary font-bold shadow-xs"
                    : "bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                aria-pressed={theme === "system"}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                  theme === "system"
                    ? "bg-primary/5 border-primary text-primary font-bold shadow-xs"
                    : "bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-primary" />
              Reminders & Notifications
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Manage reminders for deadlines and visa timelines. Changes save when you click
              &ldquo;Save Preferences&rdquo;.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="emailAlerts"
                  className="font-bold text-foreground text-xs cursor-pointer"
                >
                  Admissions Deadline Alerts
                </Label>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Send email alerts 30 days prior to tracked university cutoff deadlines.
                </p>
              </div>
              <Toggle
                id="emailAlerts"
                checked={emailAlerts}
                onChange={(v) =>
                  setValue("emailDeadlineAlerts", v, { shouldDirty: true })
                }
                disabled={submitting}
              />
            </div>

            <div className="flex items-start gap-3 border-t border-border/40 pt-4">
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="timelineNotices"
                  className="font-bold text-foreground text-xs cursor-pointer"
                >
                  Immigration Timeline Updates
                </Label>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Notify when visa processing wait times change at the German or Canadian
                  Embassy in Dhaka.
                </p>
              </div>
              <Toggle
                id="timelineNotices"
                checked={timelineNotices}
                onChange={(v) =>
                  setValue("timelineNotifications", v, { shouldDirty: true })
                }
                disabled={submitting}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-primary" />
              Immigration Strategy
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select your primary PR goal parameters. Used by country-matching to weight
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="strategySel" className="text-xs text-muted-foreground">
                Prioritize recommendations by
              </Label>
              <Select
                value={prPriority}
                onValueChange={(value) =>
                  setValue("strategyPreference", value as StrategyPreference, {
                    shouldDirty: true,
                  })
                }
                disabled={submitting}
              >
                <SelectTrigger id="strategySel" className="w-full">
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 border-t border-border/60">
          <Button
            type="submit"
            disabled={submitting || !isDirty}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 shadow-sm cursor-pointer min-h-[44px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving settings…
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
