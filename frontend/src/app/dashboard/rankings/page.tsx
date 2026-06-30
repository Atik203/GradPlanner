"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Search, Loader2, ChevronLeft, ChevronRight, BarChart3, Star, ExternalLink } from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { UniversityRanking } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { RankingTableSkeleton } from "@/components/skeletons/RankingTableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";

interface PaginatedResponse {
  data: UniversityRanking[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

const ITEMS_PER_PAGE = 50;

export default function DashboardRankingsPage() {
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

  const handleRetry = useCallback(() => {
    loadData(1, debouncedQuery, countryFilter);
  }, [loadData, debouncedQuery, countryFilter]);

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

  useEffect(() => {
    setCurrentPage(1);
    loadData(1, debouncedQuery, countryFilter);
  }, [debouncedQuery, countryFilter, loadData]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadData(newPage, debouncedQuery, countryFilter);
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-page-title font-black tracking-tight text-foreground">Global Rankings Browser</h1>
          <p className="text-sm text-muted-foreground">QS 2026 · THE 2026 · ARWU 2025 — Click any institution to see full ranking breakdown</p>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl shadow-md">
        <CardHeader className="border-b border-border/40 pb-5">
          <CardTitle className="text-lg text-foreground">Search University Rankings</CardTitle>
          <CardDescription>
            Browse 3,000+ institutions. Track universities directly from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by university name or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 bg-background border-border focus:border-primary text-sm w-full"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-3 h-5 w-5 animate-spin text-primary" />
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <strong className="text-foreground">{startItem}–{endItem}</strong> of{" "}
                <strong className="text-foreground">{total.toLocaleString()}</strong> institutions
                {debouncedQuery && <span> matching &ldquo;<strong className="text-foreground">{debouncedQuery}</strong>&rdquo;</span>}
              </p>
            </div>
          )}

          {error && (
            <ApiErrorAlert error={error} onRetry={handleRetry} />
          )}

          {/* Table (Desktop) */}
          <div className="hidden md:block rounded-xl border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/60">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Institution</th>
                    <th className="px-5 py-3.5 font-semibold">Location</th>
                    <th className="px-5 py-3.5 font-semibold text-center">QS &apos;26</th>
                    <th className="px-5 py-3.5 font-semibold text-center">THE &apos;26</th>
                    <th className="px-5 py-3.5 font-semibold text-center">ARWU &apos;25</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {results.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12">
                        <div className="max-w-sm mx-auto">
                          <EmptyState
                            icon={Search}
                            title="No universities found"
                            description="No results match your search. Try different keywords or remove filters."
                            secondaryAction={{
                              label: "Clear Filters",
                              onAction: () => { setSearchQuery(""); setCountryFilter([]); }
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading && results.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-4">
                        <RankingTableSkeleton />
                      </td>
                    </tr>
                  )}
                  {results.map((rank) => (
                    <tr key={rank.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <Link
                          href={`/universities/${rank.id}`}
                          target="_blank"
                          className="hover:text-primary transition-colors flex items-center gap-1.5 group-hover:underline decoration-primary/50 underline-offset-4"
                        >
                          {rank.institutionName}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {rank.country}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {rank.qs2026Rank ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20">
                            #{rank.qs2026RankDisplay || rank.qs2026Rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {rank.the2026Rank ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
                            #{rank.the2026RankDisplay || rank.the2026Rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {rank.arwu2025Rank ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                            #{rank.arwu2025Rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Link
                          href={`/dashboard/universities/new?name=${encodeURIComponent(rank.institutionName)}&country=${encodeURIComponent(rank.country)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/20 transition-colors"
                        >
                          <Star className="h-3 w-3" />
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (Mobile) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <RankingTableSkeleton />
            ) : results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No universities found"
                description="No results match your search. Try different keywords or remove filters."
              />
            ) : (
              results.map((rank) => (
                <div key={rank.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">{rank.institutionName}</p>
                      <p className="text-xs text-muted-foreground">{rank.country}{rank.region ? ` · ${rank.region}` : ""}</p>
                    </div>
                    <Link
                      href={`/dashboard/universities/new?name=${encodeURIComponent(rank.institutionName)}&country=${encodeURIComponent(rank.country)}`}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Star className="h-3 w-3" />
                      Track
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rank.qs2026Rank && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20">
                        QS #{rank.qs2026RankDisplay || rank.qs2026Rank}
                      </span>
                    )}
                    {rank.the2026Rank && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
                        THE #{rank.the2026RankDisplay || rank.the2026Rank}
                      </span>
                    )}
                    {rank.arwu2025Rank && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                        ARWU #{rank.arwu2025Rank}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="border-border text-muted-foreground hover:text-foreground h-9 px-2 sm:px-3"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-1.5">
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
                className="border-border text-muted-foreground hover:text-foreground h-9 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
