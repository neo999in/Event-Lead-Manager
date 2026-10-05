"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Calendar } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import CustomSelect from "@/components/ui/CustomSelect";

export default function LeadModal({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
  existingEvents = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    event: "",
    notes: "",
    follow_up_status: "Pending",
    priority: "Medium",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        name: leadToEdit.name || "",
        company: leadToEdit.company || "",
        email: leadToEdit.email || "",
        phone: leadToEdit.phone || "",
        event: leadToEdit.event || "",
        notes: leadToEdit.notes || "",
        follow_up_status: leadToEdit.follow_up_status || "Pending",
        priority: leadToEdit.priority || "Medium",
      });
    } else {
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        event: "",
        notes: "",
        follow_up_status: "Pending",
        priority: "Medium",
      });
    }
    setErrors({});
  }, [leadToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.company.trim()) errs.company = "Company is required";
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (!formData.event.trim()) errs.event = "Event / conference is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData, leadToEdit?.id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || "Failed to save lead record" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={leadToEdit ? "Edit Attendee Record" : "Record New Conference Lead"}
      description="Capture field interaction details and key conversation context for follow-up."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="flex items-center gap-2 p-3 rounded-control bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-fg)] type-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="type-xs font-medium text-app-muted">
              Full Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
            {errors.name && (
              <span className="type-xs text-[var(--status-error-fg)] block">
                {errors.name}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="type-xs font-medium text-app-muted">
              Company *
            </label>
            <Input
              type="text"
              placeholder="e.g. Razorpay Technologies, Infosys"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            {errors.company && (
              <span className="type-xs text-[var(--status-error-fg)] block">
                {errors.company}
              </span>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="type-xs font-medium text-app-muted">
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="aarav.sharma@razorpay.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && (
              <span className="type-xs text-[var(--status-error-fg)] block">
                {errors.email}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="type-xs font-medium text-app-muted">
              Direct Phone
            </label>
            <Input
              type="text"
              placeholder="+91 98201 14920"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Event Met At */}
        <div className="space-y-1">
          <label className="type-xs font-medium text-app-muted">
            Conference Met At *
          </label>
          <Input
            type="text"
            placeholder="e.g. Bengaluru Tech Summit 2026, Global Fintech Fest"
            value={formData.event}
            onChange={(e) => setFormData({ ...formData, event: e.target.value })}
          />
          {errors.event && (
            <span className="type-xs text-[var(--status-error-fg)] block">
              {errors.event}
            </span>
          )}

          {/* Quick select tags for existing conferences */}
          {existingEvents.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="type-xs text-app-subtle">Recent:</span>
              {existingEvents.slice(0, 3).map((evt) => (
                <button
                  key={evt.event}
                  type="button"
                  onClick={() => setFormData({ ...formData, event: evt.event })}
                  className="px-2 py-0.5 rounded-control bg-app-subtle hover:bg-app-muted border border-app type-xs text-app-primary transition-app cursor-pointer"
                >
                  {evt.event}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="type-xs font-medium text-app-muted">
              Initial Pipeline Status
            </label>
            <CustomSelect
              value={formData.follow_up_status}
              onChange={(val) =>
                setFormData({ ...formData, follow_up_status: val })
              }
              header="Pipeline Stage"
              className="h-9 w-full"
              menuWidth="w-full"
              options={[
                {
                  value: "Pending",
                  label: "Pending (Awaiting outreach)",
                  dotClass: "bg-[var(--status-warning-fg)]",
                },
                {
                  value: "Contacted",
                  label: "Contacted",
                  dotClass: "bg-blue-400",
                },
                {
                  value: "Meeting Scheduled",
                  label: "Meeting Scheduled",
                  dotClass: "bg-indigo-400",
                },
                {
                  value: "Qualified",
                  label: "Qualified",
                  dotClass: "bg-[var(--status-success-fg)]",
                },
                {
                  value: "Closed",
                  label: "Closed",
                  dotClass: "bg-zinc-400 dark:bg-zinc-500",
                },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="type-xs font-medium text-app-muted">
              Follow-up Priority
            </label>
            <CustomSelect
              value={formData.priority}
              onChange={(val) =>
                setFormData({ ...formData, priority: val })
              }
              header="Lead Priority"
              className="h-9 w-full"
              menuWidth="w-full"
              options={[
                {
                  value: "High",
                  label: "High Priority",
                  dotClass: "bg-[var(--status-error-fg)]",
                },
                {
                  value: "Medium",
                  label: "Medium Priority",
                  dotClass: "bg-[var(--status-warning-fg)]",
                },
                {
                  value: "Low",
                  label: "Low Priority",
                  dotClass: "bg-app-subtle border border-app-strong",
                },
              ]}
            />
          </div>
        </div>

        {/* Interaction Notes */}
        <div className="space-y-1">
          <label className="type-xs font-medium text-app-muted">
            Conversation Notes & Follow-up Commitments
          </label>
          <Textarea
            rows={3}
            placeholder="Key discussion takeaways, pain points, pilot budget (e.g. ₹25 Lakhs), follow-up promises..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Modal Action Controls */}
        <div className="pt-3 border-t border-app flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : leadToEdit
              ? "Save Changes"
              : "Record Lead"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
