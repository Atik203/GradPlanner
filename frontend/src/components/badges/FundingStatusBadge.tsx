import React from 'react';
import { FundingStatus } from '@/types';

interface FundingStatusBadgeProps {
  status: FundingStatus;
  className?: string;
}

export function FundingStatusBadge({ status, className = '' }: FundingStatusBadgeProps) {
  let badgeClasses = 'text-[10px] font-bold px-2 py-0.5 rounded-full ';

  switch (status) {
    case 'FUNDED':
      badgeClasses += 'bg-[var(--success)]/15 text-[var(--success)]';
      break;
    case 'LIKELY':
      badgeClasses += 'bg-[var(--info)]/15 text-[var(--info)]';
      break;
    case 'UNLIKELY':
      badgeClasses += 'bg-destructive/15 text-destructive';
      break;
    case 'UNKNOWN':
    default:
      badgeClasses += 'bg-muted text-muted-foreground';
  }

  return (
    <span className={`${badgeClasses} ${className}`.trim()}>
      {status}
    </span>
  );
}
