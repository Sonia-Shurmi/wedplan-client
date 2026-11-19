import type { Metadata } from "next"
import { CalendarCheck, Sparkles, Store } from "lucide-react"

import { DashboardOverview } from "@/components/dashboard/overview"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Vendor dashboard",
}

export default async function VendorDashboardPage() {
  const session = await requireRole("vendor")
  const businessName = session.user.businessName?.trim()
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "there"

  return (
    <DashboardOverview
      eyebrow="Vendor dashboard"
      title={businessName ? `Welcome back, ${businessName}` : `Welcome back, ${firstName}`}
      description="Your studio at a glance. Publish the services you offer, answer enquiries quickly and keep your availability up to date."
      stats={[
        {
          label: "Active listings",
          value: "0",
          hint: "Each package you publish becomes a listing couples can book.",
          icon: Store,
        },
        {
          label: "Booking requests",
          value: "0",
          hint: "New enquiries wait here until you accept or decline them.",
          icon: CalendarCheck,
        },
        {
          label: "Plan",
          value: "Free",
          hint: "Upgrade when you are ready to feature more listings.",
          icon: Sparkles,
        },
      ]}
      actions={[
        { label: "Browse services", href: "/services" },
        { label: "Back to home", href: "/" },
      ]}
      note="Service creation and booking management are connected in the next steps, so these cards will start filling up right away."
    />
  )
}
