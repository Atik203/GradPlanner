"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import {
  Globe,
  GraduationCap,
  School,
  BookOpen,
  Sparkles,
  X,
  Menu,
  ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/countries", label: "Countries", icon: Globe, description: "20 destination countries" },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap, description: "Funding intelligence" },
  { href: "/universities", label: "Universities", icon: School, description: "3,000+ ranked globally" },
  { href: "/how-it-works", label: "How It Works", icon: BookOpen, description: "Your admission roadmap" },
];

export function PublicNavbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      <header
        className={cn(
          "z-50 sticky top-0 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border/60 bg-background/90 backdrop-blur-2xl shadow-sm shadow-black/5"
            : "bg-background/60 backdrop-blur-xl"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-primary/30">
              GP
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              GradPlanner
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 ml-1">
              <Sparkles className="h-2.5 w-2.5" />
              Bangladesh Edition
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <link.icon className="h-3.5 w-3.5 shrink-0" />
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "hidden sm:inline-flex rounded-full shadow-md shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-200"
                )}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden sm:inline-flex rounded-full text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "hidden sm:inline-flex rounded-full shadow-md shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-200"
                  )}
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border/60 shadow-2xl transition-all duration-300 ease-out",
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
            {/* Nav Links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors",
                    isActive(link.href)
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
              </Link>
            ))}

            {/* Divider */}
            <div className="h-px bg-border/60 my-3" />

            {/* Auth CTA */}
            <div className="flex flex-col gap-2 pt-1 pb-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-xl h-11 shadow-md shadow-primary/20"
                  )}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "rounded-xl h-11 shadow-md shadow-primary/20"
                    )}
                  >
                    Start Free — No credit card
                  </Link>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-xl h-11"
                    )}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
