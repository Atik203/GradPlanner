"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      toast.success("Signed out successfully.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold cursor-pointer outline-none hover:bg-primary/20 transition-all shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-56 bg-popover/90 backdrop-blur-md border border-border/80 text-foreground p-1.5 rounded-lg shadow-lg"
      >
        <div className="flex flex-col px-2.5 py-2 border-b border-border/60 mb-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {user.name || "Graduate Student"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        
        <DropdownMenuItem
          render={<Link href="/dashboard/profile" />}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Profile Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          render={<Link href="/dashboard/settings" />}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        <div className="h-px bg-border/60 my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer hover:bg-destructive/10 text-destructive dark:hover:bg-destructive/20 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
