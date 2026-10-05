# Event Lead Manager

A high-performance conference and event lead capture and pipeline management system built with Next.js, SQLite, and Tailwind CSS.

## Features

- **Full Lead Lifecycle**: Track conference attendee leads across stages: *Pending*, *Contacted*, *Meeting Scheduled*, *Qualified*, and *Closed*.
- **Editorial Data Table & Grid**: Responsive dual-view layout with quick stage dropdowns, contact actions, and custom sort/filter tools.
- **Audit Trail & Update Logs**: Automatic change logs tracking stage transitions, note updates, priority adjustments, and AI email drafts.
- **AI Outreach Studio**: Instant contextual summaries and personalized follow-up email drafts powered by LLM endpoints.
- **Theme Support**: High-contrast, WCAG AA compliant dark and light themes.
- **CSV Data Export**: One-click full dataset export.
- **Persistent Local SQLite**: Lightweight embedded database using `better-sqlite3`.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: SQLite (`better-sqlite3`)
- **Styling**: Tailwind CSS & CSS Custom Properties
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the local development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
