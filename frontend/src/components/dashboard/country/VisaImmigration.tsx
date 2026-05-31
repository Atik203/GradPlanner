import React from "react";
import { VisaImmigration as VisaData } from "@/data/countries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Passport, Clock, Award, ShieldAlert } from "lucide-react";

export function VisaImmigration({ data }: { data: VisaData }) {
  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <Passport className="h-5 w-5 text-indigo-500" />
          Visa & Immigration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Study Visa Approval
            </span>
            <p className="text-sm font-semibold text-foreground">{data.studyVisaApprovalRate}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Processing Time
            </span>
            <p className="text-sm font-semibold text-foreground">{data.typicalProcessingTime}</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Post-Study Work Visa</span>
            <span className="text-sm font-bold text-foreground">{data.postStudyWorkVisa}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">PR Difficulty</span>
            <span className="text-sm font-bold text-foreground">{data.prDifficulty}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Award className="h-4 w-4" /> Citizenship
            </span>
            <span className="text-sm font-bold text-foreground">{data.citizenshipTimeline}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Common Rejection Reasons</span>
          <ul className="text-xs font-medium text-[var(--destructive)] list-disc pl-4 space-y-1">
            {data.commonRejectionReasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
