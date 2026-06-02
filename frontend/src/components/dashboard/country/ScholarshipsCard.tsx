import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GraduationCap, Landmark, Percent, Award } from "lucide-react";

export function ScholarshipsCard({ data }: { data: CountryIntelligence }) {
  const funding = data.funding;
  const scholarships = data.scholarships || [];
  const govScholarships = funding?.governmentScholarships || [];

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-yellow-500" />
          Scholarships & Funding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top/Major Scholarships */}
        {scholarships.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
              <Award className="h-3.5 w-3.5 text-yellow-400" /> Key Scholarships
            </span>
            <div className="space-y-2.5">
              {scholarships.slice(0, 3).map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 space-y-1">
                  <div className="text-xs font-bold text-foreground line-clamp-1">
                    {s.scholarshipName}
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-muted-foreground">
                    {s.type && (
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {s.type.replace("_", " ")}
                      </span>
                    )}
                    {s.competitionLevel && (
                      <span className="bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded">
                        {s.competitionLevel}
                      </span>
                    )}
                  </div>
                  {s.funding?.totalAnnualValueUSD && (
                    <div className="text-[11px] text-foreground/80">
                      Value: <span className="font-semibold">{s.funding.totalAnnualValueUSD} USD/yr</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Government Scholarships */}
        {govScholarships.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
              <Landmark className="h-3.5 w-3.5 text-indigo-400" /> Government Schemes
            </span>
            <ul className="space-y-2.5 pl-1">
              {govScholarships.slice(0, 3).map((s, i) => (
                <li key={i} className="text-xs space-y-0.5">
                  <div className="font-semibold text-foreground">{s.name}</div>
                  <div className="text-muted-foreground leading-snug">
                    {s.amount && <span className="block font-medium text-emerald-400">{s.amount}</span>}
                    {s.eligibility && <span className="block text-[10px]">{s.eligibility}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Funding Probability */}
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex flex-col gap-1">
          <span className="text-xs text-primary uppercase font-bold tracking-wider flex items-center gap-1">
            <Percent className="h-3 w-3" /> Funding Probability
          </span>
          <span className="text-sm font-bold text-foreground">
            {funding?.fundingAvailability || "Varies"}
          </span>
          {funding?.overallFundingScore && (
            <span className="text-[10px] text-muted-foreground">
              Score: {funding.overallFundingScore}/100
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

