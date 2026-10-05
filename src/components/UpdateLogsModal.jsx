"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Search,
  RotateCcw,
  ArrowRight,
  User,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Filter,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

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

function getLogActionConfig(actionType) {
  switch (actionType) {
    case "created":
      return {
        label: "Lead Intake",
        dotColor: "bg-sky-500",
        badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
      };
    case "stage_change":
      return {
        label: "Stage Shift",
        dotColor: "bg-blue-500",
        badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
      };
    case "priority_change":
      return {
        label: "Priority",
        dotColor: "bg-amber-500",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
      };
    case "note_updated":
      return {
        label: "Notes Edit",
        dotColor: "bg-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
      };
    case "ai_generated":
      return {
        label: "AI Outreach",
        dotColor: "bg-purple-500",
        badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
      };
    case "details_updated":
    default:
      return {
        label: "Profile Edit",
        dotColor: "bg-zinc-400",
        badgeClass: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/25",
      };
  }
}

const ACTION_FILTERS = [
  { id: "all", label: "All Updates" },
  { id: "stage_change", label: "Stage Shifts" },
  { id: "ai_generated", label: "AI Outreach" },
  { id: "priority_change", label: "Priority" },
  { id: "note_updated", label: "Notes" },
  { id: "created", label: "Intake" },
];

export default function UpdateLogsModal({ isOpen, onClose, onSelectLead }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getRecentLogs(150);
      setLogs(res.data || []);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, fetchLogs]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      actionFilter === "all" || log.action_type === actionFilter;

    if (!matchesAction) return false;

    if (!search.trim()) return true;

    const q = search.trim().toLowerCase();
    const nameMatch = log.lead_name?.toLowerCase().includes(q);
    const companyMatch = log.lead_company?.toLowerCase().includes(q);
    const eventMatch = log.lead_event?.toLowerCase().includes(q);
    const descMatch = log.description?.toLowerCase().includes(q);

    return nameMatch || companyMatch || eventMatch || descMatch;
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Activity & Update Logs"
      subtitle="Complete audit trail of all attendee status updates, notes revisions, and AI outreach generations."
      maxWidth="max-w-3xl"
      footer={
        <div className="w-full flex items-center justify-between gap-3 text-app-subtle type-xs">
          <span>
            Showing <strong className="text-app-primary">{filteredLogs.length}</strong> of {logs.length} logged events
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 px-4">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filter and Search Ribbon */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
          {/* Action Filter Pills */}
          <div className="inline-flex items-center p-0.5 rounded-control bg-app-subtle border border-app gap-0.5 overflow-x-auto scrollbar-none">
            {ACTION_FILTERS.map((tab) => {
              const count =
                tab.id === "all"
                  ? logs.length
                  : logs.filter((l) => l.action_type === tab.id).length;
              const isActive = actionFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActionFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs whitespace-nowrap transition-app cursor-pointer border shrink-0 ${
                    isActive
                      ? "bg-app-surface border-app text-app-primary font-semibold shadow-xs"
                      : "bg-transparent border-transparent text-app-muted hover:text-app-primary"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1 py-0.2 rounded text-[10px] font-medium tabular-nums border ${
                      isActive
                        ? "bg-app-subtle text-app-primary font-semibold border-app"
                        : "bg-app-subtle/50 text-app-muted border-app-subtle"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Reload */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-48">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-app-subtle pointer-events-none"
              />
              <input
                type="text"
                className="filter-input h-8 w-full rounded-control border border-app bg-app-surface text-xs text-app-primary placeholder:text-app-subtle focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-app shadow-xs pl-8 pr-2"
                placeholder="Search updates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchLogs}
              title="Refresh logs"
              className="h-8 w-8 text-app-muted hover:text-app-primary shrink-0"
            >
              <RotateCcw size={13} className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Logs List Container */}
        <div className="border border-app rounded-panel bg-app-surface max-h-[460px] overflow-y-auto scrollbar-thin divide-y divide-app">
          {isLoading ? (
            <div className="p-8 text-center space-y-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-app-subtle border-t-[var(--accent)]" />
              <p className="type-xs text-app-muted">Loading audit records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-app-subtle border border-app text-app-subtle mx-auto mb-2">
                <History size={18} />
              </div>
              <h4 className="type-sm font-medium text-app-primary">No update logs found</h4>
              <p className="type-xs text-app-muted max-w-xs mx-auto">
                No recorded updates match your active search and action filters.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const cfg = getLogActionConfig(log.action_type);

              return (
                <div
                  key={log.id}
                  className="p-3.5 hover:bg-app-subtle/40 transition-app flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-left group"
                >
                  {/* Left: Action Badge, Lead Name & Description */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>

                      {log.lead_name && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectLead) {
                              onClose();
                              onSelectLead(log.lead_id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-app-primary hover:text-[var(--accent)] transition-app cursor-pointer group-hover:underline"
                          title="View attendee profile"
                        >
                          <span>{log.lead_name}</span>
                          {log.lead_company && (
                            <span className="text-app-muted font-normal">
                              ({log.lead_company})
                            </span>
                          )}
                          <ExternalLink size={11} className="opacity-60" />
                        </button>
                      )}

                      {log.lead_event && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-app-subtle px-1.5 py-0.5 rounded bg-app-subtle border border-app">
                          <Calendar size={10} />
                          <span className="truncate max-w-[150px]">{log.lead_event}</span>
                        </span>
                      )}
                    </div>

                    <p className="type-xs text-app-primary leading-relaxed">
                      {log.description}
                    </p>

                    {/* Value Delta Comparison */}
                    {log.previous_value && log.new_value && (
                      <div className="inline-flex items-center gap-2 pt-0.5 text-xs">
                        <span className="px-2 py-0.5 rounded bg-app-subtle border border-app text-app-muted line-through text-[11px]">
                          {log.previous_value}
                        </span>
                        <ArrowRight size={11} className="text-app-subtle shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-app-surface border border-app text-app-primary font-medium text-[11px] shadow-2xs">
                          {log.new_value}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Timestamp */}
                  <div
                    className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 text-app-subtle type-xs shrink-0"
                    title={formatFullDateTime(log.created_at)}
                  >
                    <div className="flex items-center gap-1 text-app-muted font-medium">
                      <Clock size={11} className="text-app-subtle" />
                      <span>{formatRelativeTime(log.created_at)}</span>
                    </div>
                    <span className="text-[10px] text-app-subtle hidden sm:inline tabular-nums">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
