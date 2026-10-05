const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');

function getDatabase() {
  const isVercel = !!process.env.VERCEL;
  let dbPath;

  if (isVercel) {
    // Vercel serverless functions run in a read-only filesystem except /tmp
    dbPath = path.join(os.tmpdir(), 'leads.db');
    const sourceDbPath = path.join(process.cwd(), 'src', 'lib', 'leads.db');
    if (!fs.existsSync(/*turbopackIgnore: true*/ dbPath) && fs.existsSync(/*turbopackIgnore: true*/ sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, dbPath);
      } catch (err) {
        console.warn('Could not copy initial db to /tmp, will initialize fresh:', err.message);
      }
    }
  } else {
    dbPath = path.join(process.cwd(), 'src', 'lib', 'leads.db');
  }

  return new Database(dbPath);
}

const db = getDatabase();

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      event TEXT NOT NULL,
      notes TEXT DEFAULT '',
      follow_up_status TEXT NOT NULL DEFAULT 'Pending',
      priority TEXT NOT NULL DEFAULT 'Medium',
      ai_summary TEXT DEFAULT '',
      ai_drafted_email TEXT DEFAULT '',
      last_contacted_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lead_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      previous_value TEXT DEFAULT NULL,
      new_value TEXT DEFAULT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_leads_event ON leads(event);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(follow_up_status);
    CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
    CREATE INDEX IF NOT EXISTS idx_logs_lead_id ON lead_logs(lead_id);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON lead_logs(created_at);
  `);
}

// Sample leads dataset for instant rich demo experience
const SAMPLE_LEADS = [
  {
    name: 'Aarav Sharma',
    company: 'Razorpay Technologies',
    email: 'aarav.sharma@razorpay.com',
    phone: '+91 98201 14920',
    event: 'Bengaluru Tech Summit 2026',
    notes: 'Met at the Fintech & AI Stage after his keynote on high-throughput payment orchestration. Very keen on deploying our lead intake platform for Razorpay\'s enterprise merchant acquisition team of 60 reps across Bengaluru and Mumbai. Current manual intake causes 48-hour follow-up delays. Requested a 20-minute architecture demo next Tuesday at 3:00 PM IST.',
    follow_up_status: 'Meeting Scheduled',
    priority: 'High',
    ai_summary: 'Key enterprise prospect looking to eliminate 48-hr lead intake delays for Razorpay\'s 60-person merchant sales team. High urgency; wants 20-min demo Tuesday at 3:00 PM IST.',
    ai_drafted_email: 'Hi Aarav,\n\nIt was a pleasure speaking after your keynote at Bengaluru Tech Summit 2026 on payment orchestration architectures.\n\nYou highlighted how manual intake currently delays follow-ups by 48 hours for your 60-member merchant sales team—our system was built to capture and qualify enterprise leads in real time at events.\n\nLet’s lock in that 20-minute walkthrough for Tuesday at 3:00 PM IST as discussed. I\'ll send over the Google Meet invite shortly.\n\nWarm regards,\nEvent Lead Team',
    last_contacted_at: '2026-10-04T09:30:00.000Z',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    sample_logs: [
      {
        action_type: 'created',
        description: 'Captured lead at Bengaluru Tech Summit 2026 Fintech Stage',
        previous_value: null,
        new_value: 'Pending',
        offsetDays: 3
      },
      {
        action_type: 'note_updated',
        description: 'Added notes: enterprise merchant sales team of 60 reps, 48hr lag pain point',
        previous_value: null,
        new_value: null,
        offsetDays: 2.8
      },
      {
        action_type: 'ai_generated',
        description: 'Generated AI follow-up email draft proposing Tuesday 3:00 PM IST demo',
        previous_value: null,
        new_value: null,
        offsetDays: 2
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Pending" to "Meeting Scheduled"',
        previous_value: 'Pending',
        new_value: 'Meeting Scheduled',
        offsetDays: 1
      }
    ]
  },
  {
    name: 'Priya Patel',
    company: 'Tata Consultancy Services',
    email: 'priya.patel@tcs.com',
    phone: '+91 98450 33819',
    event: 'Nasscom Technology & Leadership Forum',
    notes: 'Connected at the TCS executive lounge during NTLF Mumbai. Evaluating lead capture and attendee intelligence solutions for their global BFSI roadshows. Has an allocated innovation budget of ₹45 Lakhs for Q1. Requested our ISO 27001 data sovereignty compliance documentation and SAML SSO integration guidelines before scheduling leadership review.',
    follow_up_status: 'Pending',
    priority: 'High',
    ai_summary: 'Enterprise opportunity with ₹45 Lakhs roadshow budget. Requires ISO 27001 data compliance and SAML SSO checklist prior to C-suite sign-off.',
    ai_drafted_email: '',
    last_contacted_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    sample_logs: [
      {
        action_type: 'created',
        description: 'Captured lead at Nasscom Technology & Leadership Forum executive lounge',
        previous_value: null,
        new_value: 'Pending',
        offsetDays: 2
      },
      {
        action_type: 'priority_change',
        description: 'Set priority to "High" (Allocated ₹45 Lakhs innovation budget for BFSI roadshows)',
        previous_value: 'Medium',
        new_value: 'High',
        offsetDays: 2
      }
    ]
  },
  {
    name: 'Rohan Mehta',
    company: 'Zerodha Broking',
    email: 'rohan.mehta@zerodha.com',
    phone: '+91 99100 48210',
    event: 'Global Fintech Fest Mumbai',
    notes: 'Had filter coffee at the GFF networking pavilion. Discussed developer tooling and capturing inbound fintech creator leads during Rainmatter hackathons. Appreciated the offline-first SQLite sync architecture. Wants access to sandbox API keys and Webhook documentation.',
    follow_up_status: 'Contacted',
    priority: 'Medium',
    ai_summary: 'Exploring lead intake for Rainmatter community hackathons. Interested in offline SQLite architecture and API webhooks.',
    ai_drafted_email: 'Hi Rohan,\n\nGreat catching up over filter coffee at Global Fintech Fest Mumbai! Here is the developer sandbox access and Webhook documentation for Rainmatter integrations. Let me know if you would like a brief setup call this Thursday.',
    last_contacted_at: '2026-10-03T11:00:00.000Z',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    sample_logs: [
      {
        action_type: 'created',
        description: 'Captured lead at Global Fintech Fest Mumbai networking pavilion',
        previous_value: null,
        new_value: 'Pending',
        offsetDays: 4
      },
      {
        action_type: 'ai_generated',
        description: 'Generated personalized developer sandbox and webhook intro email',
        previous_value: null,
        new_value: null,
        offsetDays: 3
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Pending" to "Contacted"',
        previous_value: 'Pending',
        new_value: 'Contacted',
        offsetDays: 2
      }
    ]
  },
  {
    name: 'Ananya Iyer',
    company: 'Freshworks India',
    email: 'ananya.iyer@freshworks.com',
    phone: '+91 97412 89012',
    event: 'TechSparks Bengaluru',
    notes: 'Met during the SaaS Founders panel at TechSparks. Freshworks partner alliances team is organizing a 6-city India roadshow. Discussed native bi-directional synchronization with Freshsales CRM and co-hosting a pipeline velocity masterclass in Koramangala.',
    follow_up_status: 'Qualified',
    priority: 'Medium',
    ai_summary: 'High-value SaaS partnership: 6-city India roadshow lead capture with native Freshsales integration and joint Bengaluru masterclass.',
    ai_drafted_email: '',
    last_contacted_at: '2026-10-02T16:45:00.000Z',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    sample_logs: [
      {
        action_type: 'created',
        description: 'Captured lead at TechSparks Bengaluru SaaS panel',
        previous_value: null,
        new_value: 'Pending',
        offsetDays: 5
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Pending" to "Contacted"',
        previous_value: 'Pending',
        new_value: 'Contacted',
        offsetDays: 3
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Contacted" to "Qualified" (Roadshow partnership & Freshsales sync confirmed)',
        previous_value: 'Contacted',
        new_value: 'Qualified',
        offsetDays: 1
      }
    ]
  },
  {
    name: 'Vikram Malhotra',
    company: 'Reliance Jio Platforms',
    email: 'vikram.malhotra@jio.com',
    phone: '+91 98210 76543',
    event: 'India Mobile Congress New Delhi',
    notes: 'Exchanged business cards during the 5G Enterprise Solutions roundtable at Pragati Maidan. Casual conversation regarding high-volume offline retail partner onboarding across Tier-2 and Tier-3 smart stores. Requested a corporate deck via WhatsApp / email.',
    follow_up_status: 'Pending',
    priority: 'Low',
    ai_summary: 'Initial contact at IMC New Delhi. Interested in Tier-2/3 retail partner onboarding. Requested product overview deck.',
    ai_drafted_email: '',
    last_contacted_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    sample_logs: [
      {
        action_type: 'created',
        description: 'Captured lead at India Mobile Congress New Delhi roundtable',
        previous_value: null,
        new_value: 'Pending',
        offsetDays: 1
      },
      {
        action_type: 'priority_change',
        description: 'Set priority to "Low" (Initial exploratory phase for Tier-2/3 stores)',
        previous_value: 'Medium',
        new_value: 'Low',
        offsetDays: 1
      }
    ]
  },
  {
    name: 'Neha Reddy',
    company: 'Swiggy Instamart',
    email: 'neha.reddy@swiggy.in',
    phone: '+91 99001 54321',
    event: 'TiEcon Delhi-NCR',
    notes: 'Annual enterprise agreement finalized for dark-store supplier acquisition team. Closed ₹18 Lakhs contract covering 12 regional fulfillment pods. Onboarding session scheduled with Swiggy operations leads.',
    follow_up_status: 'Closed',
    priority: 'High',
    ai_summary: 'Deal Closed: Finalized ₹18 Lakhs enterprise contract for Swiggy Instamart dark-store supplier intake across 12 pods.',
    ai_drafted_email: 'Hi Neha,\n\nWelcome aboard! The entire team is thrilled to partner with Swiggy Instamart. Our customer success lead will reach out to configure the regional pod workflows for your team on Monday.\n\nWarm regards,\nPartnerships Team',
    last_contacted_at: '2026-10-01T09:00:00.000Z',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    sample_logs: [
      {
        action_type: 'created',
        description: 'Captured lead at TiEcon Delhi-NCR Supply Chain track',
        previous_value: null,
        new_value: 'Pending',
        offsetDays: 7
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Pending" to "Contacted"',
        previous_value: 'Pending',
        new_value: 'Contacted',
        offsetDays: 5
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Contacted" to "Qualified"',
        previous_value: 'Contacted',
        new_value: 'Qualified',
        offsetDays: 4
      },
      {
        action_type: 'stage_change',
        description: 'Stage updated from "Qualified" to "Closed" (₹18 Lakhs annual contract signed)',
        previous_value: 'Qualified',
        new_value: 'Closed',
        offsetDays: 3
      }
    ]
  }
];

// Seed sample leads and activity logs if table is empty
function seedSampleLeads(force = false) {
  const countRow = db.prepare('SELECT COUNT(*) AS count FROM leads').get();
  const logCountRow = db.prepare('SELECT COUNT(*) AS count FROM lead_logs').get();

  // If leads already exist but lead_logs is empty, backfill realistic logs for existing leads
  if (countRow.count > 0 && logCountRow.count === 0 && !force) {
    const existingLeads = db.prepare('SELECT * FROM leads').all();
    const insertLog = db.prepare(`
      INSERT INTO lead_logs (
        lead_id, action_type, description, previous_value, new_value, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const lead of existingLeads) {
      const match = SAMPLE_LEADS.find(s => s.email.toLowerCase() === lead.email.toLowerCase());
      if (match && match.sample_logs) {
        for (const log of match.sample_logs) {
          const logTime = new Date(Date.now() - log.offsetDays * 86400000).toISOString();
          insertLog.run(
            lead.id,
            log.action_type,
            log.description,
            log.previous_value || null,
            log.new_value || null,
            logTime
          );
        }
      } else {
        insertLog.run(
          lead.id,
          'created',
          `Captured lead at ${lead.event || 'General Intake'}`,
          null,
          lead.follow_up_status || 'Pending',
          lead.created_at || new Date().toISOString()
        );
      }
    }
    return existingLeads.length;
  }

  if (countRow.count === 0 || force) {
    if (force) {
      db.exec('DELETE FROM lead_logs');
      db.exec('DELETE FROM leads');
      try {
        db.exec("DELETE FROM sqlite_sequence WHERE name IN ('leads', 'lead_logs')");
      } catch (err) {
        // ignore if table doesn't exist yet
      }
    }
    const insertLead = db.prepare(`
      INSERT INTO leads (
        name, company, email, phone, event, notes,
        follow_up_status, priority, ai_summary, ai_drafted_email,
        last_contacted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLog = db.prepare(`
      INSERT INTO lead_logs (
        lead_id, action_type, description, previous_value, new_value, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const lead of SAMPLE_LEADS) {
      const res = insertLead.run(
        lead.name,
        lead.company,
        lead.email,
        lead.phone || '',
        lead.event,
        lead.notes || '',
        lead.follow_up_status || 'Pending',
        lead.priority || 'Medium',
        lead.ai_summary || '',
        lead.ai_drafted_email || '',
        lead.last_contacted_at || null,
        lead.created_at,
        lead.updated_at
      );

      const leadId = res.lastInsertRowid;

      if (lead.sample_logs && lead.sample_logs.length > 0) {
        for (const log of lead.sample_logs) {
          const logTime = new Date(Date.now() - log.offsetDays * 86400000).toISOString();
          insertLog.run(
            leadId,
            log.action_type,
            log.description,
            log.previous_value || null,
            log.new_value || null,
            logTime
          );
        }
      }
    }
    return SAMPLE_LEADS.length;
  }
  return 0;
}

// Database query helpers
const dbManager = {
  getAllLeads({ search = '', status = '', event = '', priority = '', sortBy = 'created_at', sortOrder = 'DESC' } = {}) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(company) LIKE ? OR LOWER(email) LIKE ? OR LOWER(event) LIKE ? OR LOWER(notes) LIKE ?)';
      params.push(q, q, q, q, q);
    }

    if (status && status !== 'All') {
      sql += ' AND follow_up_status = ?';
      params.push(status);
    }

    if (event && event !== 'All') {
      sql += ' AND event = ?';
      params.push(event);
    }

    if (priority && priority !== 'All') {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    // Sanitize sort column and order
    const allowedSortCols = ['created_at', 'updated_at', 'name', 'company', 'event', 'follow_up_status', 'priority'];
    const safeCol = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${safeCol} ${safeOrder}`;

    return db.prepare(sql).all(...params);
  },

  getLeadById(id) {
    let lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(Number(id));
    // Graceful fallback for stale sessions where lead ID was re-seeded
    if (!lead && !isNaN(Number(id)) && Number(id) >= 1 && Number(id) <= 10) {
      const allLeads = db.prepare('SELECT * FROM leads ORDER BY id ASC').all();
      if (allLeads[Number(id) - 1]) {
        lead = allLeads[Number(id) - 1];
      }
    }
    if (!lead) return null;
    lead.logs = this.getLeadLogs(lead.id);
    return lead;
  },

  getLeadLogs(leadId) {
    return db.prepare(`
      SELECT * FROM lead_logs 
      WHERE lead_id = ? 
      ORDER BY created_at DESC, id DESC
    `).all(Number(leadId));
  },

  getAllRecentLogs(limit = 100) {
    return db.prepare(`
      SELECT 
        l.id,
        l.lead_id,
        l.action_type,
        l.description,
        l.previous_value,
        l.new_value,
        l.created_at,
        leads.name AS lead_name,
        leads.company AS lead_company,
        leads.event AS lead_event,
        leads.follow_up_status AS lead_status
      FROM lead_logs l
      LEFT JOIN leads ON l.lead_id = leads.id
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT ?
    `).all(Number(limit) || 100);
  },

  addLeadLog({ lead_id, action_type, description, previous_value = null, new_value = null, created_at = new Date().toISOString() }) {
    const stmt = db.prepare(`
      INSERT INTO lead_logs (lead_id, action_type, description, previous_value, new_value, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(Number(lead_id), action_type, description, previous_value, new_value, created_at);
    return {
      id: res.lastInsertRowid,
      lead_id: Number(lead_id),
      action_type,
      description,
      previous_value,
      new_value,
      created_at
    };
  },

  createLead(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO leads (
        name, company, email, phone, event, notes,
        follow_up_status, priority, ai_summary, ai_drafted_email,
        last_contacted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name ? data.name.trim() : '',
      data.company ? data.company.trim() : '',
      data.email ? data.email.trim() : '',
      data.phone ? data.phone.trim() : '',
      data.event ? data.event.trim() : '',
      data.notes ? data.notes.trim() : '',
      data.follow_up_status || 'Pending',
      data.priority || 'Medium',
      data.ai_summary || '',
      data.ai_drafted_email || '',
      data.last_contacted_at || null,
      now,
      now
    );

    const leadId = result.lastInsertRowid;
    this.addLeadLog({
      lead_id: leadId,
      action_type: 'created',
      description: `Captured lead at ${data.event ? data.event.trim() : 'general intake'}`,
      previous_value: null,
      new_value: data.follow_up_status || 'Pending',
      created_at: now
    });

    return this.getLeadById(leadId);
  },

  updateLead(id, data) {
    let existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(Number(id));
    if (!existing) {
      // Graceful fallback for stale client sessions
      if (data && data.email) {
        existing = db.prepare('SELECT * FROM leads WHERE LOWER(email) = ?').get(data.email.trim().toLowerCase());
      }
      if (!existing && !isNaN(Number(id)) && Number(id) >= 1 && Number(id) <= 10) {
        const allLeads = db.prepare('SELECT * FROM leads ORDER BY id ASC').all();
        if (allLeads[Number(id) - 1]) {
          existing = allLeads[Number(id) - 1];
        }
      }
      if (!existing) return null;
      id = existing.id;
    }

    const now = new Date().toISOString();
    const updated = {
      name: data.name !== undefined ? data.name.trim() : existing.name,
      company: data.company !== undefined ? data.company.trim() : existing.company,
      email: data.email !== undefined ? data.email.trim() : existing.email,
      phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
      event: data.event !== undefined ? data.event.trim() : existing.event,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      follow_up_status: data.follow_up_status !== undefined ? data.follow_up_status : existing.follow_up_status,
      priority: data.priority !== undefined ? data.priority : existing.priority,
      ai_summary: data.ai_summary !== undefined ? data.ai_summary : existing.ai_summary,
      ai_drafted_email: data.ai_drafted_email !== undefined ? data.ai_drafted_email : existing.ai_drafted_email,
      last_contacted_at: data.last_contacted_at !== undefined ? data.last_contacted_at : existing.last_contacted_at,
      updated_at: now
    };

    // Record audit logs for meaningful changes
    if (data.follow_up_status !== undefined && data.follow_up_status !== existing.follow_up_status) {
      this.addLeadLog({
        lead_id: id,
        action_type: 'stage_change',
        description: `Stage shifted from "${existing.follow_up_status}" to "${data.follow_up_status}"`,
        previous_value: existing.follow_up_status,
        new_value: data.follow_up_status,
        created_at: now
      });
    }

    if (data.priority !== undefined && data.priority !== existing.priority) {
      this.addLeadLog({
        lead_id: id,
        action_type: 'priority_change',
        description: `Priority changed from "${existing.priority}" to "${data.priority}"`,
        previous_value: existing.priority,
        new_value: data.priority,
        created_at: now
      });
    }

    if (data.notes !== undefined && data.notes !== existing.notes) {
      this.addLeadLog({
        lead_id: id,
        action_type: 'note_updated',
        description: 'Updated conversation notes',
        previous_value: existing.notes ? existing.notes.slice(0, 60) : '',
        new_value: data.notes ? data.notes.slice(0, 60) : '',
        created_at: now
      });
    }

    if (data.ai_drafted_email !== undefined && data.ai_drafted_email && data.ai_drafted_email !== existing.ai_drafted_email) {
      this.addLeadLog({
        lead_id: id,
        action_type: 'ai_generated',
        description: 'Generated AI email outreach draft',
        previous_value: null,
        new_value: null,
        created_at: now
      });
    }

    const hasProfileChanges =
      (data.name !== undefined && data.name.trim() !== existing.name) ||
      (data.company !== undefined && data.company.trim() !== existing.company) ||
      (data.email !== undefined && data.email.trim() !== existing.email) ||
      (data.phone !== undefined && data.phone.trim() !== existing.phone) ||
      (data.event !== undefined && data.event.trim() !== existing.event);

    if (hasProfileChanges) {
      this.addLeadLog({
        lead_id: id,
        action_type: 'details_updated',
        description: 'Updated contact profile info',
        previous_value: null,
        new_value: null,
        created_at: now
      });
    }

    const stmt = db.prepare(`
      UPDATE leads SET
        name = ?, company = ?, email = ?, phone = ?, event = ?,
        notes = ?, follow_up_status = ?, priority = ?,
        ai_summary = ?, ai_drafted_email = ?, last_contacted_at = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.company,
      updated.email,
      updated.phone,
      updated.event,
      updated.notes,
      updated.follow_up_status,
      updated.priority,
      updated.ai_summary,
      updated.ai_drafted_email,
      updated.last_contacted_at,
      updated.updated_at,
      Number(id)
    );

    return this.getLeadById(id);
  },

  deleteLead(id) {
    let existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(Number(id));
    if (!existing && !isNaN(Number(id)) && Number(id) >= 1 && Number(id) <= 10) {
      const allLeads = db.prepare('SELECT id FROM leads ORDER BY id ASC').all();
      if (allLeads[Number(id) - 1]) {
        existing = allLeads[Number(id) - 1];
      }
    }
    if (!existing) return false;
    db.prepare('DELETE FROM lead_logs WHERE lead_id = ?').run(Number(existing.id));
    db.prepare('DELETE FROM leads WHERE id = ?').run(Number(existing.id));
    return true;
  },

  getStats() {
    const totalRow = db.prepare('SELECT COUNT(*) AS total FROM leads').get();
    const pendingRow = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE follow_up_status = 'Pending'").get();
    const contactedRow = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE follow_up_status = 'Contacted'").get();
    const scheduledRow = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE follow_up_status = 'Meeting Scheduled'").get();
    const qualifiedRow = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE follow_up_status = 'Qualified'").get();
    const closedRow = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE follow_up_status = 'Closed'").get();

    const eventsList = db.prepare(`
      SELECT event, COUNT(*) AS count
      FROM leads
      GROUP BY event
      ORDER BY count DESC
    `).all();

    const priorityBreakdown = db.prepare(`
      SELECT priority, COUNT(*) AS count
      FROM leads
      GROUP BY priority
    `).all();

    const total = totalRow.total || 0;
    const actioned = total - (pendingRow.count || 0);
    const followUpRate = total > 0 ? Math.round((actioned / total) * 100) : 0;

    return {
      total,
      pending: pendingRow.count || 0,
      contacted: contactedRow.count || 0,
      scheduled: scheduledRow.count || 0,
      qualified: qualifiedRow.count || 0,
      closed: closedRow.count || 0,
      followUpRate,
      events: eventsList,
      priorities: priorityBreakdown
    };
  },

  getDistinctEvents() {
    const rows = db.prepare(`
      SELECT DISTINCT event, COUNT(*) AS leadCount
      FROM leads
      GROUP BY event
      ORDER BY leadCount DESC
    `).all();
    return rows;
  },

  seedDemoData() {
    return seedSampleLeads(true);
  }
};

// Initialize schema on load
initSchema();
seedSampleLeads(false);

module.exports = dbManager;

