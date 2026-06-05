"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { 
  setProfessors, 
  addProfessor, 
  updateProfessor, 
  deleteProfessor 
} from "@/lib/store/slices/professorSlice";
import { setUniversities } from "@/lib/store/slices/universitySlice";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { calculateResearchFit } from "@/lib/researchFitHelper";
import { EmailGeneratorModal } from "@/components/dashboard/professor/EmailGeneratorModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Save,
  Loader2, 
  Trash2,
  Table as TableIcon,
  Mail
} from "lucide-react";
import { Professor, ProfessorStatus } from "@/types";
import { toast } from "sonner";


export default function ProfessorsPage() {
  const dispatch = useAppDispatch();
  const storedProfessors = useAppSelector((state) => state.professors.items);
  const universities = useAppSelector((state) => state.universities.items);
  const profile = useAppSelector((state) => state.profile.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local grid state
  const [rows, setRows] = useState<(Partial<Professor> & { isNew?: boolean; isDirty?: boolean; tempId?: string })[]>([]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [newColName, setNewColName] = useState("");
  const [showNewColInput, setShowNewColInput] = useState(false);

  // Outreach Modal state
  const [selectedProf, setSelectedProf] = useState<Professor | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleOpenEmailModal = (prof: Professor) => {
    setSelectedProf(prof);
    setIsEmailModalOpen(true);
  };

  const handleEmailLogged = (updatedProf: Professor) => {
    dispatch(updateProfessor(updatedProf));
    setRows(prev => prev.map(r => r.id === updatedProf.id ? { ...r, ...updatedProf, isDirty: false } : r));
  };

  // Load professors, universities, and profile
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profData, uniData, profileData] = await Promise.all([
          fetchApi("/api/v1/professors"),
          fetchApi("/api/v1/universities"),
          fetchApi("/api/v1/profile").catch(() => null),
        ]);
        dispatch(setProfessors(profData));
        dispatch(setUniversities(uniData));
        if (profileData) {
          dispatch(setProfile(profileData));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load professors list.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  // Sync local rows with redux state
  useEffect(() => {
    setRows(storedProfessors.map(p => ({ ...p })));
    
    // Extract unique custom columns
    const cols = new Set<string>();
    storedProfessors.forEach(p => {
      if (p.customFields) {
        Object.keys(p.customFields).forEach(k => cols.add(k));
      }
    });
    setCustomColumns(Array.from(cols));
  }, [storedProfessors]);

  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      {
        tempId: `temp-${Date.now()}`,
        name: "",
        email: "",
        universityId: "",
        researchInterests: "",
        status: "NOT_CONTACTED",
        notes: "",
        customFields: {},
        isNew: true,
        isDirty: true
      }
    ]);
  };

  const handleAddColumn = () => {
    if (!newColName.trim() || customColumns.includes(newColName.trim())) {
      setShowNewColInput(false);
      setNewColName("");
      return;
    }
    setCustomColumns(prev => [...prev, newColName.trim()]);
    setShowNewColInput(false);
    setNewColName("");
  };

  const updateCell = (rowIndex: number, field: string, value: any, isCustom = false) => {
    setRows(prev => {
      const next = [...prev];
      const row = { ...next[rowIndex] };
      
      if (isCustom) {
        row.customFields = { ...(row.customFields || {}), [field]: value };
      } else {
        (row as any)[field] = value;
        
        // Auto-calculate researchFitScore if researchInterests is changed
        if (field === "researchInterests" && profile) {
          row.researchFitScore = calculateResearchFit(profile.researchInterests, value);
        }
      }
      
      row.isDirty = true;
      next[rowIndex] = row;
      return next;
    });
  };

  const handleDeleteRow = async (rowIndex: number) => {
    const row = rows[rowIndex];
    if (row.isNew) {
      // Just remove from local state
      setRows(prev => prev.filter((_, i) => i !== rowIndex));
      toast.success("New unsaved row removed.");
      return;
    }

    if (!confirm("Are you sure you want to delete this professor?")) return;

    try {
      await fetchApi(`/api/v1/professors/${row.id}`, { method: "DELETE" });
      dispatch(deleteProfessor(row.id as string));
      toast.success(`Professor ${row.name || "record"} deleted.`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to delete professor.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const dirtyRows = rows.filter(r => r.isDirty);
      if (dirtyRows.length === 0) {
        toast.info("No changes to save.");
        setSaving(false);
        return;
      }
      
      const promises = dirtyRows.map(async (row) => {
        if (!row.name) return null; // Skip empty names
        
        const payload = {
          name: row.name,
          email: row.email || null,
          universityId: row.universityId || null,
          researchInterests: row.researchInterests || null,
          status: row.status || "NOT_CONTACTED",
          fundingStatus: row.fundingStatus || "UNKNOWN",
          researchFitScore: row.researchFitScore ? parseInt(row.researchFitScore as any, 10) : null,
          notes: row.notes || null,
          customFields: row.customFields || {}
        };

        if (row.isNew) {
          const newProf = await fetchApi("/api/v1/professors", {
            method: "POST",
            body: JSON.stringify(payload)
          });
          return { type: 'add', data: newProf, tempId: row.tempId };
        } else {
          const updated = await fetchApi(`/api/v1/professors/${row.id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
          });
          return { type: 'update', data: updated };
        }
      });

      const results = await Promise.all(promises);
      
      // Update Redux state
      let addedCount = 0;
      let updatedCount = 0;
      results.forEach(res => {
        if (!res) return;
        if (res.type === 'add') {
          dispatch(addProfessor(res.data));
          addedCount++;
        } else if (res.type === 'update') {
          dispatch(updateProfessor(res.data));
          updatedCount++;
        }
      });

      if (addedCount > 0 || updatedCount > 0) {
        toast.success(`Saved changes successfully! Added ${addedCount}, Updated ${updatedCount}.`);
      }
      // Rows will resync via useEffect
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to save some changes. Please check your network and try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-4 h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TableIcon className="h-6 w-6 text-primary" />
            Professor Tracker
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your faculty contacts in a flexible spreadsheet. Add custom columns as needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showNewColInput ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Column Name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                className="h-9 w-40 bg-background border-border text-foreground"
                autoFocus
              />
              <Button onClick={handleAddColumn} size="sm" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">Add</Button>
              <Button onClick={() => setShowNewColInput(false)} size="sm" variant="ghost" className="h-9 text-muted-foreground">Cancel</Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowNewColInput(true)}
              variant="outline"
              className="h-9 border-border hover:bg-accent text-muted-foreground"
            >
              + Add Column
            </Button>
          )}

          <Button
            onClick={handleAddRow}
            className="h-9 bg-muted hover:bg-muted/80 text-foreground border border-border"
          >
            <Plus className="h-4 w-4 mr-2" /> Row
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={saving || !rows.some(r => r.isDirty)}
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="shrink-0 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Grid Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="sticky top-0 z-10 text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-border w-10"></th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[200px]">Professor Name *</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[250px]">University</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[200px]">Email</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[150px]">Status</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[150px]">Funding</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[100px]">Fit Score</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[250px]">Research Focus</th>
                <th className="px-4 py-3 font-medium border-r border-border min-w-[250px]">Notes</th>
                {customColumns.map(col => (
                  <th key={col} className="px-4 py-3 font-medium border-r border-border min-w-[150px] text-primary">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium border-r border-border min-w-[120px] text-center">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10 + customColumns.length} className="px-4 py-12 text-center text-muted-foreground">
                    Click "Row" to add your first professor contact.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id || row.tempId} className={`hover:bg-muted/50 transition-colors ${row.isDirty ? 'bg-primary/5' : ''}`}>
                    <td className="px-2 py-1 border-r border-border/50 text-center">
                      <button onClick={() => handleDeleteRow(index)} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-0 py-0 border-r border-border/50 relative">
                      {row.isDirty && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                      <input
                        type="text"
                        value={row.name || ""}
                        onChange={(e) => updateCell(index, "name", e.target.value)}
                        placeholder="Name..."
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <select
                        value={row.universityId || ""}
                        onChange={(e) => updateCell(index, "universityId", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground appearance-none"
                      >
                        <option value="" className="bg-background text-muted-foreground">No University linked</option>
                        {universities.map(u => (
                          <option key={u.id} value={u.id} className="bg-background text-foreground">{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <input
                        type="email"
                        value={row.email || ""}
                        onChange={(e) => updateCell(index, "email", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <select
                        value={row.status || "NOT_CONTACTED"}
                        onChange={(e) => updateCell(index, "status", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground appearance-none"
                      >
                        <option value="NOT_CONTACTED" className="bg-background">Not Contacted</option>
                        <option value="EMAILED" className="bg-background">Emailed</option>
                        <option value="AWAITING_REPLY" className="bg-background">Awaiting Reply</option>
                        <option value="REPLIED_POSITIVE" className="bg-background">Positive Reply</option>
                        <option value="REPLIED_NEGATIVE" className="bg-background">Negative Reply</option>
                        <option value="INTERVIEWED" className="bg-background">Interview Scheduled</option>
                      </select>
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <select
                        value={row.fundingStatus || "UNKNOWN"}
                        onChange={(e) => updateCell(index, "fundingStatus", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground appearance-none font-semibold"
                      >
                        <option value="UNKNOWN" className="bg-background font-normal text-muted-foreground">❓ Unknown</option>
                        <option value="FUNDED" className="bg-background font-bold text-emerald-400">✅ Funded</option>
                        <option value="LIKELY" className="bg-background font-semibold text-amber-400">🟡 Likely</option>
                        <option value="UNLIKELY" className="bg-background font-semibold text-destructive">🔴 Unlikely</option>
                      </select>
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={row.researchFitScore || ""}
                        onChange={(e) => updateCell(index, "researchFitScore", e.target.value ? parseInt(e.target.value, 10) : "")}
                        placeholder="1-10"
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground text-center font-bold"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <input
                        type="text"
                        value={row.researchInterests || ""}
                        onChange={(e) => updateCell(index, "researchInterests", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-border/50">
                      <input
                        type="text"
                        value={row.notes || ""}
                        onChange={(e) => updateCell(index, "notes", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground"
                      />
                    </td>
                    {customColumns.map(col => (
                      <td key={col} className="px-0 py-0 border-r border-border/50">
                        <input
                          type="text"
                          value={(row.customFields && row.customFields[col]) || ""}
                          onChange={(e) => updateCell(index, col, e.target.value, true)}
                          className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-primary"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-0 border-r border-border/50 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground font-semibold"
                        onClick={() => handleOpenEmailModal(row as Professor)}
                        disabled={row.isNew || !row.email}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Outreach
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <EmailGeneratorModal
        professor={selectedProf}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onEmailLogged={handleEmailLogged}
      />
    </div>
  );
}
