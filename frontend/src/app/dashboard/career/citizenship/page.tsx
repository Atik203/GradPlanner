"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Landmark,
  Loader2,
  AlertCircle,
  Globe,
  Clock,
  FileCheck,
  Users,
  ShieldCheck,
  Star,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { CitizenshipRules } from "@/types/countries/citizenship-rules";
import type { FamilyImmigrationRights } from "@/types/countries/family-immigration";

interface CountrySummary { id: string; country: string; countryCode: string; }

export default function CitizenshipPlannerPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selected, setSelected] = useState<CountrySummary | null>(null);
  const [citData, setCitData] = useState<CitizenshipRules | null>(null);
  const [familyData, setFamilyData] = useState<FamilyImmigrationRights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        if (list?.length > 0) setSelected(list[0]);
      } catch (err) {
        setError("Failed to load citizenship data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function load() {
      try {
        const data = await fetchApi(`/api/v1/countries/${selected!.countryCode}`);
        setCitData(data?.citizenship || null);
        setFamilyData(data?.family || null);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [selected]);

  const totalYears = useMemo(() => {
    if (!citData) return null;
    const studyYears = 2;
    const pgwp = 3;
    const prYears = citData.prYearsBeforeApplying || (citData.prRequired ? 3 : 0);
    const citYears = citData.minimumResidencyYears;
    return studyYears + pgwp + prYears + citYears;
  }, [citData]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={Landmark}
        title="Citizenship Planner"
        description="Long-term citizenship pathways, residency requirements, dual citizenship rules, and naturalization timelines."
        backHref="/dashboard/career/pr-planner"
        backLabel="Back to PR Route Planner"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary shrink-0" />
          <select
            value={selected?.countryCode || ""}
            onChange={(e) => {
              const c = countries.find((x) => x.countryCode === e.target.value);
              if (c) setSelected(c);
            }}
            className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer flex-1"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {!citData ? (
        <EmptyState icon={Landmark} title="No citizenship data available" description={`Citizenship data for ${selected?.country || "this country"} is being prepared.`} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={Star} label="Citizenship Score" value={`${citData.citizenshipScore}/100`} color="success" />
            <MetricCard icon={Clock} label="Min Residency" value={`${citData.minimumResidencyYears}y`} color="default" />
            <MetricCard icon={ShieldCheck} label="Dual Citizenship" value={citData.dualCitizenshipAllowed ? "Allowed" : "Not Allowed"} color={citData.dualCitizenshipAllowed ? "success" : "destructive"} />
            <MetricCard icon={Clock} label="Total Journey" value={totalYears ? `${totalYears}y` : "N/A"} color="info" />
          </div>

          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">Path to Citizenship</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Estimated journey from student to citizen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <GraduationCap className="h-4 w-4" />
                  <div>
                    <p className="text-[9px] text-muted-foreground">Study</p>
                    <p className="text-xs font-bold">~2 years</p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Briefcase className="h-4 w-4" />
                  <div>
                    <p className="text-[9px] text-muted-foreground">PGWP</p>
                    <p className="text-xs font-bold">~3 years</p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <ShieldCheck className="h-4 w-4" />
                  <div>
                    <p className="text-[9px] text-muted-foreground">PR</p>
                    <p className="text-xs font-bold">{citData.prRequired ? `${citData.prYearsBeforeApplying}y` : "Direct"}</p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Landmark className="h-4 w-4" />
                  <div>
                    <p className="text-[9px] text-muted-foreground">Citizenship</p>
                    <p className="text-xs font-bold">{citData.minimumResidencyYears}y residency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <RequirementRow label="Residency" value={`${citData.minimumResidencyYears} years (${citData.residencyCalculation})`} met={true} />
                <RequirementRow label="Language" value={`${citData.languageRequirement} (${citData.languageTest})`} met={true} />
                <RequirementRow label="Civics Test" value={citData.civicsTest ? (citData.civicsTestDescription || "Required") : "Not Required"} met={!citData.civicsTest} />
                <RequirementRow label="Criminal Record" value={citData.criminalRecordRequirement} met={true} />
                {citData.incomeRequirement && (
                  <RequirementRow label="Income" value={citData.incomeRequirement} met={false} />
                )}
                <RequirementRow label="Age" value={citData.ageRequirement} met={true} />
              </CardContent>
            </Card>

            <Card className={`border-border/60 bg-card/25 ${!citData.dualCitizenshipAllowed ? "ring-1 ring-destructive/30" : ""}`}>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Bangladesh Dual Citizenship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-xl ${citData.dualCitizenshipAllowed ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {citData.dualCitizenshipAllowed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className={`font-bold ${citData.dualCitizenshipAllowed ? "text-emerald-400" : "text-destructive"}`}>
                      {citData.dualCitizenshipAllowed ? "Dual Citizenship Allowed" : "Dual Citizenship NOT Allowed"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {citData.bangladeshPositionOnDual || citData.keyNotes || ""}
                  </p>
                  {citData.renunciationRequired && (
                    <p className="text-[10px] text-destructive mt-2">
                      Renunciation of Bangladesh citizenship may be required.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {familyData && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Family Impact Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {familyData.spouseRights && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Spouse Rights</span>
                      <p className="font-bold text-foreground">
                        Work: {familyData.spouseRights.spouseCanWork ? "Yes" : "No"}
                        {familyData.spouseRights.spouseCanWorkDuringStudy && " (during study)"}
                      </p>
                    </div>
                  )}
                  {familyData.childrenRights && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Children</span>
                      <p className="font-bold text-foreground">
                        Schooling: {familyData.childrenRights.childrenCanEnrollSchool ? "Available" : "Not Available"}
                      </p>
                      {familyData.childrenRights.birthRightCitizenship !== undefined && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Citizenship: {familyData.childrenRights.birthRightCitizenship ? "Birthright" : "By Descent"}
                        </p>
                      )}
                    </div>
                  )}
                  {familyData.parentSponsorshipRights && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Parent Sponsorship</span>
                      <p className="font-bold text-foreground">
                        {familyData.parentSponsorshipRights.canSponsorParents ? "Available" : "Not Available"}
                      </p>
                    </div>
                  )}
                  {familyData.overallFamilyScore !== undefined && (
                    <div className="p-3 rounded bg-muted/30">
                      <span className="text-muted-foreground block mb-1">Family Score</span>
                      <p className={`font-bold ${familyData.overallFamilyScore >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                        {familyData.overallFamilyScore}/100
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {citData.passportStrength && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Passport Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 text-center">
                    <p className="text-2xl font-black text-emerald-400">{selected?.country}</p>
                    <p className="text-[10px] text-muted-foreground">{citData.passportStrength}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-2xl font-black text-muted-foreground">Bangladesh</p>
                    <p className="text-[10px] text-muted-foreground">42 visa-free countries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function RequirementRow({ label, value, met }: { label: string; value: string; met: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground font-semibold">{value}</span>
        {met ? (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
        )}
      </div>
    </div>
  );
}
