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
  /ui              # shadcn/ui components (DO NOT modify)
  /layout          # Layout composites (AppLayout, Sidebar, Topbar)
  /charts          # Chart composites (ScoreDonutChart, MetricsBarChart)
  /audit           # Audit composites (AuditCard, AuditTable, IssueGroup)
  /metrics         # Metrics composites (MetricCard, ScoreBreakdown)
  /filters         # Filter composites (FilterBar, SearchInput)

/lib
  parser.ts
  transformer.ts
  scoring.ts
  grouping.ts
```

---

## UI Principles

- **Shadcn-first**: Always prefer shadcn/ui components before building custom
- **Composition over creation**: Combine existing components rather than building from scratch
- **Compound components**: Extend shadcn components for domain-specific needs
- **Never modify `/ui`**: Copy and customize if needed, but keep originals untouched

---

## Installed Components

All UI components are from shadcn/ui:

| Component       | Use Case                               |
| --------------- | -------------------------------------- |
| `card`          | Score cards, metric cards, audit cards |
| `badge`         | Impact levels (High/Medium/Low)        |
| `button`        | Actions, navigation                    |
| `input`         | Search fields                          |
| `table`         | Audit table with sortable rows         |
| `tabs`          | View switching (Dashboard/Compare)     |
| `select`        | Category filters                       |
| `accordion`     | Expandable audit details               |
| `separator`     | Layout dividers                        |
| `sheet`         | Side navigation panel                  |
| `checkbox`      | Impact toggles                         |
| `skeleton`      | Loading states                         |
| `progress`      | Loading progress                       |
| `switch`        | Dark/light mode toggle                 |
| `dialog`        | Report detail modals                   |
| `tooltip`       | Info tooltips                          |
| `scroll-area`   | Scrollable containers                  |
| `dropdown-menu` | Action menus                           |

---

## Composition Patterns

### Basic Composition

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function AuditCard({ audit }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{audit.title}</CardTitle>
        <Badge variant={getImpactVariant(audit.impact)}>{audit.impact}</Badge>
      </CardHeader>
      <CardContent>{audit.description}</CardContent>
    </Card>
  )
}
```

### Compound Component Pattern

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

function ScoreCard({ score, label, delta }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-4xl font-bold">{score}</span>
      </CardContent>
      {delta && <CardFooter>{delta}</CardFooter>}
    </Card>
  )
}
```

### Filter Bar Composition

```tsx
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

function FilterBar() {
  return (
    <div className="flex gap-4">
      <Input placeholder="Search audits..." />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="performance">Performance</SelectItem>
          <SelectItem value="accessibility">Accessibility</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Checkbox id="high" /> <label htmlFor="high">High</label>
        <Checkbox id="medium" /> <label htmlFor="medium">Medium</label>
        <Checkbox id="low" /> <label htmlFor="low">Low</label>
      </div>
    </div>
  )
}
```

### Adding New Components

Before creating a new component, check if shadcn provides it:

```bash
npx shadcn@latest add --help  # List available components
npx shadcn@latest add <component-name>
```

---

## Core Components

All components below are **composed from shadcn/ui** - never built from scratch.

### Layout

- **AppLayout** → `Sheet` (sidebar) + `Button` (nav items) + `Switch` (theme)
- **Topbar** → `Button` group, `DropdownMenu`

### Upload Flow

- **UploadDropzone** → Custom (requires drag-drop logic), use `Card` + `Input`
- **ReportLoader** → Logic only (no UI)

### Dashboard Page

- **SummaryHeader** → `Card` + `Badge` composition
- **MetricsSection** → `Card` + `Progress` + color-coded variants
- \*\*ScoreBreakdonutChart → Recharts `PieChart` wrapped in `Card`
- **MetricsBarChart** → Recharts `BarChart` wrapped in `Card`
- **IssuesSection** → `Accordion` (impact groups) + `Card` (individual issues)
- **AuditExplorer** → `Table` + `Input` (search) + `Select` (filter) + `Badge`

### Charts

- **ScoreDonutChart** - Recharts PieChart in `Card` container
- **MetricsBarChart** - Recharts BarChart with `Tooltip` overlays
- **ImpactDistributionChart** - Recharts Pie/Bar in `Card`
- **TrendLineChart** - Recharts LineChart (future)

### Audit Components

- **IssueGroup** → `Accordion` + `Badge`
- **AuditCard** → `Card` + `Badge` + `Accordion` (expandable)
- **AuditTable** → `Table` + `Accordion` (row expansion)
- **FilterBar** → `Input` + `Select` + `Checkbox` + `Button`

### Compare Mode

- **ComparePage** → `Tabs` (switch views)
- **DiffMetricCard** → `Card` + `Badge` (delta indicator)
- **DiffChart** → Recharts ComposedChart (before/after bars)

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

## Adding New shadcn Components

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `components/ui/` and imported as:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
```
