"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GanttChart,
  Loader2,
  Calendar,
  Award,
  Sparkles,
  Info,
  Coins,
  FileText,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Globe
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { TimelineSkeleton } from "@/components/skeletons/TimelineSkeleton";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { useIsMobile } from "@/hooks/use-media-query";

interface TimelineMilestone {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: "DONE" | "IN_PROGRESS" | "UPCOMING" | "OVERDUE";
  description: string;
  icon: string;
}

interface TimelineResponse {
  intake: string;
  serverTime: string;
  milestones: TimelineMilestone[];
}

interface CountrySummary {
  countryCode: string;
  country: string;
}

export default function TimelinePlannerPage() {
  const profile = useAppSelector((state) => state.profile.profile);

  const [intake, setIntake] = useState<string>("");
  const isMobile = useIsMobile();
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingTimeline, setFetchingTimeline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default intake from profile on load
  useEffect(() => {
    if (profile?.targetIntake) {
      setIntake(profile.targetIntake);
    } else {
      setIntake("Sep 2028");
    }
  }, [profile]);

  // Load countries list
  const loadCountries = useCallback(async () => {
    try {
      const list = await fetchApi("/api/v1/countries");
      setCountries(list || []);
    } catch (err) {
      console.error("Failed to load countries:", err);
    }
  }, []);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // Fetch timeline when intake changes
  const loadTimeline = useCallback(async (i: string) => {
    if (!i) return;
    try {
      setFetchingTimeline(true);
      const data = await fetchApi(`/api/v1/timeline/planner?intake=${encodeURIComponent(i)}`);
      setTimelineData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch journey timeline details.");
    } finally {
      setFetchingTimeline(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline(intake);
  }, [intake, loadTimeline]);

  const handleTimelineRetry = useCallback(() => {
    setError(null);
    loadTimeline(intake);
  }, [loadTimeline, intake]);

  // Months range calculation
  const monthsRange = useMemo(() => {
    if (!timelineData || timelineData.milestones.length === 0) return [];
    const milestones = timelineData.milestones;
    const dates = milestones.flatMap(m => [new Date(m.startDate), new Date(m.endDate)]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const startYear = minDate.getUTCFullYear();
    const startMonth = minDate.getUTCMonth();
    const endYear = maxDate.getUTCFullYear();
    const endMonth = maxDate.getUTCMonth();
    
    const range: { year: number; month: number; label: string; key: string }[] = [];
    let currYear = startYear;
    let currMonth = startMonth;
    
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
      const label = `${monthLabels[currMonth]} '${String(currYear).slice(-2)}`;
      const key = `${currYear}-${String(currMonth).padStart(2, "0")}`;
      range.push({ year: currYear, month: currMonth, label, key });
      
      currMonth++;
      if (currMonth > 11) {
        currMonth = 0;
        currYear++;
      }
    }
    return range;
  }, [timelineData]);

  // Today cursor index on columns
  const todayIndex = useMemo(() => {
    if (!timelineData || monthsRange.length === 0) return -1;
    const sDate = new Date(timelineData.serverTime);
    const key = `${sDate.getUTCFullYear()}-${String(sDate.getUTCMonth()).padStart(2, "0")}`;
    return monthsRange.findIndex(m => m.key === key);
  }, [timelineData, monthsRange]);

  const getMonthYearKey = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
  };

  const getCountrySpecificAdvice = () => {
    if (selectedCountry === "All") return null;
    const code = selectedCountry.toLowerCase();
    
    if (code === "de") {
      return {
        country: "Germany",
        text: "Since Germany is selected, remember that the APS Certificate is mandatory for Bangladeshi students (takes 6-8 weeks). The current student visa appointment wait time at the German Embassy Dhaka is 2.5+ years. Set up and fund your Blocked Account (Sperrkonto, €11,208/yr) early."
      };
    }
    if (code === "ca") {
      return {
        country: "Canada",
        text: "For Canada, securing the GIC (CAD 20,635) requires a wire transfer that takes 5-10 business days. Aim for an IELTS band of 6.0+ in each section to qualify for Canada's fast Student Direct Stream (SDS) 10-day processing visa route."
      };
    }
    if (code === "us") {
      return {
        country: "United States",
        text: "US F-1 student visa appointment wait times at the American Embassy in Dhaka can be 6-12 months. Prepare your SEVIS fee (USD 350) and schedule your visa interview slot immediately after obtaining your I-20 form from the university."
      };
    }
    if (code === "au") {
      return {
        country: "Australia",
        text: "Australian subclass 500 visas take 4-6 weeks. Ensure your 12-month living cost funds (~AUD 29,710) are held in bank statements for at least 3 months before submission to satisfy financial evidence constraints."
      };
    }
    if (code === "se") {
      return {
        country: "Sweden",
        text: "Sweden enforces a strict, non-rolling application deadline of January 15. Ensure all transcripts, certificates, and English test scores are submitted via University Admissions Sweden by this date. Tuition fee invoices must be settled by May."
      };
    }
    if (code === "nl") {
      return {
        country: "Netherlands",
        text: "In the Netherlands, MVV entry visas are sponsored directly by the host university, ensuring fast 2-8 weeks processing. However, finding student housing is extremely critical and must be initiated 3-4 months prior to arrival."
      };
    }
    return null;
  };

  const countryAdvice = getCountrySpecificAdvice();

  if (loading) {
    return <TimelineSkeleton />;
  }

  const statusColors: Record<string, string> = {
    DONE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    UPCOMING: "bg-muted text-muted-foreground border-border",
    OVERDUE: "bg-rose-500/20 text-rose-400 border-rose-500/30 border-dashed"
  };

  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case "ielts": return <Award className="h-4 w-4 text-indigo-400" />;
      case "outreach": return <Users className="h-4 w-4 text-teal-400" />;
      case "drafting": return <FileText className="h-4 w-4 text-primary" />;
      case "documents": return <Briefcase className="h-4 w-4 text-yellow-400" />;
      case "police": return <MapPin className="h-4 w-4 text-amber-400" />;
      case "applications": return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
      case "visa": return <Coins className="h-4 w-4 text-emerald-400" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            <GanttChart className="h-7 w-7 text-primary" />
            Application Timeline Planner
          </h2>
          <p className="text-muted-foreground text-sm">Chronological backwards schedule mapped relative to target intake deadlines.</p>
        </div>

        {/* Controllers */}
        <div className="flex flex-wrap gap-3">
          {/* Target Intake Selector */}
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 px-3 py-1.5 rounded-lg">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={intake}
              onChange={(e) => setIntake(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Sep 2028">September 2028 Intake</option>
              <option value="Jan 2029">January 2029 Intake</option>
            </select>
          </div>

          {/* Country Selector */}
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 px-3 py-1.5 rounded-lg">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All">All Countries</option>
              {countries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <ApiErrorAlert error={error} onRetry={handleTimelineRetry} />
      )}

      {/* Country Specific Timeline Warning Alert */}
      {countryAdvice && (
        <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {countryAdvice.country} Timeline Advisory
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            {countryAdvice.text}
          </CardContent>
        </Card>
      )}

      {fetchingTimeline ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : timelineData && timelineData.milestones.length > 0 ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Gantt Interactive Chart Wrapper */}
          <Card className="border-border/60 bg-card/25 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold text-foreground">Journey Timeline: Bangladesh → Abroad</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Dynamic monthly allocation chart showing milestones and current status.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="md:min-w-[800px] relative p-6">
                  
                  {/* Grid background rows/cols */}
                  <div className="grid grid-cols-[140px_1fr] md:grid-cols-[220px_1fr] border-b border-border/40 pb-3">
                    <div className="text-xs font-bold text-foreground">Task / Phase</div>
                    <div 
                      className="grid text-[10px] font-black text-muted-foreground text-center"
                      style={{ gridTemplateColumns: `repeat(${monthsRange.length}, minmax(45px, 1fr))` }}
                    >
                      {monthsRange.map((m) => (
                        <div key={m.key} className="border-l border-border/10 py-1 truncate">
                          {m.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Timeline Rows */}
                  <div className="relative pt-4 space-y-5">
                    
                    {/* Vertical Today Line indicator */}
                    {todayIndex !== -1 && (
                      <div 
                        className="absolute top-0 bottom-0 w-[2px] bg-primary/70 z-20 pointer-events-none border-l border-dashed border-primary"
                        style={{
                          left: `calc(${isMobile ? 140 : 220}px + ${(todayIndex / monthsRange.length) * 100}%)`,
                        }}
                      >
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] bg-primary text-primary-foreground font-black px-1.5 py-0.5 rounded-full shadow-sm">
                          TODAY
                        </span>
                      </div>
                    )}

                    {timelineData.milestones.map((m) => {
                      const startKey = getMonthYearKey(m.startDate);
                      const endKey = getMonthYearKey(m.endDate);
                      
                      let startIndex = monthsRange.findIndex(mo => mo.key === startKey);
                      let endIndex = monthsRange.findIndex(mo => mo.key === endKey);
                      
                      // Fallbacks if indices are out of range
                      if (startIndex === -1) startIndex = 0;
                      if (endIndex === -1) endIndex = monthsRange.length - 1;
                      
                      const span = Math.max(endIndex - startIndex + 1, 1);

                      return (
                        <div key={m.id} className="grid grid-cols-[140px_1fr] md:grid-cols-[220px_1fr] items-center gap-0">
                          {/* Left: Milestone Title & Status */}
                          <div className="pr-4 space-y-1">
                            <div className="font-semibold text-xs text-foreground truncate flex items-center gap-2">
                              {getMilestoneIcon(m.icon)}
                              <span className="truncate">{m.label}</span>
                            </div>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${statusColors[m.status]}`}>
                              {m.status.replace("_", " ")}
                            </span>
                          </div>

                          {/* Right: Gantt Bar */}
                          <div 
                            className="grid h-8 relative w-full"
                            style={{ gridTemplateColumns: `repeat(${monthsRange.length}, minmax(45px, 1fr))` }}
                          >
                            <div 
                              className={`h-6 rounded-lg border flex items-center justify-center text-[9px] font-bold truncate px-2 self-center transition-all ${
                                m.status === "DONE" ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/5" :
                                m.status === "IN_PROGRESS" ? "bg-blue-500/25 border-blue-500/40 text-blue-400 shadow-sm shadow-blue-500/5" :
                                m.status === "OVERDUE" ? "bg-rose-500/25 border-rose-500/40 text-rose-400 shadow-sm shadow-rose-500/5" :
                                "bg-muted/40 border-border/80 text-muted-foreground"
                              }`}
                              style={{
                                gridColumn: `${startIndex + 1} / span ${span}`
                              }}
                            >
                              {m.label} ({span} mo)
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Milestone Descriptions */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Bangladesh Passport Timeline Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timelineData.milestones.map((m) => (
                <Card key={m.id} className="border-border/60 bg-card/15 shadow-xs hover:border-primary/20 transition-all flex flex-col">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 gap-2">
                    <div className="flex items-center gap-2.5">
                      {getMilestoneIcon(m.icon)}
                      <CardTitle className="text-xs font-extrabold text-foreground">{m.label}</CardTitle>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${statusColors[m.status]}`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {m.description}
                    </p>
                    <div className="flex justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2.5 mt-2.5">
                      <span>Start: <strong>{new Date(m.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</strong></span>
                      <span>Target Due: <strong>{new Date(m.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</strong></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <EmptyState
          icon={GanttChart}
          title="No Timeline Calculated"
          description="We couldn't generate the timeline. Please verify your profile settings target intake and graduation dates."
          className="py-16"
        />
      )}

    </div>
  );
}
