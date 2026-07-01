"use client";

import React from "react";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { CommandPalette } from "@/components/command-palette/CommandPalette";

export function SearchTrigger() {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer text-sm text-muted-foreground/70 w-48 md:w-56"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left hidden sm:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50 border border-border/40 rounded px-1.5 py-0.5">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
