"use client";

import React from "react";
import Link from "next/link";
import { School } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export function PublicNavbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
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
          <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/universities" className="flex items-center gap-2 hover:text-primary transition-colors group">
            <School className="w-4 h-4 group-hover:scale-110 transition-transform" />
            University Rankings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className={cn(buttonVariants({ variant: "default" }), "rounded-full shadow-lg hover:shadow-primary/25 transition-all")}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex rounded-full")}
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className={cn(buttonVariants({ variant: "default" }), "rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300")}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
