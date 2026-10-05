# Event Lead Manager

A high-performance, full-stack conference lead capture, pipeline management, and AI outreach platform built with **Next.js 16 (App Router)**, **SQLite**, and **Tailwind CSS**.

https://event-lead-manager-chi.vercel.app/

---

## Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your optional Google Gemini API key in `.env.local` ([Get a key here](https://aistudio.google.com/app/apikey)):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```
*(If omitted, the platform automatically activates smart built-in heuristic AI synthesis so all features work out-of-the-box offline.)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Lint
```bash
npm run lint     # Verified 0 errors
npm run build    # Verified clean Turbopack production compilation
```

---

## Core Capabilities

| Feature | Description |
|---|---|
| **Complete Lead Lifecycle** | Full CRUD across 5 pipeline stages: *Pending*, *Contacted*, *Meeting Scheduled*, *Qualified*, *Closed*. |
| **Search & Filtering** | 200ms debounced search across Name, Company, Event, and Notes without table unmounting. Multi-filter by Stage, Event, and Priority. |
| **Audit Activity Stream** | Real-time immutable event log tracking all creations, stage shifts, priority edits, note revisions, and AI drafts. |
| **AI Outreach Assistant** | Executive note summarization and personalized 5-tone follow-up email drafts (*Professional, Casual, Executive, Meeting Request, Value Pitch*) with Indian business timezones (IST). |
| **Responsive Dual-View** | Desktop data table with sticky headers & full-text hover tooltips; fluid mobile-first card grid with 44px+ touch targets. |
| **Data Export** | One-click export to CSV (RFC 4180 compliant) and formatted JSON. |
| **Loading & Micro-States** | Next.js App Router `loading.jsx` skeleton, shimmer wave animations, button spinners, and optimistic feedback. |

---

## Key Architectural & Design Decisions

### 1. Database & Storage Architecture
- **Embedded SQLite via `better-sqlite3`**: Chosen for zero-network-latency synchronous queries, strict relational schema constraints, and instant local setup with no external database service required.
- **Serverless Fallback Strategy**: In cloud environments like Vercel where the filesystem is read-only, the database dynamically initializes or clones to `/tmp/leads.db`, ensuring reliable demo availability.
- **Automated Audit Logging**: Every mutation (`createLead`, `updateLead`, `deleteLead`) triggers granular log creation (`created`, `stage_change`, `priority_change`, `note_updated`, `ai_generated`) to guarantee enterprise-grade pipeline auditability.

### 2. Next.js 16 App Router & REST API Design
- **Standardized REST Endpoints**: Clean HTTP semantics (`GET`, `POST`, `PUT`, `DELETE`) with Next.js async route parameters (`await params`).
- **Server-Side Validation**: Endpoints enforce required field validation (`name`, `company`, `email`) returning structured `400 Bad Request` payloads rather than failing silently.
- **Aggregated Analytics Engine**: Database-level aggregation queries (`/api/leads/stats`) compute total pipeline counts, stage distributions, and follow-up completion rates in a single round-trip.

### 3. Resilient Two-Tier AI Integration
- **Direct REST Integration**: Communicates directly with the official Google Generative Language REST API via Axios, avoiding heavy vendor SDK overhead and keeping bundle size lean.
- **Intelligent Offline Fallback**: If `GEMINI_API_KEY` is missing or rate limits occur, the service transparently switches to structured local heuristic synthesis. The UI always stays functional and returns meaningful summaries and draft emails.
- **Lead Persistence**: Generated AI briefings and email drafts can be applied directly to the database lead record via `/api/ai/apply-to-lead`.

### 4. UI Clarity & Ergonomics
- **No-Flash Search Debouncing**: Search queries debounce at 200ms with an inline `<Loader2 />` indicator in the input bar. The table updates in-place without jarring layout shifts or flashing skeleton screens.
- **Full-Text Floating Tooltips**: Rather than letting long conversation notes truncate unreadably, hovering over the *Notes & Context* column reveals a rich floating card with smart directional positioning (opens downward on row 0, upward on lower rows to prevent clipping).
- **Theme-Aware Design System**: Built with CSS custom property design tokens in `globals.css` ensuring contrast compliance in both dark and light modes, accented with custom 6px scrollbars.

---

## Tech Stack

- **Framework**: Next.js 16.3 (Turbopack, App Router)
- **Runtime**: React 19, Node.js 20+
- **Database**: SQLite (`better-sqlite3`)
- **Styling**: Tailwind CSS v4 & CSS Design Tokens
- **Icons**: Lucide React
- **AI Engine**: Google Gemini 1.5 / 2.0 Flash REST API + Local Heuristic Engine
