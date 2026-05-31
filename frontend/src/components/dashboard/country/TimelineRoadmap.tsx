import React from "react";
import { ApplicationTimelineEvent } from "@/data/countries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function TimelineRoadmap({ data }: { data: ApplicationTimelineEvent[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60 bg-card/20 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          Application Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-border/50 ml-3 space-y-6 mt-4">
          {data.map((event, index) => (
            <div key={index} className="relative pl-6">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="text-sm font-bold text-foreground">{event.month}</span>
                  <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                    {event.year}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{event.action}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
