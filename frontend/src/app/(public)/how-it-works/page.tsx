import React from "react";
import Link from "next/link";
import { BookOpen, Globe, School, GraduationCap, FolderGit2, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "How It Works | GradPlanner",
  description: "The systematic roadmap for Bangladeshi students to secure fully-funded graduate positions abroad.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      id: "01",
      title: "Choose Your Countries",
      icon: Globe,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      desc: "Stop applying randomly. Start by filtering 20 top destinations based on what actually matters for a Bangladeshi passport: PR pathways, fully-funded availability, and visa rejection rates.",
      features: ["Visa difficulty ratings", "PR timeline estimates", "Cost of living comparison"]
    },
    {
      id: "02",
      title: "Shortlist Universities",
      icon: School,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      desc: "Search through 3,000+ universities. View all three major rankings (QS, THE, ARWU) side-by-side. Categorize them into Dream, Match, and Safety based on your profile.",
      features: ["3,000+ global institutions", "Triple-ranking view", "Target categorization"]
    },
    {
      id: "03",
      title: "Contact Professors (The Game Changer)",
      icon: GraduationCap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      desc: "For PhDs and research MScs, your application lives or dies by professor outreach. Track who you've emailed, log their responses, and get reminders when it's time to follow up.",
      features: ["Outreach pipeline tracker", "Research fit scoring", "Follow-up reminders"]
    },
    {
      id: "04",
      title: "Manage Application Pipeline",
      icon: FolderGit2,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      desc: "Once you have professor alignment or a target program, move it to your application pipeline. Track SOP drafts, LOR requests, IELTS scores, and absolute deadlines in a kanban board.",
      features: ["Kanban board tracking", "Document checklists", "Deadline management"]
    }
  ];

  return (
    <main className="px-6 py-16 max-w-4xl mx-auto space-y-16 animate-in fade-in duration-500">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Admission Roadmap</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Securing a funded graduate position is not a lottery. It's a highly structured pipeline. Here is exactly how to use GradPlanner to execute it.
        </p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[28px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {steps.map((step, idx) => (
          <div key={step.id} className={cn("relative flex items-start md:justify-between", idx % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row")}>
            
            {/* Center Node */}
            <div className="absolute left-0 md:left-1/2 -translate-x-[4px] md:-translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full border-4 border-background bg-card shadow-sm z-10">
              <span className={cn("font-bold text-sm", step.color)}>{step.id}</span>
            </div>

            {/* Content Card */}
            <div className="w-full pl-20 md:pl-0 md:w-[calc(50%-48px)]">
              <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-2xl p-6 md:p-8 hover:bg-card hover:border-border transition-colors hover:shadow-lg hover:shadow-primary/5">
                <div className={cn("inline-flex items-center justify-center h-12 w-12 rounded-xl mb-6", step.bg, step.color)}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {step.desc}
                </p>
                <ul className="space-y-2">
                  {step.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CheckCircle2 className={cn("h-4 w-4", step.color)} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 text-center space-y-6 pt-12 border-t border-border/40">
        <h2 className="text-3xl font-bold">Your journey starts here.</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/register" 
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform")}
          >
            Create Free Account
          </Link>
          <Link 
            href="/countries" 
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto h-14 px-8 rounded-full")}
          >
            Explore Countries First <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
