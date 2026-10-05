"use client";

import React from "react";
import { Search, X, RotateCcw, Loader2 } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

const STATUS_TABS = [
  { id: "All", label: "All", color: null },
  { id: "Pending", label: "Pending", color: "#f59e0b" },
  { id: "Contacted", label: "Contacted", color: "#0ea5e9" },
  { id: "Meeting Scheduled", label: "Meeting Set", color: "#3b82f6" },
  { id: "Qualified", label: "Qualified", color: "#10b981" },
  { id: "Closed", label: "Closed", color: "#71717a" },
];

export default function FilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  eventFilter,
  setEventFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  events = [],
  statusCounts = {},
  isSearching = false,
}) {
  const totalLeads = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "All" ||
    eventFilter !== "All" ||
    priorityFilter !== "All";

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
    setEventFilter("All");
    setPriorityFilter("All");
  };

  return (
    <div className="w-full mb-6 relative z-20">
      {/* Unified Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 py-1">
        {/* Left: Compact Segmented Status Tabs Track */}
        <div className="w-full lg:w-auto overflow-x-auto scrollbar-none pb-0.5">
          <div className="inline-flex items-center p-0.5 rounded-control bg-app-subtle border border-app gap-0.5 shrink-0">
            {STATUS_TABS.map((tab) => {
              const count = tab.id === "All" ? totalLeads : statusCounts[tab.id] || 0;
              const isActive = statusFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-control text-xs whitespace-nowrap transition-app cursor-pointer border shrink-0 ${
                    isActive
                      ? "bg-app-surface border-app text-app-primary font-semibold shadow-xs"
                      : "bg-transparent border-transparent text-app-muted hover:text-app-primary hover:bg-app-surface/50"
                  }`}
                >
                  {tab.color && (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tab.color }}
                    />
                  )}
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
        </div>

        {/* Right: Search Input + All Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-44 sm:flex-initial min-w-[130px]">
            {isSearching ? (
              <Loader2
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--accent)] animate-spin pointer-events-none z-10"
              />
            ) : (
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-app-subtle pointer-events-none z-10"
              />
            )}
            <input
              type="text"
              className="filter-input h-8.5 w-full rounded-control border border-app bg-app-surface text-xs text-app-primary placeholder:text-app-subtle focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-app shadow-xs"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-control text-app-muted hover:text-app-primary cursor-pointer z-10"
              >
                <X size={11} />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-app-subtle border border-app px-1 rounded bg-app-subtle/60 pointer-events-none z-10">
                /
              </span>
            )}
          </div>

          {/* Event Filter Dropdown */}
          <CustomSelect
            value={eventFilter}
            onChange={setEventFilter}
            header="Filter by Event"
            menuWidth="w-56"
            className="h-8.5 flex-1 sm:flex-initial min-w-[100px] sm:min-w-[108px] max-w-full sm:max-w-[170px]"
            options={[
              { value: "All", label: "All Events" },
              ...events.map((evt) => ({ value: evt.event, label: evt.event })),
            ]}
          />

          {/* Priority Filter Dropdown */}
          <CustomSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            header="Filter by Priority"
            menuWidth="w-44"
            className="h-8.5 flex-1 sm:flex-initial min-w-[95px] sm:min-w-[114px]"
            options={[
              { value: "All", label: "All Priorities" },
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

          {/* Sort By Dropdown */}
          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            header="Sort Order"
            menuWidth="w-48"
            className="h-8.5 flex-1 sm:flex-initial min-w-[100px] sm:min-w-[124px]"
            options={[
              { value: "updated_at", label: "Sort: Last Updated" },
              { value: "created_at", label: "Sort: Recently Added" },
              { value: "name", label: "Sort: Name (A-Z)" },
              { value: "company", label: "Sort: Company" },
              { value: "priority", label: "Sort: Priority" },
            ]}
          />

          {/* Clear Filters Button (if active) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="h-8.5 px-2 inline-flex items-center gap-1 rounded-control text-xs text-app-muted hover:text-app-primary hover:bg-app-subtle border border-app transition-app cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw size={11} />
              <span className="hidden xl:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
