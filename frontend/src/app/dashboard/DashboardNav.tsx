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
  ChevronRight
} from "lucide-react";
import { SidebarLogoutButton } from "./SidebarLogoutButton";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const trackingItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Universities", href: "/dashboard/universities", icon: School },
  { name: "Professors", href: "/dashboard/professors", icon: GraduationCap },
  { name: "Applications", href: "/dashboard/applications", icon: FolderGit2 },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Rankings", href: "/dashboard/rankings", icon: BarChart3 },
];

const countryItems: { name: string; href: string }[] = [
  { name: "Australia", href: "/dashboard/countries/australia" },
  { name: "Austria", href: "/dashboard/countries/austria" },
  { name: "Belgium", href: "/dashboard/countries/belgium" },
  { name: "Canada", href: "/dashboard/countries/canada" },
  { name: "China", href: "/dashboard/countries/china" },
  { name: "Denmark", href: "/dashboard/countries/denmark" },
  { name: "Finland", href: "/dashboard/countries/finland" },
  { name: "France", href: "/dashboard/countries/france" },
  { name: "Germany", href: "/dashboard/countries/germany" },
  { name: "Ireland", href: "/dashboard/countries/ireland" },
  { name: "Japan", href: "/dashboard/countries/japan" },
  { name: "Netherlands", href: "/dashboard/countries/netherlands" },
  { name: "New Zealand", href: "/dashboard/countries/new-zealand" },
  { name: "Norway", href: "/dashboard/countries/norway" },
  { name: "Singapore", href: "/dashboard/countries/singapore" },
  { name: "South Korea", href: "/dashboard/countries/south-korea" },
  { name: "Sweden", href: "/dashboard/countries/sweden" },
  { name: "Switzerland", href: "/dashboard/countries/switzerland" },
  { name: "UAE", href: "/dashboard/countries/uae" },
  { name: "USA", href: "/dashboard/countries/usa" },
];

export function DashboardNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-sidebar-foreground hover:opacity-90">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-extrabold text-sm shrink-0">
            GP
          </span>
          <span>GradPlanner</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-6 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 truncate">
            Intelligence Hub
          </p>
          {countryItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Globe className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-primary"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 truncate">
            Tracking
          </p>
          {trackingItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-primary"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User Avatar"}
              className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold border border-primary/20 text-sm shrink-0">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user.name || "Graduate Student"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        </div>
        
        <SidebarLogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-sm"
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
          className="absolute top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300"
          style={{ left: isCollapsed ? '12px' : 'calc(100% - 12px)' }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
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
