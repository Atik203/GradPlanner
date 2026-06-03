import React from "react";
import Link from "next/link";
import { Sparkles, Globe, GraduationCap, School, BookOpen, ArrowUpRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="z-10 mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-primary/20">
                GP
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                GradPlanner
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier decision-support workspace for Bangladeshi students pursuing graduate studies in AI, ML, and technical fields globally.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground tracking-tight">Platform</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/countries" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> 20 Countries
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" /> Scholarships
                </Link>
              </li>
              <li>
                <Link href="/universities" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <School className="h-3.5 w-3.5" /> 3,000+ Universities
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" /> How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground tracking-tight">Intelligence</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/countries" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between group">
                  <span>Visa Guides (Bangladesh)</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between group">
                  <span>Document Timelines</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/countries" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between group">
                  <span>PR Pathways</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  Blog <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground/70 uppercase font-semibold">Soon</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground tracking-tight">Company</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground/80">
            &copy; {new Date().getFullYear()} GradPlanner. All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            <span>Built Around Bangladesh Reality</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
