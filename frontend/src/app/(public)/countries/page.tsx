import React from "react";
import Link from "next/link";
import { COVERED_COUNTRIES, FUNDING_TIER_COLORS, FUNDING_TIER_LABELS, PR_QUALITY_COLORS, PR_QUALITY_LABELS, VISA_DIFFICULTY_COLORS, VISA_DIFFICULTY_LABELS } from "@/data/countries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Globe, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { CountryFlag } from "@/components/shared/CountryFlag";

export const metadata = {
  title: "20 Countries for Bangladeshi Students | GradPlanner",
  description: "Analyze 20 graduate study destinations based on funding, visa difficulty, and PR pathways specifically for Bangladeshi applicants.",
};

export default function CountriesPage() {
  return (
    <main className="px-6 py-16 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <Globe className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Intelligence for 20 Countries</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          We've analyzed funding opportunities, visa processing realities in Dhaka, and post-graduation PR pathways for 20 top destinations.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
          <p className="text-3xl font-bold text-emerald-500">12</p>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Fully Funded Paths</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
          <p className="text-3xl font-bold text-blue-500">8</p>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Top PR Pathways</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
          <p className="text-3xl font-bold text-primary">3,000+</p>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Universities</p>
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COVERED_COUNTRIES.map((country) => (
          <Card key={country.code} className="bg-card/50 backdrop-blur-sm border-border/60 hover:bg-card hover:border-primary/40 transition-all duration-300 flex flex-col h-full group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-4">
                <CountryFlag country={country.code} className="h-10 w-16 rounded border border-border/20 shadow-md" />
                <div className="flex flex-col gap-2 items-end">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border", FUNDING_TIER_COLORS[country.fundingTier])}>
                    {FUNDING_TIER_LABELS[country.fundingTier]}
                  </span>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded", PR_QUALITY_COLORS[country.prQuality])}>
                    {PR_QUALITY_LABELS[country.prQuality]}
                  </span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{country.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-6">
              {/* Bangladesh Insight Box */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border/50 text-sm">
                <div className="flex items-center gap-2 mb-2 font-semibold text-foreground">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Bangladesh Reality Check
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {country.bdInsight}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                <div>
                  <p className="text-muted-foreground mb-1 font-medium">Visa Difficulty</p>
                  <p className={cn("font-semibold", VISA_DIFFICULTY_COLORS[country.visaDifficulty])}>
                    {VISA_DIFFICULTY_LABELS[country.visaDifficulty]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 font-medium">Avg. Living Cost</p>
                  <p className="font-semibold text-foreground">{country.livingCost}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border/50">
                <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wider">Top Universities</p>
                <div className="flex flex-wrap gap-1.5">
                  {country.topUnis.slice(0, 3).map(uni => (
                    <span key={uni} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                      {uni}
                    </span>
                  ))}
                  {country.topUnis.length > 3 && (
                    <span className="text-xs text-muted-foreground px-1 py-1">+{country.topUnis.length - 3}</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 bg-primary/5 rounded-3xl p-10 md:p-16 border border-primary/20 text-center space-y-6 max-w-5xl mx-auto">
        <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold">Ready to explore universities?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We've aggregated data from QS, THE, and ARWU for over 3,000 universities across these 20 countries.
        </p>
        <Link 
          href="/universities" 
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          Search Universities <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
