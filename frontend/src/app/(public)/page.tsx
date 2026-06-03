import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Sparkles, School, GraduationCap, FolderGit2, CheckCircle2, Globe, TrendingUp, AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { COVERED_COUNTRIES, FUNDING_TIER_COLORS, FUNDING_TIER_LABELS, PR_QUALITY_COLORS, PR_QUALITY_LABELS } from "@/data/countries";
import { FEATURED_SCHOLARSHIPS, COMPETITION_COLORS, COMPETITION_LABELS } from "@/data/scholarships";
import { CountryFlag } from "@/components/shared/CountryFlag";

export default async function LandingPage() {
  const reqHeaders = await headers();
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  const isLoggedIn = !!session;
  
  // Show only 8 countries on the homepage
  const featuredCountries = COVERED_COUNTRIES.slice(0, 8);

  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Dynamic Background Gradients */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-1/4 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/20 animate-pulse duration-10000" />
          <div className="absolute bottom-[-10%] right-1/4 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/20" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[100vw] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="container mx-auto px-6 max-w-5xl text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md hover:bg-primary/10 transition-colors cursor-default mx-auto">
            <Sparkles className="h-4 w-4" />
            <span>The Ultimate Workspace for Bangladeshi Students</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-[1.1] text-foreground">
            Design Your Graduate Journey in <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] animate-gradient">
              AI & Engineering
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
            Stop tracking applications in spreadsheets. GradPlanner brings 20 countries, 3,000+ universities, and Bangladesh-specific visa intelligence into one beautiful workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto")}
              >
                Enter Workspace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group w-full sm:w-auto")}
                >
                  Start Planning for Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/login" 
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 px-8 text-base rounded-full border-border/60 hover:bg-muted/50 hover:border-border transition-all duration-300 w-full sm:w-auto bg-background/50 backdrop-blur-sm")}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats Bar */}
          <div className="pt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground/80">
            <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary/70" /> 20 Countries</div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2"><School className="h-4 w-4 text-primary/70" /> 3,000+ Universities</div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary/70" /> Built for Bangladesh</div>
          </div>
        </div>
      </section>

      {/* 2. Countries Showcase Section */}
      <section className="py-24 bg-muted/30 border-y border-border/50 relative">
        <div className="container mx-auto px-6 max-w-7xl space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Intelligence for 20 Countries</h2>
              <p className="text-muted-foreground text-lg">
                We've analyzed funding, visa difficulty, and PR pathways specifically for Bangladeshi students.
              </p>
            </div>
            <Link href="/countries" className={cn(buttonVariants({ variant: "outline" }), "rounded-full group shrink-0")}>
              Explore All Countries <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCountries.map(country => (
              <Link href="/countries" key={country.code} className="group outline-none">
                <Card className="h-full bg-card/60 backdrop-blur-sm border-border/60 hover:bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CountryFlag country={country.code} className="h-8 w-12 rounded border border-border/20 shadow-sm" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{country.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-md border", FUNDING_TIER_COLORS[country.fundingTier])}>
                        {FUNDING_TIER_LABELS[country.fundingTier]}
                      </span>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border")}>
                        {PR_QUALITY_LABELS[country.prQuality]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {country.bdInsight}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-6xl space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your Admission Roadmap</h2>
            <p className="text-muted-foreground text-lg">
              A systematic approach to securing fully-funded graduate positions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-border/80 -z-10" />
            
            {[
              { title: "Choose Country", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", desc: "Filter 20 countries by PR pathway, funding, and visa difficulty." },
              { title: "Shortlist Unis", icon: School, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", desc: "Search 3,000+ universities across QS, THE, and ARWU rankings." },
              { title: "Contact Profs", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "Track outreach emails, response rates, and interview follow-ups." },
              { title: "Manage Pipeline", icon: FolderGit2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", desc: "Kanban-style tracking for SOPs, LORs, and application deadlines." }
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center space-y-4">
                <div className={cn("h-24 w-24 rounded-2xl flex items-center justify-center border backdrop-blur-xl shadow-lg", step.bg, step.border)}>
                  <step.icon className={cn("h-10 w-10", step.color)} />
                </div>
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold shadow-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed px-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Scholarship Spotlight */}
      <section className="py-24 bg-card/30 border-y border-border/50 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto px-6 max-w-7xl space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Scholarship Intelligence</h2>
              <p className="text-muted-foreground text-lg">
                Curated funding opportunities for CSE & AI applicants from Bangladesh.
              </p>
            </div>
            <Link href="/scholarships" className={cn(buttonVariants({ variant: "outline" }), "rounded-full group shrink-0")}>
              View All Scholarships <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_SCHOLARSHIPS.slice(0, 3).map(schol => (
              <Card key={schol.id} className="bg-background border-border/60 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CountryFlag country={schol.country} className="h-8 w-12 rounded border border-border/20 shadow-sm" />
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded-md border", COMPETITION_COLORS[schol.competition])}>
                      {COMPETITION_LABELS[schol.competition]}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-tight">{schol.name}</CardTitle>
                  <CardDescription className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {schol.amount}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground leading-relaxed">
                    <p className="text-muted-foreground line-clamp-3">
                      <strong className="text-foreground">Bangladeshi Insight:</strong> {schol.bdNote}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bangladesh Reality Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-6xl space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Not a generic dashboard</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built Around Bangladesh Reality</h2>
            <p className="text-muted-foreground text-lg">
              Generic advice fails when applied to a Bangladeshi passport. GradPlanner factors in the realities of Dhaka embassies, document timelines, and PR backlogs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Visa Bottlenecks</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We track the 2.5-year appointment wait for Germany, the APS certificate requirement, and how TA/RA funding letters drop USA F-1 rejection rates from 15% to near-zero.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">PR Path Truths</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The USA EB-2/3 green card backlog for Bangladeshis is 70+ years. We highlight countries like Canada (6-12 month PR post-graduation) and Australia (485 visa).
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Document Timelines</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Police clearance takes 2-6 weeks. Bank statements need 6-month history. Canadian GIC wires take 15 days. Our timelines are built for Dhaka's reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Cards Grid */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-7xl space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              A comprehensive toolkit designed for the modern graduate applicant.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-background border-border/60 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <School className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Global Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Search 3,000+ universities globally. Data aggregated from QS, THE, and ARWU rankings, categorized by admission probability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-background border-border/60 hover:border-blue-500/40 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Professor Outreach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Track communications with potential thesis supervisors. Monitor response rates, follow-up dates, and interview schedules.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-background border-border/60 hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <FolderGit2 className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Application Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Manage SOPs, LORs, transcripts, and deadlines. Move applications through a visually intuitive kanban-style pipeline.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto px-6 text-center max-w-3xl space-y-8 animate-in zoom-in-95 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to build your application strategy?</h2>
          <p className="text-xl text-muted-foreground">
            Join other top CS & Engineering students from Bangladesh planning their graduate studies.
          </p>
          <div className="pt-4">
            <Link 
              href="/register" 
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300")}
            >
              Start Planning for Free
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required. Free forever for students.</p>
        </div>
      </section>
    </>
  );
}
