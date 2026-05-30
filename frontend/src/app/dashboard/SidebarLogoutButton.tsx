"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900 border-none px-3 py-2 rounded-lg text-sm font-medium h-9"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-400" />
      ) : (
        <LogOut className="mr-2 h-4 w-4 text-zinc-500" />
      )}
      Sign Out
    </Button>
  );
}
