"use client"

import { usePathname } from "next/navigation"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    team: "Team",
    settings: "Settings",
}

function formatSegment(segment: string): string {
    return (
        breadcrumbMap[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1)
    )
}

export function SiteHeader() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">
                                Dashboard
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {segments.slice(1).map((segment, index) => {
                            const href =
                                "/dashboard/" +
                                segments.slice(1, index + 2).join("/")
                            const isLast = index === segments.length - 2

                            return (
                                <BreadcrumbItem key={segment}>
                                    <BreadcrumbSeparator />
                                    {isLast ? (
                                        <BreadcrumbPage>
                                            {formatSegment(segment)}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={href}>
                                            {formatSegment(segment)}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}
