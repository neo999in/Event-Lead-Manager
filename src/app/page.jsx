"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import StatsCards from "@/components/StatsCards";
import FilterBar from "@/components/FilterBar";
import LeadTable from "@/components/LeadTable";
import LeadGrid from "@/components/LeadGrid";
import LeadModal from "@/components/LeadModal";
import LeadDrawer from "@/components/LeadDrawer";
import AIModal from "@/components/AIModal";
import UpdateLogsModal from "@/components/UpdateLogsModal";
import Toast from "@/components/Toast";
import { Skeleton } from "@/components/ui/skeleton";
import LeadSkeleton from "@/components/LeadSkeleton";
import { api } from "@/utils/api";
import { exportToCSV } from "@/utils/export";

export default function Home() {
  // Theme state: defaults to dark mode
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("eventlead_theme") || localStorage.getItem("nexuslead_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Leads & statistics
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);

  // Loading coordination
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const queryIdRef = useRef(0);

  // View mode: 'table' (default) | 'grid'
  const [viewMode, setViewMode] = useState("table");
  useEffect(() => {
    const savedMode = localStorage.getItem("eventlead_view_mode") || localStorage.getItem("nexuslead_view_mode");
    if (savedMode === "grid") setViewMode("grid");
  }, []);


  // Filters & sorting
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Modals & Panels
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);

  const [drawerLead, setDrawerLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [aiModalLead, setAiModalLead] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState(null);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle dark/light theme
  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("eventlead_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__toggleTheme = toggleTheme;
    }
  }, [toggleTheme]);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("eventlead_view_mode", mode);
  };

  // Debounce search input to avoid spamming API on every keystroke
  useEffect(() => {
    if (!search.trim()) {
      setDebouncedSearch("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Full refresh helper (used on initial load, demo seed, and error recovery)
  const refreshAllData = useCallback(async () => {
    try {
      const [leadsRes, statsRes, eventsRes] = await Promise.all([
        api.getLeads({
          search: debouncedSearch,
          status: statusFilter,
          event: eventFilter,
          priority: priorityFilter,
          sortBy,
          sortOrder,
        }),
        api.getStats(),
        api.getEvents(),
      ]);

      setLeads(leadsRes.data || []);
      setStats(statsRes.data || null);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      showToast("Could not fetch data. Please check backend API.", "error");
    }
  }, [debouncedSearch, statusFilter, eventFilter, priorityFilter, sortBy, sortOrder, showToast]);

  // Cold Initial Load: only displays skeleton cards once on first app mount
  useEffect(() => {
    let isCancelled = false;
    async function loadInitial() {
      try {
        setIsInitialLoading(true);
        const [leadsRes, statsRes, eventsRes] = await Promise.all([
          api.getLeads({
            search: "",
            status: "All",
            event: "All",
            priority: "All",
            sortBy: "created_at",
            sortOrder: "DESC",
          }),
          api.getStats(),
          api.getEvents(),
        ]);
        if (!isCancelled) {
          setLeads(leadsRes.data || []);
          setStats(statsRes.data || null);
          setEvents(eventsRes.data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load initial data:", err);
          showToast("Could not fetch data. Please check backend API.", "error");
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      isCancelled = true;
    };
  }, [showToast]);

  // Live filter/search: smoothly updates leads in-place without unmounting table or flashing skeletons
  useEffect(() => {
    if (isInitialLoading) return;

    const queryId = ++queryIdRef.current;
    setIsSearching(true);

    api.getLeads({
      search: debouncedSearch,
      status: statusFilter,
      event: eventFilter,
      priority: priorityFilter,
      sortBy,
      sortOrder,
    })
      .then((res) => {
        if (queryId === queryIdRef.current) {
          setLeads(res.data || []);
        }
      })
      .catch((err) => {
        if (queryId === queryIdRef.current) {
          console.error("Failed to filter leads:", err);
          showToast("Failed to load search results", "error");
        }
      })
      .finally(() => {
        if (queryId === queryIdRef.current) {
          setIsSearching(false);
        }
      });
  }, [debouncedSearch, statusFilter, eventFilter, priorityFilter, sortBy, sortOrder, isInitialLoading, showToast]);

  // Reset filters shortcut
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setEventFilter("All");
    setPriorityFilter("All");
  };

  // Open Lead Drawer and fetch freshest details & logs
  const handleOpenDrawer = async (lead) => {
    setDrawerLead(lead);
    setIsDrawerOpen(true);
    try {
      const res = await api.getLead(lead.id);
      if (res.data) {
        setDrawerLead(res.data);
      }
    } catch (err) {
      console.error("Failed to load lead details:", err);
    }
  };

  // Open Lead from Global Logs
  const handleSelectLeadFromLogs = async (leadId) => {
    let target = leads.find((l) => l.id === Number(leadId));
    if (!target) {
      try {
        const res = await api.getLead(leadId);
        target = res.data;
      } catch (err) {
        console.error("Failed to fetch lead:", err);
      }
    } else {
      try {
        const res = await api.getLead(leadId);
        if (res.data) target = res.data;
      } catch (err) {
        console.error("Failed to refresh lead logs:", err);
      }
    }
    if (target) {
      setDrawerLead(target);
      setIsDrawerOpen(true);
    }
  };

  // Add / Edit Lead Handler
  const handleSaveLead = async (formData, id) => {
    if (id) {
      const res = await api.updateLead(id, formData);
      setLeads((prev) => prev.map((l) => (l.id === id ? res.data : l)));
      if (drawerLead?.id === id) setDrawerLead(res.data);
      if (aiModalLead?.id === id) setAiModalLead(res.data);
      showToast(`Lead "${res.data.name}" updated`, "success");
    } else {
      const res = await api.createLead(formData);
      setLeads((prev) => [res.data, ...prev]);
      showToast(`Recorded attendee "${res.data.name}"`, "success");
    }
    // Refresh stats and events
    api.getStats().then((s) => setStats(s.data));
    api.getEvents().then((e) => setEvents(e.data));
  };

  // Delete Lead Handler
  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      return;
    }

    try {
      setDeletingLeadId(id);
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (drawerLead?.id === id) setIsDrawerOpen(false);
      showToast(`Lead "${name}" deleted`, "info");
      api.getStats().then((s) => setStats(s.data));
      api.getEvents().then((e) => setEvents(e.data));
    } catch (err) {
      showToast(`Failed to delete lead: ${err.message}`, "error");
    } finally {
      setDeletingLeadId(null);
    }
  };

  // Quick Status change
  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      setUpdatingLeadId(id);
      const payload = { follow_up_status: newStatus };
      if (newStatus === "Contacted") {
        payload.last_contacted_at = new Date().toISOString();
      }
      const res = await api.updateLead(id, payload);
      setLeads((prev) => prev.map((l) => (l.id === id ? res.data : l)));
      if (drawerLead?.id === id) setDrawerLead(res.data);
      showToast(`Status updated to "${newStatus}"`, "success");
      api.getStats().then((s) => setStats(s.data));
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`, "error");
      refreshAllData();
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Seed sample leads
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setIsSearching(true);
      await api.seedDemoLeads();
      await refreshAllData();
      showToast("Loaded conference attendee leads", "success");
    } catch (err) {
      showToast(`Error seeding demo data: ${err.message}`, "error");
    } finally {
      setIsSeeding(false);
      setIsSearching(false);
    }
  };

  // Exports
  const handleExportCSV = () => {
    if (leads.length === 0) {
      showToast("No leads available to export.", "error");
      return;
    }
    exportToCSV(leads, `Conference_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast("Exported records to CSV", "success");
  };

  // Copy helper
  const handleCopyText = async (text, successMsg = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg, "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  // Status counts map for tabs in FilterBar
  const statusCounts = {
    Pending: stats?.pending || 0,
    Contacted: stats?.contacted || 0,
    "Meeting Scheduled": stats?.scheduled || 0,
    Qualified: stats?.qualified || 0,
    Closed: stats?.closed || 0,
  };

  return (
    <div className="min-h-screen bg-app-page text-app-primary flex flex-col font-sans transition-app">
      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={() => {
          setLeadToEdit(null);
          setIsAddEditModalOpen(true);
        }}
        onSeedData={handleSeedData}
        onExportCSV={handleExportCSV}
        onOpenLogsModal={() => setIsLogsModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        leadCount={leads.length}
        isSeeding={isSeeding}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Editorial Pipeline Header */}
        <StatsCards stats={stats} />

        {/* Search, Filter & Controls Toolbar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          eventFilter={eventFilter}
          setEventFilter={setEventFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          events={events}
          statusCounts={statusCounts}
          isSearching={isSearching || search !== debouncedSearch}
        />

        {/* Content View: Table or Grid with Dedicated Skeleton States */}
        {isInitialLoading || isSearching || search !== debouncedSearch ? (
          <LeadSkeleton
            viewMode={viewMode}
            count={isInitialLoading ? 5 : Math.max(Math.min(leads.length, 5), 3)}
          />
        ) : viewMode === "table" ? (
          <LeadTable
            leads={leads}
            deletingLeadId={deletingLeadId}
            updatingLeadId={updatingLeadId}
            onOpenDrawer={handleOpenDrawer}
            onOpenEditModal={(lead) => {
              setLeadToEdit(lead);
              setIsAddEditModalOpen(true);
            }}
            onOpenAIModal={(lead) => {
              setAiModalLead(lead);
              setIsAIModalOpen(true);
            }}
            onDeleteLead={handleDeleteLead}
            onQuickStatusChange={handleQuickStatusChange}
            onResetFilters={handleResetFilters}
            onOpenAddModal={() => {
              setLeadToEdit(null);
              setIsAddEditModalOpen(true);
            }}
          />
        ) : (
          <LeadGrid
            leads={leads}
            deletingLeadId={deletingLeadId}
            updatingLeadId={updatingLeadId}
            onOpenDrawer={handleOpenDrawer}
            onOpenEditModal={(lead) => {
              setLeadToEdit(lead);
              setIsAddEditModalOpen(true);
            }}
            onOpenAIModal={(lead) => {
              setAiModalLead(lead);
              setIsAIModalOpen(true);
            }}
            onDeleteLead={handleDeleteLead}
            onQuickStatusChange={handleQuickStatusChange}
            onResetFilters={handleResetFilters}
            onOpenAddModal={() => {
              setLeadToEdit(null);
              setIsAddEditModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Add / Edit Lead Modal */}
      <LeadModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
        existingEvents={events}
      />

      {/* Slide-out Profile Details Drawer */}
      <LeadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={drawerLead}
        onOpenEditModal={(lead) => {
          setLeadToEdit(lead);
          setIsAddEditModalOpen(true);
        }}
        onOpenAIModal={(lead) => {
          setAiModalLead(lead);
          setIsAIModalOpen(true);
        }}
        onDeleteLead={handleDeleteLead}
        onStatusChange={handleQuickStatusChange}
        onMarkContacted={(id) => handleQuickStatusChange(id, "Contacted")}
        onCopyText={handleCopyText}
      />

      {/* AI Outreach Studio Modal */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        lead={aiModalLead}
        onLeadUpdated={(updatedLead) => {
          setLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
          );
          if (drawerLead?.id === updatedLead.id) setDrawerLead(updatedLead);
          setAiModalLead(updatedLead);
          api.getStats().then((s) => setStats(s.data));
        }}
        onCopyText={handleCopyText}
        showToast={showToast}
      />

      {/* Global Activity & Update Logs Modal */}
      <UpdateLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        onSelectLead={handleSelectLeadFromLogs}
      />

      {/* Accessible Toast System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
