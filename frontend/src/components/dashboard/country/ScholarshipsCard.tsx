import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GraduationCap, Library, Landmark, Percent } from "lucide-react";

export function ScholarshipsCard({ data }: { data: CountryIntelligence }) {
  const funding = data.funding;
  const scholarships = data.scholarships || [];

  const govScholarships = funding?.governmentScholarships || [];
  const uniScholarships = funding?.universityScholarships || [];

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-yellow-500" />
          Scholarships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {govScholarships.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Landmark className="h-3 w-3" /> Government
            </span>
            <ul className="text-sm font-medium text-foreground list-disc pl-4 marker:text-primary space-y-1">
              {govScholarships.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {uniScholarships.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Library className="h-3 w-3" /> University
            </span>
            <ul className="text-sm font-medium text-foreground list-disc pl-4 marker:text-primary space-y-1">
              {uniScholarships.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex flex-col gap-1">
          <span className="text-xs text-primary uppercase font-bold tracking-wider flex items-center gap-1">
            <Percent className="h-3 w-3" /> Funding Probability
          </span>
          <span className="text-sm font-bold text-foreground">{funding?.fundingAvailability || "Varies"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
