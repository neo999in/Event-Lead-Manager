"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Copy,
  Check,
  Trash2,
  Edit2,
  Send,
  Sparkles,
  History,
  ArrowRight,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
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

function getLogActionConfig(actionType) {
  switch (actionType) {
    case "created":
      return {
        label: "Intake",
        dotColor: "bg-sky-500",
        badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
      };
    case "stage_change":
      return {
        label: "Stage Shift",
        dotColor: "bg-blue-500",
        badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      };
    case "priority_change":
      return {
        label: "Priority",
        dotColor: "bg-amber-500",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      };
    case "note_updated":
      return {
        label: "Notes Edit",
        dotColor: "bg-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      };
    case "ai_generated":
      return {
        label: "AI Outreach",
        dotColor: "bg-purple-500",
        badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      };
    case "details_updated":
    default:
      return {
        label: "Profile Edit",
        dotColor: "bg-zinc-400",
        badgeClass: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20",
      };
  }
}

const STAGES = [
  { id: "Pending", label: "Pending" },
  { id: "Contacted", label: "Contacted" },
  { id: "Meeting Scheduled", label: "Meeting Set" },
  { id: "Qualified", label: "Qualified" },
  { id: "Closed", label: "Closed" },
];

export default function LeadDrawer({
  isOpen,
  onClose,
  lead,
  onOpenEditModal,
  onOpenAIModal,
  onDeleteLead,
  onStatusChange,
  onMarkContacted,
  onCopyText,
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !lead) return null;

  const handleCopy = (text, key) => {
    onCopyText(text, `Copied ${key} to clipboard`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formattedDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const handleStageClick = (stageId) => {
    if (onStatusChange) {
      onStatusChange(lead.id, stageId);
    } else if (onMarkContacted && stageId === "Contacted") {
      onMarkContacted(lead.id);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={lead.name}
      subtitle={lead.company || "Independent Attendee"}
      maxWidth="max-w-2xl"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenEditModal(lead);
            }}
            className="flex-1"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenAIModal(lead);
            }}
            className="flex-1"
          >
            <Mail size={14} className="text-[var(--accent)]" />
            <span>Outreach</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onClose();
              onDeleteLead(lead.id, lead.name);
            }}
            aria-label="Delete attendee"
            className="px-3"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      }
    >
      {/* Interactive Pipeline Stage Stepper */}
      <div className="space-y-1.5 pb-2">
        <label className="type-xs font-medium text-app-subtle">
          Pipeline stage
        </label>
        <div className="flex items-center gap-1 p-1 rounded-control bg-app-subtle border border-app w-full overflow-x-auto scrollbar-none">
          {STAGES.map((stage) => {
            const isActive = lead.follow_up_status === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageClick(stage.id)}
                className={`min-w-[62px] sm:min-w-0 flex-1 py-1.5 px-1 rounded-control type-xs text-center transition-app cursor-pointer truncate ${
                  isActive
                    ? "bg-app-surface border border-app text-app-primary font-semibold shadow-xs"
                    : "text-app-muted hover:text-app-primary"
                }`}
                title={`Set stage to ${stage.label}`}
              >
                {stage.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Quick Action Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <a
          href={`mailto:${lead.email}`}
          className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-control bg-app-surface hover:bg-app-subtle border border-app text-app-primary type-xs font-medium transition-app"
        >
          <Mail size={14} className="text-[var(--accent)]" />
          <span className="truncate">Email {lead.name.split(" ")[0]}</span>
        </a>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            onClose();
            onOpenAIModal(lead);
          }}
          className="h-9 px-3.5 type-xs justify-center shrink-0"
        >
          <Sparkles size={14} />
          <span>Draft follow-up</span>
        </Button>
      </div>

      {/* Contact Details Card */}
      <div className="rounded-control border border-app bg-app-surface p-3.5 space-y-3 type-sm">
        {/* Email */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-app-muted truncate">
            <Mail size={15} className="shrink-0 text-app-subtle" />
            <a
              href={`mailto:${lead.email}`}
              className="text-app-primary hover:underline truncate type-xs font-medium"
            >
              {lead.email}
            </a>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(lead.email, "email")}
            className="flex h-6 w-6 items-center justify-center rounded-control text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app cursor-pointer"
            title="Copy email"
          >
            {copiedKey === "email" ? (
              <Check size={13} className="text-[var(--status-success-fg)]" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>

        {/* Phone */}
        {lead.phone && (
          <div className="flex items-center justify-between gap-2 border-t border-app pt-2.5">
            <div className="flex items-center gap-2.5 text-app-muted">
              <Phone size={15} className="shrink-0 text-app-subtle" />
              <a href={`tel:${lead.phone}`} className="text-app-primary type-xs hover:underline">
                {lead.phone}
              </a>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(lead.phone, "phone")}
              className="flex h-6 w-6 items-center justify-center rounded-control text-app-muted hover:text-app-primary hover:bg-app-subtle transition-app cursor-pointer"
              title="Copy phone"
            >
              {copiedKey === "phone" ? (
                <Check size={13} className="text-[var(--status-success-fg)]" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        )}

        {/* Event */}
        <div className="flex items-center gap-2.5 text-app-muted border-t border-app pt-2.5 type-xs">
          <Calendar size={15} className="shrink-0 text-app-subtle" />
          <span>
            Met at: <strong className="text-app-primary font-medium">{lead.event || "General Intake"}</strong>
          </span>
        </div>

        {/* Priority, Captured & Last Updated */}
        <div className="flex flex-wrap items-center justify-between gap-2 type-xs text-app-subtle border-t border-app pt-2.5">
          <div className="flex items-center gap-1.5" title={lead.created_at ? new Date(lead.created_at).toLocaleString() : ""}>
            <Clock size={13} />
            <span>Captured {formattedDate(lead.created_at)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-app-muted"
              title={lead.updated_at ? new Date(lead.updated_at).toLocaleString() : ""}
            >
              Updated <strong className="text-app-primary font-medium">{formatRelativeTime(lead.updated_at)}</strong>
            </span>
            <span className="font-medium text-app-muted">{lead.priority || "Medium"} priority</span>
          </div>
        </div>
      </div>

      {/* Field Notes */}
      <div className="space-y-1.5">
        <label className="type-xs font-medium text-app-subtle">
          Conversation notes & context
        </label>
        <div className="rounded-control border border-app bg-app-subtle/40 p-3.5 type-xs text-app-primary leading-relaxed whitespace-pre-wrap">
          {lead.notes || <span className="text-app-subtle italic">No interaction notes recorded.</span>}
        </div>
      </div>

      {/* Executive Briefing */}
      {lead.ai_summary && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="type-xs font-medium text-app-subtle">
              Executive briefing
            </label>
            <button
              type="button"
              onClick={() => handleCopy(lead.ai_summary, "summary")}
              className="flex items-center gap-1 type-xs text-app-muted hover:text-app-primary cursor-pointer"
            >
              {copiedKey === "summary" ? (
                <Check size={12} className="text-[var(--status-success-fg)]" />
              ) : (
                <Copy size={12} />
              )}
              <span>Copy</span>
            </button>
          </div>
          <div className="rounded-control border border-app bg-app-subtle/40 p-3.5 type-xs text-app-primary leading-relaxed whitespace-pre-wrap">
            {lead.ai_summary}
          </div>
        </div>
      )}

      {/* Follow-up Email Draft */}
      {lead.ai_drafted_email && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="type-xs font-medium text-app-subtle">
              Follow-up email draft
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(lead.ai_drafted_email, "draft")}
                className="flex items-center gap-1 type-xs text-app-muted hover:text-app-primary cursor-pointer"
              >
                {copiedKey === "draft" ? (
                  <Check size={12} className="text-[var(--status-success-fg)]" />
                ) : (
                  <Copy size={12} />
                )}
                <span>Copy</span>
              </button>
              <a
                href={`mailto:${lead.email}?body=${encodeURIComponent(lead.ai_drafted_email)}`}
                className="flex items-center gap-1 type-xs text-[var(--accent)] hover:underline"
              >
                <Send size={11} />
                <span>Send</span>
              </a>
            </div>
          </div>
          <div className="rounded-control border border-app bg-app-subtle/40 p-3.5 type-xs text-app-primary leading-relaxed whitespace-pre-wrap">
            {lead.ai_drafted_email}
          </div>
        </div>
      )}

      {/* Activity & Update Logs Timeline */}
      <div className="space-y-3 pt-3 border-t border-app">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={14} className="text-[var(--accent)]" />
            <h4 className="type-xs font-semibold uppercase tracking-wider text-app-subtle">
              Update Logs & History
            </h4>
          </div>
          <span className="type-xs px-2 py-0.5 rounded-full bg-app-subtle border border-app text-app-muted tabular-nums">
            {(lead.logs || []).length} {lead.logs?.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {lead.logs && lead.logs.length > 0 ? (
          <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-app">
            {lead.logs.map((log) => {
              const cfg = getLogActionConfig(log.action_type);
              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node */}
                  <span
                    className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-app-surface ${cfg.dotColor}`}
                  />
                  <div className="rounded-control border border-app bg-app-subtle/30 p-2.5 space-y-1 hover:bg-app-subtle/50 transition-app">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                      <span
                        className="text-[11px] text-app-subtle tabular-nums shrink-0"
                        title={new Date(log.created_at).toLocaleString()}
                      >
                        {formatRelativeTime(log.created_at)}
                      </span>
                    </div>
                    <p className="type-xs text-app-primary leading-normal">
                      {log.description}
                    </p>
                    {log.previous_value && log.new_value && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-app-subtle border border-app text-app-muted line-through opacity-75">
                          {log.previous_value}
                        </span>
                        <ArrowRight size={11} className="text-app-subtle shrink-0" />
                        <span className="px-1.5 py-0.5 rounded bg-app-surface border border-app text-app-primary font-medium">
                          {log.new_value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-control border border-app bg-app-subtle/20 p-4 text-center">
            <p className="type-xs text-app-muted italic">
              No historical updates logged yet for this attendee.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

