"use client"

import * as React from "react"
import { JsonUpload } from "@/components/json-upload"
import { ScoreCards } from "@/components/score-cards"
import { CoreWebVitalsChart } from "@/components/core-web-vitals-chart"
import { ImpactDistributionChart } from "@/components/impact-distribution-chart"
import { TopIssuesCard } from "@/components/top-issues-card"
import { AuditTable } from "@/components/audit-table"
import {
    parseLighthouseReport,
    type LighthouseReport,
    type CategoryScore,
    type CoreVital,
    type AuditItem,
} from "@/lib/lighthouse-parser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, Globe, Upload, Zap } from "lucide-react"

interface ParsedData {
    url: string
    lighthouseVersion: string
    fetchTime: string
    categories: CategoryScore[]
    coreVitals: CoreVital[]
    audits: AuditItem[]
    topIssues: AuditItem[]
}

export default function DashboardPage() {
    const [uploadedReport, setUploadedReport] =
        React.useState<LighthouseReport | null>(null)
    const [parsedData, setParsedData] = React.useState<ParsedData | null>(null)
    const [isClient, setIsClient] = React.useState(false)

    React.useEffect(() => {
        setIsClient(true)
    }, [])

    React.useEffect(() => {
        if (uploadedReport) {
            const parsed = parseLighthouseReport(uploadedReport)
            setParsedData(parsed as ParsedData)
        } else {
            setParsedData(null)
        }
    }, [uploadedReport])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ""
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {isClient ? (
                        parsedData ? (
                            <>
                                <div className="px-4 lg:px-6">
                                    <Card className="border-l-4 border-l-primary">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Globe className="size-5" />
                                                    <span className="truncate">
                                                        {parsedData.url}
                                                    </span>
                                                </CardTitle>
                                                <a
                                                    href={parsedData.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setUploadedReport(null)
                                                }
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Replace
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                {parsedData.lighthouseVersion && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap className="size-4" />
                                                        Lighthouse v
                                                        {
                                                            parsedData.lighthouseVersion
                                                        }
                                                    </div>
                                                )}
                                                {parsedData.fetchTime && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="size-4" />
                                                        {formatDate(
                                                            parsedData.fetchTime
                                                        )}
                                                    </div>
                                                )}
                                                <Badge variant="outline">
                                                    {parsedData.audits.length}{" "}
                                                    audits
                                                </Badge>
                                                {parsedData.topIssues.length >
                                                    0 && (
                                                    <Badge variant="destructive">
                                                        {
                                                            parsedData.topIssues
                                                                .length
                                                        }{" "}
                                                        issues
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <ScoreCards
                                    categories={parsedData.categories}
                                />

                                <div className="grid gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
                                    <CoreWebVitalsChart
                                        vitals={parsedData.coreVitals}
                                    />
                                    <ImpactDistributionChart
                                        audits={parsedData.audits}
                                    />
                                </div>

                                <div className="px-4 lg:px-6">
                                    <TopIssuesCard
                                        issues={parsedData.topIssues}
                                        categories={parsedData.categories}
                                    />
                                </div>

                                <div className="px-4 lg:px-6">
                                    <h2 className="mb-4 text-lg font-semibold">
                                        All Audits
                                    </h2>
                                    <AuditTable audits={parsedData.audits} />
                                </div>
                            </>
                        ) : (
                            <div className="px-4 lg:px-6">
                                <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
                                    <div className="text-center">
                                        <p className="text-lg font-medium">
                                            No Lighthouse Report Loaded
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Upload a Lighthouse JSON report to
                                            see the analysis
                                        </p>
                                        <div className="mt-6">
                                            <JsonUpload
                                                onDataLoaded={setUploadedReport}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="px-4 lg:px-6">
                            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
                                <p className="text-muted-foreground">
                                    Loading...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
