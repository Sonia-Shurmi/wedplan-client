import type { Metadata } from "next"

import { AdminUsers } from "@/components/admin/admin-users"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Admin users",
}

export default async function AdminUsersPage() {
  await requireRole("admin")

  return <AdminUsers />
}
