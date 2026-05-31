import React from 'react';
import { Tier } from '@/types';

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  let badgeClasses = 'text-[10px] font-bold px-2 py-0.5 rounded-full ';

  switch (tier) {
    case 'DREAM':
      badgeClasses += 'bg-[var(--info)]/15 text-[var(--info)]';
      break;
    case 'MATCH':
      badgeClasses += 'bg-[var(--success)]/15 text-[var(--success)]';
      break;
    case 'SAFETY':
      badgeClasses += 'bg-[var(--warning)]/15 text-[var(--warning)]';
      break;
    default:
      badgeClasses += 'bg-muted text-muted-foreground';
  }

  return (
    <span className={`${badgeClasses} ${className}`.trim()}>
      {tier}
    </span>
  );
}
