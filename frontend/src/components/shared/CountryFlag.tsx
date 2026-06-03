import React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

// Mapping of country name / code variations to standard ISO 3166-1 alpha-2 codes
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "united states": "US",
  "usa": "US",
  "canada": "CA",
  "germany": "DE",
  "australia": "AU",
  "netherlands": "NL",
  "sweden": "SE",
  "finland": "FI",
  "ireland": "IE",
  "south korea": "KR",
  "korea": "KR",
  "japan": "JP",
  "uae": "AE",
  "united arab emirates": "AE",
  "uae (mbzuai)": "AE",
  "china": "CN",
  "united kingdom": "GB",
  "uk": "GB",
  "switzerland": "CH",
  "denmark": "DK",
  "norway": "NO",
  "france": "FR",
  "singapore": "SG",
  "new zealand": "NZ",
  "belgium": "BE",
};

export function getCountryCode(country: string): string {
  const normalized = country.trim().toLowerCase();
  // If it's already a 2-letter code, return it capitalized
  if (normalized.length === 2) {
    return normalized.toUpperCase();
  }
  return COUNTRY_NAME_TO_CODE[normalized] || "US";
}

interface CountryFlagProps {
  country: string; // Can be code (e.g. "US") or name (e.g. "United States")
  className?: string;
}

export function CountryFlag({ country, className }: CountryFlagProps) {
  const code = getCountryCode(country);
  const FlagComponent = (Flags as any)[code];

  if (!FlagComponent) {
    // Fallback if flag isn't found
    return (
      <div className={cn("w-8 h-5 bg-muted rounded flex items-center justify-center text-[10px] font-bold border border-border/40", className)}>
        {code}
      </div>
    );
  }

  return (
    <div className={cn("inline-block overflow-hidden rounded shadow-sm border border-border/10 aspect-[3/2] shrink-0", className)}>
      <FlagComponent className="w-full h-full object-cover" />
    </div>
  );
}
