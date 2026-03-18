"use client"

import * as React from "react"
import { Upload, FileJson, X } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    lighthouseSchema,
    type LighthouseReport,
} from "@/lib/lighthouse-parser"

interface JsonUploadProps {
    onDataLoaded: (data: LighthouseReport) => void
    className?: string
}

export function JsonUpload({ onDataLoaded, className }: JsonUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false)
    const [fileName, setFileName] = React.useState<string | null>(null)
    const [validationError, setValidationError] = React.useState<string | null>(
        null
    )
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFile = React.useCallback(
        (file: File) => {
            setValidationError(null)

            if (!file.name.endsWith(".json")) {
                const errorMsg = "Please upload a JSON file"
                setValidationError(errorMsg)
                toast.error("Invalid file type", {
                    description: errorMsg,
                })
                return
            }

            setFileName(file.name)

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string)
                    const parsed = lighthouseSchema.safeParse(json)

                    if (parsed.success) {
                        onDataLoaded(parsed.data)
                        toast.success("Lighthouse report loaded", {
                            description: `Successfully parsed report from ${file.name}`,
                        })
                    } else {
                        const firstError = parsed.error.issues[0]
                        let errorMessage = "Data validation failed"

                        if (firstError) {
                            const path = firstError.path.join(".")
                            errorMessage = `${path ? `Field "${path}" ` : ""}${firstError.message}`
                        }

                        setValidationError(errorMessage)
                        toast.error("Invalid Lighthouse report", {
                            description: errorMessage,
                        })
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : "Failed to parse JSON"
                    setValidationError(errorMessage)
                    if (error instanceof z.ZodError) {
                        const firstIssue = error.issues[0]
                        toast.error("Invalid JSON structure", {
                            description: firstIssue?.message || errorMessage,
                        })
                    } else {
                        toast.error("Failed to parse JSON", {
                            description: errorMessage,
                        })
                    }
                }
            }
            reader.readAsText(file)
        },
        [onDataLoaded]
    )

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) {
                handleFile(file)
            }
        },
        [handleFile]
    )

    const handleInputChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                handleFile(file)
            }
        },
        [handleFile]
    )

    const handleClear = React.useCallback(() => {
        setFileName(null)
        setValidationError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        onDataLoaded(null as unknown as LighthouseReport)
    }, [onDataLoaded])

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="none"
            >
                <label
                    className={cn(
                        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        fileName &&
                            !validationError &&
                            "border-green-500/50 bg-green-500/5",
                        validationError && "border-red-500/50 bg-red-500/5"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {fileName ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${validationError ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}
                            >
                                {validationError ? (
                                    <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                                ) : (
                                    <FileJson className="h-6 w-6 text-green-600 dark:text-green-400" />
                                )}
                            </div>
                            <p className="font-medium text-foreground">
                                {fileName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Click to replace or drag a new file
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-foreground">
                                Drop your Lighthouse JSON file here
                            </p>
                            <p className="text-sm text-muted-foreground">
                                or click to browse
                            </p>
                        </div>
                    )}
                </label>
            </div>

            {validationError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    <p className="font-medium">Invalid file format</p>
                    <p className="mt-1">{validationError}</p>
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Expected: Lighthouse JSON report with categories and
                        audits
                    </p>
                </div>
            )}

            {fileName && !validationError && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleClear()
                    }}
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear report
                </Button>
            )}
        </div>
    )
}
