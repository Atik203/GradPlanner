"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CountdownBadge } from "@/components/dashboard/CountdownBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Presentation,
  Calendar,
  Star,
  BookOpen,
  Link as LinkIcon,
  CheckSquare,
  GraduationCap,
  Clock,
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { ProfessorSkeleton } from "@/components/skeletons/ProfessorSkeleton";
import type { Professor } from "@/types";

export default function InterviewPrepPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchApi("/api/v1/professors") as Professor[];
        setProfessors(data || []);
      } catch (err) {
        setError("Failed to load interview preparation data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const upcoming: Professor[] = [];
    const past: Professor[] = [];
    const positiveButNoDate: Professor[] = [];

    professors.forEach((p) => {
      if (p.interviewDate) {
        const date = new Date(p.interviewDate);
        if (date >= now) {
          upcoming.push(p);
        } else {
          past.push(p);
        }
      } else if (p.status === "REPLIED_POSITIVE" || p.status === "INTERVIEWED") {
        positiveButNoDate.push(p);
      }
    });

    upcoming.sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());
    past.sort((a, b) => new Date(b.interviewDate!).getTime() - new Date(a.interviewDate!).getTime());

    return { upcoming, past, positiveButNoDate };
  }, [professors]);

  if (loading) {
    return <ProfessorSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={Presentation}
        title="Interview Prep"
        description="Prepare for professor interviews with research summaries, question banks, and mock interview notes."
        backHref="/dashboard/professors"
        backLabel="Back to Cold Email Outreach"
      />

      {error && (
        <ApiErrorAlert error={error} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard icon={Calendar} label="Upcoming" value={grouped.upcoming.length} color="info" />
        <MetricCard icon={Clock} label="Past Interviews" value={grouped.past.length} color="default" />
        <MetricCard icon={CheckSquare} label="To Schedule" value={grouped.positiveButNoDate.length} color="warning" />
      </div>

      {professors.length === 0 ? (
        <EmptyState
          icon={Presentation}
          title="No professors tracked"
          description="Add professors and track interview dates to prepare effectively."
        />
      ) : (
        <>
          {grouped.upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Upcoming Interviews
              </h3>
              <div className="space-y-4">
                {grouped.upcoming.map((p) => (
                  <InterviewCard key={p.id} professor={p} />
                ))}
              </div>
            </div>
          )}

          {grouped.positiveButNoDate.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-amber-400" />
                Positive Reply — Schedule Interview
              </h3>
              <div className="space-y-4">
                {grouped.positiveButNoDate.map((p) => (
                  <InterviewCard key={p.id} professor={p} />
                ))}
              </div>
            </div>
          )}

          {grouped.past.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 opacity-60">Previous Interviews</h3>
              <div className="space-y-4 opacity-60">
                {grouped.past.map((p) => (
                  <InterviewCard key={p.id} professor={p} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InterviewCard({ professor }: { professor: Professor }) {
  const hasInterview = !!professor.interviewDate;
  const isUpcoming = hasInterview && new Date(professor.interviewDate!) >= new Date();

  return (
    <Card className={`border-border/60 bg-card/25 hover:bg-card/40 transition-all ${isUpcoming ? "ring-1 ring-blue-500/20" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-primary shrink-0" />
              <CardTitle className="text-sm font-bold text-foreground">{professor.name}</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {professor.university?.name || ""}
              {professor.university?.country && ` · ${professor.university.country}`}
            </CardDescription>
          </div>
          {hasInterview && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-muted-foreground">Interview</p>
              <p className="text-xs font-black text-foreground">
                {new Date(professor.interviewDate!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              {isUpcoming && <CountdownBadge date={professor.interviewDate!} />}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {professor.researchInterests && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Research Focus
            </p>
            <div className="flex flex-wrap gap-1">
              {professor.researchInterests.split(",").slice(0, 5).map((topic, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-muted/30 text-[9px] font-semibold text-muted-foreground">
                  {topic.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
          {professor.profileUrl && (
            <a href={professor.profileUrl} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 p-1.5 rounded bg-muted/30 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
              <LinkIcon className="h-3 w-3" />
              Research Profile
            </a>
          )}
          {professor.fundingStatus && (
            <div className="p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground block">Funding</span>
              <span className={`font-bold ${
                professor.fundingStatus === "FUNDED" ? "text-emerald-400" :
                professor.fundingStatus === "LIKELY" ? "text-blue-400" :
                professor.fundingStatus === "UNLIKELY" ? "text-destructive" :
                "text-muted-foreground"
              }`}>{professor.fundingStatus}</span>
            </div>
          )}
          {professor.researchFitScore && (
            <div className="p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground block">Research Fit</span>
              <span className="font-bold text-amber-400">{professor.researchFitScore}/10</span>
            </div>
          )}
        </div>

        {professor.futureFundingNote && (
          <p className="text-[10px] text-muted-foreground italic border-t border-border/30 pt-2">
            Funding note: {professor.futureFundingNote}
          </p>
        )}

        {professor.notes && (
          <div className="p-2 rounded bg-muted/20 border border-border/30">
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">Notes:</span> {professor.notes}
            </p>
          </div>
        )}

        <div className="border-t border-border/30 pt-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {professor.status === "INTERVIEWED" ? "Interview Complete" : "Prep Checklist"}
            </span>
            {professor.email && (
              <span className="flex items-center gap-1 text-blue-400">
                <LinkIcon className="h-3 w-3" />
                {professor.email}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
