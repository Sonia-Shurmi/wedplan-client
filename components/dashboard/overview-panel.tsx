"use client"

import { useEffect, useState } from "react"
import {
  CalendarCheck,
  CircleCheck,
  CircleX,
  Clock3,
  Inbox,
  Receipt,
  RotateCw,
  ShieldAlert,
  Store,
  TriangleAlert,
  Users,
  UserRound,
  Wallet,
  Sparkles,
} from "lucide-react"

import {
  formatExpiry,
  formatMoney,
  type AdminDashboardStats,
  type CustomerDashboardStats,
  type VendorDashboardStats,
} from "@/lib/dashboard"
import { ApiError, api } from "@/lib/api"

import { DashboardOverview, type OverviewStat } from "./overview"

interface StatsState<T> {
  key: number
  data: T | null
  error: string | null
}

/** Fetches on mount and on retry; stale requests are aborted on unmount. */
const useStats = <T,>(endpoint: string) => {
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState<StatsState<T>>({
    key: -1,
    data: null,
    error: null,
  })

  const isLoading = state.key !== retryKey

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<T>(endpoint, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return

        setState({
          key: retryKey,
          data: response.data ?? null,
          error: null,
        })
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return

        setState({
          key: retryKey,
          data: null,
          error:
            reason instanceof ApiError
              ? reason.message
              : "We could not load your dashboard statistics.",
        })
      })

    return () => controller.abort()
  }, [endpoint, retryKey])

  return {
    data: isLoading ? null : state.data,
    error: isLoading ? null : state.error,
    isLoading,
    retry: () => setRetryKey((key) => key + 1),
  }
}

function OverviewSkeleton() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-label="Loading dashboard statistics"
    >
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-64 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-border bg-card/60"
          />
        ))}
      </div>
    </div>
  )
}

function OverviewError({
  message,
  onRetry,
}: {
  message: string | null
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert size={20} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-foreground">
            Your dashboard numbers could not be loaded.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {message ?? "Please try again in a moment."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-wedplan-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            <RotateCw size={14} />
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

export function CustomerOverviewPanel({ firstName }: { firstName: string }) {
  const { data, error, isLoading, retry } =
    useStats<CustomerDashboardStats>("/dashboard/customer")

  if (isLoading) return <OverviewSkeleton />
  if (error || !data) return <OverviewError message={error} onRetry={retry} />

  const stats: OverviewStat[] = [
    {
      label: "Booking requests",
      value: String(data.total),
      hint: "Every enquiry you have sent through WedPlan.",
      icon: CalendarCheck,
    },
    {
      label: "Awaiting reply",
      value: String(data.pending),
      hint: "Vendors have not answered these yet.",
      icon: Clock3,
    },
    {
      label: "Confirmed",
      value: String(data.accepted),
      hint: "Requests a vendor has accepted.",
      icon: CircleCheck,
    },
    {
      label: "Declined",
      value: String(data.rejected),
      hint: `${data.cancelled} request${data.cancelled === 1 ? "" : "s"} withdrawn by you.`,
      icon: CircleX,
    },
  ]

  return (
    <DashboardOverview
      eyebrow="Customer dashboard"
      title={`Welcome back, ${firstName}`}
      description="Your wedding planning hub. Keep the vendors you love in one place, compare quotes and track every booking from enquiry to celebration."
      stats={stats}
      actions={[
        { label: "My bookings", href: "/dashboard/customer/bookings" },
        { label: "Browse services", href: "/services" },
      ]}
    />
  )
}

export function VendorOverviewPanel({
  firstName,
  businessName,
}: {
  firstName: string
  businessName?: string | null
}) {
  const { data, error, isLoading, retry } =
    useStats<VendorDashboardStats>("/dashboard/vendor")

  if (isLoading) return <OverviewSkeleton />
  if (error || !data) return <OverviewError message={error} onRetry={retry} />

  const planIsLive = data.plan === "premium" && data.isPremium
  const planHint = planIsLive
    ? data.planExpiresAt
      ? `Premium access until ${formatExpiry(data.planExpiresAt)}.`
      : "Premium access is active."
    : data.plan === "premium"
      ? "Your Premium access has expired."
      : "Upgrade when you are ready to feature more listings."

  const stats: OverviewStat[] = [
    {
      label: "Service listings",
      value: String(data.totalServices),
      hint: `${data.pendingServices} awaiting admin review.`,
      icon: Store,
    },
    {
      label: "Live packages",
      value: String(data.activeServices),
      hint: "Approved and visible to couples.",
      icon: Sparkles,
    },
    {
      label: "New enquiries",
      value: String(data.pendingRequests),
      hint: "Waiting for your answer.",
      icon: Inbox,
    },
    {
      label: "Confirmed bookings",
      value: String(data.acceptedBookings),
      hint: `${data.totalRequests} request${data.totalRequests === 1 ? "" : "s"} in total.`,
      icon: CalendarCheck,
    },
    {
      label: "Your plan",
      value: planIsLive ? "Premium" : "Free",
      hint: planHint,
      icon: Wallet,
    },
  ]

  return (
    <DashboardOverview
      eyebrow="Vendor dashboard"
      title={
        businessName ? `Welcome back, ${businessName}` : `Welcome back, ${firstName}`
      }
      description="Your studio at a glance. Publish the services you offer, answer enquiries quickly and keep your availability up to date."
      stats={stats}
      actions={[
        { label: "Booking requests", href: "/dashboard/vendor/bookings" },
        { label: "Add a service", href: "/dashboard/vendor/services/new" },
        {
          label: planIsLive ? "Manage plan" : "Upgrade to Premium",
          href: "/dashboard/vendor/subscription",
        },
      ]}
    />
  )
}

export function AdminOverviewPanel({ firstName }: { firstName: string }) {
  const { data, error, isLoading, retry } =
    useStats<AdminDashboardStats>("/admin/stats")

  if (isLoading) return <OverviewSkeleton />
  if (error || !data) return <OverviewError message={error} onRetry={retry} />

  const stats: OverviewStat[] = [
    {
      label: "Total users",
      value: String(data.users),
      hint: `${data.blockedUsers} account${data.blockedUsers === 1 ? "" : "s"} restricted.`,
      icon: ShieldAlert,
    },
    {
      label: "Customers",
      value: String(data.customers),
      hint: "Couples planning their celebration.",
      icon: UserRound,
    },
    {
      label: "Vendors",
      value: String(data.vendors),
      hint: "Businesses publishing services.",
      icon: Users,
    },
    {
      label: "Services",
      value: String(data.services),
      hint: `${data.pendingServices} awaiting your review.`,
      icon: Store,
    },
    {
      label: "Bookings",
      value: String(data.bookings),
      hint: "Requests across the marketplace.",
      icon: CalendarCheck,
    },
    {
      label: "Transactions",
      value: String(data.transactions),
      hint: "Created by verified payment webhooks.",
      icon: Receipt,
    },
    {
      label: "Revenue",
      value: formatMoney(data.revenueCents),
      hint: "From successful payments only.",
      icon: Wallet,
    },
  ]

  return (
    <DashboardOverview
      eyebrow="Admin dashboard"
      title={`Welcome back, ${firstName}`}
      description="Marketplace health at a glance: who has joined, which vendors are publishing and what needs a second look."
      stats={stats}
      actions={[
        { label: "Browse services", href: "/services" },
        { label: "Back to home", href: "/" },
      ]}
      note="User moderation and the transaction ledger arrive with the admin dashboard step. These numbers are read directly from the database."
    />
  )
}
