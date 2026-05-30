"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { 
   setApplications, 
   addApplication, 
   updateApplication, 
   deleteApplication 
} from "@/lib/store/slices/applicationSlice";
import { setUniversities } from "@/lib/store/slices/universitySlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  FolderGit2, 
  Calendar, 
  Coins, 
  Check, 
  Loader2, 
  FileCheck 
} from "lucide-react";
import { Application, University, ApplicationStatus } from "@/types";

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const applications = useAppSelector((state) => state.applications.items);
  const universities = useAppSelector((state) => state.universities.items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [universityId, setUniversityId] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("PLANNING");
  const [deadline, setDeadline] = useState("");
  const [scholarshipAmt, setScholarshipAmt] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Load applications and universities
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [appData, uniData] = await Promise.all([
          fetchApi("/api/v1/applications"),
          fetchApi("/api/v1/universities"),
        ]);
        dispatch(setApplications(appData));
        dispatch(setUniversities(uniData));
      } catch (err) {
        console.error(err);
        setError("Failed to load applications data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  // Universities that do not have an application entry tracked yet
  const untrackedUniversities = universities.filter(
    (uni) => !applications.some((app) => app.universityId === uni.id)
  );

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityId) return;

    setSaving(true);
    try {
      const newApp = await fetchApi("/api/v1/applications", {
        method: "POST",
        body: JSON.stringify({
          universityId,
          status,
          deadline: deadline || null,
          scholarshipAmt,
          notes,
        }),
      });
      dispatch(addApplication(newApp));
      setFormOpen(false);
      // Reset form
      setUniversityId("");
      setStatus("PLANNING");
      setDeadline("");
      setScholarshipAmt("");
      setNotes("");
    } catch (err) {
      console.error(err);
      setError("Failed to create application entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const updated = await fetchApi(`/api/v1/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          offerReceived: newStatus === "OFFER_RECEIVED" || newStatus === "ACCEPTED",
        }),
      });
      dispatch(updateApplication(updated));
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;

    try {
      await fetchApi(`/api/v1/applications/${id}`, {
        method: "DELETE",
      });
      dispatch(deleteApplication(id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete application.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Application Funnel</h2>
          <p className="text-zinc-500 text-sm">
            Track your submission progress, decision status, and scholarship offers in one view.
          </p>
        </div>
        {untrackedUniversities.length > 0 && (
          <Button
            onClick={() => {
              setUniversityId(untrackedUniversities[0].id);
              setFormOpen(true);
            }}
            className="self-start sm:self-center bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-9 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Track Progress
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Grid of Applications */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600 border border-dashed border-zinc-900 rounded-xl bg-zinc-900/10">
          <FolderGit2 className="h-10 w-10 mb-2 text-zinc-700" />
          <p className="text-sm">No applications are currently being tracked.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold text-zinc-200 line-clamp-1">{app.university?.name}</CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      {app.university?.program || "Master's Program"}
                    </CardDescription>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    app.status === "OFFER_RECEIVED" || app.status === "ACCEPTED" ? "bg-emerald-500/15 text-emerald-400" :
                    app.status === "REJECTED" ? "bg-destructive/15 text-destructive" :
                    "bg-zinc-850 text-zinc-400"
                  }`}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* Status updater */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Admissions Status</span>
                  <select
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="w-full h-8 px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="OFFER_RECEIVED">Offer Received</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-900/60">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Coins className="h-3 w-3" /> Scholarship
                    </span>
                    <p className="text-xs text-zinc-300 font-semibold">{app.scholarshipAmt || "None"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Deadline
                    </span>
                    <p className="text-xs text-zinc-300 font-semibold">{app.deadline || "Not configured"}</p>
                  </div>
                </div>

                {app.notes && (
                  <p className="text-[11px] text-zinc-500 bg-zinc-900/40 p-2 rounded border border-zinc-900/30 line-clamp-2 mt-2">
                    {app.notes}
                  </p>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t border-zinc-900/60 flex items-center justify-between bg-zinc-900/20 rounded-b-xl">
                <span className="text-[10px] text-zinc-500">
                  Tracked since {new Date(app.createdAt).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => handleDelete(app.id)}
                  className="bg-transparent hover:bg-destructive/10 text-zinc-500 hover:text-destructive border-none p-1.5 h-8 w-8 rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Track form dialog */}
      {formOpen && untrackedUniversities.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground">Track Admissions Lifecycle</h3>
            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="uniSelect" className="text-xs text-muted-foreground">Select Tracked University</Label>
                <select
                  id="uniSelect"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  {untrackedUniversities.map((uni) => (
                    <option key={uni.id} value={uni.id}>{uni.name} ({uni.program})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="appStatus" className="text-xs text-muted-foreground">Initial Status</Label>
                  <select
                    id="appStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="deadlineInput" className="text-xs text-muted-foreground">Application Deadline</Label>
                  <Input
                    id="deadlineInput"
                    placeholder="e.g. Feb 1, 2028"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="scholarshipInput" className="text-xs text-muted-foreground">Scholarship Amount / Funding Offered (Optional)</Label>
                <Input
                  id="scholarshipInput"
                  placeholder="e.g. 50% tuition waiver / €10,000"
                  value={scholarshipAmt}
                  onChange={(e) => setScholarshipAmt(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notesInput" className="text-xs text-muted-foreground">Application Notes</Label>
                <textarea
                  id="notesInput"
                  rows={3}
                  placeholder="Application fee paid, waiting on LOR submissions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="bg-transparent hover:bg-muted text-muted-foreground border border-border h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold h-9"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
