"use client";

import React from "react";
import { Inbox } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
        Notifications about deadlines, follow-ups, and updates will appear here.
      </p>
    </div>
  );
}
