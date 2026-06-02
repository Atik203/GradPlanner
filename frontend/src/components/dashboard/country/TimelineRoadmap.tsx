import React from "react";
import { CountryIntelligence } from "@/lib/countryData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function TimelineRoadmap({ data }: { data: CountryIntelligence }) {
  const timeline = data.timeline;
  if (!timeline || !timeline.phases) {
    return null;
  }

  const phases = [
    { title: "Application Phase", data: timeline.phases.phase1_application },
    { title: "Study Phase", data: timeline.phases.phase2_study },
    { title: "Post-Study Work", data: timeline.phases.phase3_postStudyWork },
    { title: "PR Pathway", data: timeline.phases.phase4_pr },
    { title: "Citizenship", data: timeline.phases.phase5_citizenship },
  ].filter(p => p.data);

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          Immigration Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-border/50 ml-3 space-y-6 mt-4">
          {phases.map((phase, index) => (
            <div key={index} className="relative pl-6">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-bold text-foreground">{phase.title}</span>
                  {phase.data.duration && (
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-muted self-start">
                      {phase.data.duration}
                    </span>
                  )}
                  {phase.data.processingTime && (
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-muted self-start">
                      {phase.data.processingTime}
                    </span>
                  )}
                </div>
                <div className="text-sm text-foreground/80 space-y-1">
                  {phase.data.keyMilestones && phase.data.keyMilestones.length > 0 ? (
                    <ul className="list-disc pl-4 marker:text-muted-foreground">
                      {phase.data.keyMilestones.map((ms: string, i: number) => (
                        <li key={i}>{ms}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{phase.data.criticalDeadlines || phase.data.note || "Refer to specific guidelines."}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
