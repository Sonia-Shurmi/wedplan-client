import type { Metadata } from "next"
import { CalendarDays, Heart, Wallet } from "lucide-react"

import { DashboardOverview } from "@/components/dashboard/overview"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Customer dashboard",
}

export default async function CustomerDashboardPage() {
  const session = await requireRole("customer")
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "there"

  return (
    <DashboardOverview
      eyebrow="Customer dashboard"
      title={`Welcome back, ${firstName}`}
      description="Your wedding planning hub. Keep the vendors you love in one place, compare quotes and track every booking from enquiry to celebration."
      stats={[
        {
          label: "Saved vendors",
          value: "0",
          hint: "Shortlist photographers, venues and florists you want to revisit.",
          icon: Heart,
        },
        {
          label: "Bookings",
          value: "0",
          hint: "Confirmed and pending bookings will appear here with dates.",
          icon: CalendarDays,
        },
        {
          label: "Budget tracked",
          value: "—",
          hint: "Set a budget and see how each booking moves the total.",
          icon: Wallet,
        },
      ]}
      actions={[
        { label: "Browse services", href: "/services" },
        { label: "Back to home", href: "/" },
      ]}
      note="Your numbers update as soon as you save a vendor or send your first booking request."
    />
  )
}
