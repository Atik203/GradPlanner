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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Save,
  Loader2, 
  Trash2,
  Table as TableIcon
} from "lucide-react";
import { Professor, ProfessorStatus } from "@/types";

export default function ProfessorsPage() {
  const dispatch = useAppDispatch();
  const storedProfessors = useAppSelector((state) => state.professors.items);
  const universities = useAppSelector((state) => state.universities.items);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local grid state
  const [rows, setRows] = useState<(Partial<Professor> & { isNew?: boolean; isDirty?: boolean; tempId?: string })[]>([]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [newColName, setNewColName] = useState("");
  const [showNewColInput, setShowNewColInput] = useState(false);

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
      return;
    }

    if (!confirm("Are you sure you want to delete this professor?")) return;

    try {
      await fetchApi(`/api/v1/professors/${row.id}`, { method: "DELETE" });
      dispatch(deleteProfessor(row.id as string));
    } catch (err) {
      console.error(err);
      setError("Failed to delete professor.");
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const dirtyRows = rows.filter(r => r.isDirty);
      
      const promises = dirtyRows.map(async (row) => {
        if (!row.name) return null; // Skip empty names
        
        const payload = {
          name: row.name,
          email: row.email || null,
          universityId: row.universityId || null,
          researchInterests: row.researchInterests || null,
          status: row.status || "NOT_CONTACTED",
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
      results.forEach(res => {
        if (!res) return;
        if (res.type === 'add') {
          dispatch(addProfessor(res.data));
        } else if (res.type === 'update') {
          dispatch(updateProfessor(res.data));
        }
      });

      // Rows will resync via useEffect
    } catch (err) {
      console.error(err);
      setError("Failed to save some changes. Please check your network and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <TableIcon className="h-6 w-6 text-emerald-500" />
            Professor Tracker
          </h2>
          <p className="text-zinc-500 text-sm">
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
                className="h-9 w-40 bg-zinc-900 border-zinc-700"
                autoFocus
              />
              <Button onClick={handleAddColumn} size="sm" className="h-9 bg-emerald-500 text-black hover:bg-emerald-600">Add</Button>
              <Button onClick={() => setShowNewColInput(false)} size="sm" variant="ghost" className="h-9 text-zinc-400">Cancel</Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowNewColInput(true)}
              variant="outline"
              className="h-9 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              + Add Column
            </Button>
          )}

          <Button
            onClick={handleAddRow}
            className="h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Row
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={saving || !rows.some(r => r.isDirty)}
            className="h-9 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
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
      <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="sticky top-0 z-10 text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 w-10"></th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[200px]">Professor Name *</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[250px]">University</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[200px]">Email</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[150px]">Status</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[250px]">Research Focus</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[250px]">Notes</th>
                {customColumns.map(col => (
                  <th key={col} className="px-4 py-3 font-medium border-r border-zinc-800 min-w-[150px] text-emerald-400/80">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7 + customColumns.length} className="px-4 py-12 text-center text-zinc-500">
                    Click "Row" to add your first professor contact.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id || row.tempId} className={`hover:bg-zinc-900/50 transition-colors ${row.isDirty ? 'bg-emerald-900/5' : ''}`}>
                    <td className="px-2 py-1 border-r border-zinc-800/50 text-center">
                      <button onClick={() => handleDeleteRow(index)} className="text-zinc-600 hover:text-red-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-0 py-0 border-r border-zinc-800/50 relative">
                      {row.isDirty && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500" />}
                      <input
                        type="text"
                        value={row.name || ""}
                        onChange={(e) => updateCell(index, "name", e.target.value)}
                        placeholder="Name..."
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-zinc-200"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-zinc-800/50">
                      <select
                        value={row.universityId || ""}
                        onChange={(e) => updateCell(index, "universityId", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-zinc-300 appearance-none"
                      >
                        <option value="" className="bg-zinc-900 text-zinc-500">No University linked</option>
                        {universities.map(u => (
                          <option key={u.id} value={u.id} className="bg-zinc-900 text-zinc-200">{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-0 py-0 border-r border-zinc-800/50">
                      <input
                        type="email"
                        value={row.email || ""}
                        onChange={(e) => updateCell(index, "email", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-zinc-300"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-zinc-800/50">
                      <select
                        value={row.status || "NOT_CONTACTED"}
                        onChange={(e) => updateCell(index, "status", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-zinc-300 appearance-none"
                      >
                        <option value="NOT_CONTACTED" className="bg-zinc-900">Not Contacted</option>
                        <option value="EMAILED" className="bg-zinc-900">Emailed</option>
                        <option value="AWAITING_REPLY" className="bg-zinc-900">Awaiting Reply</option>
                        <option value="REPLIED_POSITIVE" className="bg-zinc-900">Positive Reply</option>
                        <option value="REPLIED_NEGATIVE" className="bg-zinc-900">Negative Reply</option>
                        <option value="INTERVIEWED" className="bg-zinc-900">Interview Scheduled</option>
                      </select>
                    </td>
                    <td className="px-0 py-0 border-r border-zinc-800/50">
                      <input
                        type="text"
                        value={row.researchInterests || ""}
                        onChange={(e) => updateCell(index, "researchInterests", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-zinc-300"
                      />
                    </td>
                    <td className="px-0 py-0 border-r border-zinc-800/50">
                      <input
                        type="text"
                        value={row.notes || ""}
                        onChange={(e) => updateCell(index, "notes", e.target.value)}
                        className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-zinc-300"
                      />
                    </td>
                    {customColumns.map(col => (
                      <td key={col} className="px-0 py-0 border-r border-zinc-800/50">
                        <input
                          type="text"
                          value={(row.customFields && row.customFields[col]) || ""}
                          onChange={(e) => updateCell(index, col, e.target.value, true)}
                          className="w-full h-10 px-4 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-emerald-500 text-emerald-100"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
