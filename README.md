# Light Scope

A modern visualization tool for **Google Chrome Lighthouse reports** that transforms raw JSON into clear, actionable insights.

Instead of scanning long audit lists, Light Scope:

- highlights **what actually matters**
- groups issues by **real-world impact**
- visualizes performance trends and comparisons
- helps developers quickly **decide what to fix first**

> Built for devs who want _clarity over clutter_

---

## Features

- **Smart Summaries** - Big score cards with delta indicators
- **Core Web Vitals** - LCP, FCP, CLS, INP, TBT with color zones (good/needs improvement/poor)
- **Impact Grouping** - Issues grouped by High / Medium / Low impact
- **Quick Wins** - Biggest gains first (future)
- **Compare Mode** - Before vs after analysis (future)
- **Explain Simply** - Toggle to rewrite audits in plain language (future)
- **Shareable Links** - Share reports with team (future)
- **Dark/Light Mode** - Theme support

---

## Architecture

```
/app
  /upload
  /dashboard
  /compare

/components
  /layout
  /charts
  /audit
  /metrics
  /filters

/lib
  parser.ts
  transformer.ts
  scoring.ts
  grouping.ts
```

---

## Core Components

### Layout

- **AppLayout** - Sidebar navigation, topbar (upload, compare, theme), main content

### Upload Flow

- **UploadDropzone** - Drag & drop JSON, validate Lighthouse format
- **ReportLoader** - Parse JSON, call transformer, store in state

### Dashboard Page

- **SummaryHeader** - Big score cards with delta (if comparing)
- **MetricsSection** - Core Web Vitals cards with status colors
- **ScoreBreakdown** - Category weights, optional radar chart
- **IssuesSection** - Grouped by impact (High/Medium/Low)
- **AuditExplorer** - Searchable, filterable audit table

### Charts

- **ScoreDonutChart** - Performance, SEO, Accessibility scores (Recharts PieChart)
  - Hover: show exact score
  - Click: filter audits by category
- **MetricsBarChart** - Core Web Vitals with color zones
  - Tooltip: explanation
  - Click: scroll to related audits
- **ImpactDistributionChart** - Pie or bar showing High/Medium/Low distribution
- **TrendLineChart** - Timeline view (future feature)

### Audit Components

- **IssueGroup** - Grouped by impact level
- **AuditCard** - Title, impact badge, short description, expandable details
  - Expanded: explanation, savings (ms/KB), link to docs
- **AuditTable** - Sortable, expandable rows
- **FilterBar** - Impact toggle, category select, search

### Compare Mode

- **ComparePage** - Header, diff summary, diff charts, diff audit list
- **DiffMetricCard** - Before vs after with status indicator
- **DiffChart** - Before vs after bars

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui

---

## Data Layer

### transformer.ts

```ts
export function transform(report) {
  return {
    scores: extractScores(report),
    metrics: extractMetrics(report),
    issues: extractIssues(report),
    grouped: groupByImpact(report.audits),
  }
}
```

### grouping.ts

```ts
const GROUPS = {
  performance: ["lcp", "cls", "fcp"],
  network: ["server-response-time"],
  js: ["main-thread-tasks"],
  images: ["uses-optimized-images"],
}
```

---

## MVP Scope

1. Upload JSON
2. Show:
   - Scores (donut chart)
   - Core metrics (bar chart)
   - Top issues (grouped by impact)
3. Expandable audit cards

---

## UI/UX Details

- Default: show **only failed audits**
- Progressive disclosure (collapse details)
- Sticky metric bar (always visible)
- Smooth scroll to sections
- Subtle animations

---

## Roadmap

- [ ] Quick Wins section (biggest gains first)
- [ ] Explain Simply toggle (rewrite audits)
- [ ] Shareable report link
- [ ] Dark/light mode
- [ ] Timeline/trend analysis
- [ ] Compare mode

---

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
