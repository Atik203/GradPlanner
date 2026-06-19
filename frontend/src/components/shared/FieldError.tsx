"use client";

/**
 * FieldError.tsx — Inline form-field error message.
 *
 * Used below inputs, selects, and checkboxes to display validation errors
 * from react-hook-form / Zod or from backend field-level errors.
 */

import React from "react";
import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  message?: string | null;
  className?: string;
  /** Optional id for aria-describedby on the associated input. */
  id?: string;
}

export function FieldError({ message, className = "", id }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={`mt-1 flex items-center gap-1 text-xs font-medium text-destructive ${className}`}
    >
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
