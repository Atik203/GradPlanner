"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
        <span className="sr-only">Toggle theme</span>
        <div className="h-4 w-4 rounded-full bg-zinc-800 animate-pulse" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-foreground hover:bg-accent/40 rounded-lg transition-colors cursor-pointer" />}>
        <span className="sr-only">Toggle theme</span>
        {theme === "light" && <Sun className="h-4 w-4 text-amber-500 animate-in spin-in-45 duration-300" />}
        {theme === "dark" && <Moon className="h-4 w-4 text-blue-400 animate-in spin-in-45 duration-300" />}
        {theme === "system" && <Monitor className="h-4 w-4 text-emerald-400 animate-in zoom-in-50 duration-300" />}
        {!theme && <Monitor className="h-4 w-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-popover/90 backdrop-blur-md border border-border/80 text-foreground p-1 rounded-lg shadow-lg">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
            theme === "light" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
            theme === "dark" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="h-3.5 w-3.5 text-blue-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
            theme === "system" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Monitor className="h-3.5 w-3.5 text-emerald-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
