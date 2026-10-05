"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Mail,
  FileText,
  Copy,
  Save,
  Send,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/utils/api";

/**
 * Renders AI-generated markdown text with styled typography.
 * Handles: ### headings, **bold**, * bullets, 1. lists, `code`, ---, blockquotes.
 */
function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-app-primary mt-4 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-app-primary mt-4 mb-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xs font-bold text-app-primary uppercase tracking-wide mt-4 mb-2 first:mt-0">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-xs text-app-primary leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-app-primary">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-app-muted">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1 my-2 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1.5 my-2 pl-1 list-none counter-reset-[item]">{children}</ol>
        ),
        li: ({ children, node, ...props }) => {
          // react-markdown passes index via node.position; use counter via CSS instead
          const isOrdered = node?.parentNode?.tagName === 'ol' ||
            (typeof props?.index === 'number');
          return (
            <li className="flex gap-2.5 text-xs text-app-primary leading-relaxed">
              {isOrdered ? (
                <span className="mt-0.5 shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold text-[10px] leading-none">
                  {(props?.index ?? 0) + 1}
                </span>
              ) : (
                <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-70" />
              )}
              <span>{children}</span>
            </li>
          );
        },
        hr: () => (
          <hr className="my-3 border-app" />
        ),
        code: ({ children }) => (
          <code className="px-1.5 py-0.5 rounded bg-app-subtle text-[var(--accent)] font-mono text-[11px] border border-app">{children}</code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-2 text-app-muted italic text-xs">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const TONE_OPTIONS = [
  { id: "professional", label: "Executive Direct", desc: "Brief, high-signal, enterprise tone" },
  { id: "casual", label: "Warm & Conversational", desc: "Friendly post-conference reconnection" },
  { id: "meeting_request", label: "Direct Meeting Call", desc: "Proposes 15-minute briefing slots" },
  { id: "value_pitch", label: "Solution & Value", desc: "Focuses on their specific business problem" },
];

export default function AIModal({
  isOpen,
  onClose,
  lead,
  onLeadUpdated,
  onCopyText,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("email"); // 'email' | 'summary'
  const [tone, setTone] = useState("professional");
  const [customInstruction, setCustomInstruction] = useState("");
  const [notes, setNotes] = useState(lead?.notes || "");

  const [summary, setSummary] = useState(lead?.ai_summary || "");
  const [emailDraft, setEmailDraft] = useState(lead?.ai_drafted_email || "");
  const [providerInfo, setProviderInfo] = useState(null);

  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
      setSummary(lead.ai_summary || "");
      setEmailDraft(lead.ai_drafted_email || "");
      setProviderInfo(null);
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleGenerateSummary = async () => {
    if (!notes.trim()) {
      showToast("Please enter field interaction notes first.", "error");
      return;
    }

    try {
      setIsLoadingSummary(true);
      const res = await api.summarizeNotes({
        leadId: lead.id,
        notes: notes,
        name: lead.name,
        company: lead.company,
        event: lead.event,
      });

      setSummary(res.summary);
      setProviderInfo({
        provider: res.provider,
        notice: res.notice,
      });
      showToast("Generated executive summary", "success");
    } catch (err) {
      showToast(`Summarization failed: ${err.message}`, "error");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateEmail = async () => {
    try {
      setIsLoadingEmail(true);
      const res = await api.draftFollowUpEmail({
        leadId: lead.id,
        notes: notes,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        event: lead.event,
        tone: tone,
        customInstruction: customInstruction,
      });

      setEmailDraft(res.draft);
      setProviderInfo({
        provider: res.provider,
        notice: res.notice,
      });
      showToast("Outreach email drafted", "success");
    } catch (err) {
      showToast(`Draft generation failed: ${err.message}`, "error");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleSaveToDatabase = async (markContacted = false) => {
    try {
      setIsSaving(true);
      const res = await api.applyAiToLead({
        leadId: lead.id,
        ai_summary: summary,
        ai_drafted_email: emailDraft,
        notes: notes,
        markAsContacted: markContacted,
      });

      onLeadUpdated(res.data);
      showToast(
        markContacted
          ? "Saved and status updated to Contacted"
          : "Saved intelligence to attendee record",
        "success"
      );
    } catch (err) {
      showToast(`Save failed: ${err.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text) => {
    onCopyText(text, "Copied to clipboard");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Outreach Assistant: ${lead.name}`}
      description={`${lead.company || "Independent"} at ${lead.event || "Conference"}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center rounded-control border border-app bg-app-subtle p-1">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-control type-xs font-medium transition-app cursor-pointer min-h-[36px] ${
              activeTab === "email"
                ? "bg-app-surface text-app-primary border border-app shadow-none"
                : "text-app-muted hover:text-app-primary"
            }`}
          >
            <Mail size={14} />
            <span>Follow-up email</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-control type-xs font-medium transition-app cursor-pointer min-h-[36px] ${
              activeTab === "summary"
                ? "bg-app-surface text-app-primary border border-app shadow-none"
                : "text-app-muted hover:text-app-primary"
            }`}
          >
            <FileText size={14} />
            <span>Executive briefing</span>
          </button>
        </div>

        {providerInfo?.notice && (
          <div className="flex items-center gap-2 p-3 rounded-control bg-app-subtle border border-app type-xs text-app-muted">
            <AlertCircle size={15} className="shrink-0 text-app-subtle" />
            <span>{providerInfo.notice}</span>
          </div>
        )}

        {/* Tab: Executive Summary */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="type-xs font-medium text-app-muted flex items-center justify-between">
                <span>Field interaction notes</span>
                <span className="text-app-subtle font-normal">
                  Context used to generate briefing
                </span>
              </label>
              <Textarea
                rows={3}
                placeholder="Discussion takeaways, requirements, team scope..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={handleGenerateSummary}
              disabled={isLoadingSummary || !notes.trim()}
              className="w-full"
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                  <span>Synthesizing notes...</span>
                </>
              ) : (
                <>
                  <FileText size={15} className="text-[var(--accent)]" />
                  <span>{summary ? "Regenerate Briefing" : "Generate Executive Briefing"}</span>
                </>
              )}
            </Button>

            {isLoadingSummary && (
              <div className="space-y-2 p-4 rounded-control border border-app bg-app-subtle/30">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}

            {summary && !isLoadingSummary && (
              <div className="space-y-2 pt-2 border-t border-app">
                <div className="flex items-center justify-between">
                  <span className="type-xs font-medium text-app-subtle">
                    Key takeaways and recommended next steps
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(summary)}
                    className="h-7 px-2 type-xs"
                  >
                    {isCopied ? (
                      <Check size={13} className="text-[var(--status-success-fg)]" />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>Copy</span>
                  </Button>
                </div>
                <div className="rounded-control border border-app bg-app-subtle/50 p-4 leading-relaxed">
                  <MarkdownContent content={summary} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Follow-up Email */}
        {activeTab === "email" && (
          <div className="space-y-4">
            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="type-xs font-medium text-app-muted">
                Outreach tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`flex flex-col text-left p-2.5 rounded-control border type-xs transition-app cursor-pointer ${
                      tone === t.id
                        ? "bg-app-subtle border-[var(--accent)] text-app-primary font-medium ring-1 ring-[var(--accent)]"
                        : "bg-app-surface border-app text-app-muted hover:border-app-strong"
                    }`}
                  >
                    <span className="font-semibold text-app-primary">{t.label}</span>
                    <span className="type-xs text-app-subtle mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction */}
            <div className="space-y-1">
              <label className="type-xs font-medium text-app-muted">
                Specific context or instructions (optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Propose Tuesday 3:00 PM IST, mention the Bengaluru AI pavilion discussion..."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={handleGenerateEmail}
              disabled={isLoadingEmail}
              className="w-full"
            >
              {isLoadingEmail ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                  <span>Drafting tailored outreach...</span>
                </>
              ) : (
                <>
                  <Mail size={15} className="text-[var(--accent)]" />
                  <span>{emailDraft ? "Regenerate Email Draft" : "Draft Outreach Email"}</span>
                </>
              )}
            </Button>

            {isLoadingEmail && (
              <div className="space-y-2 p-4 rounded-control border border-app bg-app-subtle/30">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {emailDraft && !isLoadingEmail && (
              <div className="space-y-2 pt-2 border-t border-app">
                <div className="flex items-center justify-between">
                  <span className="type-xs font-medium text-app-subtle">
                    Generated email draft
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(emailDraft)}
                      className="h-7 px-2 type-xs"
                    >
                      {isCopied ? (
                        <Check size={13} className="text-[var(--status-success-fg)]" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>Copy</span>
                    </Button>
                    <a
                      href={`mailto:${lead.email}?body=${encodeURIComponent(emailDraft)}`}
                      className="inline-flex items-center gap-1.5 h-7 px-2 rounded-control bg-app-subtle hover:bg-app-muted text-app-primary type-xs border border-app transition-app"
                    >
                      <Send size={12} />
                      <span>Open in Mail</span>
                    </a>
                  </div>
                </div>
                <div className="rounded-control border border-app bg-app-subtle/50 p-4 leading-relaxed">
                  <MarkdownContent content={emailDraft} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Action Controls */}
        <div className="pt-4 border-t border-app flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSaveToDatabase(false)}
              disabled={isSaving || (!summary && !emailDraft)}
            >
              <Save size={15} />
              <span>Save to Record</span>
            </Button>

            {emailDraft && lead.follow_up_status !== "Contacted" && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleSaveToDatabase(true)}
                disabled={isSaving}
              >
                <span>Save & Mark Contacted</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
