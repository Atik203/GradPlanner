"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCheck, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { notificationApi } from "@/lib/api";
import { useAppDispatch } from "@/lib/store/store";
import { setUnreadCount } from "@/lib/store/slices/notificationSlice";
import { NotificationItem } from "./NotificationItem";
import { NotificationEmptyState } from "./NotificationEmptyState";
import type { NotificationItem as NotificationItemType } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onMarkAllRead: () => void;
}

export function NotificationPanel({ open, onOpenChange, onMarkAllRead }: Props) {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list();
      setNotifications(res.notifications);
      setTotal(res.total);
      dispatch(setUnreadCount(res.notifications.filter((n) => !n.isRead).length));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const handleRead = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClearAll = useCallback(async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
      setTotal(0);
      dispatch(setUnreadCount(0));
    } catch {
      // silent
    }
  }, [dispatch]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col gap-0 safe-bottom">
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-base">Notifications</SheetTitle>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={handleRead} />
              ))}
            </div>
          )}
        </div>

        {total > 20 && (
          <div className="px-4 py-2 border-t text-center text-[10px] text-muted-foreground/60 shrink-0">
            Showing 20 of {total} notifications
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
