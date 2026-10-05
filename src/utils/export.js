/**
 * Utility functions for exporting lead records to CSV and JSON formats
 */

export function exportToCSV(leads, filename = 'event_leads.csv') {
  if (!leads || leads.length === 0) return;

  const headers = [
    'ID',
    'Name',
    'Company',
    'Email',
    'Phone',
    'Event',
    'Follow Up Status',
    'Priority',
    'Notes',
    'AI Summary',
    'Created At',
    'Last Contacted At'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = leads.map((lead) => [
    lead.id,
    escapeCSV(lead.name),
    escapeCSV(lead.company),
    escapeCSV(lead.email),
    escapeCSV(lead.phone || ''),
    escapeCSV(lead.event),
    escapeCSV(lead.follow_up_status),
    escapeCSV(lead.priority),
    escapeCSV(lead.notes || ''),
    escapeCSV(lead.ai_summary || ''),
    escapeCSV(lead.created_at),
    escapeCSV(lead.last_contacted_at || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(leads, filename = 'event_leads.json') {
  if (!leads || leads.length === 0) return;
  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
