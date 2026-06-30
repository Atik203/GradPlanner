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
import { DashboardNav } from "./DashboardNav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { BottomNavWrapper } from "@/components/navigation/BottomNavWrapper";

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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Responsive Navigation */}
      <DashboardNav user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b border-border bg-background/50 backdrop-blur-md">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-foreground text-gradient bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Workspace</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>

        {/* Main View scrollable */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8 pb-14 md:pb-8">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>

      <BottomNavWrapper />
    </div>
  );
}
