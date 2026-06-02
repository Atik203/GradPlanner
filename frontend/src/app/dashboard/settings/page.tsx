"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  ArrowLeft, 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  KeyRound, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [timelineNotices, setTimelineNotices] = useState(true);
  const [prPriority, setPrPriority] = useState("PR speed");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 800);
  };

  if (!mounted) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      
      {/* Navigation Header */}
      <div className="space-y-1">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Settings</h2>
        <p className="text-muted-foreground text-sm">Customize your preferences, theme options, and notification alerts.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Theme Configuration */}
        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Aesthetic & Theme Preferences</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Select how GradPlanner looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {/* Light Theme */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  theme === "light"
                    ? "bg-primary/5 border-primary text-primary font-bold shadow-xs"
                    : "bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Light</span>
              </button>

              {/* Dark Theme */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  theme === "dark"
                    ? "bg-primary/5 border-primary text-primary font-bold shadow-xs"
                    : "bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Dark</span>
              </button>

              {/* System Theme */}
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
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

        {/* 2. Notification Configuration */}
        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Reminders & Notifications
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Manage reminders for deadlines and visa timelines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex items-start gap-3">
              <input
                id="emailAlerts"
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4"
              />
              <div className="text-xs">
                <Label htmlFor="emailAlerts" className="font-bold text-foreground cursor-pointer">Admissions Deadline Alerts</Label>
                <p className="text-muted-foreground mt-0.5">Send email alerts 30 days prior to tracked university cutoff deadlines.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-border/40 pt-4">
              <input
                id="timelineNotices"
                type="checkbox"
                checked={timelineNotices}
                onChange={(e) => setTimelineNotices(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4"
              />
              <div className="text-xs">
                <Label htmlFor="timelineNotices" className="font-bold text-foreground cursor-pointer">Immigration Timeline Updates</Label>
                <p className="text-muted-foreground mt-0.5">Notify when visa processing wait times change at the German or Canadian Embassy in Dhaka.</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 3. Strategic Strategy Preferences */}
        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Immigration Strategy Strategy</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Select your primary PR goal parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="strategySel" className="text-xs text-muted-foreground">Prioritize recommendations by</Label>
              <select
                id="strategySel"
                value={prPriority}
                onChange={(e) => setPrPriority(e.target.value)}
                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer"
              >
                <option value="PR speed">Fastest Route to PR & Citizenship (e.g. Canada/Germany)</option>
                <option value="AI Market">AI/ML Job Market & Maximum Salaries (e.g. USA/Switzerland)</option>
                <option value="No Tuition">Zero Tuition Fees / Budget Programs (e.g. Germany/Europe)</option>
                <option value="Scholarship">Maximum Stipends & Funding (e.g. UAE/Japan)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t border-border/60">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 shadow-sm cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving settings...
              </>
            ) : "Save Preferences"}
          </Button>
        </div>

      </form>

    </div>
  );
}
