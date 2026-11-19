import type { Metadata } from "next"

import { AdminOverviewPanel } from "@/components/dashboard/overview-panel"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Admin dashboard",
}

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "there"

  return <AdminOverviewPanel firstName={firstName} />
}
