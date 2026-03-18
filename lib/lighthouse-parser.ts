import { z } from "zod"

const lighthouseCategorySchema = z.object({
    id: z.string(),
    title: z.string(),
    score: z.number().nullable(),
    scoreDisplayMode: z.string().optional(),
    auditRefs: z
        .array(
            z.object({
                id: z.string(),
                weight: z.number().optional(),
            })
        )
        .optional(),
})

export const lighthouseSchema = z.object({
    lighthouseVersion: z.string().optional(),
    requestedUrl: z.string(),
    finalUrl: z.string().optional(),
    finalDisplayedUrl: z.string().optional(),
    fetchTime: z.string().optional(),
    runWarnings: z.array(z.unknown()).optional(),
    categories: z.record(z.string(), lighthouseCategorySchema).optional(),
    audits: z.record(z.string(), z.unknown()).optional(),
    timing: z
        .object({
            total: z.number().optional(),
        })
        .optional(),
    environment: z
        .object({
            benchmarkIndex: z.number().optional(),
            networkUserAgent: z.string().optional(),
            hostUserAgent: z.string().optional(),
        })
        .optional(),
})

export type LighthouseReport = z.infer<typeof lighthouseSchema>

export interface CategoryScore {
    id: string
    title: string
    score: number | null
    color: string
    bgColor: string
}

export interface CoreVital {
    id: string
    title: string
    value: number
    unit: string
    displayValue: string
    score: number | null
    scoreColor: string
    p10: number | null
    median: number | null
    status: "good" | "needs-improvement" | "poor"
}

export interface AuditItem {
    id: string
    title: string
    description: string
    score: number | null
    scoreDisplayMode: string
    numericValue: number | null
    displayValue: string | null
    category: string
    impact: "high" | "medium" | "low" | "informative"
    details: unknown
}

interface ScoreColors {
    text: string
    bg: string
}

const SCORE_COLORS: Record<string, ScoreColors> = {
    good: { text: "text-green-600", bg: "bg-green-500" },
    needsImprovement: { text: "text-amber-600", bg: "bg-amber-500" },
    poor: { text: "text-red-600", bg: "bg-red-500" },
}

function getScoreColor(score: number | null): ScoreColors {
    if (score === null) return SCORE_COLORS.needsImprovement
    if (score >= 0.9) return SCORE_COLORS.good
    if (score >= 0.5) return SCORE_COLORS.needsImprovement
    return SCORE_COLORS.poor
}

function getScoreStatus(
    score: number | null
): "good" | "needs-improvement" | "poor" {
    if (score === null) return "needs-improvement"
    if (score >= 0.9) return "good"
    if (score >= 0.5) return "needs-improvement"
    return "poor"
}

function getImpactFromScore(score: number | null): AuditItem["impact"] {
    if (score === null) return "informative"
    if (score >= 0.9) return "low"
    if (score >= 0.5) return "medium"
    return "high"
}

export function parseLighthouseReport(report: LighthouseReport) {
    const categories = parseCategories(report)
    const coreVitals = parseCoreVitals(report)
    const audits = parseAudits(report)
    const topIssues = audits
        .filter((a) => a.impact === "high" && a.score !== null && a.score < 1)
        .slice(0, 10)
    const groupedByImpact = groupByImpact(audits)

    return {
        url:
            report.requestedUrl ||
            report.finalUrl ||
            report.finalDisplayedUrl ||
            "",
        lighthouseVersion: report.lighthouseVersion || "",
        fetchTime: report.fetchTime || "",
        categories,
        coreVitals,
        audits,
        topIssues,
        groupedByImpact,
    }
}

export function parseCategories(report: LighthouseReport): CategoryScore[] {
    const categoryOrder = [
        "performance",
        "accessibility",
        "best-practices",
        "seo",
        "pwa",
    ]
    const categoryTitles: Record<string, string> = {
        performance: "Performance",
        accessibility: "Accessibility",
        "best-practices": "Best Practices",
        seo: "SEO",
        pwa: "PWA",
    }

    const result: CategoryScore[] = []

    for (const id of categoryOrder) {
        const category = report.categories?.[id]
        if (category) {
            const score = category.score
            const colors = getScoreColor(score)
            result.push({
                id,
                title: categoryTitles[id] || category.title || id,
                score,
                color: colors.text,
                bgColor: colors.bg,
            })
        }
    }

    return result
}

const CORE_VITAL_IDS = [
    "largest-contentful-paint",
    "first-contentful-paint",
    "cumulative-layout-shift",
    "total-blocking-time",
    "max-potential-fid",
    "speed-index",
    "interactive",
    "server-response-time",
]

const CORE_VITAL_LABELS: Record<string, string> = {
    "largest-contentful-paint": "Largest Contentful Paint",
    "first-contentful-paint": "First Contentful Paint",
    "cumulative-layout-shift": "Cumulative Layout Shift",
    "total-blocking-time": "Total Blocking Time",
    "max-potential-fid": "Max Potential First Input Delay",
    "speed-index": "Speed Index",
    interactive: "Time to Interactive",
    "server-response-time": "Server Response Time",
}

interface VitalThresholds {
    good: number
    poor: number
    unit: string
}

const CORE_VITAL_THRESHOLDS: Record<string, VitalThresholds> = {
    "largest-contentful-paint": { good: 2500, poor: 4000, unit: "millisecond" },
    "first-contentful-paint": { good: 1800, poor: 3000, unit: "millisecond" },
    "cumulative-layout-shift": { good: 0.1, poor: 0.25, unit: "unitless" },
    "total-blocking-time": { good: 200, poor: 600, unit: "millisecond" },
    "max-potential-fid": { good: 130, poor: 250, unit: "millisecond" },
    "speed-index": { good: 3400, poor: 5800, unit: "millisecond" },
    interactive: { good: 3800, poor: 7300, unit: "millisecond" },
    "server-response-time": { good: 800, poor: 1800, unit: "millisecond" },
}

interface LighthouseAudit {
    id?: string
    title?: string
    description?: string
    score?: number | null
    scoreDisplayMode?: string
    numericValue?: number | null
    numericUnit?: string | null
    displayValue?: string | null
    scoringOptions?: {
        p10?: number
        median?: number
    }
    details?: unknown
}

function formatValue(value: number | null, unit: string): string {
    if (value === null) return ""
    if (unit === "millisecond") return `${Math.round(value)} ms`
    if (unit === "second") return `${(value / 1000).toFixed(1)} s`
    if (unit === "unitless") return value.toFixed(3)
    return `${value}`
}

export function parseCoreVitals(report: LighthouseReport): CoreVital[] {
    const result: CoreVital[] = []

    for (const id of CORE_VITAL_IDS) {
        const audit = report.audits?.[id] as LighthouseAudit | undefined
        if (!audit) continue

        const numericValue = audit.numericValue ?? null
        const score = audit.score ?? null
        const thresholds = CORE_VITAL_THRESHOLDS[id]
        let status: CoreVital["status"] = "needs-improvement"

        if (numericValue !== null && thresholds) {
            if (numericValue <= thresholds.good) {
                status = "good"
            } else if (numericValue >= thresholds.poor) {
                status = "poor"
            } else {
                status = "needs-improvement"
            }
        } else if (score !== null) {
            status = getScoreStatus(score)
        }

        result.push({
            id,
            title: CORE_VITAL_LABELS[id] || audit.title || id,
            value: numericValue ?? 0,
            unit: audit.numericUnit || thresholds?.unit || "",
            displayValue:
                audit.displayValue ||
                formatValue(
                    numericValue,
                    audit.numericUnit || thresholds?.unit || ""
                ),
            score,
            scoreColor: getScoreColor(score).text,
            p10: audit.scoringOptions?.p10 ?? null,
            median: audit.scoringOptions?.median ?? null,
            status,
        })
    }

    return result
}

const CATEGORY_MAP: Record<string, string> = {
    "uses-http2": "Network",
    "uses-rel-preconnect": "Network",
    "uses-rel-preload": "Network",
    "server-response-time": "Network",
    "uses-optimized-images": "Images",
    "uses-responsive-images": "Images",
    "image-aspect-ratio": "Images",
    "image-size-responsive": "Images",
    "efficient-animated-content": "Images",
    "uses-webp-images": "Images",
    "uses-text-compression": "Network",
    "uses-long-cache-ttl": "Network",
    "bootup-time": "JavaScript",
    "mainthread-work-breakdown": "JavaScript",
    "dom-size": "JavaScript",
    "no-document-write": "JavaScript",
    "uses-unminified-javascript": "JavaScript",
    "third-party-summary": "Third-party",
    "third-party-facades": "Third-party",
    lcp: "Performance",
    "largest-contentful-paint": "Performance",
    "first-contentful-paint": "Performance",
    "speed-index": "Performance",
    interactive: "Performance",
    "total-blocking-time": "Performance",
    "cumulative-layout-shift": "Performance",
    "max-potential-fid": "Performance",
    "first-meaningful-paint": "Performance",
    "render-blocking-resources": "Performance",
    "unused-css-rules": "CSS",
    "unused-javascript": "JavaScript",
    "unminified-css": "CSS",
    "unminified-javascript": "JavaScript",
    "font-display": "Fonts",
    "external-anchors-use-rel-noopener": "Security",
    geolocation: "UX",
    "document-title": "SEO",
    "meta-description": "SEO",
    "http-status-code": "SEO",
    "link-text": "SEO",
    "crawlable-anchors": "SEO",
    "robots-txt": "SEO",
    "tap-targets": "Accessibility",
    "color-contrast": "Accessibility",
    "image-alt": "Accessibility",
    "link-name": "Accessibility",
    "button-name": "Accessibility",
    "aria-required-attr": "Accessibility",
    "aria-required-children": "Accessibility",
    "valid-lang": "Accessibility",
    "video-caption": "Accessibility",
    "use-landmarks": "Accessibility",
    "heading-order": "Accessibility",
    plugins: "Best Practices",
    doctype: "Best Practices",
    charset: "Best Practices",
    "no-vulnerable-libraries": "Best Practices",
    "js-libraries": "Best Practices",
    "notification-on-start": "Best Practices",
    deprecations: "Best Practices",
    "password-inputs-can-be-pasted-into": "Best Practices",
    "errors-in-console": "Best Practices",
}

function inferCategory(id: string): string {
    if (CATEGORY_MAP[id]) return CATEGORY_MAP[id]

    const lower = id.toLowerCase()
    if (lower.includes("accessibility") || lower.includes("aria"))
        return "Accessibility"
    if (lower.includes("seo")) return "SEO"
    if (lower.includes("pwa")) return "PWA"
    if (
        lower.includes("performance") ||
        lower.includes("paint") ||
        lower.includes("load")
    )
        return "Performance"
    if (lower.includes("network") || lower.includes("response"))
        return "Network"
    if (lower.includes("image") || lower.includes("img")) return "Images"
    if (
        lower.includes("javascript") ||
        lower.includes("js") ||
        lower.includes("script")
    )
        return "JavaScript"
    if (lower.includes("css") || lower.includes("style")) return "CSS"
    if (lower.includes("best-practices") || lower.includes("best practice"))
        return "Best Practices"
    if (lower.includes("third-party")) return "Third-party"

    return "Other"
}

export function parseAudits(report: LighthouseReport): AuditItem[] {
    const result: AuditItem[] = []

    if (!report.audits) return result

    for (const [id, audit] of Object.entries(report.audits)) {
        if (!audit || typeof audit !== "object") continue

        const a = audit as LighthouseAudit

        const scoreDisplayMode = a.scoreDisplayMode || "numeric"
        if (
            scoreDisplayMode === "informative" ||
            scoreDisplayMode === "notApplicable" ||
            scoreDisplayMode === "manual"
        ) {
            continue
        }

        const score = typeof a.score === "number" ? a.score : null

        result.push({
            id,
            title: a.title || id,
            description: a.description || "",
            score,
            scoreDisplayMode,
            numericValue: a.numericValue ?? null,
            displayValue: a.displayValue || null,
            category: inferCategory(id),
            impact: getImpactFromScore(score),
            details: a.details || null,
        })
    }

    return result
}

export function groupByImpact(
    audits: AuditItem[]
): Record<string, AuditItem[]> {
    const groups: Record<string, AuditItem[]> = {
        high: [],
        medium: [],
        low: [],
        informative: [],
    }

    for (const audit of audits) {
        if (groups[audit.impact]) {
            groups[audit.impact].push(audit)
        }
    }

    for (const key of Object.keys(groups)) {
        groups[key].sort((a, b) => {
            const scoreA = a.score ?? 1
            const scoreB = b.score ?? 1
            return scoreA - scoreB
        })
    }

    return groups
}
