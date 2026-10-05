"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({ isOpen, onClose, title, subtitle, children, footer }) {
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
      className="fixed inset-0 z-50 flex justify-end bg-black/50 transition-app animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:w-[480px] h-full bg-app-surface border-l border-app elevation-overlay flex flex-col transition-app animate-in slide-in-from-right duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-app">
          <div>
            <h2 className="heading-tight type-lg text-app-primary">{title}</h2>
            {subtitle && (
              <p className="type-sm text-app-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-control text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-app bg-app-subtle/50 flex items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
