"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      <p className="text-[11px] text-amber-400 font-medium">
        You&apos;re offline — showing cached data. Some actions may be unavailable.
      </p>
    </div>
  );
}
