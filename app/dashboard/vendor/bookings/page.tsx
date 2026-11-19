import type { Metadata } from "next"

import { VendorBookings } from "@/components/bookings/vendor-bookings"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Booking requests",
  description: "Review and respond to couples enquiring about your services.",
}

export default async function VendorBookingsPage() {
  await requireRole("vendor")

  return <VendorBookings />
}
