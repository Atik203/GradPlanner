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
              <TrendingUp className="h-3 w-3" /> Economic Vulnerability
            </span>
            <p className="text-sm font-semibold text-foreground">{risks?.economicVulnerability || "Stable"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Startups Ecosystem
            </span>
            <p className="text-sm font-semibold text-foreground">{aiEcosystem?.startups || "Developing"}</p>
          </div>
        </div>
        
        <div className="space-y-1 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> Tech Market Status
          </span>
          <p className="text-sm font-semibold text-foreground">{jobMarket?.internshipAvailability || "Moderate"}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Major AI Hubs
          </span>
          <div className="flex flex-wrap gap-2">
            {aiEcosystem?.hubs?.slice(0, 4).map((hub, i) => (
              <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">
                {hub}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
