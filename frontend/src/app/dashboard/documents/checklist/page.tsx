"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ClipboardCheck,
  AlertCircle,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { DocumentSkeleton } from "@/components/skeletons/DocumentSkeleton";
import type { Document, DocumentStatus, DocumentType } from "@/types";
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

interface StartByResult {
  date: Date;
  dateStr: string;
  daysRemaining: number;
  urgency: "OVERDUE" | "URGENT" | "UPCOMING" | "COMPLETED";
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  OBTAINED:    { label: "Obtained",    color: "text-emerald-400 font-bold",   bg: "bg-emerald-500/10 border-emerald-500/20",   icon: <CheckCircle className="h-3.5 w-3.5" /> },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-400 font-bold",     bg: "bg-amber-500/10 border-amber-500/20",     icon: <Clock className="h-3.5 w-3.5" /> },
  PENDING:     { label: "Pending",     color: "text-muted-foreground", bg: "bg-muted/30 border-border/30",       icon: <Clock className="h-3.5 w-3.5" /> },
  EXPIRED:     { label: "Expired",     color: "text-destructive font-bold",   bg: "bg-destructive/10 border-destructive/20",   icon: <XCircle className="h-3.5 w-3.5" /> },
  NOT_REQUIRED:{ label: "Not Required",color: "text-muted-foreground", bg: "bg-muted/30 border-border/30",       icon: <ShieldAlert className="h-3.5 w-3.5" /> },
};

function mapDocNameToType(docName: string): DocumentType {
  const name = docName.toLowerCase();
  if (name.includes("transcript")) return "TRANSCRIPT";
  if (name.includes("degree certificate") || name.includes("bachelor's")) return "DEGREE_CERTIFICATE";
  if (name.includes("ielts") || name.includes("english") || name.includes("toefl")) return "IELTS";
  if (name.includes("gre")) return "GRE";
  if (name.includes("purpose") || name.includes("motivation") || name.includes("sop")) return "SOP";
  if (name.includes("recommendation") || name.includes("reference") || name.includes("lor")) return "LOR";
  if (name.includes("cv") || name.includes("resume")) return "CV";
  if (name.includes("passport")) return "PASSPORT";
  if (name.includes("police clearance") || name.includes("antecedents")) return "POLICE_CLEARANCE";
  if (name.includes("financial") || name.includes("funds") || name.includes("bank statement") || name.includes("blocked account") || name.includes("gic")) return "BANK_STATEMENT";
  if (name.includes("medical") || name.includes("health")) return "MEDICAL";
  return "OTHER";
}

function calculateStartBy(docName: string, deadlineStr: string, status: DocumentStatus): StartByResult {
  const deadline = deadlineStr ? new Date(deadlineStr) : new Date();
  const name = docName.toLowerCase();
  
  let requiredDays = 28; // Default 4 weeks buffer
  
  if (name.includes("police clearance") || name.includes("antecedents")) {
    requiredDays = 56; // 8 weeks (6 weeks + 2 buffer)
  } else if (name.includes("aps")) {
    requiredDays = 84; // 12 weeks (8 weeks + 4 buffer)
  } else if (name.includes("transcript")) {
    requiredDays = 56; // 8 weeks (6 weeks + 2 buffer)
  } else if (name.includes("ielts") || name.includes("english") || name.includes("toefl")) {
    requiredDays = 70; // 10 weeks (6 weeks seat + 2 results + 2 buffer)
  } else if (name.includes("recommendation") || name.includes("reference") || name.includes("lor")) {
    requiredDays = 42; // 6 weeks
  } else if (name.includes("purpose") || name.includes("motivation") || name.includes("sop") || name.includes("cv") || name.includes("resume")) {
    requiredDays = 28; // 4 weeks
  }
  
  const startByDate = new Date(deadline.getTime() - requiredDays * 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0,0,0,0);
  startByDate.setHours(0,0,0,0);
  
  const diffTime = startByDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let urgency: "OVERDUE" | "URGENT" | "UPCOMING" | "COMPLETED" = "UPCOMING";
  
  if (status === "OBTAINED" || status === "NOT_REQUIRED") {
    urgency = "COMPLETED";
  } else if (daysRemaining < 0) {
    urgency = "OVERDUE";
  } else if (daysRemaining <= 30) {
    urgency = "URGENT";
  }
  
  return {
    date: startByDate,
    dateStr: startByDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    daysRemaining,
    urgency,
  };
}

export default function DocumentChecklistPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [countryData, setCountryData] = useState<CountryDocRequirements | null>(null);
  const [userDocs, setUserDocs] = useState<Document[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Target deadline date picker (YYYY-MM-DD)
  const [targetDeadline, setTargetDeadline] = useState("");

  // Load baseline countries, user documents, and tracked universities
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [countryList, docs, unis] = await Promise.all([
          fetchApi("/api/v1/countries") as Promise<CountrySummary[]>,
          fetchApi("/api/v1/documents") as Promise<Document[]>,
          fetchApi("/api/v1/universities") as Promise<any[]>,
        ]);
        setCountries(countryList || []);
        setUserDocs(docs || []);
        setUniversities(unis || []);
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

  // Fetch country doc requirements when selected country changes
  useEffect(() => {
    if (!selectedCountryCode) return;
    async function loadCountry() {
      try {
        const data = await fetchApi(`/api/v1/countries/${selectedCountryCode}`);
        setCountryData(data?.documents || null);
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

  // Auto-calculate default target deadline backwards
  useEffect(() => {
    if (!selectedCountryCode) return;
    
    // 1. Look up tracked universities in selected country
    const countryUnis = universities.filter(
      (u) => u.country.toLowerCase() === selectedCountryName.toLowerCase() ||
             u.country.toLowerCase() === selectedCountryCode.toLowerCase()
    );
    
    const uniDeadlines = countryUnis
      .map((u) => u.deadline)
      .filter((d): d is string => !!d)
      .map((d) => new Date(d))
      .filter((d) => d.getTime() > Date.now()); // future only
      
    if (uniDeadlines.length > 0) {
      const earliest = new Date(Math.min(...uniDeadlines.map((d) => d.getTime())));
      setTargetDeadline(earliest.toISOString().split("T")[0]);
      return;
    }
    
    // 2. Fallback to user profile target intake
    if (profile?.targetIntake) {
      const match = profile.targetIntake.match(/(Sep|Fall|Autumn|Spring|Jan|Winter|Summer)?\s*(\d{4})/i);
      if (match) {
        const year = parseInt(match[2], 10);
        const term = match[1]?.toLowerCase() || "fall";
        if (term.includes("jan") || term.includes("spring") || term.includes("winter") || term.includes("summer")) {
          setTargetDeadline(`${year - 1}-08-15`); // spring intake deadline is approx August 15 prior year
        } else {
          setTargetDeadline(`${year}-01-15`); // fall intake deadline is approx Jan 15 same year
        }
        return;
      }
    }
    
    // 3. Absolute fallback to Jan 15 of next calendar year
    const nextYear = new Date().getFullYear() + 1;
    setTargetDeadline(`${nextYear}-01-15`);
  }, [selectedCountryCode, universities, profile, selectedCountryName]);

  const allRequiredDocs = useMemo((): DocumentItem[] => {
    if (!countryData) return [];
    const general = countryData.generalDocuments || countryData.requiredDocuments || [];
    const visa = countryData.visaDocuments || [];
    return [...general, ...visa];
  }, [countryData]);

  // Match requirement checklist item with user document vault
  function findUserDoc(docItem: DocumentItem): Document | undefined {
    return userDocs.find((ud) => {
      const nameMatch = ud.name.toLowerCase().includes(docItem.document.toLowerCase()) ||
        docItem.document.toLowerCase().includes(ud.type.replace(/_/g, " ").toLowerCase());
      const countryMatch = !ud.country || ud.country.toLowerCase() === selectedCountryName.toLowerCase() ||
        ud.country.toLowerCase() === selectedCountryCode.toLowerCase();
      return nameMatch && countryMatch;
    });
  }

  // Create or Update document status directly in DB
  const handleUpdateStatus = async (docItem: DocumentItem, newStatus: DocumentStatus) => {
    const userDoc = findUserDoc(docItem);
    const docType = mapDocNameToType(docItem.document);
    
    try {
      if (userDoc) {
        const updated = await fetchApi(`/api/v1/documents/${userDoc.id}`, {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        });
        setUserDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      } else {
        const created = await fetchApi("/api/v1/documents", {
          method: "POST",
          body: JSON.stringify({
            name: docItem.document,
            type: docType,
            status: newStatus,
            country: selectedCountryName,
            notes: `Auto-generated from BD Document Checklist for ${selectedCountryName}.`,
          }),
        });
        setUserDocs((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize checklist document status.");
    }
  };

  const obtainedCount = allRequiredDocs.filter((d) => {
    const match = findUserDoc(d);
    return match && (match.status === "OBTAINED" || match.status === "NOT_REQUIRED");
  }).length;
  const progressPercent = allRequiredDocs.length > 0 ? Math.round((obtainedCount / allRequiredDocs.length) * 100) : 0;

  // Group and sort checklist items by urgency category
  const groupedTimeline = useMemo(() => {
    const overdue: any[] = [];
    const urgent: any[] = [];
    const upcoming: any[] = [];
    const completed: any[] = [];
    
    allRequiredDocs.forEach((docItem) => {
      const userDoc = findUserDoc(docItem);
      const status = userDoc?.status || "PENDING";
      const startBy = calculateStartBy(docItem.document, targetDeadline, status);
      const payload = { docItem, userDoc, status, startBy };
      
      if (startBy.urgency === "COMPLETED") completed.push(payload);
      else if (startBy.urgency === "OVERDUE") overdue.push(payload);
      else if (startBy.urgency === "URGENT") urgent.push(payload);
      else upcoming.push(payload);
    });

    // Sort active checklists chronologically (earliest startBy first)
    const sortFn = (a: any, b: any) => a.startBy.date.getTime() - b.startBy.date.getTime();
    overdue.sort(sortFn);
    urgent.sort(sortFn);
    upcoming.sort(sortFn);
    
    return { overdue, urgent, upcoming, completed };
  }, [allRequiredDocs, targetDeadline, userDocs]);

  if (loading) {
    return <DocumentSkeleton />;
  }

  const renderChecklistCard = (item: any, idx: number) => {
    const { docItem, status, startBy } = item;
    const config = STATUS_CONFIG[status as DocumentStatus] || STATUS_CONFIG.PENDING;
    const isOverdue = startBy.urgency === "OVERDUE";
    const isUrgent = startBy.urgency === "URGENT";

    return (
      <Card key={idx} className={`border transition-all ${
        isOverdue ? "border-destructive/30 bg-destructive/[0.01] hover:border-destructive/50" :
        isUrgent ? "border-amber-500/25 bg-amber-500/[0.01] hover:border-amber-500/40" :
        "border-border/60 bg-card/25 hover:bg-card/45"
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-sm font-black text-foreground flex items-center gap-1.5 flex-wrap">
                {docItem.document}
                {isOverdue && (
                  <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-black text-[8px] uppercase tracking-wider border border-destructive/20 shrink-0">
                    Overdue
                  </span>
                )}
                {isUrgent && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-black text-[8px] uppercase tracking-wider border border-amber-500/20 shrink-0">
                    Urgent
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">{docItem.details}</CardDescription>
            </div>
            
            {/* Status Select dropdown */}
            <div className="shrink-0 flex items-center gap-2">
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] border font-black ${config.bg} ${config.color}`}>
                {config.icon}
                <span>{config.label.toUpperCase()}</span>
              </div>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(docItem, e.target.value as DocumentStatus)}
                className="bg-background border border-border text-foreground rounded-lg px-2.5 py-1 text-[10px] font-black focus:outline-none focus:ring-1 focus:ring-primary h-7 cursor-pointer"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="OBTAINED">Obtained</option>
                <option value="EXPIRED">Expired</option>
                <option value="NOT_REQUIRED">Not Required</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-2">
          {/* Metadata tags */}
          <div className="flex flex-wrap gap-2 text-[9px] text-muted-foreground">
            {docItem.attestationRequired && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-black border border-amber-500/10">
                Attestation Required
              </span>
            )}
            {docItem.translationRequired && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-black border border-blue-500/10">
                Translation Required
              </span>
            )}
            <span className="bg-muted/30 px-1.5 py-0.5 rounded border border-border/10">
              Proc. Time: <strong className="text-foreground">{docItem.processingTime}</strong>
            </span>
          </div>

          {/* Timeline advisory check */}
          {status !== "OBTAINED" && status !== "NOT_REQUIRED" && (
            <div className="border-t border-border/20 pt-2 flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Target Start Date: <strong className="text-foreground font-black">{startBy.dateStr}</strong>
              </span>
              <span className={`font-black ${isOverdue ? "text-destructive" : isUrgent ? "text-amber-400" : "text-muted-foreground"}`}>
                {isOverdue 
                  ? `${Math.abs(startBy.daysRemaining)} days overdue` 
                  : `${startBy.daysRemaining} days remaining`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={ClipboardCheck}
        title="BD Document Checklist"
        description="Dynamic backwards timeline planner mapping Dhaka processing delays, Ministry attestations, and German/Canada/Australia visa document checklists."
        backHref="/dashboard/documents"
        backLabel="Back to Upload Vault"
      />

      {error && (
        <ApiErrorAlert error={error} />
      )}

      {/* Target country and custom deadline select */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
            {/* Country Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer w-full sm:w-48"
              >
                {countries.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Deadline selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-black text-muted-foreground whitespace-nowrap">Target Deadline:</span>
              <input
                type="date"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                className="bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 w-full sm:w-auto cursor-pointer"
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Vault Status: <span className="font-bold text-foreground">{obtainedCount}/{allRequiredDocs.length}</span>
            </span>
            <div className="w-28 h-2 bg-muted rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400 shrink-0">{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Germany Specific Callout alert */}
      {selectedCountryCode.toLowerCase() === "de" && (
        <Card className="border-orange-500/25 bg-orange-500/[0.03] shadow">
          <CardContent className="p-4 flex items-start gap-3 text-xs text-orange-200">
            <AlertCircle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-orange-300 block mb-1 text-[13px] uppercase tracking-wider">Critical German Attestation & Embassy Delay Warning</span>
              The **Akademische Prüfungsstelle (APS) certificate** is mandatory for all Bangladeshi nationals studying in Germany. 
              Student visa appointments at the German Embassy Baridhara, Dhaka, face a **2.5+ year backlog**. 
              You must apply for your APS certificate (takes 6–12 weeks) immediately. 
              Without an APS certificate, you will be denied embassy admission or visa processing.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chronological Checklist Urgency Columns */}
      {allRequiredDocs.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No checklist requirements found"
          description={`Checklist parameters for ${selectedCountryName} are not loaded in the reference database.`}
        />
      ) : (
        <div className="space-y-6">
          {/* A. OVERDUE SECTION (If present) */}
          {groupedTimeline.overdue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-destructive tracking-widest flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Overdue Checklist items
              </h3>
              <div className="bg-destructive/[0.02] border border-destructive/20 rounded-xl p-3 mb-2 text-xs text-red-200/90 flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>These documents are past their estimated start dates based on the application deadline. Initiate requests immediately to bypass Ministry of Education attestations in Dhaka.</span>
              </div>
              <div className="space-y-3">
                {groupedTimeline.overdue.map((item, idx) => renderChecklistCard(item, idx))}
              </div>
            </div>
          )}

          {/* B. URGENT SECTION (If present) */}
          {groupedTimeline.urgent.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Urgent Action Required (Next 30 Days)
              </h3>
              <div className="space-y-3">
                {groupedTimeline.urgent.map((item, idx) => renderChecklistCard(item, idx))}
              </div>
            </div>
          )}

          {/* C. UPCOMING SECTION */}
          {groupedTimeline.upcoming.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Planned Timeline Checklist
              </h3>
              <div className="space-y-3">
                {groupedTimeline.upcoming.map((item, idx) => renderChecklistCard(item, idx))}
              </div>
            </div>
          )}

          {/* D. COMPLETED SECTION */}
          {groupedTimeline.completed.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border/20">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Obtained / Completed Vault References ({groupedTimeline.completed.length})
              </h3>
              <div className="space-y-3 opacity-75">
                {groupedTimeline.completed.map((item, idx) => renderChecklistCard(item, idx))}
              </div>
            </div>
          )}

          {/* Country specific general advisory text steps */}
          {countryData?.bangladeshSpecificSteps && countryData.bangladeshSpecificSteps.length > 0 && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-foreground">
                  Bangladesh Embassy & Document Attestation Checklist Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {countryData.bangladeshSpecificSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-black shrink-0 mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key deadlines fallback information */}
          {countryData?.keyDeadlines && (
            <Card className="border-border/60 bg-card/25">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-foreground">Standard Intake Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(countryData.keyDeadlines).map(([key, val]: any[]) => (
                    <div key={key} className="p-2.5 rounded bg-muted/20 border border-border/10">
                      <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-black text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
