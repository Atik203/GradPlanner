import React from "react";
import { Sparkles, GraduationCap, Users, ShieldAlert, Award } from "lucide-react";

export const metadata = {
  title: "About Us | GradPlanner",
  description: "Learn more about the mission behind GradPlanner — the graduate decision support platform built around Bangladesh realities.",
};

export default function AboutPage() {
  return (
    <main className="px-6 py-16 max-w-5xl mx-auto space-y-20 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto relative">
        <div className="absolute inset-0 pointer-events-none -z-10 flex justify-center">
          <div className="w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/20" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md">
          <Sparkles className="h-4 w-4" />
          <span>Our Story</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Demystifying Graduate School for Bangladeshi Engineers
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          Generic study-abroad consultants do not understand the technical demands of a CS/Engineering MSc or PhD, nor the constraints of a Bangladeshi passport. We built GradPlanner to bridge that gap.
        </p>
      </section>

      {/* The Problem & The Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">The Reality of Applying from Dhaka</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every year, hundreds of top CSE/SWE graduates from universities like BUET, DU, UIU, NSU, and BRACU plan their higher education abroad. But they face critical hurdles:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground font-semibold">Embassy Waitlists:</strong> Waiting 2.5+ years for a German student visa appointment in Dhaka can derail a fully funded offer.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground font-semibold">Funding Dependency:</strong> Bangladeshi students are almost exclusively scholarship-dependent. Rank-200 funded positions are prioritized over Rank-10 unfunded ones.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground font-semibold">Document timelining:</strong> Standard platforms do not account for police clearances, degree releases, or GIC wire speed from local Bangladeshi banks.
              </p>
            </li>
          </ul>
        </div>
        <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
          <h3 className="text-2xl font-bold tracking-tight text-primary">How GradPlanner Helps</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            GradPlanner provides a data-driven system specifically designed around these constraints. We don't just show university rankings; we compile actual funding rates, PR probabilities, and visa turnaround strategies.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">20</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Target Countries</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">3,000+</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Universities Indexed</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Funding Focused</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">Free</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold">For All Applicants</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center tracking-tight">Our Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Funding Over Ranking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We focus on opportunities with active research stipends, tuition waivers, and scholarship awards. A prestigious university with no funding is rarely a viable option.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Actionable Outreach</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Securing an advisor is the fastest path to admission. We build pipelines to manage professor communication, track responses, and automate follow-ups.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Immigration & PR Intelligence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Graduate study is often the first step to immigration. We evaluate which countries offer transparent post-graduation work permits and long-term residency pathways.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
