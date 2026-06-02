import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowLeft } from "lucide-react";

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export function SectionHeader({ icon: Icon, title, description, backHref, backLabel }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      {backHref && (
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel || "Back"}
        </Link>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
        {Icon && <Icon className="h-7 w-7 text-primary" />}
        {title}
      </h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
