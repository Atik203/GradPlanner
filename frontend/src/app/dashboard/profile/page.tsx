"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  User, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ProfileDetailsPage() {
  const dispatch = useAppDispatch();
  const { data: session } = authClient.useSession();
  const profile = useAppSelector((state) => state.profile.profile);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [university, setUniversityName] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const profileData = await fetchApi("/api/v1/profile");
        dispatch(setProfile(profileData));
        if (profileData) {
          setUniversityName(profileData.university || "");
          setCgpa(profileData.cgpa ? String(profileData.cgpa) : "");
          setTargetDegree(profileData.targetDegree || "");
          setTargetIntake(profileData.targetIntake || "");
          setGraduationDate(profileData.graduationDate || "");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const updatedProfile = await fetchApi("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({
          university,
          cgpa: cgpa ? parseFloat(cgpa) : null,
          targetIntake,
          graduationDate,
          targetDegree,
        }),
      });
      dispatch(setProfile(updatedProfile));
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate profile readiness completeness
  let completeness = 0;
  if (profile) {
    if (profile.university) completeness += 20;
    if (profile.cgpa) completeness += 20;
    if (profile.targetDegree) completeness += 20;
    if (profile.targetIntake) completeness += 20;
    if (profile.graduationDate) completeness += 20;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      
      {/* Header Navigation */}
      <div className="space-y-1">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Profile Details</h2>
        <p className="text-muted-foreground text-sm">Manage your undergrad academic standing and intake preferences.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Profile updated successfully! Your target match algorithms have been synchronized.</span>
        </div>
      )}

      {/* Profile Completeness Bar */}
      <Card className="border-border/60 bg-card/25 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              Academic Profile Readiness
            </span>
            <span className="text-xs font-bold text-primary">{completeness}% Complete</span>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <div 
              className="bg-linear-to-r from-primary to-emerald-400 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2.5">
            A complete profile ensures highly personalized country and university match recommendation calculations.
          </p>
        </CardContent>
      </Card>

      {/* Editing Form */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md shadow-xs">
        <CardHeader>
          <CardTitle className="text-md font-bold text-foreground">Academic Profile & Targets</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Modify details to recalculate fit ratings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Info read-only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border/55">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Account Holder</span>
                <p className="text-sm font-semibold text-foreground truncate">{session?.user?.name || "Student User"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Primary Email</span>
                <p className="text-sm font-semibold text-foreground truncate">{session?.user?.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="undergradUni" className="text-xs text-muted-foreground">Current/Previous Undergrad University</Label>
              <Input
                id="undergradUni"
                type="text"
                placeholder="UIU Dhaka, DU, NSU, etc."
                value={university}
                onChange={(e) => setUniversityName(e.target.value)}
                className="bg-background border-border text-foreground text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cgpaInput" className="text-xs text-muted-foreground">Undergraduate CGPA (out of 4.0)</Label>
                <Input
                  id="cgpaInput"
                  type="number"
                  step="0.01"
                  placeholder="3.75"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="degreeInput" className="text-xs text-muted-foreground">Target Degree Domain</Label>
                <Input
                  id="degreeInput"
                  type="text"
                  placeholder="MSc Computer Science / PhD AI"
                  value={targetDegree}
                  onChange={(e) => setTargetDegree(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="intakeInput" className="text-xs text-muted-foreground">Target Intake Cycle</Label>
                <Input
                  id="intakeInput"
                  type="text"
                  placeholder="September 2028"
                  value={targetIntake}
                  onChange={(e) => setTargetIntake(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gradInput" className="text-xs text-muted-foreground">Estimated Graduation Date</Label>
                <Input
                  id="gradInput"
                  type="text"
                  placeholder="November 2027"
                  value={graduationDate}
                  onChange={(e) => setGraduationDate(e.target.value)}
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 shadow-sm cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
