"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  School, 
  GraduationCap, 
  FileText, 
  FolderGit2, 
  Globe,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Award,
  Briefcase,
  Calendar,
  Settings
} from "lucide-react";

interface NavSubItem {
  name: string;
  href: string;
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

const navGroups: NavGroup[] = [
  {
    name: "Intelligence Hub",
    icon: Globe,
    items: [
      { name: "Country Explorer", href: "/dashboard/countries" },
      { name: "Compare Countries", href: "/dashboard/countries/compare" },
      { name: "Future Outlook", href: "/dashboard/countries/future-outlook" },
    ],
  },
  {
    name: "Universities",
    icon: School,
    items: [
      { name: "Explore Rankings", href: "/dashboard/rankings" },
      { name: "Saved Universities", href: "/dashboard/universities" },
      { name: "Add University", href: "/dashboard/universities/new" },
    ],
  },
  {
    name: "Scholarships & Funding",
    icon: Award,
    items: [
      { name: "Active Scholarships", href: "/dashboard/funding/scholarships" },
      { name: "Funding Matrix", href: "/dashboard/funding/matrix" },
      { name: "Saved Trackers", href: "/dashboard/funding" },
    ],
  },
  {
    name: "Applications",
    icon: FolderGit2,
    items: [
      { name: "App Pipeline", href: "/dashboard/applications" },
      { name: "Upcoming Deadlines", href: "/dashboard/applications/deadlines" },
      { name: "Decision Tracker", href: "/dashboard/applications/decisions" },
    ],
  },
  {
    name: "Professors",
    icon: GraduationCap,
    items: [
      { name: "Cold Email Outreach", href: "/dashboard/professors" },
      { name: "Follow Up Reminders", href: "/dashboard/professors/reminders" },
      { name: "Interview Prep", href: "/dashboard/professors/interviews" },
    ],
  },
  {
    name: "Documents",
    icon: FileText,
    items: [
      { name: "BD Document Checklist", href: "/dashboard/documents/checklist" },
      { name: "Upload Vault", href: "/dashboard/documents" },
    ],
  },
  {
    name: "Career & PR",
    icon: Briefcase,
    items: [
      { name: "AI Job Market", href: "/dashboard/career/job-market" },
      { name: "Salary Intelligence", href: "/dashboard/career/salary" },
      { name: "PR Route Planner", href: "/dashboard/career/pr-planner" },
      { name: "Citizenship Planner", href: "/dashboard/career/citizenship" },
    ],
  },
];

interface StandaloneItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const standaloneItems: StandaloneItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timeline Planner", href: "/dashboard/timeline", icon: Calendar },
  { name: "Analytics & Fit", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Track open accordion groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Proactively open group if a subitem inside it is active
    const initial: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      if (group.items.some((item) => pathname.startsWith(item.href))) {
        initial[group.name] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-sidebar-foreground hover:opacity-90">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-linear-to-br from-primary to-emerald-500 text-primary-foreground font-extrabold text-sm shrink-0 shadow-xs">
            GP
          </span>
          <span className="bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent">GradPlanner</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 px-3 py-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-sidebar-border">
        {/* Standalone items first */}
        <div className="space-y-1">
          {standaloneItems.slice(0, 1).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs" 
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-primary"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Collapsible Groups */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-2 truncate">
            Core Modules
          </p>
          {navGroups.map((group) => {
            const isOpen = !!openGroups[group.name];
            const isGroupActive = group.items.some((item) => pathname.startsWith(item.href));
            
            return (
              <div key={group.name} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                    isGroupActive 
                      ? "text-primary bg-sidebar-accent/30 font-semibold animate-pulse-slow"
                      : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <group.icon className={`h-4 w-4 shrink-0 transition-colors ${isGroupActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-primary"}`} />
                    <span className="truncate">{group.name}</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-sidebar-foreground/45 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="pl-7 pr-1 py-1 space-y-1 border-l border-sidebar-border/50 ml-5">
                    {group.items.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            isSubActive 
                              ? "text-primary font-semibold" 
                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSubActive ? "bg-primary animate-pulse" : "bg-sidebar-foreground/20"}`} />
                          <span className="truncate">{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Other tools */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-2 truncate">
            Planning & Settings
          </p>
          {standaloneItems.slice(1).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs" 
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-primary"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border text-center shrink-0">
        <p className="text-[10px] text-sidebar-foreground/40 font-mono">
          GradPlanner v1.2.0
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-sm cursor-pointer hover:bg-sidebar-accent transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop Sidebar Wrapper */}
      <div className={`hidden md:flex relative h-screen shrink-0 transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-64'}`}>
        <aside className={`flex flex-col h-full bg-sidebar border-sidebar-border transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 border-r-0 opacity-0' : 'w-64 border-r'}`}>
          <div className="w-64 flex flex-col h-full shrink-0">
            <SidebarContent />
          </div>
        </aside>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 cursor-pointer"
          style={{ left: isCollapsed ? '12px' : 'calc(100% - 12px)' }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out flex flex-col ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}
