import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };

export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-muted/60",
        sizes[size],
        className
      )}
      aria-hidden="true"
    />
  );
}
