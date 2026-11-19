/** Shapes returned by the admin-only Express endpoints. */

import type { UserRole } from "./constants"
import type { Pagination } from "./api"

export interface AdminUser {
  _id: string
  name: string
  email: string
  image: string | null
  role: UserRole | null
  isBlocked: boolean
  businessName: string | null
  subscriptionPlan: "free" | "premium"
  subscriptionExpiresAt: string | null
  createdAt: string
}

export interface AdminUserDetail extends AdminUser {
  services: number
  pendingServices: number
  bookings: number
  acceptedBookings: number
}

export interface AdminTransaction {
  _id: string
  stripeSessionId: string
  vendorId: string
  vendorName: string
  vendorEmail: string
  plan: "free" | "premium"
  amount: number
  currency: string
  status: string
  createdAt: string
}

export interface AdminTransactionSummary {
  count: number
  successfulCount: number
  revenueCents: number
}

export interface AdminListResponse<T> {
  items: T[]
  pagination: Pagination
}

export const EMPTY_ADMIN_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

export const roleText = (role: UserRole | null): string => {
  switch (role) {
    case "admin":
      return "Administrator"
    case "vendor":
      return "Vendor"
    case "customer":
      return "Customer"
    default:
      return "Unassigned"
  }
}

export const formatAdminDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

/** Stripe amounts arrive in minor units. */
export const formatTransactionAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount / 100)

export const transactionStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "paid":
    case "completed":
      return "Successful"
    case "failed":
      return "Failed"
    case "pending":
      return "Pending"
    default:
      return status
  }
}

export const isSuccessfulStatus = (status: string): boolean =>
  ["succeeded", "paid", "completed"].includes(status.toLowerCase())
