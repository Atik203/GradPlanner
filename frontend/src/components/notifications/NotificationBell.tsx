"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Bell, BellOff } from "lucide-react";
import { notificationApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setUnreadCount, resetUnreadCount } from "@/lib/store/slices/notificationSlice";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { unreadCount, loading } = useAppSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const fetchCount = useCallback(async () => {
    try {
      const { count } = await notificationApi.unreadCount();
      dispatch(setUnreadCount(count));
    } catch {
      // Silently fail — keep previous count
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(fetchCount, 30000);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchCount]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      setOpen(v);
      if (!v) fetchCount();
    },
    [fetchCount]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      dispatch(resetUnreadCount());
    } catch {
      // silent
    }
  }, [dispatch]);

  return (
    <>
      <button
        ref={bellRef}
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        {unreadCount > 0 ? (
          <>
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none animate-in zoom-in-50">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground/60" />
        )}
      </button>

      <NotificationPanel
        open={open}
        onOpenChange={handleOpenChange}
        triggerRef={bellRef}
        onMarkAllRead={handleMarkAllRead}
      />
    </>
  );
}
