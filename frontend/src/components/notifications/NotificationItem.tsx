"use client";

import React from "react";
import {
  Clock,
  BellOff,
  FileText,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationApi } from "@/lib/api";
import { useAppDispatch } from "@/lib/store/store";
import { decrementUnreadCount } from "@/lib/store/slices/notificationSlice";
import type { NotificationItem as NotificationItemType } from "@/types";

const TYPE_ICONS: Record<string, LucideIcon> = {
  DEADLINE_APPROACHING: Clock,
  DEADLINE_URGENT: AlertTriangle,
  FOLLOW_UP_DUE: MessageSquare,
  FOLLOW_UP_LIMIT: BellOff,
  DOCUMENT_EXPIRING: FileText,
  PROFILE_INCOMPLETE: UserCheck,
  APPLICATION_UPDATE: CheckCircle2,
  SYSTEM: CheckCircle2,
};

const TYPE_COLORS: Record<string, string> = {
  DEADLINE_APPROACHING: "text-amber-500",
  DEADLINE_URGENT: "text-destructive",
  FOLLOW_UP_DUE: "text-blue-500",
  FOLLOW_UP_LIMIT: "text-orange-500",
  DOCUMENT_EXPIRING: "text-yellow-500",
  PROFILE_INCOMPLETE: "text-violet-500",
  APPLICATION_UPDATE: "text-emerald-500",
  SYSTEM: "text-muted-foreground",
};

interface Props {
  notification: NotificationItemType;
  onRead: () => void;
}

export function NotificationItem({ notification, onRead }: Props) {
  const dispatch = useAppDispatch();
  const Icon = TYPE_ICONS[notification.type] || CheckCircle2;
  const colorClass = TYPE_COLORS[notification.type] || "text-muted-foreground";

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await notificationApi.markRead(notification.id);
        dispatch(decrementUnreadCount());
      } catch {
        // silent
      }
    }
    onRead();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 text-left w-full transition-colors hover:bg-muted/60 cursor-pointer border-0",
        !notification.isRead && "bg-muted/30"
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", colorClass)} aria-hidden />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.isRead ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          {new Date(notification.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {!notification.isRead && (
        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );
}
