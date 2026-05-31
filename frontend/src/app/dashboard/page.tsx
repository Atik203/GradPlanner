"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { setUniversities } from "@/lib/store/slices/universitySlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  School, 
  GraduationCap, 
  FolderGit2, 
  FileText, 
  Plus, 
  Calendar,
  AlertCircle,
  TrendingUp,
  User
} from "lucide-react";

interface Stats {
  universities: { total: number; dream: number; match: number; safety: number };
  professors: { total: number; notContacted: number; emailed: number; awaitingReply: number; repliedPositive: number; repliedNegative: number; interviewed: number; totalReplies: number };
  applications: { total: number; planning: number; inProgress: number; submitted: number; underReview: number; offerReceived: number; accepted: number; rejected: number; withdrawn: number };
  documents: { total: number; pending: number; inProgress: number; obtained: number; expired: number; notRequired: number; progressPercentage: number };
}

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const universities = useAppSelector((state) => state.universities.items);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile editing state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [university, setUniversityName] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, profileData, uniData] = await Promise.all([
          fetchApi("/api/v1/dashboard/stats"),
          fetchApi("/api/v1/profile"),
          fetchApi("/api/v1/universities"),
        ]);
        setStats(statsData);
        dispatch(setProfile(profileData));
        dispatch(setUniversities(uniData));

        // Prefill profile edit fields
        setUniversityName(profileData.university || "");
        setCgpa(profileData.cgpa ? String(profileData.cgpa) : "");
        setTargetDegree(profileData.targetDegree || "");
        setTargetIntake(profileData.targetIntake || "");
        setGraduationDate(profileData.graduationDate || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [dispatch]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const updatedProfile = await fetchApi("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({
          university,
          cgpa,
          targetIntake,
          graduationDate,
          targetDegree,
        }),
      });
      dispatch(setProfile(updatedProfile));
      setEditProfileOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingDeadlines = universities
    .filter((u) => u.deadline && !u.deletedAt)
    .map((u) => ({
      name: u.name,
      program: u.program || "ML & AI",
      deadline: u.deadline!,
      tier: u.tier,
    }))
    .slice(0, 5); // top 5 deadlines

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl border border-border bg-gradient-to-r from-muted/50 to-primary/10 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Hello, {profile?.university ? "Graduate Candidate" : "Applicant"}!
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Welcome to your ML/AI abroad graduate applications workspace. Track your profile, ranking list, contacted professors, and deadlines here.
            </p>
          </div>
          <Button 
            onClick={() => setEditProfileOpen(true)}
            className="self-start md:self-center bg-muted border border-border hover:bg-accent hover:text-accent-foreground text-foreground h-9 px-4 rounded-lg flex items-center gap-2"
          >
            <User className="h-4 w-4 text-primary" />
            Update Profile
          </Button>
        </div>

        {/* Quick Profile Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/80">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase">Target Degree</span>
            <p className="text-sm font-semibold text-foreground">{profile?.targetDegree || "Not Set"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase">Undergrad CGPA</span>
            <p className="text-sm font-semibold text-foreground">{profile?.cgpa ? `${profile.cgpa} / 4.0` : "Not Set"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase">Target Intake</span>
            <p className="text-sm font-semibold text-foreground">{profile?.targetIntake || "September 2028"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase">Current University</span>
            <p className="text-sm font-semibold text-foreground truncate">{profile?.university || "Not Set"}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Universities */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tracked Universities</CardTitle>
              <School className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{stats.universities.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.universities.dream} Dream · {stats.universities.match} Match · {stats.universities.safety} Safety
              </p>
            </CardContent>
          </Card>

          {/* Professors */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contacted Professors</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{stats.professors.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.professors.totalReplies} replies ({stats.professors.repliedPositive} positive)
              </p>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
              <FolderGit2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{stats.applications.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.applications.inProgress} in progress · {stats.applications.submitted} submitted
              </p>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Document Progress</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-foreground">{stats.documents.progressPercentage}%</div>
              {/* Progress bar */}
              <div className="w-full bg-accent rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.documents.progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Deadlines Section */}
        <Card className="border-border/60 bg-card/20 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-foreground">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-muted-foreground">Keep track of your target program deadlines.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                <Calendar className="h-8 w-8 mb-2" />
                <p className="text-sm">No upcoming deadlines configured.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-border bg-card/30 rounded-lg hover:border-border/80 transition-all">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.program}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.tier === "DREAM" ? "bg-purple-500/10 text-purple-400" :
                        item.tier === "MATCH" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {item.tier}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">{item.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="border-border/60 bg-card/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-foreground">Admissions Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">1</span>
              <p>Add 5+ universities from QS, THE, or ARWU lists.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">2</span>
              <p>Contact target professors in your research areas.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">3</span>
              <p>Prepare transcript copies, draft your SOP & CV.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">4</span>
              <p>Register for standard exams (IELTS/GRE).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Update Profile Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="undergradUni" className="text-xs text-muted-foreground">Current/Previous Undergrad University</Label>
                <Input
                  id="undergradUni"
                  type="text"
                  placeholder="UIU Dhaka"
                  value={university}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cgpaInput" className="text-xs text-muted-foreground">CGPA</Label>
                  <Input
                    id="cgpaInput"
                    type="number"
                    step="0.01"
                    placeholder="3.8"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="degreeInput" className="text-xs text-muted-foreground">Target Degree</Label>
                  <Input
                    id="degreeInput"
                    type="text"
                    placeholder="MSc ML/AI"
                    value={targetDegree}
                    onChange={(e) => setTargetDegree(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="intakeInput" className="text-xs text-muted-foreground">Target Intake</Label>
                  <Input
                    id="intakeInput"
                    type="text"
                    placeholder="Sep 2028"
                    value={targetIntake}
                    onChange={(e) => setTargetIntake(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gradInput" className="text-xs text-muted-foreground">Graduation Date</Label>
                  <Input
                    id="gradInput"
                    type="text"
                    placeholder="Nov 2027"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  onClick={() => setEditProfileOpen(false)}
                  className="bg-transparent hover:bg-muted text-muted-foreground border border-border h-9"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={profileSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9"
                >
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
