"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Globe,
  Star,
  Clock,
  ShieldAlert,
  CheckCircle,
  TrendingUp,
  Award,
  Calculator,
  User,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  Briefcase
} from "lucide-react";
import type { PrPathways } from "@/types/countries/pr-pathways";

interface CountrySummary { id: string; country: string; countryCode: string; }

export default function PRRoutePlannerPage() {
  const profile = useAppSelector((state) => state.profile.profile);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selected, setSelected] = useState<CountrySummary | null>(null);
  const [prData, setPrData] = useState<PrPathways | null>(null);
  const [visaData, setVisaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"routes" | "calculator">("routes");

  // Calculator inputs
  const [age, setAge] = useState<number>(24);
  const [calcDegree, setCalcDegree] = useState<"msc" | "phd">("msc");
  const [ielts, setIelts] = useState<number>(7.0);
  const [workExp, setWorkExp] = useState<number>(1);

  // Sync default inputs with profile if loaded
  useEffect(() => {
    if (profile) {
      if (profile.ieltsScore) setIelts(profile.ieltsScore);
      if (profile.targetDegree) {
        setCalcDegree(profile.targetDegree.toLowerCase().includes("phd") ? "phd" : "msc");
      }
    }
  }, [profile]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchApi("/api/v1/countries") as CountrySummary[];
        setCountries(list || []);
        if (list?.length > 0) setSelected(list[0]);
      } catch (err) {
        setError("Failed to load PR data.");
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
        setPrData(data?.prPathways || null);
        setVisaData(data?.visa || null);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [selected]);

  const pathways = useMemo(() => prData?.pathways || [], [prData]);

  const difficultyColor = (d: string) => {
    const lower = d.toLowerCase();
    if (lower.includes("low") || lower.includes("easy")) return "text-emerald-400 bg-emerald-500/10";
    if (lower.includes("moderate") || lower.includes("medium")) return "text-amber-400 bg-amber-500/10";
    if (lower.includes("high") || lower.includes("hard")) return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted";
  };

  // PR Points calculations based on target country
  const calculatorResults = useMemo(() => {
    if (!selected) return null;
    const country = selected.countryCode.toLowerCase();
    
    let score = 0;
    let maxScore = 100;
    let systemName = "";
    let eligibilityText = "";
    let colorClass = "text-foreground";
    let isEligible = false;
    let estimatedTimeline = "";
    let probability: "High" | "Moderate" | "Low" | "Not Viable" = "Moderate";
    let details: { label: string; value: string | number; desc: string }[] = [];

    if (country === "ca") {
      systemName = "Canada CRS (Express Entry)";
      maxScore = 600; // Simplified Core CRS points
      
      // Age (Max 110)
      let agePts = 0;
      if (age >= 20 && age <= 29) agePts = 110;
      else if (age === 30) agePts = 105;
      else if (age === 31) agePts = 99;
      else if (age === 32) agePts = 94;
      else if (age === 33) agePts = 88;
      else if (age === 34) agePts = 83;
      else if (age >= 35 && age <= 39) agePts = 65;
      else if (age >= 40) agePts = 35;
      else agePts = 90; // under 20
      details.push({ label: "Age points", value: agePts, desc: "Single applicant maximum is 110 (ages 20-29)" });

      // Education (Master's = 135, PhD = 150)
      const eduPts = calcDegree === "phd" ? 150 : 135;
      details.push({ label: "Education level points", value: eduPts, desc: `Master's: 135, PhD: 150` });

      // Language (IELTS)
      let langPts = 0;
      if (ielts >= 8.0) langPts = 136; // CLB 10
      else if (ielts >= 7.5) langPts = 124; // CLB 9
      else if (ielts >= 6.5) langPts = 110; // CLB 8
      else if (ielts >= 6.0) langPts = 96; // CLB 7
      else langPts = 60;
      details.push({ label: "Language points", value: langPts, desc: "IELTS 7.5+ (CLB 9) gives significant points boost" });

      // Canadian Work Experience (Projected)
      let workPts = 0;
      if (workExp >= 3) workPts = 64;
      else if (workExp === 2) workPts = 53;
      else if (workExp === 1) workPts = 40;
      details.push({ label: "Canadian work experience", value: workPts, desc: "Estimated post-graduation Canadian employment" });

      // Skill Transferability & Study Bonus
      let bonusPts = 30; // 30 points for Canadian Master's/PhD degree completed!
      let transferPts = 0;
      if (ielts >= 7.5) {
        transferPts += 50; // Education + language transfer
        if (workExp >= 1) transferPts += 50; // Work + language transfer
      } else {
        transferPts += 25;
        if (workExp >= 1) transferPts += 25;
      }
      details.push({ label: "Degree study bonus", value: bonusPts, desc: "Extra points for Canadian graduate credential" });
      details.push({ label: "Skill transferability", value: transferPts, desc: "Combination of language skill, degree, and work exp" });

      score = agePts + eduPts + langPts + workPts + transferPts + bonusPts;
      isEligible = ielts >= 6.0;

      if (score >= 490) {
        probability = "High";
        colorClass = "text-emerald-400";
        eligibilityText = "Excellent chances! Score is competitive with recent Express Entry general draws.";
      } else if (score >= 460) {
        probability = "Moderate";
        colorClass = "text-amber-400";
        eligibilityText = "Moderate chances. Consider provincial nominations (PNP) or a second year of Canadian work experience.";
      } else {
        probability = "Low";
        colorClass = "text-destructive";
        eligibilityText = "Score is below typical cutoffs. Focus on maximizing your IELTS (target 8.0+) or securing a provincial nomination.";
      }
      estimatedTimeline = "1.5 – 2.5 Years post-graduation";

    } else if (country === "au") {
      systemName = "Australia Points Test (Subclass 189/190)";
      maxScore = 100;
      
      // Age
      let agePts = 0;
      if (age >= 25 && age <= 32) agePts = 30;
      else if (age >= 18 && age <= 24) agePts = 25;
      else if (age >= 33 && age <= 39) agePts = 25;
      else if (age >= 40 && age <= 44) agePts = 15;
      details.push({ label: "Age points", value: agePts, desc: "Ages 25-32 yield maximum 30 points" });

      // English
      let engPts = 0;
      if (ielts >= 8.0) engPts = 20; // Superior
      else if (ielts >= 7.0) engPts = 10; // Proficient
      details.push({ label: "English points", value: engPts, desc: "IELTS 8.0 = 20 pts, IELTS 7.0 = 10 pts" });

      // Qualification
      const qualPts = calcDegree === "phd" ? 20 : 15;
      details.push({ label: "Qualification points", value: qualPts, desc: "Doctorate: 20, Master's: 15" });

      // Australian Study Requirement (projected)
      const studyPts = 5;
      details.push({ label: "Australian study", value: studyPts, desc: "Completed 2-year academic program in Australia" });

      // Projected Work Experience (Australian)
      let workPts = 0;
      if (workExp >= 3) workPts = 10;
      else if (workExp >= 1) workPts = 5;
      details.push({ label: "Australian work experience", value: workPts, desc: "1 yr: 5 pts, 3 yrs: 10 pts" });

      // State Nomination (Subclass 190 standard support assumptions)
      const statePts = 5;
      details.push({ label: "State nomination", value: statePts, desc: "Subclass 190 state sponsorship grants 5 bonus points" });

      score = agePts + engPts + qualPts + studyPts + workPts + statePts;
      isEligible = score >= 65 && ielts >= 6.0;

      if (score >= 85) {
        probability = "High";
        colorClass = "text-emerald-400";
        eligibilityText = "Strong score! Highly competitive for Subclass 189 Skilled Independent and state subclass 190.";
      } else if (score >= 75) {
        probability = "Moderate";
        colorClass = "text-amber-400";
        eligibilityText = "Eligible. Likely requires state nomination sponsorship (Subclass 190/491) or additional work experience.";
      } else {
        probability = "Low";
        colorClass = "text-destructive";
        eligibilityText = "Eligible to apply (65+), but competition is high. Target IELTS 8.0+ or gain more local experience.";
      }
      estimatedTimeline = "2 – 3 Years post-graduation";

    } else if (country === "de") {
      systemName = "Germany Blue Card Checklist";
      maxScore = 4; // Checklist conditions
      
      const hasRecognisedDegree = true;
      const salaryMeetsThreshold = true; // IT CSE graduates easily earn above the €45,300 shortage threshold
      const jobMatchesDegree = true;
      const ieltsMinOk = ielts >= 5.0; // German visa language minimum is low
      
      let count = 0;
      if (hasRecognisedDegree) count++;
      if (salaryMeetsThreshold) count++;
      if (jobMatchesDegree) count++;
      if (ieltsMinOk) count++;

      score = count;
      isEligible = count === 4;
      estimatedTimeline = "21 Months (with B1 German) OR 33 Months (No German)";

      details.push({ label: "Recognised Degree", value: "✓ Met", desc: "CSE degree recognized on Anabin H+ database" });
      details.push({ label: "Salary Threshold", value: "✓ Met", desc: "Estimated salary exceeds shortage threshold (€45,300/yr)" });
      details.push({ label: "Field Alignment", value: "✓ Met", desc: "Job contract matches graduate degree" });
      details.push({ label: "English/German Base", value: ieltsMinOk ? "✓ Met" : "✗ Gap", desc: "Visa requires basic English/German proof" });

      if (isEligible) {
        probability = "High";
        colorClass = "text-emerald-400";
        eligibilityText = "Excellent! Germany does not use a competitive points quota. If you have a matching job contract and degree, approval is near-automatic.";
      } else {
        probability = "Low";
        colorClass = "text-destructive";
        eligibilityText = "Ineligible. Ensure your job contract aligns with your degree fields.";
      }
    } else {
      // General countries (Sweden, Netherlands, Ireland)
      systemName = "Residency Time-Based Pathway";
      maxScore = 5;
      
      const yearsNeeded = country === "nl" ? 5 : (country === "se" ? 4 : 5);
      score = yearsNeeded;
      isEligible = ielts >= 6.0;
      estimatedTimeline = `${yearsNeeded} Years uninterrupted legal residency`;

      details.push({ label: "Year target", value: `${yearsNeeded} Years`, desc: "Required residency duration before applying for permanent status" });
      details.push({ label: "Study counts", value: country === "se" ? "100%" : "50%", desc: "How much student visa years count towards PR" });
      details.push({ label: "Job requirement", value: "Mandatory", desc: "Must be employed with local salary contract at threshold" });
      details.push({ label: "Language integration", value: country === "nl" ? "Required (NT2)" : "Upcoming", desc: "Must pass local language proficiency tests" });

      if (isEligible) {
        probability = "Moderate";
        colorClass = "text-amber-400";
        eligibilityText = `Approval is non-competitive but takes time. Maintain employment and start learning the local language (e.g. Dutch/Swedish) early.`;
      } else {
        probability = "Low";
        colorClass = "text-destructive";
        eligibilityText = "Ensure you meet the English proficiency minimums for the job/search visa.";
      }
    }

    return {
      systemName,
      score,
      maxScore,
      eligibilityText,
      colorClass,
      isEligible,
      estimatedTimeline,
      probability,
      details,
    };
  }, [selected, age, calcDegree, ielts, workExp]);

  // BD Specific Advisories
  const bdSpecificWarning = useMemo(() => {
    if (!selected) return null;
    const country = selected.countryCode.toLowerCase();

    if (country === "us") {
      return {
        severity: "destructive",
        title: "🚫 USA employment-based PR is NOT viable for BD nationals",
        text: "The US EB-2 and EB-3 permanent residency (Green Card) categories face a 70–90 year backlog for skilled worker applications. The F-1 student visa is strictly non-immigrant. Unless you secure an academic EB-1 (extraordinary ability) or marry a US citizen, there is NO fast PR path in the USA. STEM OPT gives 3 temporary years only.",
      };
    }
    if (country === "ae") {
      return {
        severity: "warning",
        title: "⚠️ UAE Golden Visa is NOT Permanent Residency",
        text: "The 10-year UAE Golden Visa is a premium residency permit, not a permanent pathway. It does not grant a passport, voting rights, or permanent safety nets. Your status remains dependent on maintaining capital or specialized employment. UAE law also denies residency to HIV-positive applicants.",
      };
    }
    if (country === "de") {
      return {
        severity: "warning",
        title: "🇩🇪 Germany APS Certificate & Embassy wait times in Dhaka",
        text: "APS Academic Verification is mandatory for Bangladeshi students targeting Germany. Processing takes 6-8 weeks. Furthermore, the German Embassy in Baridhara, Dhaka, currently has a visa appointment wait list exceeding 2 years. Apply for your APS certificate immediately post-graduation and request queue appointments early.",
      };
    }
    return null;
  }, [selected]);

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
        icon={MapPin}
        title="PR Route Planner & Probability Tool"
        description="Calculate points for Canada CRS, Australia Skilled visas, Germany Blue Card, and plan immigration timelines."
        backHref="/dashboard/career/job-market"
        backLabel="Back to Career Hub"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Country Selection Card */}
      <Card className="border-border bg-card/40 backdrop-blur-md">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary shrink-0" />
            <span className="text-xs font-bold text-muted-foreground uppercase">Target Country</span>
          </div>
          <select
            value={selected?.countryCode || ""}
            onChange={(e) => {
              const c = countries.find((x) => x.countryCode === e.target.value);
              if (c) setSelected(c);
            }}
            className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer w-60"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {!prData ? (
        <EmptyState icon={MapPin} title="No PR data available" description={`PR pathway data for ${selected?.country || "this country"} is being prepared.`} />
      ) : (
        <>
          {/* BD Specific Warnings at the very top of results */}
          {bdSpecificWarning && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
              bdSpecificWarning.severity === "destructive" ? "bg-red-500/10 border-red-500/20 text-red-400" :
              "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}>
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold mb-1">{bdSpecificWarning.title}</strong>
                {bdSpecificWarning.text}
              </div>
            </div>
          )}

          {/* Dual Tabs controls */}
          <div className="flex border-b border-border/40 pb-px">
            <button
              onClick={() => setActiveTab("routes")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "routes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              PR Pathways List
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "calculator"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calculator className="h-4 w-4" />
              PR Probability Calculator (P3)
            </button>
          </div>

          {/* TAB 1: Current Pathways List */}
          {activeTab === "routes" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard icon={Star} label="Overall PR Score" value={`${prData.overallPRScore}/100`} color="success" />
                <MetricCard icon={Clock} label="Difficulty Level" value={prData.overallPRDifficulty || "N/A"} color="default" />
                <MetricCard icon={ShieldAlert} label="Pathways" value={pathways.length} color="warning" />
                <MetricCard icon={CheckCircle} label="Recommended" value={prData.recommendedPathway || "N/A"} color="info" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Available Residency Routes</h3>
                <div className="space-y-4">
                  {pathways.map((pw, idx) => (
                    <Card key={idx} className={`border-border/60 bg-card/25 hover:bg-card/40 transition-all ${idx === 0 ? "ring-1 ring-primary/30" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {idx === 0 && <Star className="h-4 w-4 text-primary fill-primary" />}
                              <CardTitle className="text-sm font-bold text-foreground">{pw.pathwayName}</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-muted-foreground line-clamp-2">{pw.description}</CardDescription>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${difficultyColor(pw.difficulty)}`}>
                            {pw.difficulty}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          <div className="p-1.5 rounded bg-muted/30">
                            <span className="text-muted-foreground block">Est. Years</span>
                            <span className="font-bold text-foreground">{pw.estimatedYears}</span>
                          </div>
                          <div className="p-1.5 rounded bg-muted/30">
                            <span className="text-muted-foreground block">Job Required</span>
                            <span className={`font-bold ${pw.jobRequired ? "text-amber-400" : "text-emerald-400"}`}>
                              {pw.jobRequired ? "Yes" : "No"}
                            </span>
                          </div>
                          {pw.costEstimate && (
                            <div className="p-1.5 rounded bg-muted/30">
                              <span className="text-muted-foreground block">Cost Est.</span>
                              <span className="font-bold text-foreground">{pw.costCurrency} {pw.costEstimate.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="p-1.5 rounded bg-muted/30">
                            <span className="text-muted-foreground block">Processing</span>
                            <span className="font-bold text-foreground">{pw.processingTime || "N/A"}</span>
                          </div>
                        </div>

                        {pw.strengths && pw.strengths.length > 0 && (
                          <div className="border-t border-border/30 pt-2">
                            <div className="flex flex-wrap gap-1">
                              {pw.strengths.map((s, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {pw.strategicAdvice && (
                          <p className="text-[10px] text-muted-foreground italic mt-1">Tip: {pw.strategicAdvice}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {prData.criticalWarnings && prData.criticalWarnings.length > 0 && (
                <Card className="border-destructive/10 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Critical Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {prData.criticalWarnings.map((warning, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive font-bold shrink-0">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {visaData && (
                <Card className="border-border/60 bg-card/25">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground">Visa Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {visaData.studentVisa && (
                        <div className="p-3 rounded bg-muted/30">
                          <span className="text-muted-foreground block mb-1">Student Visa</span>
                          <p className="font-bold text-foreground">{visaData.studentVisa.visaName}</p>
                          <p className="text-[10px] text-muted-foreground">Processing: {visaData.studentVisa.processingTime}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold text-amber-400">Risk for BD: {visaData.studentVisa.rejectionRiskBangladesh}</p>
                        </div>
                      )}
                      {visaData.postStudyVisa && (
                        <div className="p-3 rounded bg-muted/30">
                          <span className="text-muted-foreground block mb-1">Post-Study Visa</span>
                          <p className="font-bold text-foreground">{visaData.postStudyVisa.visaName}</p>
                          <p className="text-[10px] text-muted-foreground">Duration: {visaData.postStudyVisa.duration}</p>
                        </div>
                      )}
                      {visaData.workVisa && (
                        <div className="p-3 rounded bg-muted/30">
                          <span className="text-muted-foreground block mb-1">Work Visa</span>
                          <p className="font-bold text-foreground">{visaData.workVisa.visaName || "See pathways"}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: PR Probability Calculator */}
          {activeTab === "calculator" && calculatorResults && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {/* Inputs Form */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="border-border bg-card/40 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <User className="h-4 w-4 text-primary" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Input your parameters to simulate your scores.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Age Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <Label className="font-semibold text-foreground">Age</Label>
                        <span className="font-bold text-primary">{age} Years</span>
                      </div>
                      <input
                        type="range"
                        min={18}
                        max={45}
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Degree select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5 text-primary" /> Target Degree Level</Label>
                      <select
                        value={calcDegree}
                        onChange={(e) => setCalcDegree(e.target.value as any)}
                        className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none h-9 cursor-pointer"
                      >
                        <option value="msc">Master's Degree (MSc)</option>
                        <option value="phd">Doctoral Degree (PhD)</option>
                      </select>
                    </div>

                    {/* IELTS Score */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <Label className="font-semibold text-foreground flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-primary" /> Target IELTS Band</Label>
                        <span className="font-bold text-primary">{ielts.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={5.0}
                        max={9.0}
                        step={0.5}
                        value={ielts}
                        onChange={(e) => setIelts(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Projected Work Experience */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <Label className="font-semibold text-foreground flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-primary" /> Post-Grad Work Experience</Label>
                        <span className="font-bold text-primary">{workExp} Years</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        value={workExp}
                        onChange={(e) => setWorkExp(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calculations Output */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-primary/20 bg-primary/5 shadow-xl">
                  <CardHeader className="pb-3 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {calculatorResults.systemName}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Estimated score based on local immigration criteria.
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">Estimated Score</span>
                        <span className="text-xl font-black text-primary">
                          {calculatorResults.score}
                          <span className="text-muted-foreground font-normal text-xs">/{calculatorResults.maxScore}</span>
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {/* Score Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                        <span>Progress Score</span>
                        <span>{Math.round((calculatorResults.score / calculatorResults.maxScore) * 100)}%</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((calculatorResults.score / calculatorResults.maxScore) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Gauges & Advice */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">PR Probability</span>
                        <span className={`text-base font-extrabold block ${calculatorResults.colorClass}`}>
                          {calculatorResults.probability}
                        </span>
                        <span className="text-[10px] text-muted-foreground block leading-normal mt-1">
                          {calculatorResults.eligibilityText}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Estimated Timeline</span>
                        <span className="text-base font-extrabold text-foreground block flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          {calculatorResults.estimatedTimeline}
                        </span>
                        <span className="text-[10px] text-muted-foreground block leading-normal mt-1">
                          Timeline starts from graduation day in host country, assuming standard employment contract pathways.
                        </span>
                      </div>
                    </div>

                    {/* Score Details Breakdown */}
                    <div className="space-y-2.5 pt-3 border-t border-border/40">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Estimated Point Breakdown
                      </h4>
                      <div className="divide-y divide-border/20 border border-border/40 rounded-lg bg-card/10 overflow-hidden">
                        {calculatorResults.details.map((det) => (
                          <div key={det.label} className="p-3 flex justify-between gap-4 text-xs hover:bg-muted/10 transition-colors">
                            <div>
                              <span className="font-semibold text-foreground block">{det.label}</span>
                              <span className="text-[10px] text-muted-foreground">{det.desc}</span>
                            </div>
                            <span className="font-mono font-bold text-primary text-right">{det.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
