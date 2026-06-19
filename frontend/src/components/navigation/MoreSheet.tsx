"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Globe,
  School,
  Award,
  FolderGit2,
  GraduationCap,
  FileText,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    name: "Intelligence Hub",
    icon: Globe,
    items: [
      { name: "Country Explorer", href: "/dashboard/countries", icon: Globe },
      { name: "Compare Countries", href: "/dashboard/countries/compare", icon: Globe },
      { name: "Future Outlook", href: "/dashboard/countries/future-outlook", icon: Globe },
    ],
  },
  {
    name: "Universities",
    icon: School,
    items: [
      { name: "Explore Rankings", href: "/dashboard/rankings", icon: School },
      { name: "Saved Universities", href: "/dashboard/universities", icon: School },
    ],
  },
  {
    name: "Scholarships & Funding",
    icon: Award,
    items: [
      { name: "Active Scholarships", href: "/dashboard/funding/scholarships", icon: Award },
      { name: "Funding Matrix", href: "/dashboard/funding/matrix", icon: Award },
      { name: "Saved Trackers", href: "/dashboard/funding", icon: Award },
    ],
  },
  {
    name: "Applications",
    icon: FolderGit2,
    items: [
      { name: "App Pipeline", href: "/dashboard/applications", icon: FolderGit2 },
      { name: "Upcoming Deadlines", href: "/dashboard/applications/deadlines", icon: FolderGit2 },
      { name: "Decision Tracker", href: "/dashboard/applications/decisions", icon: FolderGit2 },
    ],
  },
  {
    name: "Professors",
    icon: GraduationCap,
    items: [
      { name: "Cold Email Outreach", href: "/dashboard/professors", icon: GraduationCap },
      { name: "Follow Up Reminders", href: "/dashboard/professors/reminders", icon: GraduationCap },
      { name: "Interview Prep", href: "/dashboard/professors/interviews", icon: GraduationCap },
    ],
  },
  {
    name: "Documents",
    icon: FileText,
    items: [
      { name: "BD Document Checklist", href: "/dashboard/documents/checklist", icon: FileText },
      { name: "Upload Vault", href: "/dashboard/documents", icon: FileText },
    ],
  },
  {
    name: "Career & PR",
    icon: Briefcase,
    items: [
      { name: "AI Job Market", href: "/dashboard/career/job-market", icon: Briefcase },
      { name: "Salary Intelligence", href: "/dashboard/career/salary", icon: Briefcase },
      { name: "PR Route Planner", href: "/dashboard/career/pr-planner", icon: Briefcase },
      { name: "Citizenship Planner", href: "/dashboard/career/citizenship", icon: Briefcase },
    ],
  },
];

const standaloneItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timeline Planner", href: "/dashboard/timeline", icon: Calendar },
  { name: "Analytics & Fit", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MoreSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>All Destinations</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-1 pb-6">
          {standaloneItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </Link>
            );
          })}

          <div className="border-t border-border pt-4 space-y-3">
            {groups.map((group) => (
              <div key={group.name}>
                <p className="px-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1.5">
                  {group.name}
                </p>
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
