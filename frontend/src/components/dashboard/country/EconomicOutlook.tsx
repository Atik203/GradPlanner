import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, Briefcase, Building2 } from "lucide-react";

export function EconomicOutlook({ data }: { data: CountryIntelligence }) {
  const risks = data.risks;
  const aiEcosystem = data.aiEcosystem;
  const jobMarket = data.jobMarket;

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Economic & Tech Outlook
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Economic Risk
            </span>
            <p className="text-sm font-semibold text-foreground">{risks?.risks?.economicRisk?.level || risks?.riskLevel || "Low"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Tech Ecosystem
            </span>
            <p className="text-sm font-semibold text-foreground">{aiEcosystem?.aiCompanies && aiEcosystem.aiCompanies.length > 0 ? "Active" : "Developing"}</p>
          </div>
        </div>
        
        <div className="space-y-1 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> Job Demand Level
          </span>
          <p className="text-sm font-semibold text-foreground">{jobMarket?.demandLevel || "Moderate"}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Major AI & Research Hubs
          </span>
          <div className="flex flex-wrap gap-2">
            {aiEcosystem?.researchHubs?.slice(0, 4).map((hub, i) => (
              <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">
                {hub.name}
              </span>
            ))}
            {(!aiEcosystem?.researchHubs || aiEcosystem.researchHubs.length === 0) && (
              <span className="text-xs text-muted-foreground">None specified</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

