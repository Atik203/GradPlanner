import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Sparkles, School, GraduationCap, FolderGit2, BarChart2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LandingPage() {
  const reqHeaders = await headers();
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  const isLoggedIn = !!session;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/20 animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-1/4 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/20" />
      </div>

      {/* Navbar */}
      <header className="z-10 sticky top-0 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-primary/20">
              GP
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              GradPlanner
            </span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/dashboard/universities" className="flex items-center gap-2 hover:text-primary transition-colors group">
              <School className="w-4 h-4 group-hover:scale-110 transition-transform" />
              University Rankings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex rounded-full">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto space-y-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md animate-fade-in hover:bg-primary/10 transition-colors cursor-default">
          <Sparkles className="h-4 w-4" />
          <span>The Ultimate Workspace for ML & AI Graduate Applicants</span>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl max-w-4xl leading-[1.15] bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
          Design Your Future in <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Artificial Intelligence
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
          A premium, all-in-one platform to explore university rankings, track target professors, and seamlessly manage your admission documents and deadlines.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 pt-4 w-full sm:w-auto">
          {isLoggedIn ? (
            <Button size="lg" asChild className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
              <Link href="/dashboard">
                Enter Workspace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group">
                <Link href="/register">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base rounded-full border-border/60 hover:bg-muted/50 hover:border-border transition-all duration-300">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 gap-6 sm:grid-cols-3 pt-24 w-full text-left">
          <Card className="bg-card/40 backdrop-blur-lg border-border/50 hover:bg-card/60 hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <School className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Global University Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Explore meticulously verified universities tailored for ML/AI programs across 13 countries, categorized by admission probability.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-lg border-border/50 hover:bg-card/60 hover:border-blue-500/30 transition-all duration-300 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Professor Outreach</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Track your communications with potential thesis supervisors. Monitor response rates, follow-up dates, and interview schedules.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-lg border-border/50 hover:bg-card/60 hover:border-purple-500/30 transition-all duration-300 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderGit2 className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>Application Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Manage your SOPs, LORs, transcripts, and deadlines. Move applications through a visually intuitive kanban-style pipeline.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
              GP
            </div>
            <span className="font-semibold text-foreground/80 text-sm">GradPlanner</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GradPlanner. Designed for ML & AI aspirants.
          </p>
        </div>
      </footer>
    </div>
  );
}
