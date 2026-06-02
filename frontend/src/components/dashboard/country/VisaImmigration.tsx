import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plane, Clock, Award, ShieldAlert } from "lucide-react";

export function VisaImmigration({ data }: { data: CountryIntelligence }) {
  const visa = data.visa;
  const postStudyWork = data.postStudyWork;
  const prPathways = data.prPathways;
  const citizenship = data.citizenship;

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <Plane className="h-5 w-5 text-indigo-500" />
          Visa & Immigration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Rejection Risk (BD)
            </span>
            <p className="text-sm font-semibold text-foreground">{visa?.studentVisa?.rejectionRiskBangladesh || "Unknown"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Processing Time
            </span>
            <p className="text-sm font-semibold text-foreground">{visa?.studentVisa?.processingTimeDhaka || "Unknown"}</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Post-Study Work Visa</span>
            <span className="text-sm font-bold text-foreground text-right">{postStudyWork?.duration || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">PR Difficulty</span>
            <span className="text-sm font-bold text-foreground text-right">{prPathways?.prPathway?.difficulty || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Award className="h-4 w-4 shrink-0" /> Citizenship
            </span>
            <span className="text-sm font-bold text-foreground text-right">{citizenship?.yearsToEligibility || "N/A"} Years</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Visa Application Tips</span>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            {visa?.studentVisa?.tips || "Check official embassy guidelines."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
