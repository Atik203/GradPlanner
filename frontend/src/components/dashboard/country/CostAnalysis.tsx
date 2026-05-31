import React from "react";
import { CostAnalysis as CostData } from "@/data/countries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, Home, Bus, HeartPulse } from "lucide-react";

export function CostAnalysis({ data }: { data: CostData }) {
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
            <span className="text-sm text-muted-foreground">Annual Tuition</span>
            <span className="text-sm font-bold text-foreground">{data.tuition}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground">Living Cost (Year)</span>
            <span className="text-sm font-bold text-foreground">{data.livingCost}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Home className="h-3 w-3" /> Rent/Month
            </span>
            <p className="text-xs font-semibold text-foreground">{data.accommodation}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <HeartPulse className="h-3 w-3" /> Insurance
            </span>
            <p className="text-xs font-semibold text-foreground">{data.insurance}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Bus className="h-3 w-3" /> Transport
            </span>
            <p className="text-xs font-semibold text-foreground">{data.transport}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Part-Time
            </span>
            <p className="text-xs font-semibold text-foreground">{data.partTimeEarnings}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg">
          <span className="text-xs text-[var(--destructive)] uppercase font-bold tracking-wider block mb-1">
            Expected Monthly Balance
          </span>
          <p className="text-sm font-medium text-foreground">{data.expectedMonthlyBalance}</p>
        </div>
      </CardContent>
    </Card>
  );
}
