import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { 
  LayoutDashboard, 
  School, 
  GraduationCap, 
  FileText, 
  FolderGit2, 
  LogOut, 
  Settings, 
  User as UserIcon 
} from "lucide-react";
import { SidebarLogoutButton } from "./SidebarLogoutButton";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Universities", href: "/dashboard/universities", icon: School },
  { name: "Professors", href: "/dashboard/professors", icon: GraduationCap },
  { name: "Applications", href: "/dashboard/applications", icon: FolderGit2 },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: reqHeaders,
    },
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 border-r border-zinc-900 bg-zinc-950 shrink-0">
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-zinc-900">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white hover:opacity-90">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500 text-zinc-950 font-extrabold text-sm">
              GP
            </span>
            <span>GradPlanner</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group"
            >
              <item.icon className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-zinc-900 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User Avatar"}
                className="h-9 w-9 rounded-full object-cover border border-zinc-800"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-sm">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate">
                {user.name || "Graduate Student"}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <SidebarLogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-zinc-200">Workspace</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500">Target Intake: Sept 2028</div>
          </div>
        </header>

        {/* Main View scrollable */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
