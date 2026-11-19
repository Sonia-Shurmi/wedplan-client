"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge"
import { EmptyState } from "@/components/bookings/empty-state"
import { Modal } from "@/components/bookings/modal"
import { ApiError, api, type Pagination } from "@/lib/api"
import {
  BOOKING_STATUSES,
  EMPTY_BOOKING_PAGINATION,
  bookingImage,
  formatEventDate,
  formatRequestDate,
  vendorName,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings"
import { formatServicePrice } from "@/lib/services"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type StatusFilter = BookingStatus | "all"

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

export function CustomerBookings() {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)
  const [details, setDetails] = useState<Booking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

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
      .get<Booking[]>(`/bookings/mine?${params.toString()}`, {
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

  const changeStatus = (next: StatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  const confirmCancel = async () => {
    if (!cancelTarget) return

    setCancelling(true)

    try {
      await api.patch<Booking>(`/bookings/${cancelTarget._id}/cancel`)
      toast.success("Booking request cancelled.")
      setCancelTarget(null)
      setDetails(null)
      // Refetch so status filters and totals stay in sync with the database.
      setReloadKey((value) => value + 1)
    } catch (reason) {
      toast.error(
        reason instanceof ApiError
          ? reason.message
          : "We could not cancel this request.",
      )
    } finally {
      setCancelling(false)
    }
  }

  const goToPage = (nextPage: number) => setPage(nextPage)

  return (
    <section className="mt-10 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl text-foreground sm:text-3xl">
            My bookings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading your requests…"
              : `${pagination.total} ${pagination.total === 1 ? "request" : "requests"}${status === "all" ? "" : ` · ${status}`}`}
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Browse more services
        </Link>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter bookings by status">
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
              className="h-36 animate-pulse rounded-2xl border border-wedplan-sage/50 bg-card"
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
          icon={<CalendarDays size={28} />}
          title={status === "all" ? "No bookings yet" : `No ${status} requests`}
          description={
            status === "all"
              ? "When you enquire about a wedding service, the request and the vendor's response will appear here."
              : `You do not have any ${status} requests right now. Try another status to see the rest of your bookings.`
          }
          action={
            status === "all" ? (
              <Link
                href="/services"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-wedplan-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
              >
                Find a wedding service
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => changeStatus("all")}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Show all bookings
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
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
                        Requested {formatRequestDate(booking.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-2 font-heading text-lg text-foreground">
                      {booking.service?.serviceName ?? "WedPlan service"}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {vendorName(booking)}
                      {booking.service
                        ? ` · ${formatServicePrice(booking.service.price, booking.service.currency)}`
                        : ""}
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

                    {booking.message ? (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-foreground/70">
                        “{booking.message}”
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDetails(booking)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-wedplan-sage/70 bg-background px-3 text-xs font-semibold text-wedplan-primary transition-colors hover:bg-muted"
                      >
                        <Eye size={14} />
                        View details
                      </button>

                      {booking.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(booking)}
                          className="inline-flex h-9 items-center rounded-lg px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                        >
                          Cancel request
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Only pending requests can be cancelled. This one is{" "}
                          {booking.status}.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {pagination.totalPages > 1 ? (
            <nav
              aria-label="Booking pagination"
              className="flex items-center justify-center gap-4 pt-2"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
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
                onClick={() => goToPage(page + 1)}
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

      <Modal
        open={details !== null}
        onClose={() => setDetails(null)}
        title="Booking details"
      >
        {details ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={details.status} />
              <span className="text-xs text-muted-foreground">
                Ref · {details._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="font-heading text-lg text-foreground">
                {details.service?.serviceName ?? "WedPlan service"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {vendorName(details)}
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Event date</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {formatEventDate(details.eventDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Event location</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {details.eventLocation}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Requested on</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {formatRequestDate(details.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {details.service
                    ? formatServicePrice(details.service.price, details.service.currency)
                    : "—"}
                </dd>
              </div>
            </dl>
            <div>
              <p className="text-xs text-muted-foreground">Your message</p>
              <p className="mt-1 whitespace-pre-line rounded-lg bg-muted/40 p-3 leading-6 text-foreground/80">
                {details.message || "No message was included with this request."}
              </p>
            </div>
            {details.status !== "pending" ? (
              <p className="text-xs leading-5 text-muted-foreground">
                This request is {details.status}, so it can no longer be
                cancelled. Contact the vendor directly if you need to change
                your plans.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel this request?"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              Keep request
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              disabled={cancelling}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : null}
              {cancelling ? "Cancelling…" : "Yes, cancel request"}
            </button>
          </>
        }
      >
        {cancelTarget ? (
          <p className="text-sm leading-7 text-muted-foreground">
            Your enquiry for{" "}
            <span className="font-semibold text-foreground">
              {cancelTarget.service?.serviceName ?? "this service"}
            </span>{" "}
            on {formatEventDate(cancelTarget.eventDate)} will be withdrawn. The
            vendor will no longer see it in their inbox. This cannot be undone.
          </p>
        ) : null}
      </Modal>
    </section>
  )
}
