import type { Metadata } from "next"

import { AdminServices } from "@/components/admin/admin-services"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Admin service moderation",
}

export default async function AdminServicesPage() {
  await requireRole("admin")

  return <AdminServices />
}
