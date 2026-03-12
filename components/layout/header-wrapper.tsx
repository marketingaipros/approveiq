"use client"

import dynamic from "next/dynamic"

// Dynamic import MUST live in a Client Component when using ssr:false.
// This wrapper is the minimal client boundary that prevents Radix UI
// hydration mismatches from useId() in the Header's Sheet/DropdownMenu.
const HeaderClient = dynamic(
    () => import("@/components/layout/header").then(m => m.Header),
    {
        ssr: false,
        loading: () => <div className="flex h-14 shrink-0 items-center border-b px-4 lg:px-6" />
    }
)

export function HeaderWrapper({ userId }: { userId?: string }) {
    return <HeaderClient userId={userId} />
}
