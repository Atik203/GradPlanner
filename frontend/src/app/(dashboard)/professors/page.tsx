"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api.js";
import { useAppDispatch, useAppSelector } from "@/lib/store/store.js";
import { 
  setProfessors, 
  addProfessor, 
  updateProfessor, 
  deleteProfessor 
} from "@/lib/store/slices/professorSlice.js";
import { setUniversities } from "@/lib/store/slices/universitySlice.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { 
  Plus, 
  Trash2, 
  User, 
  Mail, 
  Link as LinkIcon, 
  Search, 
  Loader2, 
  BookOpen, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { Professor, University, ProfessorStatus } from "@/types";

export default function ProfessorsPage() {
  const dispatch = useAppDispatch();
  const professors = useAppSelector((state) => state.professors.items);
  const universities = useAppSelector((state) => state.universities.items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProfessorStatus>("NOT_CONTACTED");
  const [saving, setSaving] = useState(false);

  // Load professors and universities
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profData, uniData] = await Promise.all([
          fetchApi("/api/v1/professors"),
          fetchApi("/api/v1/universities"),
        ]);
        dispatch(setProfessors(profData));
        dispatch(setUniversities(uniData));
      } catch (err) {
        console.error(err);
        setError("Failed to load professors list.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  const handleCreateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const newProf = await fetchApi("/api/v1/professors", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          universityId: universityId || null,
          profileUrl,
          researchInterests,
          status,
          notes,
        }),
      });
      dispatch(addProfessor(newProf));
      setFormOpen(false);
      // Reset form
      setName("");
      setEmail("");
      setUniversityId("");
      setProfileUrl("");
      setResearchInterests("");
      setNotes("");
      setStatus("NOT_CONTACTED");
    } catch (err) {
      console.error(err);
      setError("Failed to save professor details.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ProfessorStatus) => {
    try {
      const updated = await fetchApi(`/api/v1/professors/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          replyReceived: newStatus === "REPLIED_POSITIVE" || newStatus === "REPLIED_NEGATIVE" || newStatus === "INTERVIEWED",
        }),
      });
      dispatch(updateProfessor(updated));
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this professor?")) return;

    try {
      await fetchApi(`/api/v1/professors/${id}`, {
        method: "DELETE",
      });
      dispatch(deleteProfessor(id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete professor.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Faculty Contacts</h2>
          <p className="text-zinc-500 text-sm">
            Keep track of professors you have reached out to for research or funding opportunities.
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="self-start sm:self-center bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-9 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Professor
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : professors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600 border border-dashed border-zinc-900 rounded-xl bg-zinc-900/10">
          <User className="h-10 w-10 mb-2 text-zinc-700" />
          <p className="text-sm">No faculty members tracked yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professors.map((prof) => (
            <Card key={prof.id} className="border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-200 line-clamp-1">{prof.name}</CardTitle>
                  <CardDescription className="text-xs text-zinc-500 truncate">
                    {prof.university?.name || "Independent Researcher"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4 flex-1">
                {prof.email && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Mail className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="truncate">{prof.email}</span>
                  </div>
                )}
                {prof.researchInterests && (
                  <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <BookOpen className="h-3.5 w-3.5 text-zinc-600 mt-0.5 shrink-0" />
                    <p className="line-clamp-2 text-zinc-300">{prof.researchInterests}</p>
                  </div>
                )}

                {/* Status selector */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-zinc-500">Contact Status</span>
                  <select
                    value={prof.status}
                    onChange={(e) => handleUpdateStatus(prof.id, e.target.value as ProfessorStatus)}
                    className="w-full h-8 px-2 bg-zinc-950 border border-zinc-900 rounded text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="NOT_CONTACTED">Not Contacted</option>
                    <option value="EMAILED">Emailed</option>
                    <option value="AWAITING_REPLY">Awaiting Reply</option>
                    <option value="REPLIED_POSITIVE">Positive Reply</option>
                    <option value="REPLIED_NEGATIVE">Negative Reply</option>
                    <option value="INTERVIEWED">Interview Scheduled</option>
                  </select>
                </div>

                {prof.notes && (
                  <p className="text-[11px] text-zinc-500 bg-zinc-900/40 p-2 rounded border border-zinc-900/30 line-clamp-2 mt-2">
                    {prof.notes}
                  </p>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t border-zinc-900/60 flex items-center justify-between bg-zinc-900/20 rounded-b-xl">
                {prof.profileUrl ? (
                  <a
                    href={prof.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-all"
                  >
                    Profile <LinkIcon className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-zinc-600">No profile link</span>
                )}
                <Button
                  onClick={() => handleDelete(prof.id)}
                  className="bg-transparent hover:bg-destructive/10 text-zinc-500 hover:text-destructive border-none p-1.5 h-8 w-8 rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create form dialog */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-zinc-200">Add Faculty Member</h3>
            <form onSubmit={handleCreateProfessor} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="profName" className="text-xs text-zinc-400">Professor Name</Label>
                <Input
                  id="profName"
                  placeholder="e.g. Dr. Yann LeCun"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="profEmail" className="text-xs text-zinc-400">Email Address (Optional)</Label>
                <Input
                  id="profEmail"
                  type="email"
                  placeholder="yann@nyu.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="uniSelect" className="text-xs text-zinc-400">Affiliation University</Label>
                  <select
                    id="uniSelect"
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select tracked university...</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="profStatus" className="text-xs text-zinc-400">Initial Status</Label>
                  <select
                    id="profStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProfessorStatus)}
                    className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="NOT_CONTACTED">Not Contacted</option>
                    <option value="EMAILED">Emailed</option>
                    <option value="AWAITING_REPLY">Awaiting Reply</option>
                    <option value="REPLIED_POSITIVE">Positive Reply</option>
                    <option value="REPLIED_NEGATIVE">Negative Reply</option>
                    <option value="INTERVIEWED">Interview Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="profLink" className="text-xs text-zinc-400">Lab/Profile URL (Optional)</Label>
                <Input
                  id="profLink"
                  type="url"
                  placeholder="https://..."
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="interestsInput" className="text-xs text-zinc-400">Research Interests / Lab Focus</Label>
                <Input
                  id="interestsInput"
                  placeholder="e.g. Deep Learning, Computer Vision, LLMs"
                  value={researchInterests}
                  onChange={(e) => setResearchInterests(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notesInput" className="text-xs text-zinc-400">Notes</Label>
                <textarea
                  id="notesInput"
                  rows={2}
                  placeholder="Requires matching project proposal, funding available for Fall 2028..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="bg-transparent hover:bg-zinc-800 text-zinc-400 border border-zinc-800 h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold h-9"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Professor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
