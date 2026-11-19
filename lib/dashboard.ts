/** Shapes returned by the role-scoped dashboard statistics APIs. */

export interface CustomerDashboardStats {
  total: number
  pending: number
  accepted: number
  rejected: number
  cancelled: number
}

export interface VendorDashboardStats {
  totalServices: number
  activeServices: number
  pendingServices: number
  totalRequests: number
  pendingRequests: number
  acceptedBookings: number
  plan: "free" | "premium"
  planExpiresAt: string | null
  isPremium: boolean
}

export interface AdminDashboardStats {
  users: number
  vendors: number
  customers: number
  blockedUsers: number
  services: number
  pendingServices: number
  bookings: number
  transactions: number
  revenueCents: number
}

export const dashboardEndpointFor = (
  role: "customer" | "vendor" | "admin",
): string => {
  switch (role) {
    case "customer":
      return "/dashboard/customer"
    case "vendor":
      return "/dashboard/vendor"
    case "admin":
      return "/admin/stats"
  }
}

/** Stripe amounts arrive in minor units; display them in major units. */
export const formatMoney = (cents: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100)

export const formatExpiry = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
