import React from "react";
import Link from "next/link";
import { SCHOLARSHIPS, COMPETITION_COLORS, COMPETITION_LABELS } from "@/data/scholarships";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GraduationCap, ArrowRight, Wallet, Clock, AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CountryFlag } from "@/components/shared/CountryFlag";

export const metadata = {
  title: "Scholarship Intelligence | GradPlanner",
  description: "Curated funding opportunities for Bangladeshi students pursuing graduate studies abroad.",
};

export default function ScholarshipsPage() {
  return (
    <main className="px-6 py-16 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-2">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Scholarship Intelligence</h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
          Forget generic lists. We've curated the most relevant, high-impact funding opportunities specifically for Bangladeshi applicants in technical fields.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SCHOLARSHIPS.map((schol) => (
          <Card key={schol.id} className="bg-card/40 backdrop-blur-sm border-border/60 hover:bg-card hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full group">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <CountryFlag country={schol.country} className="h-8 w-12 rounded border border-border/20 shadow-sm" />
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-500 transition-colors">{schol.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{schol.country}</p>
                  </div>
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border", COMPETITION_COLORS[schol.competition])}>
                  {COMPETITION_LABELS[schol.competition]}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-6">
              {/* Highlight Amount */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{schol.amount}</p>
                  <p className="text-sm text-muted-foreground">{schol.amountUSD}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Deadline</p>
                  <p className="font-medium">{schol.deadline}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> For</p>
                  <p className="font-medium">{schol.targetDegree.join(" / ")}</p>
                </div>
              </div>

              {/* Bangladesh Insight Box */}
              <div className="bg-muted/40 rounded-xl p-4 border border-border/50 text-sm mt-auto">
                <div className="flex items-center gap-2 mb-2 font-semibold text-foreground">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Bangladesh Context
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {schol.bdNote}
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4">
                {schol.type.replace("-", " ")}
              </p>
              {schol.applyUrl !== "#" ? (
                <a 
                  href={schol.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1 group/link"
                >
                  Official Site <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                </a>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 text-center space-y-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold">Ready to track your applications?</h2>
        <p className="text-muted-foreground">
          Create an account to save scholarships, track deadlines, and manage your documents in a kanban board.
        </p>
        <Link 
          href="/register" 
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "rounded-full shadow-lg")}
        >
          Start for Free
        </Link>
      </div>
    </main>
  );
}
