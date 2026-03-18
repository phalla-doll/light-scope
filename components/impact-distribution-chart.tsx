"use client"

import * as React from "react"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { type AuditItem } from "@/lib/lighthouse-parser"

interface ImpactDistributionChartProps {
    audits: AuditItem[]
    className?: string
}

const IMPACT_COLORS: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
    informative: "#6b7280",
}

const IMPACT_LABELS: Record<string, string> = {
    high: "High Impact",
    medium: "Medium Impact",
    low: "Low Impact",
    informative: "Informative",
}

export function ImpactDistributionChart({
    audits,
    className,
}: ImpactDistributionChartProps) {
    const impactCounts = React.useMemo(() => {
        const counts: Record<string, number> = {
            high: 0,
            medium: 0,
            low: 0,
            informative: 0,
        }

        for (const audit of audits) {
            if (counts[audit.impact] !== undefined) {
                counts[audit.impact]++
            }
        }

        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name,
                value,
                label: IMPACT_LABELS[name],
                color: IMPACT_COLORS[name],
            }))
    }, [audits])

    const chartConfig: ChartConfig = {
        impact: {
            label: "Impact Level",
        },
    }

    const totalAudits = audits.length
    const highImpactCount =
        impactCounts.find((c) => c.name === "high")?.value || 0
    const mediumImpactCount =
        impactCounts.find((c) => c.name === "medium")?.value || 0
    const lowImpactCount =
        impactCounts.find((c) => c.name === "low")?.value || 0

    const passingCount = audits.filter(
        (a) => a.score !== null && a.score >= 0.9
    ).length
    const passRate =
        totalAudits > 0 ? Math.round((passingCount / totalAudits) * 100) : 0

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Audit Impact Distribution</CardTitle>
                <CardDescription>
                    Issues grouped by performance impact level
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-square h-[250px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={impactCounts}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    label={({ value }) => `${value}`}
                                    labelLine={false}
                                >
                                    {impactCounts.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={entry.color}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length)
                                            return null
                                        const data = payload[0].payload
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                <p className="font-semibold">
                                                    {data.label}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {data.value} audits (
                                                    {Math.round(
                                                        (data.value /
                                                            totalAudits) *
                                                            100
                                                    )}
                                                    %)
                                                </p>
                                            </div>
                                        )
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => (
                                        <span className="text-sm text-foreground">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold">
                                {totalAudits}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Total Audits
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                        {highImpactCount > 0 && (
                            <div
                                className="bg-red-500 transition-all duration-500"
                                style={{
                                    width: `${(highImpactCount / totalAudits) * 100}%`,
                                }}
                                title={`High: ${highImpactCount}`}
                            />
                        )}
                        {mediumImpactCount > 0 && (
                            <div
                                className="bg-amber-500 transition-all duration-500"
                                style={{
                                    width: `${(mediumImpactCount / totalAudits) * 100}%`,
                                }}
                                title={`Medium: ${mediumImpactCount}`}
                            />
                        )}
                        {lowImpactCount > 0 && (
                            <div
                                className="bg-green-500 transition-all duration-500"
                                style={{
                                    width: `${(lowImpactCount / totalAudits) * 100}%`,
                                }}
                                title={`Low: ${lowImpactCount}`}
                            />
                        )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{highImpactCount} High</span>
                        <span>{mediumImpactCount} Medium</span>
                        <span>{lowImpactCount} Low</span>
                    </div>
                </div>

                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pass Rate</span>
                        <span
                            className={`font-semibold ${passRate >= 80 ? "text-green-600" : passRate >= 50 ? "text-amber-600" : "text-red-600"}`}
                        >
                            {passRate}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
