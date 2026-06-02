"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/store";
import { addUniversity } from "@/lib/store/slices/universitySlice";
import { fetchApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, School, Calendar, DollarSign, FileText, Globe } from "lucide-react";
import { countryList } from "@/lib/countryList";

// Zod Schema
const universitySchema = z.object({
  name: z.string().min(1, "University name is required"),
  country: z.string().min(1, "Country is required"),
  tier: z.enum(["DREAM", "MATCH", "SAFETY"]),
  program: z.string().optional().or(z.literal("")),
  tuitionPerYr: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  intake: z.string().optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL starting with http:// or https://").optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type UniversityFormValues = z.infer<typeof universitySchema>;

interface UniversityFormProps {
  initialCountry?: string;
}

export function UniversityForm({ initialCountry = "" }: UniversityFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize initial country to match dropdown option value (slug/name)
  let defaultCountry = "";
  if (initialCountry) {
    const foundCountry = countryList.find(
      (c) => c.name.toLowerCase() === initialCountry.toLowerCase() || c.id.toLowerCase() === initialCountry.toLowerCase()
    );
    if (foundCountry) {
      defaultCountry = foundCountry.id; // Store exact name e.g. "Germany"
    } else {
      // Fallback capitalize first letter
      defaultCountry = initialCountry.charAt(0).toUpperCase() + initialCountry.slice(1);
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      name: "",
      country: defaultCountry,
      tier: "MATCH",
      program: "MSc Machine Learning & AI",
      tuitionPerYr: "",
      deadline: "",
      intake: "Sep 2028",
      website: "",
      notes: "",
    },
  });

  const onSubmit = async (data: UniversityFormValues) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetchApi("/api/v1/universities", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          website: data.website || `https://google.com/search?q=${encodeURIComponent(data.name)}`,
        }),
      });

      dispatch(addUniversity(response));
      
      // Navigate back to universities list or country page if country specified
      if (initialCountry) {
        router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
      } else {
        router.push("/dashboard/universities");
      }
    } catch (err: any) {
      console.error("Submit university error:", err);
      setError(err?.message || "Failed to add university. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (initialCountry) {
              router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
            } else {
              router.push("/dashboard/universities");
            }
          }}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <School className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Track New University</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Add university details to your admissions tracker to plan professor outreach and documents.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* University Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                University Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Technical University of Munich"
                className={`bg-background border-border text-foreground h-10 ${errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Grid for Country and Tier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Country <span className="text-destructive">*</span>
                </Label>
                <select
                  id="country"
                  className={`w-full h-10 px-3 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${
                    errors.country ? "border-destructive" : "border-border"
                  }`}
                  {...register("country")}
                >
                  <option value="">Select a country</option>
                  {countryList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Admission Tier <span className="text-destructive">*</span>
                </Label>
                <select
                  id="tier"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("tier")}
                >
                  <option value="DREAM">DREAM (Reach/Highly Competitive)</option>
                  <option value="MATCH">MATCH (Likely/Standard Fit)</option>
                  <option value="SAFETY">SAFETY (High Probability)</option>
                </select>
                {errors.tier && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.tier.message}</p>
                )}
              </div>
            </div>

            {/* Target Program */}
            <div className="space-y-2">
              <Label htmlFor="program" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Target Program
              </Label>
              <Input
                id="program"
                placeholder="e.g. MSc Machine Learning & AI"
                className="bg-background border-border text-foreground h-10"
                {...register("program")}
              />
              {errors.program && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.program.message}</p>
              )}
            </div>

            {/* Grid for Tuition & Intake */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tuitionPerYr" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-muted-foreground" /> Tuition Cost per Year
                </Label>
                <Input
                  id="tuitionPerYr"
                  placeholder="e.g. €1,500 / Free / CAD 25,000"
                  className="bg-background border-border text-foreground h-10"
                  {...register("tuitionPerYr")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intake" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Target Intake
                </Label>
                <Input
                  id="intake"
                  placeholder="e.g. Sep 2028"
                  className="bg-background border-border text-foreground h-10"
                  {...register("intake")}
                />
              </div>
            </div>

            {/* Grid for Deadline & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Application Deadline
                </Label>
                <Input
                  id="deadline"
                  placeholder="e.g. Jan 15, 2028"
                  className="bg-background border-border text-foreground h-10"
                  {...register("deadline")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-muted-foreground" /> Program Website URL
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  className={`bg-background border-border text-foreground h-10 ${errors.website ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  {...register("website")}
                />
                {errors.website && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" /> Notes / Requirements
              </Label>
              <textarea
                id="notes"
                rows={4}
                placeholder="e.g. Requires GRE (320+ min), IELTS 7.0 (no band less than 6.5), 3 reference letters, and statement of purpose focusing on research interest in computer vision."
                className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 transition-colors"
                {...register("notes")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-6 border-t border-border/40 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (initialCountry) {
                  router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
                } else {
                  router.push("/dashboard/universities");
                }
              }}
              className="border-border text-muted-foreground hover:text-foreground h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Track University"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
