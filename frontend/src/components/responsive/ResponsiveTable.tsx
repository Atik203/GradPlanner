"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-media-query";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  mobileCardTitle?: (row: T) => React.ReactNode;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data available.",
  mobileCardTitle,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((row) => (
          <div key={keyExtractor(row)} className="rounded-lg border border-border bg-card p-4 space-y-2">
            {mobileCardTitle && (
              <div className="font-semibold text-sm text-foreground mb-1">
                {mobileCardTitle(row)}
              </div>
            )}
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.header} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">{col.header}</span>
                  <span className="text-foreground text-right truncate">{col.accessor(row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: render as table
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="sticky top-0 z-10 text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 font-medium ${col.hideOnMobile ? "" : ""} ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`px-4 py-3 ${col.hideOnMobile ? "" : ""} ${col.className || ""}`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
