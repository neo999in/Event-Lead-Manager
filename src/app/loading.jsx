import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import LeadSkeleton from "@/components/LeadSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-app-bg text-app-primary flex flex-col font-sans transition-app">
      {/* Top indeterminate loader accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-[var(--accent)]/20 overflow-hidden">
        <div className="h-full w-1/3 bg-[var(--accent)] animate-[shimmer_1.5s_infinite_linear]" />
      </div>

      {/* Skeleton Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-app bg-app-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-control" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-control hidden sm:block" />
            <Skeleton className="h-8 w-28 rounded-control hidden md:block" />
            <Skeleton className="h-8 w-8 rounded-control" />
            <Skeleton className="h-8 w-8 rounded-control" />
            <Skeleton className="h-8 w-28 rounded-control" />
          </div>
        </div>
      </header>

      {/* Main Workspace Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Metric Cards Skeleton */}
        <div className="mb-6 sm:mb-7">
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

        {/* FilterBar Skeleton */}
        <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-5 p-1 rounded-panel bg-app-surface border border-app">
          <div className="flex items-center gap-2 flex-1 p-2">
            <Skeleton className="h-8.5 w-48 rounded-control" />
            <Skeleton className="h-8.5 w-32 rounded-control hidden sm:block" />
            <Skeleton className="h-8.5 w-32 rounded-control hidden sm:block" />
          </div>
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8.5 w-28 rounded-control" />
          </div>
        </div>

        {/* Lead Table Skeleton */}
        <LeadSkeleton viewMode="table" count={6} />
      </main>
    </div>
  );
}
