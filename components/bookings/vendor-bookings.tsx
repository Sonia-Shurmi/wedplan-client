"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  MapPin,
  TriangleAlert,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge"
import { EmptyState } from "@/components/bookings/empty-state"
import { ApiError, api, type Pagination } from "@/lib/api"
import {
  BOOKING_STATUSES,
  EMPTY_BOOKING_PAGINATION,
  bookingImage,
  customerName,
  formatEventDate,
  formatRequestDate,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type StatusFilter = BookingStatus | "all"
type Decision = "accepted" | "rejected"

interface ListResult {
  key: string
  items: Booking[]
  pagination: Pagination
  error: string | null
}

const filters: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...BOOKING_STATUSES,
]

export function VendorBookings() {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const requestKey = `${status}|${page}|${reloadKey}`
  const isLoading = !result || result.key !== requestKey
  const bookings = isLoading ? [] : (result?.items ?? [])
  const pagination = isLoading ? EMPTY_BOOKING_PAGINATION : (result?.pagination ?? EMPTY_BOOKING_PAGINATION)
  const error = isLoading ? null : (result?.error ?? null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    })
    if (status !== "all") {
      params.set("status", status)
    }

    api
      .get<Booking[]>(`/vendor/bookings?${params.toString()}`, {
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          items: response.data ?? [],
          pagination: response.pagination ?? EMPTY_BOOKING_PAGINATION,
          error: null,
        })
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          items: [],
          pagination: EMPTY_BOOKING_PAGINATION,
          error:
            reason instanceof ApiError
              ? reason.message
              : "We could not load your booking requests.",
        })
      })

    return () => controller.abort()
  }, [status, page, reloadKey, requestKey])

  const decide = async (booking: Booking, decision: Decision) => {
    // Only pending rows are actionable. The API repeats this check from the
    // database, so a stale page cannot accept an already-answered request.
    if (booking.status !== "pending" || busyId) {
      return
    }

    setBusyId(booking._id)

    try {
      await api.patch<Booking>(`/vendor/bookings/${booking._id}`, {
        status: decision,
      })

      toast.success(
        decision === "accepted"
          ? `Accepted ${customerName(booking)}'s request.`
          : "Request declined.",
      )

      // No optimistic update: the server's response is authoritative. A
      // refetch also removes the row from a "pending" filter if one is active.
      setReloadKey((value) => value + 1)
    } catch (reason) {
      toast.error(
        reason instanceof ApiError
          ? reason.message
          : "Your response could not be saved.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const changeStatus = (next: StatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return (
    <section className="mt-10 space-y-5">
      <div>
        <h2 className="font-heading text-2xl text-foreground sm:text-3xl">
          Booking requests
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading
            ? "Loading enquiries…"
            : `${pagination.total} ${pagination.total === 1 ? "request" : "requests"}${status === "all" ? "" : ` · ${status}`}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter requests by status">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeStatus(filter.value)}
            aria-pressed={status === filter.value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              status === filter.value
                ? "border-wedplan-primary bg-wedplan-primary text-white"
                : "border-wedplan-sage/70 bg-card text-muted-foreground hover:border-wedplan-muted hover:text-foreground",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-wedplan-sage/50 bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-6 text-sm text-destructive">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title={status === "all" ? "No requests yet" : `No ${status} requests`}
          description={
            status === "all"
              ? "When a couple enquires about one of your services, their message and event details will arrive here."
              : `You do not have any ${status} requests right now. Try another status to see the rest of your inbox.`
          }
          action={
            status === "all" ? undefined : (
              <button
                type="button"
                onClick={() => changeStatus("all")}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Show all requests
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isBusy = busyId === booking._id
              const isPending = booking.status === "pending"

              return (
                <article
                  key={booking._id}
                  className="rounded-2xl border border-wedplan-sage/60 bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative size-20 shrink-0 self-start overflow-hidden rounded-xl bg-muted sm:size-24">
                      <Image
                        src={bookingImage(booking)}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <BookingStatusBadge status={booking.status} />
                        <span className="text-xs text-muted-foreground">
                          Received {formatRequestDate(booking.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-2 font-heading text-lg text-foreground">
                        {booking.service?.serviceName ?? "WedPlan service"}
                      </h3>
                      <p className="mt-1 text-sm text-foreground/80">
                        From <span className="font-semibold">{customerName(booking)}</span>
                        {booking.customer?.email ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {booking.customer.email}
                          </span>
                        ) : null}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-wedplan-muted" />
                          {formatEventDate(booking.eventDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-wedplan-muted" />
                          {booking.eventLocation}
                        </span>
                      </div>

                      <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs leading-6 text-foreground/75">
                        {booking.message || "No message was included with this request."}
                      </p>

                      {isPending ? (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => decide(booking, "accepted")}
                            disabled={isBusy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-wedplan-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Accept request
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(booking, "rejected")}
                            disabled={isBusy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X size={14} />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <p className="mt-4 text-[11px] text-muted-foreground">
                          You already responded to this request — it is{" "}
                          {booking.status}. Processed requests cannot be changed
                          here.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {pagination.totalPages > 1 ? (
            <nav
              aria-label="Request pagination"
              className="flex items-center justify-center gap-4 pt-2"
            >
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page <strong className="text-foreground">{page}</strong> of{" "}
                {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  )
}
