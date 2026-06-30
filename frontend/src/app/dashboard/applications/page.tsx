"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { ResponsiveModal } from "@/components/responsive/ResponsiveModal";
import { 
  Plus, 
  Trash2, 
  FolderGit2, 
  Calendar, 
  Coins, 
  Loader2,
} from "lucide-react";
import { Application, University, ApplicationStatus } from "@/types";
import { ApplicationSkeleton } from "@/components/skeletons/ApplicationSkeleton";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

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

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Load applications and universities
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

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
    const currentApp = applications.find(a => a.id === id);
    if (!currentApp) return;

    const previousStatus = currentApp.status;

    // Optimistic: immediately update UI
    dispatch(updateApplication({ ...currentApp, status: newStatus }));

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
      // Revert on failure
      dispatch(updateApplication({ ...currentApp, status: previousStatus }));
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await fetchApi(`/api/v1/applications/${deleteTarget}`, {
        method: "DELETE",
      });
      dispatch(deleteApplication(deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete application.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Application Funnel</h2>
          <p className="text-muted-foreground text-sm">
            Track your submission progress, decision status, and scholarship offers in one view.
          </p>
        </div>
        {!loading && untrackedUniversities.length > 0 && (
          <Button
            onClick={() => {
              setUniversityId(untrackedUniversities[0].id);
              setFormOpen(true);
            }}
            className="self-start sm:self-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Track Progress
          </Button>
        )}
      </div>

      {error && (
        <ApiErrorAlert error={error} onRetry={loadData} />
      )}

      {loading ? (
        <ApplicationSkeleton />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No applications tracked"
          description="Add universities to your workspace to start tracking application progress."
          actionLabel="Go to Universities"
          actionHref="/dashboard/universities"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-border bg-card/30 hover:border-border/80 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground line-clamp-1">{app.university?.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {app.university?.program || "Master's Program"}
                    </CardDescription>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    app.status === "OFFER_RECEIVED" || app.status === "ACCEPTED" ? "bg-[var(--success)]/15 text-[var(--success)]" :
                    app.status === "REJECTED" ? "bg-destructive/15 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Admissions Status</span>
                    <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="w-full h-10 min-h-[44px] px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
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
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" /> Scholarship
                    </span>
                    <p className="text-xs text-foreground/90 font-semibold">{app.scholarshipAmt || "None"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Deadline
                    </span>
                    <p className="text-xs text-foreground/90 font-semibold">{app.deadline || "Not configured"}</p>
                  </div>
                </div>

                {app.notes && (
                  <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 line-clamp-2 mt-2">
                    {app.notes}
                  </p>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t border-border/60 flex items-center justify-between bg-muted/30 rounded-b-xl">
                <span className="text-[10px] text-muted-foreground">
                  Tracked since {new Date(app.createdAt).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => setDeleteTarget(app.id)}
                  className="bg-transparent hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-none p-1.5 h-8 w-8 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Track form dialog */}
      <ResponsiveModal open={formOpen} onOpenChange={setFormOpen} title="Track Admissions Lifecycle">
        <form onSubmit={handleCreateApplication} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="uniSelect" className="text-xs text-muted-foreground">Select Tracked University</Label>
            <select
              id="uniSelect"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
              className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              onClick={() => setFormOpen(false)}
              className="bg-transparent hover:bg-muted text-muted-foreground border border-border h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track Application"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="Delete Application"
        description="Are you sure you want to remove this application? This action cannot be undone."
      />
    </div>
  );
}
