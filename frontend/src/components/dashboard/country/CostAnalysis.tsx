import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, Home, Bus, HeartPulse } from "lucide-react";

export function CostAnalysis({ data }: { data: CountryIntelligence }) {
  const living = data.livingCosts;
  const currency = living?.currency || data.summary?.averageLivingCostCurrency || "USD";

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-500" />
          Cost Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground">Est. Living Cost (Month)</span>
            <span className="text-sm font-bold text-foreground">{living?.averageMonthlyLivingCost || data.summary?.averageLivingCost || 0} {currency}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground">Tuition Range (Year)</span>
            <span className="text-sm font-bold text-foreground">Varies by University</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Home className="h-3 w-3" /> Rent/Month
            </span>
            <p className="text-xs font-semibold text-foreground">{living?.breakdown?.rent || "Unknown"} {currency}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <HeartPulse className="h-3 w-3" /> Insurance
            </span>
            <p className="text-xs font-semibold text-foreground">{living?.breakdown?.healthInsurance || "Unknown"} {currency}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Bus className="h-3 w-3" /> Transport
            </span>
            <p className="text-xs font-semibold text-foreground">{living?.breakdown?.transportation || "Unknown"} {currency}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Part-Time
            </span>
            <p className="text-xs font-semibold text-foreground">Subject to visa limits</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-xs text-primary uppercase font-bold tracking-wider block mb-1">
            Affordability Note
          </span>
          <p className="text-sm font-medium text-foreground">{living?.affordabilityTips?.[0] || "Check local student discounts for transport and housing."}</p>
        </div>
      </CardContent>
    </Card>
  );
}
