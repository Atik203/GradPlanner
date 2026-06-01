"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/store";
import { addDocument } from "@/lib/store/slices/documentSlice";
import { fetchApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, FileText, Clock, AlertCircle } from "lucide-react";
import { countriesData } from "@/data/countries";

// BD-specific document metadata: name suggestions + timeline hints
const DOCUMENT_TYPE_META: Record<string, { label: string; nameSuggestion: string; bdHint?: string }> = {
  TRANSCRIPT: { label: "Academic Transcript", nameSuggestion: "Official Academic Transcript", bdHint: "UIU Registrar: 3–7 days. Request 8 sealed copies." },
  DEGREE_CERTIFICATE: { label: "Degree Certificate", nameSuggestion: "Degree Certificate", bdHint: "Available AFTER graduation is processed (same-day to 3 days)." },
  IELTS: { label: "IELTS Certificate", nameSuggestion: "IELTS Academic Certificate", bdHint: "Results in 13 days post-exam. Book seats 6–8 weeks ahead." },
  TOEFL: { label: "TOEFL Score Report", nameSuggestion: "TOEFL iBT Score Report", bdHint: "Scores available ~6 days after test. Book early." },
  GRE: { label: "GRE Score Report", nameSuggestion: "GRE General Test Score Report", bdHint: "Scores available ~10–15 days after test." },
  LOR: { label: "Letter of Recommendation", nameSuggestion: "Letter of Recommendation", bdHint: "Request from professors 4–6 weeks before deadline." },
  SOP: { label: "Statement of Purpose", nameSuggestion: "Statement of Purpose", bdHint: "Start drafting 3–4 months before deadline. Tailor per university." },
  CV: { label: "Curriculum Vitae (CV)", nameSuggestion: "Academic CV", bdHint: "Keep updated with research, publications, and awards." },
  PASSPORT: { label: "Passport", nameSuggestion: "Bangladesh Passport", bdHint: "New/Renewal: 3–4 weeks regular, 7–10 days urgent." },
  PASSPORT_PHOTO: { label: "Passport Photo", nameSuggestion: "Passport-size Photographs", bdHint: "Most universities require 2–4 photos in specific formats." },
  POLICE_CLEARANCE: { label: "Police Clearance Certificate", nameSuggestion: "Police Clearance Certificate (PCC)", bdHint: "2–6 weeks via pcc.police.gov.bd (Ramna HQ). Apply early!" },
  BANK_STATEMENT: { label: "Bank Statement", nameSuggestion: "Bank Statement (6 Months)", bdHint: "1–3 days from bank. Must show 6 months consistent balance." },
  BLOCKED_ACCOUNT: { label: "Blocked Account (Germany)", nameSuggestion: "Fintiba/Coracle Blocked Account", bdHint: "Germany: €11,208 required. Setup + wire transfer: 8–17 days." },
  MEDICAL_CERTIFICATE: { label: "Medical Certificate", nameSuggestion: "Medical Certificate", bdHint: "1 day exam, 3–10 days to upload (Australia/Canada/USA)." },
  APS_CERTIFICATE: { label: "APS Certificate (Germany)", nameSuggestion: "APS Certificate", bdHint: "MANDATORY for BD nationals applying to Germany. 6–8 weeks at German Embassy, Baridhara." },
  BIRTH_CERTIFICATE: { label: "Birth Certificate", nameSuggestion: "Birth Certificate (English)", bdHint: "Available from Union/City Corporation. Notarize for overseas use." },
  OTHER: { label: "Other Document", nameSuggestion: "", bdHint: undefined },
};

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
  country: z.string().optional().or(z.literal("")),
  status: z.enum(["PENDING", "IN_PROGRESS", "OBTAINED"]),
  expiresAt: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  initialCountry?: string;
}

export function DocumentForm({ initialCountry = "" }: DocumentFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");

  const defaultCountry = initialCountry
    ? (Object.values(countriesData).find(c => c.slug === initialCountry.toLowerCase())?.id ?? initialCountry)
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      type: "",
      country: defaultCountry,
      status: "PENDING",
      expiresAt: "",
      notes: "",
    },
  });

  const watchedType = watch("type");
  const currentMeta = DOCUMENT_TYPE_META[watchedType];

  // Auto-fill name when type changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeKey = e.target.value;
    setSelectedType(typeKey);
    setValue("type", typeKey);
    const meta = DOCUMENT_TYPE_META[typeKey];
    if (meta?.nameSuggestion) {
      setValue("name", meta.nameSuggestion);
    }
  };

  const onSubmit = async (data: DocumentFormValues) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetchApi("/api/v1/documents", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          country: data.country || null,
          expiresAt: data.expiresAt || null,
          notes: data.notes || null,
        }),
      });
      dispatch(addDocument(response));
      if (initialCountry) {
        router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
      } else {
        router.push("/dashboard/documents");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add document. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (initialCountry) {
      router.push(`/dashboard/countries/${initialCountry.toLowerCase()}`);
    } else {
      router.push("/dashboard/documents");
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

      <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Track New Document</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Track your application documents and their preparation status for Bangladesh-based timelines.
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

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="type"
                className={`w-full h-10 px-3 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.type ? "border-destructive" : "border-border"}`}
                {...register("type")}
                onChange={handleTypeChange}
              >
                <option value="">Select document type...</option>
                {Object.entries(DOCUMENT_TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-destructive font-medium">{errors.type.message}</p>}

              {/* BD Hint Box */}
              {currentMeta?.bdHint && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">{currentMeta.bdHint}</p>
                </div>
              )}
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Document Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. IELTS Academic Certificate"
                className={`bg-background border-border text-foreground h-10 ${errors.name ? "border-destructive" : ""}`}
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>

            {/* Country & Status row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold text-foreground">
                  Country (Optional)
                </Label>
                <select
                  id="country"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("country")}
                >
                  <option value="">All Countries (Universal)</option>
                  {Object.values(countriesData).map(c => (
                    <option key={c.id} value={c.id}>{c.hero.flag} {c.hero.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                  Current Status
                </Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  {...register("status")}
                >
                  <option value="PENDING">⏳ Pending (Not started)</option>
                  <option value="IN_PROGRESS">🔄 In Progress (Being prepared)</option>
                  <option value="OBTAINED">✅ Obtained (Ready to submit)</option>
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-sm font-semibold text-foreground">
                Expiry Date (Optional)
              </Label>
              <Input
                id="expiresAt"
                type="date"
                className="bg-background border-border text-foreground h-10"
                {...register("expiresAt")}
              />
              <p className="text-xs text-muted-foreground">Important for IELTS (2 years), Passport, PCC (6 months), Medical reports</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
                Notes
              </Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="e.g. Requested from UIU registrar on June 5, need 6 sealed copies..."
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
              {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>) : "Track Document"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
