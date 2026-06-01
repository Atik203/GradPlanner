import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
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
  );
}
