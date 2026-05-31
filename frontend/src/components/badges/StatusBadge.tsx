import React from 'react';
import { ApplicationStatus, ProfessorStatus, DocumentStatus } from '@/types';

type AnyStatus = ApplicationStatus | ProfessorStatus | DocumentStatus;

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let badgeClasses = 'text-[10px] font-bold px-2 py-0.5 rounded-full ';

  // Success variants
  if (['OFFER_RECEIVED', 'ACCEPTED', 'REPLIED_POSITIVE', 'OBTAINED'].includes(status)) {
    badgeClasses += 'bg-[var(--success)]/15 text-[var(--success)]';
  } 
  // Danger variants
  else if (['REJECTED', 'REPLIED_NEGATIVE', 'EXPIRED'].includes(status)) {
    badgeClasses += 'bg-destructive/15 text-destructive';
  } 
  // Warning/In-Progress variants
  else if (['IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_REPLY', 'INTERVIEWED'].includes(status)) {
    badgeClasses += 'bg-[var(--warning)]/15 text-[var(--warning)]';
  } 
  // Default/Neutral variants
  else {
    badgeClasses += 'bg-muted text-muted-foreground';
  }

  const label = status.replace(/_/g, ' ');

  return (
    <span className={`${badgeClasses} ${className}`.trim()}>
      {label}
    </span>
  );
}
