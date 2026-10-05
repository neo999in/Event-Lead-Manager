"use client";

import React from "react";
import { Users, Clock, CalendarCheck, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="mb-6 sm:mb-7">
        <h1 className="sr-only">Event Lead Manager</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3.5 sm:p-5 rounded-panel bg-app-surface border border-app flex flex-col justify-between shadow-xs min-h-[104px] sm:min-h-[112px]"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-control shrink-0" />
              </div>
              <div className="mt-2 sm:mt-2.5 space-y-1.5">
                <Skeleton className="h-7 w-16 sm:w-20" />
                <Skeleton className="h-3 w-28 hidden xs:block sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = stats.total || 0;
  const pending = stats.pending || 0;
  const contacted = stats.contacted || 0;
  const scheduled = stats.scheduled || 0;
  const qualified = stats.qualified || 0;
  const closed = stats.closed || 0;

  const followUpRate = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
  const inDiscussion = scheduled + qualified;

  return (
    <div className="mb-6 sm:mb-7">
      <h1 className="sr-only">Event Lead Manager</h1>
      {/* Executive Metric Cards: 2x2 on Mobile/Tablet, 4-col on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
        {/* Card 1: Total Leads */}
        <div className="p-3.5 sm:p-5 rounded-panel bg-app-surface border border-app hover:border-app-hover transition-app flex flex-col justify-between shadow-xs min-h-[104px] sm:min-h-[112px]">
          <div className="flex items-center justify-between">
            <span className="type-xs font-medium text-app-muted truncate">Total Leads</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-control bg-app-subtle border border-app text-app-subtle shrink-0">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-app-primary tracking-tight">
              {total}
            </div>
            <p className="type-xs text-app-subtle mt-0.5 truncate hidden xs:block sm:block">Active database records</p>
          </div>
        </div>

        {/* Card 2: Awaiting Action */}
        <div className="p-3.5 sm:p-5 rounded-panel bg-app-surface border border-app hover:border-app-hover transition-app flex flex-col justify-between shadow-xs min-h-[104px] sm:min-h-[112px]">
          <div className="flex items-center justify-between">
            <span className="type-xs font-medium text-app-muted truncate">Awaiting Action</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-control bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[var(--status-warning-fg)] tracking-tight">
              {pending}
            </div>
            <p className="type-xs text-app-subtle mt-0.5 truncate hidden xs:block sm:block">Needs initial follow-up</p>
          </div>
        </div>

        {/* Card 3: In Discussion */}
        <div className="p-3.5 sm:p-5 rounded-panel bg-app-surface border border-app hover:border-app-hover transition-app flex flex-col justify-between shadow-xs min-h-[104px] sm:min-h-[112px]">
          <div className="flex items-center justify-between">
            <span className="type-xs font-medium text-app-muted truncate">In Discussion</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-control bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
              <CalendarCheck size={14} />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[var(--accent)] tracking-tight">
              {inDiscussion}
            </div>
            <p className="type-xs text-app-subtle mt-0.5 truncate hidden xs:block sm:block">Meeting set or qualified</p>
          </div>
        </div>

        {/* Card 4: Outreach Rate */}
        <div className="p-3.5 sm:p-5 rounded-panel bg-app-surface border border-app hover:border-app-hover transition-app flex flex-col justify-between shadow-xs min-h-[104px] sm:min-h-[112px]">
          <div className="flex items-center justify-between">
            <span className="type-xs font-medium text-app-muted truncate">Outreach Rate</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-control bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-app-primary tracking-tight">
              {followUpRate}%
            </div>
            <p className="type-xs text-app-subtle mt-0.5 truncate hidden xs:block sm:block">{total - pending} of {total} actioned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
