import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Banknote, Briefcase } from "lucide-react";

export function CareerOutlook({ data }: { data: CountryIntelligence }) {
  const salary = data.salary;
  const jobMarket = data.jobMarket;

  const entryAi = salary?.entryLevel?.find(s => s.role.includes("AI") || s.role.includes("Machine Learning"))?.salary || "Unknown";
  const midAi = salary?.midLevel?.find(s => s.role.includes("AI") || s.role.includes("Machine Learning") || s.role.includes("Data Scientist"))?.salary || "Unknown";
  const seniorAi = salary?.seniorLevel?.find(s => s.role.includes("AI") || s.role.includes("Machine Learning") || s.role.includes("Senior"))?.salary || "Unknown";

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          AI/ML Career Outlook
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Entry Salary
            </span>
            <span className="text-sm font-bold text-foreground">{entryAi}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Mid-Level Salary
            </span>
            <span className="text-sm font-bold text-foreground">{midAi}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Senior Salary
            </span>
            <span className="text-sm font-bold text-foreground">{seniorAi}</span>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <span className="text-xs text-muted-foreground">Job Demand Trend</span>
          <p className="text-sm font-semibold text-[var(--success)]">{jobMarket?.jobMarketOutlook || "Stable"}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> Top Roles
          </span>
          <div className="flex flex-wrap gap-2">
            {jobMarket?.inDemandRoles?.slice(0, 4).map((role, i) => (
              <span key={i} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-md font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
