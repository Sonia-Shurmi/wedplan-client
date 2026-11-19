import type { Metadata } from "next"

import { VendorOverviewPanel } from "@/components/dashboard/overview-panel"
import VendorServicesPanel from "@/components/vendor/vendor-services-panel"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Vendor dashboard",
}

export default async function VendorDashboardPage() {
  const session = await requireRole("vendor")
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "there"

  return (
    <>
      <VendorOverviewPanel
        firstName={firstName}
        businessName={session.user.businessName}
      />

      <div className="mt-12">
        <VendorServicesPanel />
      </div>
    </>
  )
}
