import React from "react";
import { HeroSection as HeroData } from "@/data/countries";
import { Star } from "lucide-react";

export function HeroSection({ data }: { data: HeroData }) {
  return (
    <div className="relative rounded-2xl border border-border bg-gradient-to-r from-muted/50 to-primary/10 p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              {data.flag} {data.title}
            </h1>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-primary">AI/ML Master&apos;s Destination Score</h2>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < data.score ? "fill-primary text-primary" : "text-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8 md:text-right">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Recommendation</p>
            <p className="text-md font-bold text-foreground">{data.overallRecommendation}</p>
          </div>
          <div className="space-y-1 hidden sm:block text-left">
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Best For</p>
            <ul className="text-sm font-medium text-foreground list-disc pl-4 marker:text-primary">
              {data.bestFor.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-border/50 text-xs text-muted-foreground">
        Last Updated: {data.lastUpdated}
      </div>
    </div>
  );
}
