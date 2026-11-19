"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { CalendarCheck, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { ApiError, api } from "@/lib/api"
import { formatEventDate, type Booking } from "@/lib/bookings"
import { formatServicePrice, type Service } from "@/lib/services"

type FormService = Pick<
  Service,
  "_id" | "serviceName" | "price" | "currency" | "location"
>

const todayUtc = () => new Date().toISOString().slice(0, 10)

/**
 * Used on the service details page and on /services/[id]/book. The API owns all
 * authorisation and duplicate checks; this component mirrors the basic field
 * rules so small mistakes are caught before the request is sent.
 */
export function BookingForm({ service }: { service: FormService }) {
  const [eventDate, setEventDate] = useState("")
  const [location, setLocation] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!eventDate) {
      setError("Choose the date of your event.")
      return
    }
    if (eventDate < todayUtc()) {
      setError("Choose today or a future date.")
      return
    }
    if (location.trim().length < 2) {
      setError("Tell the vendor where the event will take place.")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const response = await api.post<Booking>("/bookings", {
        serviceId: service._id,
        eventDate,
        eventLocation: location.trim(),
        message: message.trim() || undefined,
      })

      setConfirmed(response.data)
      toast.success("Booking request sent. The vendor will review it shortly.")
    } catch (reason) {
      // Surface the server's own message so conflicts (e.g. a request for the
      // same service and day) are explained exactly as the API reports them.
      const text =
        reason instanceof ApiError
          ? reason.message
          : "We could not send your request. Please try again."

      setError(text)
      toast.error(text)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
          <CheckCircle2 size={24} />
        </span>
        <h2 className="mt-4 font-heading text-2xl text-foreground">
          Request sent
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {service.serviceName} for {formatEventDate(confirmed.eventDate)}. The
          vendor can now accept or decline your enquiry — you will see the
          outcome in your bookings.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-wedplan-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            View my bookings
          </Link>
          <button
            type="button"
            onClick={() => {
              setConfirmed(null)
              setEventDate("")
              setLocation("")
              setMessage("")
            }}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Book another date
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 shadow-sm lg:sticky lg:top-24">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-wedplan-brown uppercase">
        Enquire about this service
      </p>
      <p className="mt-2 font-heading text-2xl text-foreground">
        {formatServicePrice(service.price, service.currency)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Starting price · negotiable with the vendor
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="event-date"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Event date
          </label>
          <input
            id="event-date"
            type="date"
            min={todayUtc()}
            required
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none focus:border-wedplan-muted focus:ring-2 focus:ring-wedplan-sage/50"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="event-location"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Event location
          </label>
          <input
            id="event-location"
            type="text"
            required
            maxLength={200}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Venue or city"
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-wedplan-muted focus:ring-2 focus:ring-wedplan-sage/50"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="booking-message"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Message to the vendor
          </label>
          <textarea
            id="booking-message"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell them about your day, guest count and anything you have in mind…"
            className="w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-wedplan-muted focus:ring-2 focus:ring-wedplan-sage/50"
          />
        </div>

        {error ? (
          <p role="alert" className="text-xs leading-5 text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-wedplan-primary text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
          {submitting ? "Sending request…" : "Request to book"}
        </button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck size={14} className="text-wedplan-muted" />
        No payment is taken at this stage.
      </p>
    </div>
  )
}
