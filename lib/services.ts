/** Types shared by the public browse UI and, later, the vendor forms. */

export interface ServiceVendor {
  _id: string
  name: string
  businessName: string | null
  image: string | null
  subscriptionPlan: "free" | "premium"
}

export interface Service {
  _id: string
  vendorId: string
  serviceName: string
  category: string
  description: string
  price: number
  currency: "USD"
  location: string
  images: string[]
  status: "pending" | "approved" | "rejected"
  isActive: boolean
  vendor: ServiceVendor | null
  isPremiumVendor: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceSort = "newest" | "price_asc" | "price_desc"

export const SERVICE_SORTS: readonly {
  value: ServiceSort
  label: string
}[] = [
  { value: "newest", label: "Featured & Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const

export const isServiceSort = (value: unknown): value is ServiceSort =>
  typeof value === "string" && SERVICE_SORTS.some((sort) => sort.value === value)

/** Client-side fallback used before the first response arrives. */
export const EMPTY_PAGINATION = {
  total: 0,
  page: 1,
  limit: 9,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

export const formatServicePrice = (price: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price)

/** Services are seeded with a placeholder path until vendors upload photos. */
export const serviceImage = (service: Service) =>
  service.images?.[0] || "/images/wedding.jpg"

export const vendorLabel = (service: Service) =>
  service.vendor?.businessName?.trim() || service.vendor?.name || "WedPlan vendor"
