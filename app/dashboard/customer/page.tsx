import type { Metadata } from "next"

import { CustomerOverviewPanel } from "@/components/dashboard/overview-panel"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Customer dashboard",
}

export default async function CustomerDashboardPage() {
  const session = await requireRole("customer")
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "there"

  return <CustomerOverviewPanel firstName={firstName} />
}
