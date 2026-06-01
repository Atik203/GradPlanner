"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { UniversityRanking } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

interface PaginatedResponse {
  data: UniversityRanking[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

const ITEMS_PER_PAGE = 50;

export default function PublicUniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [results, setResults] = useState<UniversityRanking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (page: number, query: string, countries: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        page: String(page),
      });
      if (query.trim()) params.set("q", query.trim());
      if (countries.length > 0) params.set("country", countries.join(","));

      const response: PaginatedResponse = await fetchApi(`/api/v1/rankings?${params.toString()}`);
      setResults(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      console.error(err);
      setError("Failed to load rankings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await fetchApi("/api/v1/rankings/countries");
        setAvailableCountries(data);
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    }
    loadCountries();
  }, []);

  // Reset to page 1 when search or country changes
  useEffect(() => {
    setCurrentPage(1);
    loadData(1, debouncedQuery, countryFilter);
  }, [debouncedQuery, countryFilter, loadData]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadData(newPage, debouncedQuery, countryFilter);
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <>

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
            <CardDescription>Type a university name or country to filter the rankings. Click any institution for detailed breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. Oxford, Stanford, MIT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background border-border/60 focus:border-primary text-base rounded-xl shadow-sm w-full"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-primary" />
                )}
              </div>
              
              {/* Country Filter */}
              <div className="w-full sm:w-[220px]">
                <MultiSelect
                  options={availableCountries}
                  selected={countryFilter}
                  onChange={setCountryFilter}
                  placeholder="All Countries"
                />
              </div>
            </div>

            {/* Result count */}
            {!loading && total > 0 && (
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  Showing <strong className="text-foreground">{startItem}–{endItem}</strong> of{" "}
                  <strong className="text-foreground">{total.toLocaleString()}</strong> institutions
                  {debouncedQuery && <span> matching &ldquo;<strong className="text-foreground">{debouncedQuery}</strong>&rdquo;</span>}
                </p>
              </div>
            )}

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
                      <th className="px-6 py-4 font-semibold text-center">QS &apos;26</th>
                      <th className="px-6 py-4 font-semibold text-center">THE &apos;26</th>
                      <th className="px-6 py-4 font-semibold text-center">ARWU &apos;25</th>
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
                    {loading && results.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                        </td>
                      </tr>
                    )}
                    {results.map((rank) => (
                      <tr key={rank.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <Link
                            href={`/universities/${rank.id}`}
                            className="hover:text-primary transition-colors group-hover:underline decoration-primary/50 underline-offset-4"
                          >
                            {rank.institutionName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {rank.country} {rank.region ? <span className="text-xs opacity-70">({rank.region})</span> : ""}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank.qs2026Rank ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs border border-purple-500/20">
                              #{rank.qs2026RankDisplay || rank.qs2026Rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank.the2026Rank ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20">
                              #{rank.the2026RankDisplay || rank.the2026Rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank.arwu2025Rank ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                              #{rank.arwu2025Rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {/* Page number pills — show up to 5 */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          pageNum === currentPage
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
