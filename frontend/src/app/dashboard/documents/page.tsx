"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { 
  setDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from "@/lib/store/slices/documentSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2, 
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { Document, DocumentType, DocumentStatus } from "@/types";

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector((state) => state.documents.items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<DocumentType>("SOP");
  const [status, setStatus] = useState<DocumentStatus>("PENDING");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Load documents
  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        const data = await fetchApi("/api/v1/documents");
        dispatch(setDocuments(data));
      } catch (err) {
        console.error(err);
        setError("Failed to load documents checklist.");
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, [dispatch]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const newDoc = await fetchApi("/api/v1/documents", {
        method: "POST",
        body: JSON.stringify({
          name,
          type,
          status,
          notes,
        }),
      });
      dispatch(addDocument(newDoc));
      setFormOpen(false);
      // Reset form
      setName("");
      setType("SOP");
      setStatus("PENDING");
      setNotes("");
    } catch (err) {
      console.error(err);
      setError("Failed to save document check.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: DocumentStatus) => {
    try {
      const updated = await fetchApi(`/api/v1/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      dispatch(updateDocument(updated));
    } catch (err) {
      console.error(err);
      setError("Failed to update document status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document reference?")) return;

    try {
      await fetchApi(`/api/v1/documents/${id}`, {
        method: "DELETE",
      });
      dispatch(deleteDocument(id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete document.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Document Checklist</h2>
          <p className="text-muted-foreground text-sm">
            Manage files, SOPs, CV drafts, and examination transcripts needed for admissions.
          </p>
        </div>
        <Button
          onClick={() => {
            setName("Statement of Purpose (SOP)");
            setType("SOP");
            setFormOpen(true);
          }}
          className="self-start sm:self-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Checklist Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
          <FileText className="h-10 w-10 mb-2 text-muted-foreground/50" />
          <p className="text-sm">Your document checklist is empty. Add a file checklist item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-border bg-card/30 hover:border-border/80 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground line-clamp-1">{doc.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{doc.type}</CardDescription>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.status === "OBTAINED" ? "bg-[var(--success)]/15 text-[var(--success)]" :
                    doc.status === "IN_PROGRESS" ? "bg-[var(--warning)]/15 text-[var(--warning)]" :
                    doc.status === "PENDING" ? "bg-muted text-muted-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {doc.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* Status selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Checklist Status</span>
                  <select
                    value={doc.status}
                    onChange={(e) => handleUpdateStatus(doc.id, e.target.value as DocumentStatus)}
                    className="w-full h-8 px-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="OBTAINED">Obtained / Complete</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="NOT_REQUIRED">Not Required</option>
                  </select>
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 line-clamp-2 mt-2">
                    {doc.notes}
                  </p>
                )}
              </CardContent>
              <div className="px-6 py-3 border-t border-border/60 flex items-center justify-between bg-muted/30 rounded-b-xl">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-transparent hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-none p-1.5 h-8 w-8 rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Document modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground">Add Checklist Document</h3>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="docName" className="text-xs text-muted-foreground">Document Name</Label>
                <Input
                  id="docName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="docTypeSelect" className="text-xs text-muted-foreground">Document Type</Label>
                  <select
                    id="docTypeSelect"
                    value={type}
                    onChange={(e) => setType(e.target.value as DocumentType)}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="SOP">SOP (Statement of Purpose)</option>
                    <option value="CV">Curriculum Vitae (CV)</option>
                    <option value="TRANSCRIPT">Academic Transcript</option>
                    <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                    <option value="IELTS">IELTS Test Report</option>
                    <option value="GRE">GRE Score Card</option>
                    <option value="LOR">Letter of Recommendation</option>
                    <option value="PASSPORT">Passport Copy</option>
                    <option value="BANK_STATEMENT">Bank Statement</option>
                    <option value="OTHER">Other document</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="docStatusSelect" className="text-xs text-muted-foreground">Status</Label>
                  <select
                    id="docStatusSelect"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="OBTAINED">Obtained / Complete</option>
                    <option value="NOT_REQUIRED">Not Required</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notesInput" className="text-xs text-muted-foreground">Checklist Notes</Label>
                <textarea
                  id="notesInput"
                  rows={3}
                  placeholder="Need to request transcript from Registrar's office, SOP draft needs revision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Checklist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
