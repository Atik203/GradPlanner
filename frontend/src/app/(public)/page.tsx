import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Sparkles, School, GraduationCap, FolderGit2, BarChart2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const reqHeaders = await headers();
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  const isLoggedIn = !!session;

  return (
    <>
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/4 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/20 animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-1/4 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/20" />
      </div>


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
            <Link 
              href="/dashboard" 
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300")}
            >
              Enter Workspace <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link 
                href="/register" 
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group")}
              >
                Start for Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 px-8 text-base rounded-full border-border/60 hover:bg-muted/50 hover:border-border transition-all duration-300")}
              >
                Sign In
              </Link>
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

    </>
  );
}
