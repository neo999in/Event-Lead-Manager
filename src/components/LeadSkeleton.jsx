"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadSkeleton({ viewMode = "table", count = 5 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 w-full animate-in fade-in duration-150">
        {items.map((i) => (
          <div
            key={i}
            className="bg-app-surface border border-app rounded-panel p-4 sm:p-5 flex flex-col justify-between shadow-xs min-h-[220px]"
          >
            <div>
              {/* Header: Name, Company, Priority */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <Skeleton className="h-10 w-10 rounded-control shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-28 sm:w-36" />
                    <Skeleton className="h-3 w-20 sm:w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-14 rounded-control shrink-0" />
              </div>

              {/* Event Met At */}
              <div className="mt-4 flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
                <Skeleton className="h-3.5 w-28" />
              </div>

              {/* Notes Excerpt */}
              <div className="mt-4 p-3.5 rounded-control bg-app-subtle/40 border border-app-subtle space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>

            {/* Footer: Stage & Action buttons */}
            <div className="mt-5 pt-4 border-t border-app flex items-center justify-between gap-3">
              <Skeleton className="h-7 w-28 rounded-control" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-8 w-18 rounded-control hidden sm:block" />
                <Skeleton className="h-8 w-8 rounded-control" />
                <Skeleton className="h-8 w-8 rounded-control" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // viewMode === "table"
  return (
    <div className="w-full animate-in fade-in duration-150">
      {/* Desktop Editorial Table Skeleton (>= 1024px) */}
      <div className="hidden lg:block w-full bg-app-surface border border-app rounded-panel overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[960px] text-left border-collapse">
          <thead>
            <tr className="border-b border-app bg-app-subtle/30 text-app-subtle type-xs font-medium">
              <th className="py-3 px-5 font-medium w-60 first:rounded-tl-panel">Attendee</th>
              <th className="py-3 px-5 font-medium w-48">Event</th>
              <th className="py-3 px-5 font-medium">Notes & Context</th>
              <th className="py-3 px-5 font-medium w-40">Pipeline Stage</th>
              <th className="py-3 px-5 font-medium w-24">Priority</th>
              <th className="py-3 px-5 font-medium w-32">Last Updated</th>
              <th className="py-3 px-5 font-medium text-right w-44 last:rounded-tr-panel">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {items.map((i) => (
              <tr key={i} className="hover:bg-transparent">
                {/* Attendee */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="h-8.5 w-8.5 rounded-control shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>

                {/* Event */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                </td>

                {/* Notes & Context */}
                <td className="py-3.5 px-5">
                  <div className="space-y-1.5 max-w-sm">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                </td>

                {/* Pipeline Stage */}
                <td className="py-3.5 px-5 w-40">
                  <Skeleton className="h-6.5 w-28 rounded-control" />
                </td>

                {/* Priority */}
                <td className="py-3.5 px-5 w-24">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-14" />
                  </div>
                </td>

                {/* Last Updated */}
                <td className="py-3.5 px-5 w-32">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded shrink-0" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right w-44">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-8 w-8 rounded-control" />
                    <Skeleton className="h-8 w-8 rounded-control" />
                    <Skeleton className="h-8 w-8 rounded-control" />
                    <Skeleton className="h-8 w-8 rounded-control" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card Stream Skeleton (< 1024px) */}
      <div className="block lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {items.map((i) => (
          <div
            key={i}
            className="bg-app-surface border border-app rounded-panel p-4 sm:p-5 space-y-3 shadow-xs"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="h-9 w-9 rounded-control shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-control shrink-0" />
            </div>

            {/* Event & Priority metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-control" />
              <Skeleton className="h-5 w-16 rounded-control" />
              <Skeleton className="h-5 w-20 rounded-control" />
            </div>

            {/* Notes excerpt */}
            <Skeleton className="h-10 w-full rounded-control" />

            {/* Actions row */}
            <div className="pt-2.5 mt-0.5 border-t border-app flex items-center justify-between gap-2">
              <Skeleton className="flex-1 h-9 sm:h-10 rounded-control" />
              <Skeleton className="px-2.5 h-9 sm:h-10 w-10 sm:w-11 rounded-control shrink-0" />
              <Skeleton className="px-2.5 h-9 sm:h-10 w-10 sm:w-11 rounded-control shrink-0" />
              <Skeleton className="px-2.5 h-9 sm:h-10 w-10 sm:w-11 rounded-control shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
