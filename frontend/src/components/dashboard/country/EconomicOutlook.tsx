import React from "react";
import { EconomicOutlook as EconomicData } from "@/data/countries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, Briefcase, Building2 } from "lucide-react";

export function EconomicOutlook({ data }: { data: EconomicData }) {
  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Economic Outlook
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> GDP Growth
            </span>
            <p className="text-sm font-semibold text-foreground">{data.gdpGrowth}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Inflation
            </span>
            <p className="text-sm font-semibold text-foreground">{data.inflation}</p>
          </div>
        </div>
        
        <div className="space-y-1 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> Tech Market
          </span>
          <p className="text-sm font-semibold text-foreground">{data.techMarket}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Major Companies
          </span>
          <div className="flex flex-wrap gap-2">
            {data.majorCompanies.map((company, i) => (
              <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">
                {company}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
