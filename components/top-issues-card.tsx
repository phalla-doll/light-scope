"use client"

import * as React from "react"
import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { type AuditItem, type CategoryScore } from "@/lib/lighthouse-parser"

interface TopIssuesCardProps {
    issues: AuditItem[]
    categories: CategoryScore[]
    className?: string
}

function getImpactIcon(impact: string) {
    switch (impact) {
        case "high":
            return <AlertTriangle className="size-4 text-red-500" />
        case "medium":
            return <AlertCircle className="size-4 text-amber-500" />
        case "low":
            return <Info className="size-4 text-green-500" />
        default:
            return <Info className="size-4 text-muted-foreground" />
    }
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

export function TopIssuesCard({
    issues,
    categories,
    className,
}: TopIssuesCardProps) {
    const groupedByCategory = React.useMemo(() => {
        const groups: Record<string, AuditItem[]> = {}
        for (const issue of issues) {
            if (!groups[issue.category]) {
                groups[issue.category] = []
            }
            groups[issue.category].push(issue)
        }
        return groups
    }, [issues])

    const categoryScores: Record<string, number | null> = {}
    for (const cat of categories) {
        categoryScores[cat.id] = cat.score
    }

    const totalIssues = issues.length

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Top Issues
                    {totalIssues > 0 && (
                        <Badge variant="destructive">{totalIssues}</Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Failing audits that need attention, grouped by category
                </CardDescription>
            </CardHeader>
            <CardContent>
                {totalIssues === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-3 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                            <AlertTriangle className="size-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                            No critical issues!
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            All audits are passing or need minimal attention
                        </p>
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(groupedByCategory).map(
                            ([category, categoryIssues]) => (
                                <AccordionItem key={category} value={category}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            {getImpactIcon(
                                                categoryIssues[0]?.impact ||
                                                    "low"
                                            )}
                                            <span className="font-medium">
                                                {category}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="ml-2"
                                            >
                                                {categoryIssues.length}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pt-2">
                                            {categoryIssues.map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">
                                                                    {
                                                                        issue.title
                                                                    }
                                                                </h4>
                                                                {issue.score !==
                                                                    null && (
                                                                    <Badge
                                                                        variant={
                                                                            issue.score <
                                                                            0.5
                                                                                ? "destructive"
                                                                                : issue.score <
                                                                                    0.9
                                                                                  ? "secondary"
                                                                                  : "outline"
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {Math.round(
                                                                            issue.score *
                                                                                100
                                                                        )}
                                                                        %
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                                {stripHtml(
                                                                    issue.description
                                                                ).slice(0, 150)}
                                                                {issue
                                                                    .description
                                                                    .length >
                                                                150
                                                                    ? "..."
                                                                    : ""}
                                                            </p>
                                                            {issue.displayValue && (
                                                                <p className="mt-2 text-sm">
                                                                    <span className="text-muted-foreground">
                                                                        Current:{" "}
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {
                                                                            issue.displayValue
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {issue.numericValue !==
                                                                null &&
                                                                issue.score !==
                                                                    null &&
                                                                issue.score <
                                                                    1 && (
                                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                                        {issue.numericValue >=
                                                                        1000
                                                                            ? `${(issue.numericValue / 1000).toFixed(2)}s`
                                                                            : `${Math.round(issue.numericValue)}ms`}
                                                                        {issue.score <
                                                                            0.5 &&
                                                                            " - Critical"}
                                                                    </p>
                                                                )}
                                                        </div>
                                                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        )}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    )
}
