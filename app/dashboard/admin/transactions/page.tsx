import type { Metadata } from "next"

import { AdminTransactions } from "@/components/admin/admin-transactions"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Admin transactions",
}

export default async function AdminTransactionsPage() {
  await requireRole("admin")

  return <AdminTransactions />
}
