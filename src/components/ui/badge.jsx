import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "neutral", children, ...props }) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-control type-xs font-medium border leading-none tracking-normal";

  const variants = {
    neutral:
      "bg-app-subtle text-app-muted border-app",
    accent:
      "bg-[var(--accent-subtle)] text-[var(--accent-fg)] border-[var(--accent)]",
    success:
      "bg-[var(--status-success-bg)] text-[var(--status-success-fg)] border-[var(--status-success-border)]",
    warning:
      "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border-[var(--status-warning-border)]",
    error:
      "bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border-[var(--status-error-border)]",
    info:
      "bg-[var(--status-info-bg)] text-[var(--status-info-fg)] border-[var(--status-info-border)]",
  };

  return (
    <span className={cn(baseStyles, variants[variant] || variants.neutral, className)} {...props}>
      {children}
    </span>
  );
}
