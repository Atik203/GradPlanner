"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CountdownBadge } from "@/components/dashboard/CountdownBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BellRing,
  Loader2,
  AlertCircle,
  Mail,
  Send,
  MessageCircle,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailGeneratorModal } from "@/components/dashboard/professor/EmailGeneratorModal";
import type { Professor, ProfessorStatus } from "@/types";

const STATUS_LABELS: Record<ProfessorStatus, string> = {
  NOT_CONTACTED: "Not Contacted",
  EMAILED: "Emailed",
  AWAITING_REPLY: "Awaiting Reply",
  REPLIED_POSITIVE: "Replied (Positive)",
  REPLIED_NEGATIVE: "Replied (Negative)",
  INTERVIEWED: "Interviewed",
};

const STATUS_COLORS: Record<ProfessorStatus, string> = {
  NOT_CONTACTED: "bg-muted text-muted-foreground",
  EMAILED: "bg-blue-500/10 text-blue-400",
  AWAITING_REPLY: "bg-amber-500/10 text-amber-400",
  REPLIED_POSITIVE: "bg-emerald-500/10 text-emerald-400",
  REPLIED_NEGATIVE: "bg-destructive/10 text-destructive",
  INTERVIEWED: "bg-purple-500/10 text-purple-400",
};

export default function FollowUpRemindersPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Outreach Modal state
  const [selectedProf, setSelectedProf] = useState<Professor | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleOpenEmailModal = (prof: Professor) => {
    setSelectedProf(prof);
    setIsEmailModalOpen(true);
  };

  const handleEmailLogged = (updatedProf: Professor) => {
    setProfessors(prev => prev.map(p => p.id === updatedProf.id ? updatedProf : p));
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchApi("/api/v1/professors") as Professor[];
        setProfessors(data || []);
      } catch (err) {
        setError("Failed to load professor follow-up data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const overdue: Professor[] = [];
    const upcoming: Professor[] = [];
    const replied: Professor[] = [];

    professors.forEach((p) => {
      if (p.replyReceived || p.status === "REPLIED_POSITIVE" || p.status === "REPLIED_NEGATIVE" || p.status === "INTERVIEWED") {
        replied.push(p);
      } else if (p.nextFollowUp) {
        const next = new Date(p.nextFollowUp);
        if (next < now) {
          overdue.push(p);
        } else {
          upcoming.push(p);
        }
      } else if (p.emailSentDate && p.status === "EMAILED") {
        const sent = new Date(p.emailSentDate);
        const followUp = new Date(sent);
        followUp.setDate(followUp.getDate() + 14);
        if (followUp < now) overdue.push(p);
        else upcoming.push(p);
      } else {
        upcoming.push(p);
      }
    });

    overdue.sort((a, b) => {
      const aDate = a.nextFollowUp ? new Date(a.nextFollowUp) : new Date(a.emailSentDate || 0);
      const bDate = b.nextFollowUp ? new Date(b.nextFollowUp) : new Date(b.emailSentDate || 0);
      return aDate.getTime() - bDate.getTime();
    });
    upcoming.sort((a, b) => {
      const aDate = a.nextFollowUp
        ? new Date(a.nextFollowUp)
        : (a.emailSentDate ? new Date(new Date(a.emailSentDate).setDate(new Date(a.emailSentDate).getDate() + 14)) : new Date(8640000000000000));
      const bDate = b.nextFollowUp
        ? new Date(b.nextFollowUp)
        : (b.emailSentDate ? new Date(new Date(b.emailSentDate).setDate(new Date(b.emailSentDate).getDate() + 14)) : new Date(8640000000000000));
      return aDate.getTime() - bDate.getTime();
    });

    return { overdue, upcoming, replied };
  }, [professors]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        icon={BellRing}
        title="Follow Up Reminders"
        description="Automated follow-up schedules, email cadence tracking, and reply analysis for professor outreach."
        backHref="/dashboard/professors"
        backLabel="Back to Cold Email Outreach"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Mail} label="Total Professors" value={professors.length} color="default" />
        <MetricCard icon={Send} label="Emailed" value={professors.filter((p) => p.emailSentDate).length} color="info" />
        <MetricCard icon={MessageCircle} label="Replied" value={grouped.replied.length} color="success" />
        <MetricCard icon={Clock} label="Overdue" value={grouped.overdue.length} color={grouped.overdue.length > 0 ? "destructive" : "success"} />
      </div>

      {professors.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No professors tracked"
          description="Add professors to your outreach list to track follow-ups and replies."
          actionLabel="Add Professor"
          onAction={() => window.location.href = "/dashboard/professors"}
        />
      ) : (
        <>
          {grouped.overdue.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-destructive mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Overdue ({grouped.overdue.length})
              </h3>
              <div className="space-y-2">
                {grouped.overdue.map((p) => (
                  <ProfessorCard key={p.id} professor={p} onOutreach={() => handleOpenEmailModal(p)} />
                ))}
              </div>
            </div>
          )}

          {grouped.upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Upcoming ({grouped.upcoming.length})</h3>
              <div className="space-y-2">
                {grouped.upcoming.map((p) => (
                  <ProfessorCard key={p.id} professor={p} onOutreach={() => handleOpenEmailModal(p)} />
                ))}
              </div>
            </div>
          )}

          {grouped.replied.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Replied ({grouped.replied.length})
              </h3>
              <div className="space-y-2">
                {grouped.replied.map((p) => (
                  <ProfessorCard key={p.id} professor={p} onOutreach={() => handleOpenEmailModal(p)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <EmailGeneratorModal
        professor={selectedProf}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onEmailLogged={handleEmailLogged}
      />
    </div>
  );
}

function ProfessorCard({ professor, onOutreach }: { professor: Professor; onOutreach: () => void }) {
  return (
    <Card className={`border-border/60 bg-card/25 hover:bg-card/40 transition-all ${
      !professor.replyReceived && professor.status !== "REPLIED_POSITIVE" && professor.nextFollowUp && new Date(professor.nextFollowUp) < new Date()
        ? "border-l-2 border-destructive/60"
        : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground truncate">{professor.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[professor.status]}`}>
                {STATUS_LABELS[professor.status]}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {professor.university?.name || ""}
              {professor.researchInterests && ` · ${professor.researchInterests.slice(0, 60)}${professor.researchInterests.length > 60 ? "..." : ""}`}
            </p>
            {(professor.researchFitScore || professor.followUpCount > 0) && (
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {professor.researchFitScore && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" />
                    Fit: {professor.researchFitScore}/10
                  </span>
                )}
                {professor.followUpCount > 0 && (
                  <span>Follow-ups sent: {professor.followUpCount}</span>
                )}
              </div>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {professor.emailSentDate && (
              <span className="text-[10px] text-muted-foreground">
                Sent: {new Date(professor.emailSentDate).toLocaleDateString()}
              </span>
            )}
            {professor.nextFollowUp && (
              <CountdownBadge date={professor.nextFollowUp} label="Follow-up" />
            )}
            {professor.replyDate && (
              <span className={`text-[10px] font-semibold ${
                professor.status === "REPLIED_POSITIVE" ? "text-emerald-400" : "text-destructive"
              }`}>
                Reply: {new Date(professor.replyDate).toLocaleDateString()}
              </span>
            )}
            {professor.lastFollowUp && (
              <span className="text-[10px] text-muted-foreground">
                Last FU: {new Date(professor.lastFollowUp).toLocaleDateString()}
              </span>
            )}
            {professor.email && professor.status !== "REPLIED_POSITIVE" && professor.status !== "REPLIED_NEGATIVE" && professor.status !== "INTERVIEWED" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1 h-7 px-3 text-[10px] border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground font-semibold flex items-center gap-1 shrink-0"
                onClick={onOutreach}
              >
                <Mail className="h-3 w-3" /> Outreach
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
