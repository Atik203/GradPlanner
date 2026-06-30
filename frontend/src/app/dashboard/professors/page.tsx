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
  Mail,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  Coins,
  Building,
  Info
} from "lucide-react";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { ProfessorSkeleton } from "@/components/skeletons/ProfessorSkeleton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Professor, ProfessorStatus } from "@/types";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-media-query";


function getUserProfOverlap(userInterests: string[] | string | undefined | null, profInterests: string | undefined | null) {
  if (!userInterests) return { matches: [], profOnly: profInterests ? profInterests.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : [] };
  
  const userList = Array.isArray(userInterests) 
    ? userInterests.map(i => i.toLowerCase().trim()).filter(Boolean)
    : userInterests.split(/[,;\n]/).map(i => i.toLowerCase().trim()).filter(Boolean);
    
  if (!profInterests) return { matches: [], profOnly: [] };
  
  const profList = profInterests.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  
  const matches: string[] = [];
  const profOnly: string[] = [];
  
  profList.forEach(pi => {
    const piLower = pi.toLowerCase().trim();
    const isMatch = userList.some(ui => {
      const uiLower = ui.toLowerCase().trim();
      return uiLower.includes(piLower) || piLower.includes(uiLower);
    });
    
    if (isMatch) {
      matches.push(pi);
    } else {
      profOnly.push(pi);
    }
  });
  
  return { matches, profOnly };
}


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

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

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
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  // Sync local rows with redux state
  useEffect(() => {
    setRows(storedProfessors.map(p => ({ ...p })));
    
    // Extract unique custom columns, starting with standard pre-seeded ones
    const cols = new Set<string>([
      "lastPublicationYear",
      "recentPhdGraduations",
      "activeGrants",
      "industryPartnerships"
    ]);
    storedProfessors.forEach(p => {
      if (p.customFields) {
        Object.keys(p.customFields).forEach(k => {
          if (k) cols.add(k);
        });
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
      setRows(prev => prev.filter((_, i) => i !== rowIndex));
      toast.success("New unsaved row removed.");
      return;
    }
    setDeleteTarget(rowIndex);
  };

  const confirmDeleteRow = async () => {
    if (deleteTarget === null) return;
    const row = rows[deleteTarget];
    if (!row) { setDeleteTarget(null); return; }

    try {
      await fetchApi(`/api/v1/professors/${row.id}`, { method: "DELETE" });
      dispatch(deleteProfessor(row.id as string));
      setDeleteTarget(null);
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
        
        // Format custom fields safely before submitting
        const formattedCustomFields = { ...(row.customFields || {}) };
        
        if (formattedCustomFields.lastPublicationYear !== undefined && formattedCustomFields.lastPublicationYear !== null && formattedCustomFields.lastPublicationYear !== "") {
          formattedCustomFields.lastPublicationYear = parseInt(formattedCustomFields.lastPublicationYear as any, 10) || null;
        } else if (formattedCustomFields.lastPublicationYear === "") {
          formattedCustomFields.lastPublicationYear = null;
        }
        
        if (formattedCustomFields.recentPhdGraduations !== undefined && formattedCustomFields.recentPhdGraduations !== null && formattedCustomFields.recentPhdGraduations !== "") {
          formattedCustomFields.recentPhdGraduations = parseInt(formattedCustomFields.recentPhdGraduations as any, 10) || null;
        } else if (formattedCustomFields.recentPhdGraduations === "") {
          formattedCustomFields.recentPhdGraduations = null;
        }
        
        if (formattedCustomFields.activeGrants !== undefined && formattedCustomFields.activeGrants !== null) {
          formattedCustomFields.activeGrants = !!formattedCustomFields.activeGrants;
        }
        
        if (typeof formattedCustomFields.industryPartnerships === "string") {
          formattedCustomFields.industryPartnerships = formattedCustomFields.industryPartnerships
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        
        const payload = {
          name: row.name,
          email: row.email || null,
          universityId: row.universityId || null,
          researchInterests: row.researchInterests || null,
          status: row.status || "NOT_CONTACTED",
          fundingStatus: row.fundingStatus || "UNKNOWN",
          researchFitScore: row.researchFitScore ? parseInt(row.researchFitScore as any, 10) : null,
          notes: row.notes || null,
          customFields: formattedCustomFields
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
          <h2 className="text-page-title font-black tracking-tight text-foreground flex items-center gap-2">
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
                className="min-h-11 w-40 bg-background border-border text-foreground"
                autoFocus
              />
              <Button onClick={handleAddColumn} size="sm" className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90">Add</Button>
              <Button onClick={() => setShowNewColInput(false)} size="sm" variant="ghost" className="min-h-11 text-muted-foreground">Cancel</Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowNewColInput(true)}
              variant="outline"
              className="min-h-11 border-border hover:bg-accent text-muted-foreground"
            >
              + Add Column
            </Button>
          )}

          <Button
            onClick={handleAddRow}
            className="min-h-11 bg-muted hover:bg-muted/80 text-foreground border border-border"
          >
            <Plus className="h-4 w-4 mr-2" /> Row
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={saving || !rows.some(r => r.isDirty)}
            className="min-h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <ApiErrorAlert error={error} onRetry={loadData} />
      )}

      {/* Grid Container */}
      <div className="hidden md:block">
        <div className="flex-1 overflow-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        {loading ? (
          <ProfessorSkeleton />
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
                {customColumns.map(col => {
                  let label = col;
                  if (col === "lastPublicationYear") label = "Last Pub Year";
                  else if (col === "recentPhdGraduations") label = "Recent PhD Grads";
                  else if (col === "activeGrants") label = "Active Grants";
                  else if (col === "industryPartnerships") label = "Industry Partnerships";
                  return (
                    <th key={col} className="px-4 py-3 font-medium border-r border-border min-w-[150px] text-primary">
                      {label}
                    </th>
                  );
                })}
                <th className="px-4 py-3 font-medium border-r border-border min-w-[120px] text-center">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10 + customColumns.length} className="px-4 py-12">
                    <div className="max-w-sm mx-auto">
                      <EmptyState
                        icon={GraduationCap}
                        title="No professors tracked"
                        description="Click &quot;Row&quot; to add your first professor contact and start tracking outreach."
                      />
                    </div>
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
                    <td className="px-0 py-0 border-r border-border/50 group relative overflow-visible">
                      <div className="flex items-center justify-between px-3 h-10 w-full">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={row.researchFitScore || ""}
                          onChange={(e) => updateCell(index, "researchFitScore", e.target.value ? parseInt(e.target.value, 10) : "")}
                          placeholder="1-10"
                          className="w-12 bg-transparent border-none focus:ring-0 text-foreground font-bold text-center"
                        />
                        <Info className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary cursor-help" />
                      </div>
                      
                      {/* Research Fit Score Popover Tooltip */}
                      {(() => {
                        const { matches, profOnly } = getUserProfOverlap(profile?.researchInterests, row.researchInterests);
                        
                        const pubYear = row.customFields?.lastPublicationYear;
                        let pubRecencyStatus = "UNKNOWN";
                        let pubRecencyColor = "bg-muted text-muted-foreground";
                        let pubRecencyText = "No publication history recorded";
                        
                        if (pubYear) {
                          const year = parseInt(pubYear, 10);
                          if (year >= 2024) {
                            pubRecencyStatus = "ACTIVE";
                            pubRecencyColor = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                            pubRecencyText = `Highly Active (Published ${year})`;
                          } else if (year >= 2021) {
                            pubRecencyStatus = "MODERATE";
                            pubRecencyColor = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
                            pubRecencyText = `Moderately Active (Published ${year})`;
                          } else {
                            pubRecencyStatus = "INACTIVE";
                            pubRecencyColor = "bg-destructive/20 text-destructive border border-destructive/30";
                            pubRecencyText = `Inactive (Last published ${year})`;
                          }
                        }
                        
                        const phdCount = row.customFields?.recentPhdGraduations ? parseInt(row.customFields.recentPhdGraduations, 10) : 0;
                        const hasCapacityCaution = phdCount >= 3;
                        
                        const hasActiveGrants = !!row.customFields?.activeGrants;
                        const industryPartners = row.customFields?.industryPartnerships;
                        const displayPartners = Array.isArray(industryPartners) 
                          ? industryPartners 
                          : (typeof industryPartners === "string" && industryPartners 
                              ? industryPartners.split(",").map(s => s.trim()).filter(Boolean) 
                              : []);
                              
                        return (
                          <div className="hidden group-hover:block absolute left-[80%] top-[90%] z-50 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 text-xs space-y-4 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                            {/* Title & Score */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-amber-400" />
                                Research Fit Analysis
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-xs border border-primary/30">
                                {row.researchFitScore ? `${row.researchFitScore}/10` : "—"}
                              </span>
                            </div>
                            
                            {/* Keyword Match Chips */}
                            <div className="space-y-2">
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">Keyword Overlaps</span>
                              <div className="flex flex-wrap gap-1.5">
                                {matches.length > 0 ? (
                                  matches.map(m => (
                                    <span key={m} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                      ✓ {m}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500 italic">No matching keywords.</span>
                                )}
                              </div>
                              
                              {profOnly.length > 0 && (
                                <div className="pt-1.5 space-y-1">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Professor Focus</span>
                                  <div className="flex flex-wrap gap-1">
                                    {profOnly.map(p => (
                                      <span key={p} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Publication Recency */}
                            <div className="space-y-1.5 border-t border-slate-800/60 pt-2">
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">Publication Recency</span>
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                  pubRecencyStatus === "ACTIVE" ? "bg-emerald-400" :
                                  pubRecencyStatus === "MODERATE" ? "bg-amber-400" :
                                  pubRecencyStatus === "INACTIVE" ? "bg-red-400" : "bg-slate-600"
                                }`} />
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pubRecencyColor}`}>
                                  {pubRecencyText}
                                </span>
                              </div>
                            </div>

                            {/* Capacity caution */}
                            {(hasCapacityCaution || phdCount > 0) && (
                              <div className="space-y-1.5 border-t border-slate-800/60 pt-2">
                                <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">Lab Capacity</span>
                                {hasCapacityCaution ? (
                                  <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p className="leading-normal">
                                      <strong>Capacity Caution:</strong> Professor graduated {phdCount} PhDs recently. Lab space might be limited or funding stretched.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span>Graduated {phdCount} PhD student(s) recently.</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Lab Funding Signals */}
                            <div className="space-y-2 border-t border-slate-800 pt-3">
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">Funding & Industry Signals</span>
                              <div className="space-y-1.5">
                                {hasActiveGrants ? (
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                    <Coins className="h-3.5 w-3.5 text-emerald-400" />
                                    Active Research Grants Found
                                  </div>
                                ) : (
                                  <div className="text-slate-500 italic">No active grants reported.</div>
                                )}

                                {displayPartners.length > 0 && (
                                  <div className="flex items-start gap-1.5 text-slate-300">
                                    <Building className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Partners:</strong> {displayPartners.join(", ")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
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
                    {customColumns.map(col => {
                      const val = row.customFields?.[col];
                      
                      if (col === "activeGrants") {
                        return (
                          <td key={col} className="px-0 py-0 border-r border-border/50 text-center align-middle">
                            <div className="flex items-center justify-center h-10">
                              <input
                                type="checkbox"
                                checked={!!val}
                                onChange={(e) => updateCell(index, col, e.target.checked, true)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background cursor-pointer"
                              />
                            </div>
                          </td>
                        );
                      }
                      
                      if (col === "lastPublicationYear" || col === "recentPhdGraduations") {
                        return (
                          <td key={col} className="px-0 py-0 border-r border-border/50">
                            <input
                              type="number"
                              placeholder={col === "lastPublicationYear" ? "e.g. 2024" : "e.g. 2"}
                              value={val !== undefined && val !== null ? val : ""}
                              onChange={(e) => updateCell(index, col, e.target.value !== "" ? parseInt(e.target.value, 10) : "", true)}
                              className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground text-center"
                            />
                          </td>
                        );
                      }
                      
                      // For industryPartnerships (could be array or comma-separated string)
                      const displayVal = Array.isArray(val) ? val.join(", ") : (val || "");
                      
                      return (
                        <td key={col} className="px-0 py-0 border-r border-border/50">
                          <input
                            type="text"
                            placeholder={col === "industryPartnerships" ? "e.g. Google, NVIDIA" : "Value..."}
                            value={displayVal}
                            onChange={(e) => updateCell(index, col, e.target.value, true)}
                            className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-primary text-foreground"
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-0 border-r border-border/50 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground font-semibold"
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
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <ProfessorSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No professors tracked"
            description="Track professor outreach and manage your contacts."
          />
        ) : (
          rows.map((row, index) => (
            <div key={row.id || row.tempId} className="rounded-lg border border-border bg-card p-4 space-y-3">
              {/* Header: name + delete */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={row.name || ""}
                    onChange={(e) => updateCell(index, "name", e.target.value)}
                    placeholder="Professor Name"
                    className="w-full bg-transparent font-semibold text-sm text-foreground placeholder:text-muted-foreground/40 border-none outline-none"
                  />
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{row.email || "No email"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {row.id && (
                    <button onClick={() => handleOpenEmailModal(row as Professor)} className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Send email">
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDeleteRow(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* University + Status */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">University</span>
                  <select
                    value={row.universityId || ""}
                    onChange={(e) => updateCell(index, "universityId", e.target.value)}
                    className="w-full min-h-11 px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Status</span>
                  <select
                    value={row.status || "NOT_CONTACTED"}
                    onChange={(e) => updateCell(index, "status", e.target.value)}
                    className="w-full min-h-11 px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
                  >
                    <option value="NOT_CONTACTED">Not Contacted</option>
                    <option value="EMAILED">Emailed</option>
                    <option value="AWAITING_REPLY">Awaiting Reply</option>
                    <option value="REPLIED_POSITIVE">Positive</option>
                    <option value="REPLIED_NEGATIVE">Negative</option>
                    <option value="INTERVIEWED">Interviewed</option>
                  </select>
                </div>
              </div>

              {/* Research interests */}
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Research Interests</span>
                <input
                  type="text"
                  value={row.researchInterests || ""}
                  onChange={(e) => updateCell(index, "researchInterests", e.target.value)}
                  placeholder="NLP, LLM, Computer Vision..."
                  className="w-full h-8 px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
                />
              </div>

              {/* Notes + Funding */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Funding</span>
                  <select
                    value={row.fundingStatus || "UNKNOWN"}
                    onChange={(e) => updateCell(index, "fundingStatus", e.target.value)}
                    className="w-full min-h-11 px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="FUNDED">Funded</option>
                    <option value="LIKELY">Likely</option>
                    <option value="UNLIKELY">Unlikely</option>
                  </select>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Research Fit</span>
                  <p className="text-xs font-semibold text-foreground">
                    {row.researchFitScore != null ? `${Math.round(row.researchFitScore)}%` : "N/A"}
                  </p>
                </div>
              </div>

              {/* Notes textarea */}
              {row.notes && (
                <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/40 line-clamp-2">
                  {row.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <EmailGeneratorModal
        professor={selectedProf}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onEmailLogged={handleEmailLogged}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={confirmDeleteRow}
        title="Delete Professor"
        description="Are you sure you want to delete this professor record? This action cannot be undone."
      />
    </div>
  );
}
