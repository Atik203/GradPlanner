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
    { 
      title: "Application Phase", 
      duration: timeline.phases.phase1_application?.duration,
      milestones: timeline.phases.phase1_application?.keyMilestones,
      notes: timeline.phases.phase1_application?.criticalDeadlines 
    },
    { 
      title: "Study Phase", 
      duration: `MSc: ${timeline.phases.phase2_study?.mscDuration || "N/A"} / PhD: ${timeline.phases.phase2_study?.phdDuration || "N/A"}`,
      milestones: timeline.phases.phase2_study?.keyMilestones,
      notes: timeline.phases.phase2_study?.criticalNote 
    },
    { 
      title: "Post-Study Work", 
      duration: timeline.phases.phase3_postStudyWork?.duration,
      milestones: timeline.phases.phase3_postStudyWork?.keyMilestones,
      notes: `Permit: ${timeline.phases.phase3_postStudyWork?.permitName || "N/A"}. ${timeline.phases.phase3_postStudyWork?.criticalNote || ""}` 
    },
    { 
      title: "PR Pathway", 
      duration: timeline.phases.phase4_pr?.estimatedYearsFromGraduation ? `Est: ${timeline.phases.phase4_pr?.estimatedYearsFromGraduation}` : undefined,
      milestones: timeline.phases.phase4_pr?.keyMilestones,
      notes: timeline.phases.phase4_pr?.eligibilityRequirements ? `Reqs: ${timeline.phases.phase4_pr.eligibilityRequirements.slice(0, 3).join(", ")}` : undefined 
    },
    { 
      title: "Citizenship", 
      duration: timeline.phases.phase5_citizenship?.estimatedYearsFromGraduation ? `Est: ${timeline.phases.phase5_citizenship?.estimatedYearsFromGraduation}` : undefined,
      milestones: undefined,
      notes: timeline.phases.phase5_citizenship?.note || `Wait after PR: ${timeline.phases.phase5_citizenship?.waitAfterPr || "N/A"}. Language: ${timeline.phases.phase5_citizenship?.languageRequired || "N/A"}` 
    },
  ].filter(p => p.duration || p.milestones || p.notes);

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          Immigration Timeline & Phases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-border/50 ml-3 space-y-6 mt-4">
          {phases.map((phase, index) => (
            <div key={index} className="relative pl-6">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <span className="text-sm font-bold text-foreground">{phase.title}</span>
                  {phase.duration && (
                    <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-muted self-start">
                      {phase.duration}
                    </span>
                  )}
                </div>
                <div className="text-sm text-foreground/80 space-y-1.5 flex-1">
                  {phase.milestones && phase.milestones.length > 0 ? (
                    <ul className="list-disc pl-4 marker:text-muted-foreground space-y-1">
                      {phase.milestones.map((ms: string, i: number) => (
                        <li key={i}>{ms}</li>
                      ))}
                    </ul>
                  ) : phase.notes ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">{phase.notes}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

