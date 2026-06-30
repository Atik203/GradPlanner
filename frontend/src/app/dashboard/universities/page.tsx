"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { 
  setUniversities, 
  addUniversity, 
  updateUniversity, 
  deleteUniversity 
} from "@/lib/store/slices/universitySlice";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ResponsiveModal } from "@/components/responsive/ResponsiveModal";
import { 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink, 
  BookOpen, 
  DollarSign, 
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Bookmark,
  School,
  TrendingUp,
  Award,
  Globe,
  Coins
} from "lucide-react";
import { UniversityRanking, University, Tier } from "@/types";
import { toast } from "sonner";
import { UniversitySkeleton } from "@/components/skeletons/UniversitySkeleton";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";

// BDT Conversion Rates constant for calculation
const BDT_RATES: Record<string, number> = {
  USD: 125, EUR: 136, CAD: 92, AUD: 83, GBP: 160, SEK: 11.9, NOK: 11.7, DKK: 18.2,
  CHF: 138, NZD: 76, JPY: 0.81, KRW: 0.091, SGD: 93, CNY: 17.3, AED: 34.0,
};

const getCountryCurrency = (country: string) => {
  const c = country.toLowerCase().trim();
  if (c.includes("usa") || c.includes("united states")) return "USD";
  if (c.includes("germany") || c.includes("netherlands") || c.includes("ireland") || c.includes("finland") || c.includes("europe") || c.includes("netherland")) return "EUR";
  if (c.includes("canada")) return "CAD";
  if (c.includes("australia")) return "AUD";
  if (c.includes("united kingdom") || c.includes("uk") || c.includes("great britain")) return "GBP";
  if (c.includes("sweden")) return "SEK";
  if (c.includes("norway")) return "NOK";
  if (c.includes("denmark")) return "DKK";
  if (c.includes("switzerland")) return "CHF";
  if (c.includes("new zealand")) return "NZD";
  if (c.includes("japan")) return "JPY";
  if (c.includes("korea") || c.includes("south korea")) return "KRW";
  if (c.includes("singapore")) return "SGD";
  if (c.includes("china")) return "CNY";
  if (c.includes("uae") || c.includes("united arab emirates")) return "AED";
  return "USD";
};

const convertToBdt = (costStr: string | null | undefined, country: string): number => {
  if (!costStr) return 0;
  const cleaned = costStr.replace(/[^0-9.]/g, "");
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;
  
  let currency = getCountryCurrency(country);
  const costUpper = costStr.toUpperCase();
  if (costUpper.includes("$") || costUpper.includes("USD")) {
    if (costUpper.includes("CAD")) currency = "CAD";
    else if (costUpper.includes("AUD")) currency = "AUD";
    else currency = "USD";
  } else if (costUpper.includes("€") || costUpper.includes("EUR")) {
    currency = "EUR";
  } else if (costUpper.includes("£") || costUpper.includes("GBP")) {
    currency = "GBP";
  } else if (costUpper.includes("SEK")) {
    currency = "SEK";
  } else if (costUpper.includes("AED")) {
    currency = "AED";
  }
  
  return amount * (BDT_RATES[currency] || 125);
};

const formatBdtAmount = (amount: number): string => {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)} Lakh BDT`;
  }
  return `${amount.toLocaleString()} BDT`;
};

export default function UniversitiesPage() {
  const dispatch = useAppDispatch();
  const universities = useAppSelector((state) => state.universities.items);
  const profile = useAppSelector((state) => state.profile.profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UniversityRanking[]>([]);
  const [searching, setSearching] = useState(false);

  // Add/Edit university states
  const [selectedRanking, setSelectedRanking] = useState<UniversityRanking | null>(null);
  const [trackFormOpen, setTrackFormOpen] = useState(false);
  const [program, setProgram] = useState("");
  const [tier, setTier] = useState<Tier>("MATCH");
  const [tuitionPerYr, setTuitionPerYr] = useState("");
  const [livingCostPerYr, setLivingCostPerYr] = useState("");
  const [scholarshipsAvailable, setScholarshipsAvailable] = useState(false);
  const [minCgpa, setMinCgpa] = useState("");
  const [minIelts, setMinIelts] = useState("");
  const [acceptanceRate, setAcceptanceRate] = useState("");
  const [fundingAvailable, setFundingAvailable] = useState(false);
  const [prPathwayQuality, setPrPathwayQuality] = useState("Good");
  const [deadline, setDeadline] = useState("");
  const [intake, setIntake] = useState("Sep 2028");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Load tracked universities and profile
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [uniData, profileData] = await Promise.all([
        fetchApi("/api/v1/universities"),
        fetchApi("/api/v1/profile").catch(() => null),
      ]);
      dispatch(setUniversities(uniData));
      if (profileData) {
        dispatch(setProfile(profileData));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tracked universities.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  // Search rankings
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetchApi(`/api/v1/rankings?q=${encodeURIComponent(searchQuery)}&limit=10`);
        // Backend now returns paginated object { data: [], total, ... }
        setSearchResults(Array.isArray(response) ? response : (response.data ?? []));
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleOpenTrackForm = (ranking: UniversityRanking) => {
    setSelectedRanking(ranking);
    setProgram("MSc Machine Learning & AI");
    setTier("MATCH");
    setTuitionPerYr("");
    setLivingCostPerYr("");
    setScholarshipsAvailable(false);
    setMinCgpa("");
    setMinIelts("");
    setAcceptanceRate("");
    setFundingAvailable(false);
    setPrPathwayQuality("Good");
    setDeadline("");
    setIntake("Sep 2028");
    setWebsite("");
    setNotes("");
    setTrackFormOpen(true);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRanking) return;

    setSaving(true);
    try {
      const newUni = await fetchApi("/api/v1/universities", {
        method: "POST",
        body: JSON.stringify({
          name: selectedRanking.institutionName,
          country: selectedRanking.country,
          tier,
          program,
          tuitionPerYr,
          livingCostPerYr,
          scholarshipsAvailable,
          minCgpa: minCgpa || null,
          minIelts: minIelts || null,
          acceptanceRate: acceptanceRate || null,
          fundingAvailable,
          prPathwayQuality,
          deadline,
          intake,
          website: website || `https://google.com/search?q=${encodeURIComponent(selectedRanking.institutionName)}`,
          notes,
        }),
      });

      dispatch(addUniversity(newUni));
      setTrackFormOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      toast.success(`${selectedRanking.institutionName} tracked successfully!`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to track university. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await fetchApi(`/api/v1/universities/${deleteTarget}`, {
        method: "DELETE",
      });
      dispatch(deleteUniversity(deleteTarget));
      setDeleteTarget(null);
      toast.success("University removed from tracker.");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to delete university.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">University Tracker</h2>
          <p className="text-muted-foreground text-sm">
            Search from 3,045 ranked institutions and add them to your tracking dashboard.
          </p>
        </div>
      </div>

      {/* University Search Section */}
      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Find Universities to Track</CardTitle>
          <CardDescription className="text-muted-foreground">
            Type to search by name or country (QS 2026, THE 2026, and ARWU 2025 metrics included).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search e.g. Oxford, Stanford, Germany, Ireland..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="rounded-lg border border-border bg-popover/95 divide-y divide-border/50 max-h-80 overflow-y-auto z-20">
              {searchResults.map((rank) => (
                <div key={rank.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/40 transition-all gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{rank.institutionName}</h4>
                    <p className="text-xs text-muted-foreground">{rank.country} {rank.region ? `· ${rank.region}` : ""}</p>
                    <div className="flex gap-4 mt-2">
                      {rank.qs2026Rank && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          QS: #{rank.qs2026Rank}
                        </span>
                      )}
                      {rank.the2026Rank && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          THE: #{rank.the2026Rank}
                        </span>
                      )}
                      {rank.arwu2025Rank && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          ARWU: #{rank.arwu2025Rank}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOpenTrackForm(rank)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-8 px-3 rounded-lg text-xs flex items-center gap-1 self-start sm:self-center"
                  >
                    <Plus className="h-3 w-3" />
                    Track
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <ApiErrorAlert error={error} onRetry={loadData} />
      )}

      {/* Tracked Universities list */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          Tracked Workspace ({universities.length})
        </h3>

        {loading ? (
          <UniversitySkeleton />
        ) : universities.length === 0 ? (
          <EmptyState
            icon={School}
            title="No universities tracked yet"
            description="Search and add universities above to build your personalized shortlist."
            actionLabel="Add University"
            actionHref="/dashboard/universities/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {universities.map((uni) => {
              const tuitionBdt = convertToBdt(uni.tuitionPerYr, uni.country);
              const livingBdt = convertToBdt(uni.livingCostPerYr, uni.country);
              const totalBdt = tuitionBdt + livingBdt;
              
              const getFitBadge = () => {
                if (!profile) return null;
                const { cgpa, ieltsScore } = profile;
                const minCgpa = uni.minCgpa;
                const minIelts = uni.minIelts;
                
                if (minCgpa || minIelts) {
                  const gpaGap = minCgpa && cgpa ? cgpa < minCgpa : false;
                  const ieltsGap = minIelts && ieltsScore ? ieltsScore < minIelts : false;
                  
                  if (gpaGap || ieltsGap) {
                    let reasons = [];
                    if (gpaGap) reasons.push(`GPA ${cgpa}/${minCgpa}`);
                    if (ieltsGap) reasons.push(`IELTS ${ieltsScore}/${minIelts}`);
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-black text-[10px] border border-destructive/20 animate-pulse" title={`Gaps: ${reasons.join(", ")}`}>
                        Gap: {reasons.join(" · ")}
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] border border-emerald-500/20">
                      Strong Fit
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">
                    Standard Fit
                  </span>
                );
              };

              return (
                <Card key={uni.id} className="border-border bg-card/30 hover:border-border/80 transition-all flex flex-col justify-between shadow-sm">
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-bold text-foreground line-clamp-1">{uni.name}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">{uni.country}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          uni.tier === "DREAM" ? "bg-[var(--tier-dream-bg)] text-[var(--tier-dream)]" :
                          uni.tier === "MATCH" ? "bg-[var(--tier-match-bg)] text-[var(--tier-match)]" :
                          "bg-[var(--tier-safety-bg)] text-[var(--tier-safety)]"
                        }`}>
                          {uni.tier}
                        </span>
                        {getFitBadge()}
                      </div>
                    </div>

                    {/* All 3 Ranks Side-by-Side */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] border border-purple-500/20">
                        QS: #{uni.ranking?.qs2026RankDisplay || uni.ranking?.qs2026Rank || "—"}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">
                        THE: #{uni.ranking?.the2026RankDisplay || uni.ranking?.the2026Rank || "—"}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        ARWU: #{uni.ranking?.arwu2025Rank || "—"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4 flex-1">
                    {uni.program && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="font-semibold text-foreground/90">{uni.program}</span>
                      </div>
                    )}

                    {/* Cost Breakdown & Conversion */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Tuition / Yr
                        </span>
                        <p className="text-xs text-foreground/90 font-semibold">{uni.tuitionPerYr || "Not specified"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Coins className="h-3 w-3 text-muted-foreground" /> Living / Yr
                        </span>
                        <p className="text-xs text-foreground/90 font-semibold">{uni.livingCostPerYr || "Not specified"}</p>
                      </div>
                    </div>

                    {totalBdt > 0 && (
                      <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          💰 Net Annual Cost BDT:
                        </span>
                        <span className="font-extrabold text-emerald-400">
                          {formatBdtAmount(totalBdt)}/yr
                        </span>
                      </div>
                    )}

                    {/* University Requirements Criteria */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-2.5 rounded-lg border border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">GPA Req / IELTS Req:</span>
                        <span className="font-semibold text-foreground">{uni.minCgpa || "—"} / {uni.minIelts || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Acceptance / PR:</span>
                        <span className="font-semibold text-foreground">{uni.acceptanceRate ? `${uni.acceptanceRate}%` : "—"} / {uni.prPathwayQuality || "—"}</span>
                      </div>
                      <div className="col-span-2 flex justify-between pt-1 border-t border-border/20 text-[10px]">
                        <span className={uni.scholarshipsAvailable ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                          {uni.scholarshipsAvailable ? "✓ Scholarships" : "✗ No Scholarships"}
                        </span>
                        <span className={uni.fundingAvailable ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                          {uni.fundingAvailable ? "✓ TA/RA Funding" : "✗ No TA/RA Funding"}
                        </span>
                      </div>
                    </div>

                    {uni.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 line-clamp-2">
                        {uni.notes}
                      </p>
                    )}
                  </CardContent>

                  <div className="px-6 py-3 border-t border-border/60 flex items-center justify-between bg-muted/30 rounded-b-xl">
                    <div className="flex items-center gap-4">
                      {uni.website ? (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-all font-semibold"
                        >
                          Website <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No website</span>
                      )}
                      {uni.deadline && (
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Deadline: {uni.deadline}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => setDeleteTarget(uni.id)}
                      className="bg-transparent hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-none p-1.5 h-8 w-8 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ResponsiveModal
        open={trackFormOpen}
        onOpenChange={setTrackFormOpen}
        title="Track University"
        description={selectedRanking ? `${selectedRanking.institutionName} (${selectedRanking.country})` : undefined}
      >
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="progName" className="text-xs text-muted-foreground">Target Program</Label>
            <Input
              id="progName"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="tierSelect" className="text-xs text-muted-foreground">Application Tier</Label>
              <select
                id="tierSelect"
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="DREAM">DREAM</option>
                <option value="MATCH">MATCH</option>
                <option value="SAFETY">SAFETY</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="tuitionInput" className="text-xs text-muted-foreground">Tuition Per Year</Label>
              <Input
                id="tuitionInput"
                placeholder="e.g. €15,000 / Free"
                value={tuitionPerYr}
                onChange={(e) => setTuitionPerYr(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="deadlineInput" className="text-xs text-muted-foreground">Application Deadline</Label>
              <Input
                id="deadlineInput"
                placeholder="e.g. Jan 15, 2028"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="intakeInput" className="text-xs text-muted-foreground">Target Intake</Label>
              <Input
                id="intakeInput"
                value={intake}
                onChange={(e) => setIntake(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="uniWebsite" className="text-xs text-muted-foreground">University Program Website (Optional)</Label>
            <Input
              id="uniWebsite"
              type="url"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="livingCostInput" className="text-xs text-muted-foreground">Living Cost / Year</Label>
              <Input
                id="livingCostInput"
                placeholder="e.g. €11,200"
                value={livingCostPerYr}
                onChange={(e) => setLivingCostPerYr(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prPathwaySelect" className="text-xs text-muted-foreground">PR Pathway Quality</Label>
              <select
                id="prPathwaySelect"
                value={prPathwayQuality}
                onChange={(e) => setPrPathwayQuality(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="Best">Best</option>
                <option value="Good">Good</option>
                <option value="Possible">Possible</option>
                <option value="Avoid">Avoid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="cgpaInput" className="text-xs text-muted-foreground">Min CGPA</Label>
              <Input
                id="cgpaInput"
                type="number"
                step="0.01"
                placeholder="3.0"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ieltsInput" className="text-xs text-muted-foreground">Min IELTS</Label>
              <Input
                id="ieltsInput"
                type="number"
                step="0.5"
                placeholder="6.5"
                value={minIelts}
                onChange={(e) => setMinIelts(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="acceptanceRateInput" className="text-xs text-muted-foreground">Acceptance %</Label>
              <Input
                id="acceptanceRateInput"
                type="number"
                step="0.1"
                placeholder="15"
                value={acceptanceRate}
                onChange={(e) => setAcceptanceRate(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer bg-muted/20 border border-border/40 p-2 rounded-lg text-xs">
              <input
                type="checkbox"
                checked={scholarshipsAvailable}
                onChange={(e) => setScholarshipsAvailable(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary bg-background"
              />
              <span className="text-foreground font-semibold">Scholarships</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-muted/20 border border-border/40 p-2 rounded-lg text-xs">
              <input
                type="checkbox"
                checked={fundingAvailable}
                onChange={(e) => setFundingAvailable(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary bg-background"
              />
                <span className="text-foreground font-semibold">TA/RA Funding</span>
            </label>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notesInput" className="text-xs text-muted-foreground">Personal Notes / Requirements</Label>
            <textarea
              id="notesInput"
              rows={3}
              placeholder="Minimum IELTS score 7.0, requires 3 LORs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              onClick={() => setTrackFormOpen(false)}
              className="bg-transparent hover:bg-muted text-muted-foreground border border-border h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track University"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="Untrack University"
        description="Are you sure you want to remove this university from your tracker? This action cannot be undone."
      />
    </div>
  );
}
