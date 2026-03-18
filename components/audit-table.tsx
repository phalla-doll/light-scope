"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Search } from "lucide-react"
import { type AuditItem } from "@/lib/lighthouse-parser"

interface AuditTableProps {
    audits: AuditItem[]
    className?: string
}

const IMPACT_COLORS: Record<
    string,
    "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
> = {
    high: "outline",
    medium: "outline",
    low: "outline",
    informative: "outline",
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

function formatDescription(desc: string): string {
    const stripped = stripHtml(desc)
    if (stripped.length > 300) {
        return stripped.slice(0, 300) + "..."
    }
    return stripped
}

export function AuditTable({ audits, className }: AuditTableProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
    const [impactFilter, setImpactFilter] = React.useState<string>("all")
    const [sortConfig, setSortConfig] = React.useState<{
        key: keyof AuditItem
        direction: "asc" | "desc"
    }>({ key: "score", direction: "asc" })

    const categories = React.useMemo(() => {
        const cats = new Set(audits.map((a) => a.category))
        return Array.from(cats).sort()
    }, [audits])

    const filteredAudits = React.useMemo(() => {
        return audits.filter((audit) => {
            const matchesSearch =
                searchQuery === "" ||
                audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                audit.id.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCategory =
                categoryFilter === "all" || audit.category === categoryFilter

            const matchesImpact =
                impactFilter === "all" || audit.impact === impactFilter

            return matchesSearch && matchesCategory && matchesImpact
        })
    }, [audits, searchQuery, categoryFilter, impactFilter])

    const sortedAudits = React.useMemo(() => {
        return [...filteredAudits].sort((a, b) => {
            let aVal = a[sortConfig.key]
            let bVal = b[sortConfig.key]

            if (aVal === null) aVal = 1
            if (bVal === null) bVal = 1

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortConfig.direction === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal)
            }

            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortConfig.direction === "asc"
                    ? aVal - bVal
                    : bVal - aVal
            }

            return 0
        })
    }, [filteredAudits, sortConfig])

    const handleSort = (key: keyof AuditItem) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
    }

    return (
        <div className={className}>
            <div className="mb-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative max-w-70 flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={impactFilter}
                        onValueChange={setImpactFilter}
                    >
                        <SelectTrigger className="w-35">
                            <SelectValue placeholder="Impact" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Impacts</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                    <TabsList className="scrollbar-hide w-full justify-start overflow-x-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        {categories.map((cat) => (
                            <TabsTrigger key={cat} value={cat}>
                                {cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-lg border px-4 lg:px-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">
                                <button
                                    type="button"
                                    className="flex items-center hover:text-foreground"
                                    onClick={() => handleSort("title")}
                                >
                                    Audit
                                </button>
                            </TableHead>
                            <TableHead className="text-center">
                                <button
                                    type="button"
                                    className="flex items-center justify-center hover:text-foreground"
                                    onClick={() => handleSort("impact")}
                                >
                                    Impact
                                </button>
                            </TableHead>
                            <TableHead className="text-center">
                                <button
                                    type="button"
                                    className="flex items-center justify-center hover:text-foreground"
                                    onClick={() => handleSort("score")}
                                >
                                    Score
                                </button>
                            </TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAudits.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center"
                                >
                                    No audits found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedAudits.map((audit) => (
                                <TableRow key={audit.id}>
                                    <TableCell className="font-medium">
                                        <Accordion
                                            type="single"
                                            collapsible
                                            className="w-full"
                                        >
                                            <AccordionItem
                                                value={audit.id}
                                                className="border-none"
                                            >
                                                <AccordionTrigger className="hover:no-underline [&>svg]:hidden data-[state=open]:[&>svg]:hidden">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="text-sm">
                                                            {audit.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {audit.id}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                                                        <p className="whitespace-pre-wrap">
                                                            {formatDescription(
                                                                audit.description
                                                            )}
                                                        </p>
                                                        <a
                                                            href={`https://developer.chrome.com/docs/lighthouse/${audit.id}/`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                                        >
                                                            Learn more
                                                        </a>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                IMPACT_COLORS[audit.impact]
                                            }
                                            className={
                                                audit.impact === "high"
                                                    ? "bg-red-100  border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-500"
                                                    : audit.impact === "medium"
                                                      ? "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-500"
                                                      : undefined
                                            }
                                        >
                                            {audit.impact
                                                .charAt(0)
                                                .toUpperCase() +
                                                audit.impact.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {audit.score !== null ? (
                                            <span
                                                className={`font-mono font-medium tabular-nums ${
                                                    audit.score >= 0.9
                                                        ? "text-green-600"
                                                        : audit.score >= 0.5
                                                          ? "text-amber-600"
                                                          : "text-red-600"
                                                }`}
                                            >
                                                {Math.round(audit.score * 100)}%
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                N/A
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {audit.displayValue || "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-2 px-4 text-sm text-muted-foreground lg:px-6">
                Showing {sortedAudits.length} of {audits.length} audits
            </div>
        </div>
    )
}
