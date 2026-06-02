"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { addProfessor } from "@/lib/store/slices/professorSlice";
import { fetchApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, GraduationCap, AlertCircle, Info, Star } from "lucide-react";


const professorSchema = z.object({
  name: z.string().min(1, "Professor name is required"),
  email: z.string().email("Must be a valid email address").optional().or(z.literal("")),
  universityId: z.string().optional().or(z.literal("")),
  researchInterests: z.string().optional().or(z.literal("")),
  profileUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  fundingStatus: z.enum(["FUNDED", "LIKELY", "UNLIKELY", "UNKNOWN"]),
  researchFitScore: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type ProfessorFormValues = z.infer<typeof professorSchema>;

interface ProfessorFormProps {
  initialCountry?: string;
}

const FUNDING_STATUS_OPTIONS = [
  { value: "FUNDED", label: "✅ FUNDED — Professor confirmed funding available" },
  { value: "LIKELY", label: "🟡 LIKELY — Active lab, recent publications" },
  { value: "UNLIKELY", label: "🔴 UNLIKELY — No recent papers or funding signals" },
  { value: "UNKNOWN", label: "❓ UNKNOWN — Not researched yet" },
];

export function ProfessorForm({ initialCountry = "" }: ProfessorFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const universities = useAppSelector(s => s.universities.items);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter universities by country if country param provided
  const filteredUniversities = initialCountry
    ? universities.filter(u => {
        return u.country.toLowerCase().replace(/\s+/g, '-') === initialCountry.toLowerCase();
      })
    : universities;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      name: "",
      email: "",
      universityId: "",
      researchInterests: "",
      profileUrl: "",
      fundingStatus: "UNKNOWN" as const,
      researchFitScore: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ProfessorFormValues) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetchApi("/api/v1/professors", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email || null,
          universityId: data.universityId || null,
          researchInterests: data.researchInterests || null,
          profileUrl: data.profileUrl || null,
          fundingStatus: data.fundingStatus,
          researchFitScore: data.researchFitScore ? parseInt(data.researchFitScore, 10) : null,
          notes: data.notes || null,
          status: "NOT_CONTACTED",
        }),
      });
      dispatch(addProfessor(response));
      if (initialCountry) {
        router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
      } else {
        router.push("/dashboard/professors");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add professor. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (initialCountry) {
      router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
    } else {
      router.push("/dashboard/professors");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={goBack} className="border-border text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Outreach tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-sm">📬 Professor Outreach Best Practice</p>
          <p>Best contact window: <strong className="text-foreground">Tue–Thu, 8:30–9:30 AM professor&apos;s LOCAL time</strong>. Keep emails concise (3–4 paragraphs), reference a specific paper they wrote, and attach your CV.</p>
          <p>Wait at least <strong className="text-foreground">14 days</strong> before a follow-up. Maximum 2 follow-ups per professor.</p>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Add Professor Contact</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Track professor outreach for funding and research fit. Prioritize by fit score.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Professor Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Professor Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Prof. John Smith"
                className={`bg-background border-border text-foreground h-10 ${errors.name ? "border-destructive" : ""}`}
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>

            {/* Email & University row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Institutional Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="prof@university.edu"
                  className={`bg-background border-border text-foreground h-10 ${errors.email ? "border-destructive" : ""}`}
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="universityId" className="text-sm font-semibold text-foreground">
                  Linked University
                </Label>
                <select
                  id="universityId"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("universityId")}
                >
                  <option value="">None (not linked)</option>
                  {filteredUniversities.length > 0 ? (
                    filteredUniversities.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
                    ))
                  ) : (
                    universities.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
                    ))
                  )}
                </select>
                {filteredUniversities.length === 0 && universities.length === 0 && (
                  <p className="text-xs text-muted-foreground">Add universities first to link this professor.</p>
                )}
              </div>
            </div>

            {/* Profile URL */}
            <div className="space-y-2">
              <Label htmlFor="profileUrl" className="text-sm font-semibold text-foreground">
                Profile / Google Scholar URL
              </Label>
              <Input
                id="profileUrl"
                type="url"
                placeholder="https://scholar.google.com/..."
                className={`bg-background border-border text-foreground h-10 ${errors.profileUrl ? "border-destructive" : ""}`}
                {...register("profileUrl")}
              />
              {errors.profileUrl && <p className="text-xs text-destructive font-medium">{errors.profileUrl.message}</p>}
            </div>

            {/* Research Interests */}
            <div className="space-y-2">
              <Label htmlFor="researchInterests" className="text-sm font-semibold text-foreground">
                Research Interests
              </Label>
              <Input
                id="researchInterests"
                placeholder="e.g. NLP, LLMs, Computer Vision, Reinforcement Learning"
                className="bg-background border-border text-foreground h-10"
                {...register("researchInterests")}
              />
            </div>

            {/* Funding Status & Research Fit Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fundingStatus" className="text-sm font-semibold text-foreground">
                  Funding Status
                </Label>
                <select
                  id="fundingStatus"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("fundingStatus")}
                >
                  {FUNDING_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="researchFitScore" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500" /> Research Fit Score (1–10)
                </Label>
                <Input
                  id="researchFitScore"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="e.g. 8"
                  className="bg-background border-border text-foreground h-10"
                  {...register("researchFitScore")}
                />
                <p className="text-xs text-muted-foreground">How well does their research match yours?</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
                Notes
              </Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="e.g. Published on Transformers in 2024, lab has 3 PhD openings, mentioned funding available in July..."
                className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 transition-colors"
                {...register("notes")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-6 border-t border-border/40 bg-muted/20">
            <Button type="button" variant="outline" onClick={goBack} className="border-border text-muted-foreground hover:text-foreground h-10 px-5">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-6">
              {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>) : "Add Professor"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
