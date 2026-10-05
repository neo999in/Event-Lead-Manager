const BASE_URL = '/api';

/**
 * Helper to handle fetch responses safely
 */
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Fetch leads with query parameters
  async getLeads(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.event && filters.event !== 'All') params.append('event', filters.event);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const res = await fetch(`${BASE_URL}/leads?${params.toString()}`);
    return handleResponse(res);
  },

  // Get statistics
  async getStats() {
    const res = await fetch(`${BASE_URL}/leads/stats`);
    return handleResponse(res);
  },

  // Get distinct events
  async getEvents() {
    const res = await fetch(`${BASE_URL}/leads/events`);
    return handleResponse(res);
  },

  // Get single lead
  async getLead(id) {
    const res = await fetch(`${BASE_URL}/leads/${id}`);
    return handleResponse(res);
  },

  // Create lead
  async createLead(leadData) {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return handleResponse(res);
  },

  // Update lead
  async updateLead(id, leadData) {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return handleResponse(res);
  },

  // Delete lead
  async deleteLead(id) {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Seed sample leads
  async seedDemoLeads() {
    const res = await fetch(`${BASE_URL}/leads/seed`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Fetch audit trail and update logs
  async getRecentLogs(limit = 100, leadId = null) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (leadId) params.append('leadId', leadId);
    const res = await fetch(`${BASE_URL}/leads/logs?${params.toString()}`);
    return handleResponse(res);
  },

  // AI Summarize Notes
  async summarizeNotes(payload) {
    const res = await fetch(`${BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await handleResponse(res);
    // Route returns { success, data: { summary, provider, notice } }
    return json.data ?? json;
  },

  // AI Draft Follow-up Email
  async draftFollowUpEmail(payload) {
    const res = await fetch(`${BASE_URL}/ai/draft-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await handleResponse(res);
    // Route returns { success, data: { draft, provider, notice } }
    return json.data ?? json;
  },

  // Save AI output directly to lead
  async applyAiToLead(payload) {
    const res = await fetch(`${BASE_URL}/ai/apply-to-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  }
};
