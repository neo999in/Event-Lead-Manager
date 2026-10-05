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
  Clock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatRelativeTime(dateString) {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 0) return "Just now";
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "1d ago";
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatFullDateTime(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

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

export default function LeadTable({
  leads = [],
  deletingLeadId = null,
  updatingLeadId = null,
  onOpenDrawer,
  onOpenEditModal,
  onOpenAIModal,
  onDeleteLead,
  onQuickStatusChange,
  onResetFilters,
  onOpenAddModal,
}) {
  const [openStageMenuId, setOpenStageMenuId] = React.useState(null);
  const [hoveredNotes, setHoveredNotes] = React.useState(null);

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
      <div className="w-full border border-app rounded-panel p-12 text-center flex flex-col items-center justify-center bg-app-surface">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-app-subtle border border-app text-app-subtle mb-3">
          <Inbox size={18} />
        </div>
        <h3 className="heading-tight type-base text-app-primary">
          No contacts match your query
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
    <div className="w-full">
      {/* Desktop Editorial Table (>= 1024px) */}
      <div className="hidden lg:block w-full bg-app-surface border border-app rounded-panel overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[960px] text-left border-collapse">
          <thead>
            <tr className="border-b border-app bg-app-subtle/30 text-app-subtle type-xs font-medium">
              <th className="py-3 px-5 font-medium w-60 first:rounded-tl-panel">Attendee</th>
              <th className="py-3 px-5 font-medium w-48">Event</th>
              <th className="py-3 px-5 font-medium" title="Hover over row notes to view complete interaction text">Notes & Context</th>
              <th className="py-3 px-5 font-medium w-40">Pipeline Stage</th>
              <th className="py-3 px-5 font-medium w-24">Priority</th>
              <th className="py-3 px-5 font-medium w-32">Last Updated</th>
              <th className="py-3 px-5 font-medium text-right w-44 last:rounded-tr-panel">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {leads.map((lead, index) => {
              const statusCfg = STATUS_CONFIG[lead.follow_up_status] || STATUS_CONFIG.Pending;
              const isStageMenuOpen = openStageMenuId === lead.id;
              // Open upwards if row is near bottom of table to avoid overflowing/overlapping
              const isNearBottom = index >= Math.max(leads.length - 2, 2);
              const isLastRow = index === leads.length - 1;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onOpenDrawer(lead)}
                  className={`hover:bg-app-subtle/50 transition-app group cursor-pointer ${
                    isStageMenuOpen ? "relative z-40" : "relative z-0"
                  } ${
                    isLastRow ? "[&>td:first-child]:rounded-bl-panel [&>td:last-child]:rounded-br-panel" : ""
                  }`}
                >
                  {/* Attendee Name & Company */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-control bg-app-subtle border border-app type-xs font-semibold text-app-primary">
                        {getInitials(lead.name)}
                      </div>
                      <div className="truncate">
                        <div className="type-sm font-semibold text-app-primary group-hover:text-[var(--accent)] transition-app truncate">
                          {lead.name}
                        </div>
                        <div className="type-xs text-app-muted truncate mt-0.5">
                          {lead.company || "Independent"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Event Met At */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2 text-app-muted type-xs truncate">
                      <Calendar size={13} className="text-app-subtle shrink-0" />
                      <span className="truncate">{lead.event || "General Intake"}</span>
                    </div>
                  </td>

                  {/* Notes & Follow-up Draft Marker */}
                  <td className="py-3.5 px-5">
                    <div
                      onMouseEnter={(e) => {
                        if (!lead.notes) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredNotes({
                          name: lead.name,
                          event: lead.event,
                          text: lead.notes,
                          rect: {
                            top: rect.top,
                            bottom: rect.bottom,
                            left: rect.left,
                            right: rect.right,
                          },
                        });
                      }}
                      onMouseLeave={() => setHoveredNotes(null)}
                      className="cursor-pointer max-w-[280px]"
                    >
                      <div className="type-xs text-app-muted line-clamp-1 hover:text-app-primary transition-app">
                        {lead.notes || <span className="italic text-app-subtle">No notes entered</span>}
                      </div>
                    </div>
                    {lead.ai_drafted_email && (
                      <div className="inline-flex items-center gap-1.5 mt-1 text-app-subtle type-xs">
                        <Mail size={11} className="text-[var(--accent)]" />
                        <span className="text-[var(--accent)] font-medium">Draft ready</span>
                      </div>
                    )}
                  </td>

                  {/* Stage Dropdown (Custom bespoke button with popover, immune to select bugs) */}
                  <td className="py-3.5 px-5 w-44 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div data-stage-menu className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setOpenStageMenuId(openStageMenuId === lead.id ? null : lead.id)}
                        disabled={updatingLeadId === lead.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control border text-xs font-medium cursor-pointer transition-app hover:opacity-90 whitespace-nowrap shadow-2xs ${statusCfg.badgeClass}`}
                        aria-expanded={openStageMenuId === lead.id}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                        <span>{statusCfg.label}</span>
                        {updatingLeadId === lead.id ? (
                          <Loader2 size={11} className="animate-spin opacity-70" />
                        ) : (
                          <ChevronDown
                            size={11}
                            className={`opacity-70 transition-transform duration-150 ${
                              openStageMenuId === lead.id ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {openStageMenuId === lead.id && (
                        <div
                          className={`absolute ${
                            isNearBottom ? "bottom-full mb-1.5" : "top-full mt-1.5"
                          } left-0 w-44 p-1 rounded-control bg-app-surface/95 backdrop-blur-md border border-app shadow-xl z-50 elevation-overlay`}
                        >
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
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-5 w-24 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 type-xs">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          lead.priority === "High"
                            ? "bg-[var(--status-error-fg)]"
                            : lead.priority === "Medium"
                            ? "bg-[var(--status-warning-fg)]"
                            : "bg-app-subtle border border-app-strong"
                        }`}
                      />
                      <span className={lead.priority === "High" ? "text-app-primary font-medium" : "text-app-muted"}>
                        {lead.priority || "Medium"}
                      </span>
                    </div>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-5 w-32 whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1.5 text-app-muted type-xs"
                      title={formatFullDateTime(lead.updated_at)}
                    >
                      <Clock size={12} className="text-app-subtle shrink-0" />
                      <span className="font-medium text-app-primary">
                        {formatRelativeTime(lead.updated_at)}
                      </span>
                    </div>
                  </td>

                  {/* Row Actions (Always visible, polished interactive controls) */}
                  <td className="py-3.5 px-5 text-right w-44 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenAIModal(lead)}
                        title="Draft follow-up email"
                        aria-label="Draft outreach email"
                        className="h-8 w-8 rounded-control text-app-muted hover:text-[var(--accent)] hover:bg-[var(--accent)]/15 transition-app"
                      >
                        <Mail size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenEditModal(lead)}
                        title="Edit lead"
                        aria-label="Edit lead"
                        className="h-8 w-8 rounded-control text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app"
                      >
                        <Edit2 size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteLead(lead.id, lead.name)}
                        disabled={deletingLeadId === lead.id}
                        title="Delete lead"
                        aria-label="Delete lead"
                        className="h-8 w-8 rounded-control text-app-muted hover:text-[var(--status-error-fg)] hover:bg-red-500/15 transition-app"
                      >
                        {deletingLeadId === lead.id ? (
                          <Loader2 size={16} className="animate-spin text-[var(--status-error-fg)]" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenDrawer(lead)}
                        title="Inspect lead details"
                        aria-label="Inspect lead details"
                        className="h-8 w-8 rounded-control text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app"
                      >
                        <ChevronRight size={17} strokeWidth={2.2} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive Card Stream (Tablet 2-col & Mobile 1-col < 1024px) */}
      <div className="block lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {leads.map((lead, index) => {
          const statusCfg = STATUS_CONFIG[lead.follow_up_status] || STATUS_CONFIG.Pending;
          const isMobMenuOpen = openStageMenuId === `mob-${lead.id}`;
          const isNearBottomMob = index >= Math.max(leads.length - 2, 2);

          return (
            <div
              key={lead.id}
              onClick={() => onOpenDrawer(lead)}
              className={`bg-app-surface border border-app rounded-panel p-4 sm:p-5 space-y-3 cursor-pointer hover:border-app-hover transition-app ${
                isMobMenuOpen ? "relative z-30" : "relative z-0"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-app-subtle border border-app type-xs font-semibold text-app-primary">
                    {getInitials(lead.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="type-sm font-semibold text-app-primary truncate">
                      {lead.name}
                    </h4>
                    <p className="type-xs text-app-muted truncate mt-0.5">
                      {lead.company || "Independent"}
                    </p>
                  </div>
                </div>

                <div data-stage-menu className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setOpenStageMenuId(isMobMenuOpen ? null : `mob-${lead.id}`)}
                    disabled={updatingLeadId === lead.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control border text-xs font-medium cursor-pointer transition-app whitespace-nowrap shadow-2xs ${statusCfg.badgeClass}`}
                    aria-expanded={isMobMenuOpen}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                    <span>{statusCfg.label}</span>
                    {updatingLeadId === lead.id ? (
                      <Loader2 size={11} className="animate-spin opacity-70" />
                    ) : (
                      <ChevronDown
                        size={11}
                        className={`opacity-70 transition-transform duration-150 ${
                          isMobMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {isMobMenuOpen && (
                    <div
                      className={`absolute ${
                        isNearBottomMob ? "bottom-full mb-1.5" : "top-full mt-1.5"
                      } right-0 w-44 p-1 rounded-control bg-app-surface/95 backdrop-blur-md border border-app shadow-xl z-50 elevation-overlay`}
                    >
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
              </div>

              {/* Event & Priority metadata */}
              <div className="flex flex-wrap items-center gap-2 type-xs text-app-muted">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-control bg-app-subtle border border-app text-app-primary">
                  <Calendar size={12} className="text-app-subtle" />
                  <span className="truncate max-w-[140px] sm:max-w-none">{lead.event || "General Intake"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-control bg-app-subtle border border-app text-app-primary">
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
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-control bg-app-subtle border border-app text-app-muted"
                  title={formatFullDateTime(lead.updated_at)}
                >
                  <Clock size={12} className="text-app-subtle" />
                  <span>{formatRelativeTime(lead.updated_at)}</span>
                </div>
              </div>

              {/* Notes excerpt with full-text hover tooltip */}
              {lead.notes && (
                <div
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredNotes({
                      name: lead.name,
                      event: lead.event,
                      text: lead.notes,
                      rect: {
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right,
                      },
                    });
                  }}
                  onMouseLeave={() => setHoveredNotes(null)}
                  className="cursor-pointer"
                >
                  <p className="type-xs text-app-muted line-clamp-2 bg-app-subtle/40 p-2.5 rounded-control border border-app-subtle leading-relaxed hover:text-app-primary transition-app">
                    {lead.notes}
                  </p>
                </div>
              )}

              {/* Actions row: optimized for touch and flexible width */}
              <div
                className="pt-2.5 mt-0.5 border-t border-app flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  onClick={() => onOpenAIModal(lead)}
                  className="flex-1 h-9 sm:h-10 px-2.5 sm:px-3 type-xs font-medium text-app-primary hover:text-[var(--accent)] hover:border-[var(--accent)] min-w-0"
                >
                  <Mail size={15} className="text-[var(--accent)] shrink-0" />
                  <span className="truncate">Draft Outreach</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onOpenDrawer(lead)}
                  className="px-2.5 sm:px-3 h-9 sm:h-10 min-w-[38px] sm:min-w-[42px] shrink-0 text-app-muted hover:text-app-primary"
                  aria-label="View details"
                >
                  <ChevronRight size={17} strokeWidth={2} />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onOpenEditModal(lead)}
                  className="px-2.5 sm:px-3 h-9 sm:h-10 min-w-[38px] sm:min-w-[42px] shrink-0 text-app-muted hover:text-app-primary"
                  aria-label="Edit"
                >
                  <Edit2 size={15} />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onDeleteLead(lead.id, lead.name)}
                  disabled={deletingLeadId === lead.id}
                  className="px-2.5 sm:px-3 h-9 sm:h-10 min-w-[38px] sm:min-w-[42px] shrink-0 text-app-muted hover:text-[var(--status-error-fg)]"
                  aria-label="Delete"
                >
                  {deletingLeadId === lead.id ? (
                    <Loader2 size={15} className="animate-spin text-[var(--status-error-fg)]" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Viewport-fixed Portal Tooltip - 100% solid background, zero clipping, zero duplicate native tooltip */}
      {hoveredNotes && (
        <div
          style={{
            position: "fixed",
            top: hoveredNotes.rect.top < 230 ? hoveredNotes.rect.bottom + 8 : undefined,
            bottom: hoveredNotes.rect.top >= 230 ? window.innerHeight - hoveredNotes.rect.top + 8 : undefined,
            left: Math.max(16, Math.min(hoveredNotes.rect.left, typeof window !== "undefined" ? window.innerWidth - 380 : 16)),
            maxWidth: "360px",
            width: "max-content",
            zIndex: 99999,
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-strong)",
            boxShadow: "0 14px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border)",
          }}
          className="pointer-events-none p-3.5 rounded-control border text-left animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-app text-[10px] font-semibold uppercase tracking-wider text-app-subtle">
            <span className="text-[var(--accent)] font-bold">Notes & Context</span>
            {hoveredNotes.event && (
              <span className="font-medium normal-case text-app-muted truncate max-w-[180px]">
                {hoveredNotes.event}
              </span>
            )}
          </div>
          <p className="type-xs text-app-primary leading-relaxed whitespace-pre-wrap select-none font-normal">
            {hoveredNotes.text}
          </p>
        </div>
      )}
    </div>
  );
}

