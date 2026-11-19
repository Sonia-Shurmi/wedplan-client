/** Types and formatting helpers shared by the customer and vendor booking UIs. */

import type { Pagination } from "@/lib/api"

export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled"

export interface BookingServiceSummary {
  _id: string
  serviceName: string
  category: string
  price: number
  currency: "USD"
  location: string
  images: string[]
}

export interface BookingVendorSummary {
  _id: string
  name: string
  businessName: string | null
  image: string | null
}

export interface BookingCustomerSummary {
  _id: string
  name: string
  email: string
  image: string | null
}

export interface Booking {
  _id: string
  serviceId: string
  vendorId: string
  customerId: string
  /** ISO timestamp at UTC midnight of the requested calendar day. */
  eventDate: string
  eventLocation: string
  message: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
  service: BookingServiceSummary | null
  vendor: BookingVendorSummary | null
  customer: BookingCustomerSummary | null
}

export const BOOKING_STATUSES: readonly {
  value: BookingStatus
  label: string
}[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const

export const isBookingStatus = (value: string): value is BookingStatus =>
  BOOKING_STATUSES.some((status) => status.value === value)

export const EMPTY_BOOKING_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

const formatUtc = (value: string, withTime = false) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable"
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date)
}

/** Event dates are stored at UTC midnight, so format them in UTC as well. */
export const formatEventDate = (value: string) => formatUtc(value)

export const formatRequestDate = (value: string) => formatUtc(value, true)

export const bookingImage = (booking: Booking) =>
  booking.service?.images?.[0] || "/images/wedding.jpg"

export const vendorName = (booking: Booking) =>
  booking.vendor?.businessName?.trim() || booking.vendor?.name || "WedPlan vendor"

export const customerName = (booking: Booking) =>
  booking.customer?.name?.trim() || "WedPlan customer"
