import type { Metadata } from "next"

import { CustomerBookings } from "@/components/bookings/customer-bookings"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "My bookings",
  description: "Track your wedding booking requests and vendor responses.",
}

export default async function CustomerBookingsPage() {
  await requireRole("customer")

  return <CustomerBookings />
}
