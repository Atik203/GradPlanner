"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ClipboardCheck,
  Loader2,
  AlertCircle,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import type { Document, DocumentStatus } from "@/types";
import type {
  DocumentRequirements as CountryDocRequirements,
  DocumentItem,
} from "@/types/countries";

interface CountrySummary {
  id: string;
  country: string;
  countryCode: string;
  overallScore: number;
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  OBTAINED:    { label: "Obtained",    color: "text-emerald-400",   bg: "bg-emerald-500/10",   icon: <CheckCircle className="h-3.5 w-3.5" /> },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-400",     bg: "bg-amber-500/10",     icon: <Clock className="h-3.5 w-3.5" /> },
  PENDING:     { label: "Pending",     color: "text-muted-foreground", bg: "bg-muted/30",       icon: <Clock className="h-3.5 w-3.5" /> },
  EXPIRED:     { label: "Expired",     color: "text-destructive",   bg: "bg-destructive/10",   icon: <XCircle className="h-3.5 w-3.5" /> },
  NOT_REQUIRED:{ label: "Not Required",color: "text-muted-foreground", bg: "bg-muted/30",       icon: <ShieldAlert className="h-3.5 w-3.5" /> },
};

export default function DocumentChecklistPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [countryData, setCountryData] = useState<CountryDocRequirements | null>(null);
  const [userDocs, setUserDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [countryList, docs] = await Promise.all([
          fetchApi("/api/v1/countries") as Promise<CountrySummary[]>,
          fetchApi("/api/v1/documents") as Promise<Document[]>,
        ]);
        setCountries(countryList || []);
        setUserDocs(docs || []);
        if (countryList?.length > 0) {
          setSelectedCountryCode(countryList[0].countryCode);
        }
      } catch (err) {
        setError("Failed to load document checklist data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedCountryCode) return;
    async function loadCountry() {
      try {
        const data = await fetchApi(`/api/v1/countries/${selectedCountryCode}`);
        setCountryData(data);
      } catch (err) {
        console.error("Failed to load country doc requirements:", err);
        setCountryData(null);
      }
    }
    loadCountry();
  }, [selectedCountryCode]);

  const selectedCountryName = useMemo(
    () => countries.find((c) => c.countryCode === selectedCountryCode)?.country || selectedCountryCode,
    [countries, selectedCountryCode]
  );

  const allRequiredDocs = useMemo((): DocumentItem[] => {
    if (!countryData) return [];
    const general = countryData.generalDocuments || countryData.requiredDocuments || [];
    const visa = countryData.visaDocuments || [];
    return [...general, ...visa];
  }, [countryData]);

  function findUserDoc(docItem: DocumentItem): Document | undefined {
    return userDocs.find((ud) => {
      const nameMatch = ud.name.toLowerCase().includes(docItem.document.toLowerCase()) ||
        docItem.document.toLowerCase().includes(ud.type.replace(/_/g, " ").toLowerCase());
      const countryMatch = !ud.country || ud.country.toLowerCase() === selectedCountryName.toLowerCase() ||
        ud.country.toLowerCase() === selectedCountryCode.toLowerCase();
      return nameMatch && countryMatch;
    });
  }

  const obtainedCount = allRequiredDocs.filter((d) => {
    const match = findUserDoc(d);
    return match && (match.status === "OBTAINED" || match.status === "NOT_REQUIRED");
  }).length;
  const progressPercent = allRequiredDocs.length > 0 ? Math.round((obtainedCount / allRequiredDocs.length) * 100) : 0;

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
        icon={ClipboardCheck}
        title="BD Document Checklist"
        description="Country-specific document requirements for Bangladeshi applicants — transcripts, notarizations, and attestations."
        backHref="/dashboard/documents"
        backLabel="Back to Upload Vault"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary shrink-0" />
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer w-full sm:w-auto"
            >
              {countries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Checklist: <span className="font-bold text-foreground">{obtainedCount}/{allRequiredDocs.length}</span>
            </span>
            <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400">{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {allRequiredDocs.length === 0 && !loading ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No document requirements loaded"
          description={`Document requirement data for ${selectedCountryName} is not available yet.`}
        />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              Required Documents for {selectedCountryName}
            </h3>
            <div className="space-y-2">
              {allRequiredDocs.map((docItem, idx) => {
                const userDoc = findUserDoc(docItem);
                const status = userDoc?.status || "PENDING";
                const config = STATUS_CONFIG[status];
                return (
                  <Card key={idx} className="border-border/60 bg-card/25 hover:bg-card/40 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-bold text-foreground">{docItem.document}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5">{docItem.details}</CardDescription>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.color} shrink-0`}>
                          {config.icon}
                          {config.label}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-1.5">
                      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                        {docItem.attestationRequired && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                            Attestation Required
                          </span>
                        )}
                        {docItem.translationRequired && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                            Translation Required
                          </span>
                        )}
                        <span>Processing: {docItem.processingTime}</span>
                      </div>
                      {userDoc && (
                        <div className="text-[10px] text-muted-foreground pt-1">
                          Tracked as: {userDoc.name} — Status: {userDoc.status.replace(/_/g, " ")}
                          {userDoc.expiresAt && ` — Expires: ${new Date(userDoc.expiresAt).toLocaleDateString()}`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {countryData?.bangladeshSpecificSteps && countryData.bangladeshSpecificSteps.length > 0 && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  Bangladesh-Specific Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {countryData.bangladeshSpecificSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {countryData?.keyDeadlines && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Key Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground block">Fall Intake</span>
                    <span className="font-bold text-foreground">{countryData.keyDeadlines.fallIntake}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground block">Winter Intake</span>
                    <span className="font-bold text-foreground">{countryData.keyDeadlines.winterIntake}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground block">Visa Apply After Admission</span>
                    <span className="font-bold text-foreground">{countryData.keyDeadlines.visaApplyAfterAdmission}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
