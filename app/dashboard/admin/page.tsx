import type { Metadata } from "next"
import { ShieldCheck, Store, Users } from "lucide-react"

import { DashboardOverview } from "@/components/dashboard/overview"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Admin dashboard",
}

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "there"

  return (
    <DashboardOverview
      eyebrow="Admin dashboard"
      title={`Welcome back, ${firstName}`}
      description="Marketplace health at a glance: who has joined, which vendors are publishing and what needs a second look."
      stats={[
        {
          label: "Customers",
          value: "0",
          hint: "Couples with an active account on the marketplace.",
          icon: Users,
        },
        {
          label: "Vendors",
          value: "0",
          hint: "Businesses that can publish services and take bookings.",
          icon: Store,
        },
        {
          label: "Restricted accounts",
          value: "0",
          hint: "Accounts currently blocked from signing in.",
          icon: ShieldCheck,
        },
      ]}
      actions={[
        { label: "Browse services", href: "/services" },
        { label: "Back to home", href: "/" },
      ]}
      note="User and vendor management tools arrive with the admin dashboard step. Until then this page confirms that role protection is working."
    />
  )
}
