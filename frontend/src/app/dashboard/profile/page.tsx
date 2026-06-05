"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  GraduationCap,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Brain,
  Target,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const RESEARCH_SUGGESTIONS = [

  "NLP", "LLM", "Computer Vision", "Reinforcement Learning",
  "Deep Learning", "Robotics", "ML Theory", "Healthcare AI",
  "Generative AI", "Federated Learning", "Explainable AI",
  "Autonomous Systems", "Data Science", "Quantum ML",
];

const PR_PRIORITY_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: "Low",      desc: "Returning to Bangladesh after studies",    color: "text-muted-foreground" },
  2: { label: "Moderate", desc: "Open to staying if opportunity arises",    color: "text-blue-400" },
  3: { label: "High",     desc: "Aiming for permanent residency",           color: "text-amber-400" },
  4: { label: "Critical", desc: "PR is the primary goal of this journey",   color: "text-orange-400" },
  5: { label: "Essential", desc: "Citizenship pathway is non-negotiable",   color: "text-emerald-400" },
};

export default function ProfileDetailsPage() {
  const dispatch = useAppDispatch();
  const { data: session } = authClient.useSession();
  const profile = useAppSelector((state) => state.profile.profile);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Academic form state
  const [university, setUniversityName] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [graduationDate, setGraduationDate] = useState("");

  // Match Intelligence state
  const [ieltsScore, setIeltsScore] = useState("");
  const [monthlyBudgetUSD, setMonthlyBudgetUSD] = useState("");
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [researchInput, setResearchInput] = useState("");
  const [prPriority, setPrPriority] = useState<number>(3);
  const [familyRelocation, setFamilyRelocation] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const profileData = await fetchApi("/api/v1/profile");
        dispatch(setProfile(profileData));
        if (profileData) {
          setUniversityName(profileData.university || "");
          setCgpa(profileData.cgpa ? String(profileData.cgpa) : "");
          setTargetDegree(profileData.targetDegree || "");
          setTargetIntake(profileData.targetIntake || "");
          setGraduationDate(profileData.graduationDate || "");
          setIeltsScore(profileData.ieltsScore ? String(profileData.ieltsScore) : "");
          setMonthlyBudgetUSD(profileData.monthlyBudgetUSD ? String(profileData.monthlyBudgetUSD) : "");
          setResearchInterests(profileData.researchInterests ?? []);
          setPrPriority(profileData.prPriority ?? 3);
          setFamilyRelocation(profileData.familyRelocation ?? false);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [dispatch]);

  const addResearchTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !researchInterests.includes(clean) && researchInterests.length < 8) {
      setResearchInterests([...researchInterests, clean]);
    }
    setResearchInput("");
  };

  const removeResearchTag = (tag: string) => {
    setResearchInterests(researchInterests.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const updatedProfile = await fetchApi("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({
          university,
          cgpa: cgpa ? parseFloat(cgpa) : null,
          targetIntake,
          graduationDate,
          targetDegree,
          ieltsScore: ieltsScore ? parseFloat(ieltsScore) : null,
          monthlyBudgetUSD: monthlyBudgetUSD ? parseInt(monthlyBudgetUSD, 10) : null,
          researchInterests,
          prPriority,
          familyRelocation,
        }),
      });
      dispatch(setProfile(updatedProfile));
      setSuccess(true);
      toast.success("Profile saved! Country match scores recalculated.");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to save changes. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate profile readiness (now 10 fields)
  const fields = [
    !!profile?.university,
    profile?.cgpa !== null && profile?.cgpa !== undefined,
    !!profile?.targetDegree,
    !!profile?.targetIntake,
    !!profile?.graduationDate,
    profile?.ieltsScore !== null && profile?.ieltsScore !== undefined,
    profile?.monthlyBudgetUSD !== null && profile?.monthlyBudgetUSD !== undefined,
    (profile?.researchInterests?.length ?? 0) > 0,
    profile?.prPriority !== null && profile?.prPriority !== undefined,
    profile?.familyRelocation !== null && profile?.familyRelocation !== undefined,
  ];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  const prLabel = PR_PRIORITY_LABELS[prPriority] ?? PR_PRIORITY_LABELS[3];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">

      {/* Header */}
      <div className="space-y-1">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Profile & Match Intelligence</h2>
        <p className="text-muted-foreground text-sm">Your academic standing + match preferences drive personalised country scores.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Profile saved! Country match scores will update across GradPlanner.</span>
        </div>
      )}

      {/* Profile Completeness Bar */}
      <Card className="border-border/60 bg-card/25 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              Profile Completeness
            </span>
            <span className="text-xs font-bold text-primary">{completeness}% Complete</span>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <div
              className="bg-linear-to-r from-primary to-emerald-400 h-2 rounded-full transition-all duration-700"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2.5">
            {completeness < 60
              ? "⚠️ Add IELTS score, budget, and research interests to unlock accurate country match scores."
              : completeness < 100
              ? "Almost there — complete your match intelligence fields for maximum accuracy."
              : "✅ Full profile unlocks the most personalised country match scores."}
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Academic Profile ─────────────────────────────────────────── */}
        <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-md font-bold text-foreground">Academic Profile</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Your undergrad credentials and target degree.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Account read-only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border/55">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Account Holder</span>
                <p className="text-sm font-semibold text-foreground truncate">{session?.user?.name || "Student User"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email</span>
                <p className="text-sm font-semibold text-foreground truncate">{session?.user?.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="undergradUni" className="text-xs text-muted-foreground">Undergrad University</Label>
              <Input
                id="undergradUni"
                placeholder="UIU Dhaka, DU, NSU, BUET..."
                value={university}
                onChange={(e) => setUniversityName(e.target.value)}
                className="bg-background border-border text-foreground text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cgpaInput" className="text-xs text-muted-foreground">CGPA (out of 4.0)</Label>
                <Input
                  id="cgpaInput"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  placeholder="3.75"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="degreeInput" className="text-xs text-muted-foreground">Target Degree</Label>
                <Input
                  id="degreeInput"
                  placeholder="MSc Computer Science / PhD AI"
                  value={targetDegree}
                  onChange={(e) => setTargetDegree(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="intakeInput" className="text-xs text-muted-foreground">Target Intake</Label>
                <Input
                  id="intakeInput"
                  placeholder="September 2028"
                  value={targetIntake}
                  onChange={(e) => setTargetIntake(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gradInput" className="text-xs text-muted-foreground">Graduation Date</Label>
                <Input
                  id="gradInput"
                  placeholder="November 2027"
                  value={graduationDate}
                  onChange={(e) => setGraduationDate(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Match Intelligence ───────────────────────────────────────── */}
        <Card className="border-primary/20 bg-primary/5 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-md font-bold text-foreground">Match Intelligence</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Powers your personalised country match scores. The more you fill, the more accurate your recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
              {/* IELTS Score */}
              <div className="space-y-1.5">
                <Label htmlFor="ieltsInput" className="text-xs text-muted-foreground">
                  IELTS Score (actual or target)
                </Label>
                <Input
                  id="ieltsInput"
                  type="number"
                  step="0.5"
                  min="0"
                  max="9.0"
                  placeholder="7.0"
                  value={ieltsScore}
                  onChange={(e) => setIeltsScore(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Used to check country IELTS minimums</p>
              </div>

              {/* Monthly Budget */}
              <div className="space-y-1.5">
                <Label htmlFor="budgetInput" className="text-xs text-muted-foreground">
                  Monthly Budget (USD, self-funded)
                </Label>
                <Input
                  id="budgetInput"
                  type="number"
                  step="50"
                  min="0"
                  placeholder="1500"
                  value={monthlyBudgetUSD}
                  onChange={(e) => setMonthlyBudgetUSD(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
                <p className="text-[10px] text-muted-foreground">0 = fully scholarship-dependent</p>
              </div>
            </div>

            {/* Research Interests */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Research Interests (up to 8 tags)</Label>
              <div className="flex flex-wrap gap-1.5 min-h-8">
                {researchInterests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeResearchTag(tag)}
                      className="hover:text-destructive transition-colors cursor-pointer"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {researchInterests.length < 8 && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={researchInput}
                      onChange={(e) => setResearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addResearchTag(researchInput);
                        }
                      }}
                      placeholder="Add interest..."
                      className="bg-background border border-border rounded-full px-2 py-0.5 text-[10px] text-foreground outline-none focus:ring-1 focus:ring-primary w-28"
                    />
                    <button
                      type="button"
                      onClick={() => addResearchTag(researchInput)}
                      className="p-0.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
              {/* Quick-add suggestions */}
              <div className="flex flex-wrap gap-1 pt-1">
                {RESEARCH_SUGGESTIONS.filter(s => !researchInterests.includes(s)).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addResearchTag(s)}
                    className="text-[9px] text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* PR Priority Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">PR / Residency Priority</Label>
                <span className={`text-xs font-bold ${prLabel.color}`}>{prLabel.label}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={prPriority}
                onChange={(e) => setPrPriority(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-accent rounded-full appearance-none cursor-pointer accent-primary"
                aria-label="PR priority slider"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Return to Bangladesh</span>
                <span>Citizenship essential</span>
              </div>
              <p className="text-[10px] text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                <Target className="h-3 w-3 inline mr-1 text-primary" />
                {prLabel.desc}
              </p>
            </div>

            {/* Family Relocation Toggle */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Family Relocation Plans</Label>
              <div className="flex gap-2">
                {[
                  { value: false, label: "Solo / No family move" },
                  { value: true,  label: "Plan to bring spouse / children" },
                ].map(({ value, label }) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setFamilyRelocation(value)}
                    className={`flex-1 text-[10px] font-semibold py-2 px-3 rounded-lg border transition-all cursor-pointer ${
                      familyRelocation === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 shadow-sm cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Profile & Recalculate Scores"}
          </Button>
        </div>

      </form>
    </div>
  );
}
