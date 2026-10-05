"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Sun,
  Moon,
  Plus,
  Download,
  Database,
  Menu,
  X,
  CalendarCheck,
  History,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar({
  onOpenAddModal,
  onSeedData,
  onExportCSV,
  onOpenLogsModal,
  theme,
  toggleTheme,
  viewMode,
  setViewMode,
  leadCount = 0,
  isSeeding = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-app bg-app-surface/90 backdrop-blur-sm transition-app">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
        {/* Left: Product & Workspace Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-app-subtle border border-app text-app-primary shadow-xs">
            <CalendarCheck size={16} className="text-[var(--accent)]" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm sm:type-base text-app-primary tracking-tight truncate">
              <span className="sm:hidden">Lead Manager</span>
              <span className="hidden sm:inline">Event Lead Manager</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSeedData}
            disabled={isSeeding}
            title="Load demo conference data"
            className="type-xs text-app-muted hover:text-app-primary"
          >
            {isSeeding ? (
              <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
            ) : (
              <Database size={14} />
            )}
            <span className="hidden lg:inline">{isSeeding ? "Loading..." : "Demo Data"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenLogsModal}
            title="View system update logs and audit trail"
            className="type-xs text-app-muted hover:text-app-primary"
          >
            <History size={14} className="text-[var(--accent)]" />
            <span className="hidden md:inline">Update Logs</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExportCSV}
            title="Export CSV"
            className="type-xs text-app-muted hover:text-app-primary"
          >
            <Download size={14} />
            <span className="hidden lg:inline">Export</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 text-app-muted hover:text-app-primary"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onOpenAddModal}
            className="gap-1.5 h-8 px-3 font-medium"
          >
            <Plus size={15} />
            <span>New Lead</span>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={onOpenAddModal}
            className="h-8 px-2.5 text-xs font-medium"
          >
            <Plus size={14} />
            <span>New</span>
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8.5 w-8.5 min-h-[34px] min-w-[34px] items-center justify-center rounded-control border border-app bg-app-subtle text-app-primary cursor-pointer transition-app"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-app bg-app-surface px-4 py-3 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-app">
            <span className="type-xs text-app-muted">View Mode</span>
            <div className="flex items-center rounded-control border border-app bg-app-subtle p-0.5">
              <button
                onClick={() => {
                  setViewMode("table");
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-control type-xs min-h-[44px] ${
                  viewMode === "table" ? "bg-app-surface text-app-primary font-medium" : "text-app-muted"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => {
                  setViewMode("grid");
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-control type-xs min-h-[44px] ${
                  viewMode === "grid" ? "bg-app-surface text-app-primary font-medium" : "text-app-muted"
                }`}
              >
                Cards
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="mobile"
              onClick={toggleTheme}
              className="w-full justify-start type-xs"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </Button>

            <Button
              variant="outline"
              size="mobile"
              disabled={isSeeding}
              onClick={() => {
                onSeedData();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start type-xs"
            >
              {isSeeding ? (
                <Loader2 size={15} className="animate-spin text-[var(--accent)]" />
              ) : (
                <Database size={15} />
              )}
              <span>{isSeeding ? "Loading Demo Leads..." : "Demo Leads"}</span>
            </Button>

            <Button
              variant="outline"
              size="mobile"
              onClick={() => {
                if (onOpenLogsModal) onOpenLogsModal();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start type-xs col-span-2 text-app-primary"
            >
              <History size={15} className="text-[var(--accent)]" />
              <span>Update Logs & Activity</span>
            </Button>

            <Button
              variant="outline"
              size="mobile"
              onClick={() => {
                onExportCSV();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start type-xs col-span-2"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
