"use client";

import React from "react";
import {
  Calendar,
  Mail,
  Edit2,
  Trash2,
  ChevronRight,
  Inbox,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
  },
  Contacted: {
    label: "Contacted",
    dotClass: "bg-sky-500",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
  },
  "Meeting Scheduled": {
    label: "Meeting Set",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
  },
  Qualified: {
    label: "Qualified",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  },
  Closed: {
    label: "Closed",
    dotClass: "bg-zinc-400 dark:bg-zinc-500",
    badgeClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/25",
  },
};

const STAGES = [
  { id: "Pending", label: "Pending", dotClass: "bg-amber-500" },
  { id: "Contacted", label: "Contacted", dotClass: "bg-sky-500" },
  { id: "Meeting Scheduled", label: "Meeting Set", dotClass: "bg-blue-500" },
  { id: "Qualified", label: "Qualified", dotClass: "bg-emerald-500" },
  { id: "Closed", label: "Closed", dotClass: "bg-zinc-400 dark:bg-zinc-500" },
];

export default function LeadGrid({
  leads = [],
  onOpenDrawer,
  onOpenEditModal,
  onOpenAIModal,
  onDeleteLead,
  onQuickStatusChange,
  onResetFilters,
  onOpenAddModal,
}) {
  const [openStageMenuId, setOpenStageMenuId] = React.useState(null);

  React.useEffect(() => {
    if (!openStageMenuId) return;
    const handleDocClick = (e) => {
      if (e.target.closest("[data-stage-menu]")) return;
      setOpenStageMenuId(null);
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [openStageMenuId]);

  if (!leads || leads.length === 0) {
    return (
      <div className="w-full border border-app rounded-panel p-12 text-center flex flex-col items-center justify-center bg-app-surface shadow-xs">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-app-subtle border border-app text-app-subtle mb-3">
          <Inbox size={18} />
        </div>
        <h3 className="heading-tight type-base text-app-primary">
          No matching contacts
        </h3>
        <p className="type-xs text-app-muted max-w-sm mt-1 mb-5">
          Clear your search query or status filter to reveal all conference attendee records.
        </p>
        <div className="flex items-center gap-2">
          {onResetFilters && (
            <Button variant="outline" size="sm" onClick={onResetFilters} className="type-xs h-8">
              Reset Filters
            </Button>
          )}
          {onOpenAddModal && (
            <Button variant="default" size="sm" onClick={onOpenAddModal} className="type-xs h-8">
              <Plus size={14} />
              <span>New Lead</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
      {leads.map((lead) => {
        const statusCfg = STATUS_CONFIG[lead.follow_up_status] || STATUS_CONFIG.Pending;

        return (
          <div
            key={lead.id}
            onClick={() => onOpenDrawer(lead)}
            className={`bg-app-surface border border-app rounded-panel p-4 sm:p-5 flex flex-col justify-between transition-app hover:border-app-hover cursor-pointer group shadow-xs min-h-[200px] sm:min-h-[220px] ${
              openStageMenuId === lead.id ? "relative z-30" : "relative z-0"
            }`}
          >
            <div>
              {/* Header: Name, Company, Priority */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-app-subtle border border-app type-xs font-semibold text-app-primary">
                    {getInitials(lead.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="type-sm font-semibold text-app-primary group-hover:text-[var(--accent)] transition-app truncate">
                      {lead.name}
                    </h4>
                    <p className="type-xs text-app-muted truncate mt-0.5">
                      {lead.company || "Independent"}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 type-xs text-app-subtle shrink-0">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      lead.priority === "High"
                        ? "bg-[var(--status-error-fg)]"
                        : lead.priority === "Medium"
                        ? "bg-[var(--status-warning-fg)]"
                        : "bg-app-subtle border border-app-strong"
                    }`}
                  />
                  <span>{lead.priority || "Medium"}</span>
                </div>
              </div>

              {/* Event Met At */}
              <div className="mt-4 flex items-center gap-2 type-xs text-app-muted">
                <Calendar size={13} className="text-app-subtle shrink-0" />
                <span className="truncate">{lead.event || "General Intake"}</span>
              </div>

              {/* Notes Excerpt */}
              <div className="mt-4 p-3.5 rounded-control bg-app-subtle/50 border border-app-subtle">
                <p className="type-xs text-app-muted line-clamp-2 leading-relaxed">
                  {lead.notes || "No interaction notes recorded."}
                </p>
                {lead.ai_drafted_email && (
                  <div className="flex items-center gap-1.5 mt-2 text-[var(--accent)] type-xs font-medium">
                    <Mail size={12} />
                    <span>Outreach email drafted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Stage Selector & Quick Actions */}
            <div
              className="mt-5 pt-4 border-t border-app flex items-center justify-between gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div data-stage-menu className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setOpenStageMenuId(openStageMenuId === lead.id ? null : lead.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control border text-xs font-medium cursor-pointer transition-app hover:opacity-90 whitespace-nowrap shadow-2xs ${statusCfg.badgeClass}`}
                  aria-expanded={openStageMenuId === lead.id}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                  <span>{statusCfg.label}</span>
                  <ChevronDown
                    size={11}
                    className={`opacity-70 transition-transform duration-150 ${
                      openStageMenuId === lead.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openStageMenuId === lead.id && (
                  <div className="absolute bottom-full left-0 mb-1.5 w-44 p-1 rounded-control bg-app-surface/95 backdrop-blur-md border border-app shadow-xl z-50 elevation-overlay">
                    <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-app-subtle select-none">
                      Update Stage
                    </div>
                    {STAGES.map((st) => {
                      const isSelected = lead.follow_up_status === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            onQuickStatusChange(lead.id, st.id);
                            setOpenStageMenuId(null);
                          }}
                          className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-control text-xs text-left transition-app cursor-pointer ${
                            isSelected
                              ? "bg-app-subtle text-app-primary font-medium"
                              : "text-app-muted hover:text-app-primary hover:bg-app-subtle/70"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${st.dotClass}`} />
                          <span className="truncate">{st.label}</span>
                          {isSelected && (
                            <Check size={12} className="ml-auto text-app-primary shrink-0" strokeWidth={2.5} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenAIModal(lead)}
                  title="Draft follow-up email"
                  className="h-8 px-2.5 type-xs text-app-muted hover:text-[var(--accent)] hover:bg-[var(--accent)]/15 transition-app"
                >
                  <Mail size={15} className="text-[var(--accent)]" />
                  <span className="ml-1 hidden sm:inline">Outreach</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenEditModal(lead)}
                  title="Edit lead"
                  aria-label="Edit lead"
                  className="h-8 w-8 text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app"
                >
                  <Edit2 size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteLead(lead.id, lead.name)}
                  title="Delete lead"
                  aria-label="Delete lead"
                  className="h-8 w-8 text-app-muted hover:text-[var(--status-error-fg)] hover:bg-red-500/15 transition-app"
                >
                  <Trash2 size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenDrawer(lead)}
                  title="Inspect lead details"
                  aria-label="Inspect lead details"
                  className="h-8 w-8 text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app"
                >
                  <ChevronRight size={17} strokeWidth={2.2} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
