import type { Metadata } from "next"

import { SubscriptionPanel } from "@/components/vendor/subscription-panel"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Plans & billing",
}

export default async function VendorSubscriptionPage() {
  await requireRole("vendor")

  return <SubscriptionPanel />
}
