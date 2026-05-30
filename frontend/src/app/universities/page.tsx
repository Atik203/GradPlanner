"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowLeft, School } from "lucide-react";
import { UniversityRanking } from "@/types";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicUniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UniversityRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const data = await fetchApi("/api/v1/rankings?limit=50");
        setResults(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load rankings.");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/api/v1/rankings?q=${encodeURIComponent(searchQuery)}&limit=50`);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="z-10 sticky top-0 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <School className="h-5 w-5 text-primary" />
            <span>Global Rankings</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-6 py-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight">University Rankings Explorer</h1>
          <p className="text-muted-foreground text-lg">
            Search through 3,000+ institutions globally. Data aggregated from QS 2026, THE 2026, and ARWU 2025.
          </p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Search Directory</CardTitle>
            <CardDescription>Type a university name or country to filter the rankings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. Oxford, Stanford, Germany, Ireland..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-background border-border/60 focus:border-primary text-base rounded-xl shadow-sm"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-primary" />
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/60">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Institution</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold text-center">QS '26</th>
                      <th className="px-6 py-4 font-semibold text-center">THE '26</th>
                      <th className="px-6 py-4 font-semibold text-center">ARWU '25</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {results.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No universities found matching your search.
                        </td>
                      </tr>
                    )}
                    {results.map((rank) => (
                      <tr key={rank.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {rank.institutionName}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {rank.country} {rank.region ? <span className="text-xs opacity-70">({rank.region})</span> : ""}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank.qs2026Rank ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-500 font-semibold text-xs border border-purple-500/20">
                              #{rank.qs2026RankDisplay || rank.qs2026Rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank.the2026Rank ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 font-semibold text-xs border border-blue-500/20">
                              #{rank.the2026RankDisplay || rank.the2026Rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank.arwu2025Rank ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold text-xs border border-emerald-500/20">
                              #{rank.arwu2025Rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
