"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Settings,
  School,
  GraduationCap,
  FileText,
  FolderGit2,
  Globe,
  Sun,
  Moon,
  LogOut,
  Building2,
  Plus,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
} from "@/components/ui/command";
import { searchApi } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useTheme } from "next-themes";
import type { SearchResults } from "@/types";

interface NavigateItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchApi
      .search(debouncedQuery)
      .then((data) => {
        setResults(data);
        setSearching(false);
      })
      .catch(() => {
        setResults(null);
        setSearching(false);
      });
  }, [debouncedQuery]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      onOpenChange(v);
      if (!v) {
        setQuery("");
        setResults(null);
      }
    },
    [onOpenChange]
  );

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      handleOpenChange(false);
    },
    [router, handleOpenChange]
  );

  const navItems: NavigateItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, action: () => navigate("/dashboard") },
    { id: "countries", label: "Country Explorer", icon: Globe, action: () => navigate("/dashboard/countries") },
    { id: "universities", label: "Universities", icon: School, action: () => navigate("/dashboard/universities") },
    { id: "professors", label: "Professors", icon: GraduationCap, action: () => navigate("/dashboard/professors") },
    { id: "applications", label: "Applications", icon: FolderGit2, action: () => navigate("/dashboard/applications") },
    { id: "documents", label: "Documents", icon: FileText, action: () => navigate("/dashboard/documents") },
    { id: "profile", label: "Profile", icon: User, action: () => navigate("/dashboard/profile") },
    { id: "settings", label: "Settings", icon: Settings, action: () => navigate("/dashboard/settings") },
  ];

  const actions: NavigateItem[] = [
    {
      id: "toggle-theme",
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon: theme === "dark" ? Sun : Moon,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        handleOpenChange(false);
      },
    },
  ];

  const totalResults =
    (results?.universityRankings.length ?? 0) +
    (results?.universities.length ?? 0) +
    (results?.professors.length ?? 0) +
    (results?.countries.length ?? 0);

  const showDefault = !query || query.length < 2;

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search universities, professors, countries..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {searching && (
          <CommandLoading>
            <div className="flex items-center justify-center py-4">
              <span className="text-xs text-muted-foreground animate-pulse">Searching...</span>
            </div>
          </CommandLoading>
        )}

        {!searching && query.length >= 2 && totalResults === 0 && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}

        {/* Search Results */}
        {results && !searching && (
          <>
            {results.universities.length > 0 && (
              <CommandGroup heading="Your Universities">
                {results.universities.map((u) => (
                  <CommandItem
                    key={`uni-${u.id}`}
                    value={`uni-${u.id}`}
                    onSelect={() => navigate(`/dashboard/universities`)}
                  >
                    <School className="h-4 w-4" />
                    <span className="flex-1">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{u.country}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.universityRankings.length > 0 && (
              <CommandGroup heading="University Rankings">
                {results.universityRankings.map((r) => (
                  <CommandItem
                    key={`rank-${r.id}`}
                    value={`rank-${r.id}`}
                    onSelect={() => navigate(`/dashboard/universities`)}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="flex-1">{r.institutionName}</span>
                    <span className="text-[10px] text-muted-foreground">{r.country}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.professors.length > 0 && (
              <CommandGroup heading="Professors">
                {results.professors.map((p) => (
                  <CommandItem
                    key={`prof-${p.id}`}
                    value={`prof-${p.id}`}
                    onSelect={() => navigate(`/dashboard/professors`)}
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span className="flex-1">{p.name}</span>
                    {p.university && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {p.university.name}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.countries.length > 0 && (
              <CommandGroup heading="Countries">
                {results.countries.map((c) => (
                  <CommandItem
                    key={`country-${c.id}`}
                    value={`country-${c.id}`}
                    onSelect={() => navigate(`/dashboard/countries/${c.countryCode.toLowerCase()}`)}
                  >
                    <Globe className="h-4 w-4" />
                    <span className="flex-1">{c.country}</span>
                    <span className="text-[10px] text-muted-foreground">Score: {c.overallScore}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        {/* Default: Navigation + Quick Actions */}
        {showDefault && (
          <>
            <CommandGroup heading="Navigation">
              {navItems.map((item) => (
                <CommandItem key={item.id} value={item.id} onSelect={item.action}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Quick Actions">
              {actions.map((item) => (
                <CommandItem key={item.id} value={item.id} onSelect={item.action}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
