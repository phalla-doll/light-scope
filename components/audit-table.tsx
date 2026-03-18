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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { type AuditItem } from "@/lib/lighthouse-parser"

interface SortIconProps {
    columnKey: keyof AuditItem
    currentKey: keyof AuditItem
    direction: "asc" | "desc"
}

function SortIcon({ columnKey, currentKey, direction }: SortIconProps) {
    if (currentKey !== columnKey) return null
    return direction === "asc" ? (
        <ChevronUp className="ml-1 inline size-4" />
    ) : (
        <ChevronDown className="ml-1 inline size-4" />
    )
}

interface AuditTableProps {
    audits: AuditItem[]
    className?: string
}

const IMPACT_COLORS: Record<
    string,
    "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
> = {
    high: "destructive",
    medium: "secondary",
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
            <div className="mb-4 flex flex-col gap-4 px-4 sm:flex-row lg:px-6">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search audits..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                    >
                        <SelectTrigger className="w-[160px]">
                            <Filter className="mr-2 size-4" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={impactFilter}
                        onValueChange={setImpactFilter}
                    >
                        <SelectTrigger className="w-[140px]">
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
                                    <SortIcon
                                        columnKey="title"
                                        currentKey={sortConfig.key}
                                        direction={sortConfig.direction}
                                    />
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    className="flex items-center hover:text-foreground"
                                    onClick={() => handleSort("category")}
                                >
                                    Category
                                    <SortIcon
                                        columnKey="category"
                                        currentKey={sortConfig.key}
                                        direction={sortConfig.direction}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-center">
                                <button
                                    type="button"
                                    className="flex items-center justify-center hover:text-foreground"
                                    onClick={() => handleSort("impact")}
                                >
                                    Impact
                                    <SortIcon
                                        columnKey="impact"
                                        currentKey={sortConfig.key}
                                        direction={sortConfig.direction}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-center">
                                <button
                                    type="button"
                                    className="flex items-center justify-center hover:text-foreground"
                                    onClick={() => handleSort("score")}
                                >
                                    Score
                                    <SortIcon
                                        columnKey="score"
                                        currentKey={sortConfig.key}
                                        direction={sortConfig.direction}
                                    />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAudits.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
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
                                                <AccordionTrigger className="hover:no-underline">
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
                                        <Badge variant="outline">
                                            {audit.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                IMPACT_COLORS[audit.impact]
                                            }
                                        >
                                            {audit.impact
                                                .charAt(0)
                                                .toUpperCase() +
                                                audit.impact.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {audit.score !== null ? (
                                            <span
                                                className={`font-medium ${
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
