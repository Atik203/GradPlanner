import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client.js";
import { ArrowRight, Sparkles, School, GraduationCap, FolderGit2, FileCheck } from "lucide-react";

export default async function LandingPage() {
  const reqHeaders = await headers();
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  const isLoggedIn = !!session;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="z-10 flex h-20 items-center justify-between px-8 max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500 text-zinc-950 font-extrabold text-sm">
            GP
          </span>
          <span>GradPlanner</span>
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-600 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-600 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Graduate Admissions Workspace for ML & AI Abroad</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-3xl leading-[1.1] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Organize Your Path to a Master's Degree
        </h1>

        <p className="max-w-xl text-lg text-zinc-400 leading-8">
          A premium workspace designed for graduate applicants to search university rankings, track target faculty members, and manage application checklists.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-base font-semibold text-zinc-950 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
            >
              Enter Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-base font-semibold text-zinc-950 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
              >
                Start for Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/20 px-6 text-base font-semibold text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 pt-16 w-full text-left">
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-3">
            <School className="h-8 w-8 text-emerald-400" />
            <h3 className="font-bold text-zinc-200">3k+ University Rankings</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Deduplicated and merged listings from QS 2026, THE 2026, and ARWU 2025. Search by ranking and country.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-3">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <h3 className="font-bold text-zinc-200">Professor Tracker</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Track target faculty members in deep learning, NLP, computer vision. Monitor follow-up dates and reply stats.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-3">
            <FolderGit2 className="h-8 w-8 text-purple-400" />
            <h3 className="font-bold text-zinc-200">Admissions Pipeline</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Track document checklists (SOP, LOR, transcripts, test reports) and applications through every submission stage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 py-8 border-t border-zinc-900/50 text-center text-xs text-zinc-600 w-full max-w-6xl mx-auto">
        <p>&copy; {new Date().getFullYear()} GradPlanner. Designed for ML & AI aspirants abroad.</p>
      </footer>
    </div>
  );
}
