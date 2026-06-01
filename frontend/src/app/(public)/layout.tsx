import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <PublicNavbar />
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
