"use client"

import * as React from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { type CoreVital } from "@/lib/lighthouse-parser"

interface CoreWebVitalsChartProps {
    vitals: CoreVital[]
    className?: string
}

const STATUS_COLORS: Record<string, string> = {
    good: "#22c55e",
    "needs-improvement": "#f59e0b",
    poor: "#ef4444",
}

const SHORT_LABELS: Record<string, string> = {
    "largest-contentful-paint": "LCP",
    "first-contentful-paint": "FCP",
    "cumulative-layout-shift": "CLS",
    "total-blocking-time": "TBT",
    "max-potential-fid": "INP",
    "speed-index": "Speed",
    interactive: "TTI",
    "server-response-time": "Server",
}

export function CoreWebVitalsChart({
    vitals,
    className,
}: CoreWebVitalsChartProps) {
    const chartData = vitals.map((vital) => ({
        name: SHORT_LABELS[vital.id] || vital.title,
        fullName: vital.title,
        value: vital.value,
        displayValue: vital.displayValue,
        status: vital.status,
        color: STATUS_COLORS[vital.status] || "#6b7280",
        score: vital.score,
        p10: vital.p10,
        median: vital.median,
    }))

    const chartConfig: ChartConfig = {
        value: {
            label: "Value",
        },
    }

    const goodCount = vitals.filter((v) => v.status === "good").length
    const needsWorkCount = vitals.filter(
        (v) => v.status === "needs-improvement"
    ).length
    const poorCount = vitals.filter((v) => v.status === "poor").length

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>
                    Performance metrics with threshold indicators
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={true}
                                vertical={false}
                            />
                            <XAxis
                                type="number"
                                tickFormatter={(value) => {
                                    if (value >= 1000)
                                        return `${(value / 1000).toFixed(1)}s`
                                    return `${value}ms`
                                }}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={55}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null
                                    const data = payload[0].payload
                                    return (
                                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                                            <p className="font-semibold">
                                                {data.fullName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Value:{" "}
                                                <span
                                                    className="font-medium"
                                                    style={{
                                                        color: data.color,
                                                    }}
                                                >
                                                    {data.displayValue}
                                                </span>
                                            </p>
                                            {data.score !== null && (
                                                <p className="text-sm text-muted-foreground">
                                                    Score:{" "}
                                                    <span className="font-medium">
                                                        {Math.round(
                                                            data.score * 100
                                                        )}
                                                        %
                                                    </span>
                                                </p>
                                            )}
                                            {data.p10 !== null &&
                                                data.median !== null && (
                                                    <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                                                        <p>
                                                            P10:{" "}
                                                            {data.p10 >= 1000
                                                                ? `${(data.p10 / 1000).toFixed(1)}s`
                                                                : `${data.p10}ms`}
                                                        </p>
                                                        <p>
                                                            Median:{" "}
                                                            {data.median >= 1000
                                                                ? `${(data.median / 1000).toFixed(1)}s`
                                                                : `${data.median}ms`}
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                    )
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {vitals.map((vital) => (
                        <div key={vital.id} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor:
                                        STATUS_COLORS[vital.status],
                                }}
                            />
                            <span className="text-xs">
                                <span className="font-medium">
                                    {SHORT_LABELS[vital.id] || vital.title}
                                </span>
                                <span className="text-muted-foreground">
                                    {" "}
                                    ({vital.displayValue})
                                </span>
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-center gap-6 border-t pt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">
                            Good ({goodCount})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground">
                            Needs Improvement ({needsWorkCount})
                        </span>
                    </div>
                    {poorCount > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">
                                Poor ({poorCount})
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
