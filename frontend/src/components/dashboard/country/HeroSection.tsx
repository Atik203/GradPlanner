import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Star } from "lucide-react";

export function HeroSection({ data }: { data: CountryIntelligence }) {
  const summary = data.summary;
  if (!summary) return null;
  const scoreOutOf5 = Math.max(1, Math.round((summary.overallScore || 0) / 20));

  return (
    <div className="relative rounded-2xl border border-border bg-gradient-to-r from-muted/50 to-primary/10 p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              {summary.country}
            </h1>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-primary">AI/ML Master&apos;s Destination Score</h2>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < scoreOutOf5 ? "fill-primary text-primary" : "text-muted"}`}
                />
              ))}
               <span className="ml-2 text-sm font-semibold text-muted-foreground">({summary.overallScore}/100)</span>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed mt-2">
            {summary.evidenceSummary || summary.countryCode}
          </p>
        </div>

        <div className="flex gap-8 md:text-right shrink-0">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Risk Level</p>
            <p className="text-md font-bold text-foreground max-w-[200px]">{data.risks?.riskLevel || "Stable"}</p>
          </div>
          <div className="space-y-1 hidden sm:block text-left">
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Languages</p>
            <ul className="text-sm font-medium text-foreground list-disc pl-4 marker:text-primary">
              {summary.language?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between">
        <span>Population: {(summary.population / 1000000).toFixed(1)}M</span>
        <span>Continent: {summary.continent}</span>
      </div>
    </div>
  );
}

