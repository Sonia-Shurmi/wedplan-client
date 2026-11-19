import type { Metadata } from "next"

import Navbar from "@/components/layout/navbar"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Server-side gate: role and blocked state come from the database, not from
  // the optimistic cookie check in `proxy.ts`.
  await requireSession()

  return (
    <>
      <Navbar />
      <main className="min-h-[70svh] bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {children}
        </div>
      </main>
    </>
  )
}
