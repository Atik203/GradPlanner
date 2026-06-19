"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  School,
  FolderGit2,
  MoreHorizontal,
} from "lucide-react";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface Tab {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Countries", href: "/dashboard/countries", icon: Globe },
  { name: "Universities", href: "/dashboard/universities", icon: School },
  { name: "Applications", href: "/dashboard/applications", icon: FolderGit2 },
  { name: "More", href: "#more", icon: MoreHorizontal },
];

export function BottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  const pathname = usePathname();
  const { direction } = useScrollDirection();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 h-14 bg-background/95 backdrop-blur-md border-t border-border transition-transform duration-300 ${
        direction === "down" ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          if (tab.href === "#more") {
            return (
              <button
                key={tab.name}
                onClick={onMoreClick}
                className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full cursor-pointer"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground/60" />
                <span className="text-[10px] font-medium text-muted-foreground/60">More</span>
              </button>
            );
          }
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors ${
                active ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${active ? "fill-primary/20" : ""}`} />
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
