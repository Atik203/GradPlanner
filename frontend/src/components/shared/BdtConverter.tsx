import React from "react";

const BDT_RATE = 120;
const RATE_DISCLAIMER = "Rate as of Jun 2026";

interface BdtConverterProps {
  usd: number | null | undefined;
}

export function BdtConverter({ usd }: BdtConverterProps) {
  if (usd == null || usd <= 0) return null;

  const bdt = Math.round(usd * BDT_RATE);

  return (
    <span className="text-xs text-muted-foreground">
      ≈ ৳{bdt.toLocaleString("en-BD")}/month
      <span className="ml-1 opacity-60">({RATE_DISCLAIMER})</span>
    </span>
  );
}
