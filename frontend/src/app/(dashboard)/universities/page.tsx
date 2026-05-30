"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api.js";
import { useAppDispatch, useAppSelector } from "@/lib/store/store.js";
import { 
  setUniversities, 
  addUniversity, 
  updateUniversity, 
  deleteUniversity 
} from "@/lib/store/slices/universitySlice.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { Select } from "@/components/ui/select.js"; // Standard HTML select is fine, or we can use custom
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
  School
} from "lucide-react";
import { UniversityRanking, University, Tier } from "@/types";

export default function UniversitiesPage() {
  const dispatch = useAppDispatch();
  const universities = useAppSelector((state) => state.universities.items);
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
  const [deadline, setDeadline] = useState("");
  const [intake, setIntake] = useState("Sep 2028");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Load tracked universities
  useEffect(() => {
    async function loadUniversities() {
      try {
        setLoading(true);
        const data = await fetchApi("/api/v1/universities");
        dispatch(setUniversities(data));
      } catch (err) {
        console.error(err);
        setError("Failed to load tracked universities.");
      } finally {
        setLoading(false);
      }
    }
    loadUniversities();
  }, [dispatch]);

  // Search rankings
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await fetchApi(`/api/v1/rankings?q=${encodeURIComponent(searchQuery)}&limit=10`);
        setSearchResults(results);
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
    } catch (err) {
      console.error(err);
      setError("Failed to track university. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this university from your tracker?")) return;

    try {
      await fetchApi(`/api/v1/universities/${id}`, {
        method: "DELETE",
      });
      dispatch(deleteUniversity(id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete university.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">University Tracker</h2>
          <p className="text-zinc-500 text-sm">
            Search from 3,045 ranked institutions and add them to your tracking dashboard.
          </p>
        </div>
      </div>

      {/* University Search Section */}
      <Card className="border-zinc-900 bg-zinc-900/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-300">Find Universities to Track</CardTitle>
          <CardDescription className="text-zinc-500">
            Type to search by name or country (QS 2026, THE 2026, and ARWU 2025 metrics included).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search e.g. Oxford, Stanford, Germany, Ireland..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-200 placeholder:text-zinc-600"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-emerald-400" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 divide-y divide-zinc-800/50 max-h-80 overflow-y-auto z-20">
              {searchResults.map((rank) => (
                <div key={rank.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-800/40 transition-all gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-100">{rank.institutionName}</h4>
                    <p className="text-xs text-zinc-500">{rank.country} {rank.region ? `· ${rank.region}` : ""}</p>
                    <div className="flex gap-4 mt-2">
                      {rank.qs2026Rank && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          QS: #{rank.qs2026Rank}
                        </span>
                      )}
                      {rank.the2026Rank && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          THE: #{rank.the2026Rank}
                        </span>
                      )}
                      {rank.arwu2025Rank && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          ARWU: #{rank.arwu2025Rank}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOpenTrackForm(rank)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-8 px-3 rounded-lg text-xs flex items-center gap-1 self-start sm:self-center"
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
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tracked Universities list */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-zinc-300 flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-emerald-400" />
          Tracked Workspace ({universities.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : universities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600 border border-dashed border-zinc-900 rounded-xl bg-zinc-900/10">
            <School className="h-10 w-10 mb-2 text-zinc-700" />
            <p className="text-sm">No universities tracked yet. Find one above to begin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {universities.map((uni) => (
              <Card key={uni.id} className="border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm font-bold text-zinc-200 line-clamp-1">{uni.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-500">{uni.country}</CardDescription>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      uni.tier === "DREAM" ? "bg-purple-500/15 text-purple-400" :
                      uni.tier === "MATCH" ? "bg-emerald-500/15 text-emerald-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {uni.tier}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  {uni.program && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <BookOpen className="h-3 w.3 text-zinc-600" />
                      <span className="font-medium text-zinc-300">{uni.program}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900/60">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Tuition / Yr
                      </span>
                      <p className="text-xs text-zinc-300 font-semibold">{uni.tuitionPerYr || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Deadline
                      </span>
                      <p className="text-xs text-zinc-300 font-semibold">{uni.deadline || "Not specified"}</p>
                    </div>
                  </div>
                  {uni.notes && (
                    <p className="text-xs text-zinc-500 bg-zinc-900/40 p-2 rounded border border-zinc-900/30 line-clamp-2">
                      {uni.notes}
                    </p>
                  )}
                </CardContent>
                <div className="px-6 py-3 border-t border-zinc-900/60 flex items-center justify-between bg-zinc-900/20 rounded-b-xl">
                  {uni.website ? (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-all"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-600">No website</span>
                  )}
                  <Button
                    onClick={() => handleDelete(uni.id)}
                    className="bg-transparent hover:bg-destructive/10 text-zinc-500 hover:text-destructive border-none p-1.5 h-8 w-8 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Track form dialog */}
      {trackFormOpen && selectedRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-bold text-zinc-200">Track University</h3>
              <p className="text-xs text-zinc-500">{selectedRanking.institutionName} ({selectedRanking.country})</p>
            </div>
            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="progName" className="text-xs text-zinc-400">Target Program</Label>
                <Input
                  id="progName"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="tierSelect" className="text-xs text-zinc-400">Application Tier</Label>
                  <select
                    id="tierSelect"
                    value={tier}
                    onChange={(e) => setTier(e.target.value as Tier)}
                    className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="DREAM">DREAM</option>
                    <option value="MATCH">MATCH</option>
                    <option value="SAFETY">SAFETY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="tuitionInput" className="text-xs text-zinc-400">Tuition Per Year</Label>
                  <Input
                    id="tuitionInput"
                    placeholder="e.g. €15,000 / Free"
                    value={tuitionPerYr}
                    onChange={(e) => setTuitionPerYr(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="deadlineInput" className="text-xs text-zinc-400">Application Deadline</Label>
                  <Input
                    id="deadlineInput"
                    placeholder="e.g. Jan 15, 2028"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="intakeInput" className="text-xs text-zinc-400">Target Intake</Label>
                  <Input
                    id="intakeInput"
                    value={intake}
                    onChange={(e) => setIntake(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="uniWebsite" className="text-xs text-zinc-400">University Program Website (Optional)</Label>
                <Input
                  id="uniWebsite"
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notesInput" className="text-xs text-zinc-400">Personal Notes / Requirements</Label>
                <textarea
                  id="notesInput"
                  rows={3}
                  placeholder="Minimum IELTS score 7.0, requires 3 LORs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  onClick={() => setTrackFormOpen(false)}
                  className="bg-transparent hover:bg-zinc-800 text-zinc-400 border border-zinc-800 h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold h-9"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track University"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
