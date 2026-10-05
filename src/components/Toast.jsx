"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        let icon = (
          <Info
            size={16}
            className="text-[var(--status-info-fg)] shrink-0 mt-0.5"
          />
        );
        let borderClass = "border-[var(--status-info-border)]";
        let bgClass = "bg-app-surface";

        if (toast.type === "success") {
          icon = (
            <CheckCircle2
              size={16}
              className="text-[var(--status-success-fg)] shrink-0 mt-0.5"
            />
          );
          borderClass = "border-[var(--status-success-border)]";
        } else if (toast.type === "error") {
          icon = (
            <AlertCircle
              size={16}
              className="text-[var(--status-error-fg)] shrink-0 mt-0.5"
            />
          );
          borderClass = "border-[var(--status-error-border)]";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-control border ${borderClass} ${bgClass} elevation-overlay type-xs text-app-primary animate-in slide-in-from-bottom-2 duration-150 transition-app`}
          >
            {icon}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="flex h-5 w-5 items-center justify-center rounded-control text-app-subtle hover:text-app-primary cursor-pointer shrink-0 transition-app"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
