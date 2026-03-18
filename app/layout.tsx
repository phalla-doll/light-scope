import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
    title: {
        default: "Light Scope",
        template: "%s | Light Scope",
    },
    description:
        "A modern visualization tool for Google Chrome Lighthouse reports that transforms raw JSON into clear, actionable insights.",
    keywords: [
        "Lighthouse",
        "Chrome DevTools",
        "Performance",
        "Web Vitals",
        "SEO",
        "Accessibility",
    ],
    authors: [{ name: "Light Scope" }],
    creator: "Light Scope",
    metadataBase: new URL("https://lightscope.dev"),
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://lightscope.dev",
        siteName: "Light Scope",
        title: "Light Scope",
        description:
            "Modern visualization tool for Google Chrome Lighthouse reports",
    },
    twitter: {
        card: "summary_large_image",
        title: "Light Scope",
        description:
            "Modern visualization tool for Google Chrome Lighthouse reports",
    },
    robots: {
        index: true,
        follow: true,
    },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                "antialiased",
                fontMono.variable,
                "font-sans",
                inter.variable
            )}
        >
            <body>
                <ThemeProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
