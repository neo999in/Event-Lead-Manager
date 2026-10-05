"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-xl",
}) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs transition-app animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "w-full bg-app-surface border border-app rounded-panel elevation-overlay overflow-hidden transition-app animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] shadow-2xl",
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-app">
          <div className="min-w-0 pr-2">
            <h2 className="heading-tight type-base sm:type-lg text-app-primary truncate">{title}</h2>
            {(description || subtitle) && (
              <p className="type-xs sm:type-sm text-app-muted mt-0.5 truncate">{description || subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 sm:h-9 sm:w-9 min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-control text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden scrollbar-thin px-4 sm:px-6 py-4 sm:py-5 flex-1 space-y-4 sm:space-y-5">{children}</div>

        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-app bg-app-subtle/40 flex items-center justify-between gap-2.5 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
