"use client"

import * as React from "react"
import { Activity, Gauge, Shield, Search } from "lucide-react"

import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { type CategoryScore } from "@/lib/lighthouse-parser"

interface ScoreCardsProps {
    categories: CategoryScore[]
    className?: string
}

function getScoreIcon(id: string) {
    switch (id) {
        case "performance":
            return <Activity className="size-4" />
        case "accessibility":
            return <Shield className="size-4" />
        case "seo":
            return <Search className="size-4" />
        case "pwa":
            return <Gauge className="size-4" />
        default:
            return <Activity className="size-4" />
    }
}

function getScoreLabel(score: number | null): string {
    if (score === null) return "N/A"
    if (score >= 0.9) return "Good"
    if (score >= 0.5) return "Needs Improvement"
    return "Poor"
}

export function ScoreCards({ categories, className }: ScoreCardsProps) {
    if (categories.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-4 lg:px-6 @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <CardDescription>Loading...</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div
            className={`grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @3xl/main:grid-cols-${Math.min(categories.length, 4)} ${className || ""}`}
        >
            {categories.map((category) => {
                const scorePercent =
                    category.score !== null
                        ? Math.round(category.score * 100)
                        : null
                const scoreColor =
                    category.score !== null
                        ? category.score >= 0.9
                            ? "text-green-600"
                            : category.score >= 0.5
                              ? "text-amber-600"
                              : "text-red-600"
                        : "text-muted-foreground"

                return (
                    <Card
                        key={category.id}
                        className="relative overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                background: `linear-gradient(135deg, ${category.bgColor} 0%, transparent 50%)`,
                            }}
                        />
                        <CardHeader className="relative pb-2">
                            <CardDescription className="flex items-center gap-2">
                                {getScoreIcon(category.id)}
                                {category.title}
                            </CardDescription>
                            <CardTitle
                                className={`text-4xl font-bold tabular-nums ${scoreColor}`}
                            >
                                {scorePercent !== null
                                    ? `${scorePercent}`
                                    : "N/A"}
                                {scorePercent !== null && (
                                    <span className="text-xl">%</span>
                                )}
                            </CardTitle>
                            <CardAction className="pt-2">
                                <div
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium badge-${category.id}`}
                                >
                                    {getScoreLabel(category.score)}
                                </div>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="relative flex-col items-start gap-1.5 text-sm">
                            <div className="flex w-full items-center">
                                <span className="text-muted-foreground">
                                    Score
                                </span>
                                <div className="ml-auto flex items-center">
                                    <span className="font-medium">
                                        {scorePercent !== null
                                            ? `${scorePercent}/100`
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full transition-all duration-500 ${category.score !== null && category.score >= 0.9 ? "bg-green-500" : category.score !== null && category.score >= 0.5 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{
                                        width:
                                            scorePercent !== null
                                                ? `${scorePercent}%`
                                                : "0%",
                                    }}
                                />
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}
