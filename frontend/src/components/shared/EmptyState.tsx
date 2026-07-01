import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryAction?: { label: string; onAction: () => void };
  illustration?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryAction,
  illustration,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-muted/20 ${className}`}
    >
      {illustration ?? (
        <div className="bg-muted p-4 rounded-full mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-section font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {actionLabel}
          </Button>
        )}
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {actionLabel}
            </Button>
          </Link>
        )}
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onAction}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
