"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  header,
  placeholder = "Select...",
  className = "",
  menuWidth = "min-w-full",
  align = "left",
  position = "auto",
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listboxId = React.useId();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const isFullWidth = className.includes("w-full");

  return (
    <div
      ref={containerRef}
      className={`relative text-left ${
        isFullWidth ? "w-full block" : "inline-block shrink-0"
      }`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel || header || placeholder}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-control border bg-app-surface text-xs text-app-primary cursor-pointer transition-app shadow-2xs select-none ${
          isOpen
            ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
            : "border-app hover:border-app-hover"
        } ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.dotClass && (
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${selectedOption.dotClass}`} />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-app-subtle">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={11}
          className={`text-app-muted shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={`absolute ${
            position === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${
            align === "right" ? "right-0" : "left-0"
          } ${menuWidth} max-w-[calc(100vw-2rem)] max-h-64 overflow-y-auto p-1 rounded-control bg-app-surface/95 backdrop-blur-md border border-app shadow-xl z-50 elevation-overlay scrollbar-none`}
        >
          {header && (
            <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-app-subtle select-none">
              {header}
            </div>
          )}

          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-control text-xs text-left transition-app cursor-pointer ${
                  isSelected
                    ? "bg-app-subtle text-app-primary font-medium"
                    : "text-app-muted hover:text-app-primary hover:bg-app-subtle/70"
                }`}
              >
                {opt.dotClass && (
                  <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dotClass}`} />
                )}
                {opt.icon && (
                  <span className="shrink-0 text-app-subtle">{opt.icon}</span>
                )}
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    size={12}
                    className="ml-auto text-app-primary shrink-0"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
