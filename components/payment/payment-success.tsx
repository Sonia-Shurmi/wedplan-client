"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  RotateCw,
} from "lucide-react"

import { ApiError, api } from "@/lib/api"
import { formatExpiry } from "@/lib/dashboard"
import type { SubscriptionStatus } from "@/lib/subscription"

const POLL_INTERVAL_MS = 1_500
const MAX_POLL_ATTEMPTS = 20 // roughly 30 seconds

type Phase = "activating" | "active" | "timeout" | "error"

interface PollState {
  key: number
  phase: Phase
  status: SubscriptionStatus | null
  message: string | null
  attempts: number
}

const INITIAL_STATE: PollState = {
  key: -1,
  phase: "activating",
  status: null,
  message: null,
  attempts: 0,
}

/**
 * The URL is never treated as proof of payment. We poll the authenticated
 * status endpoint until Stripe's verified webhook has actually activated the
 * plan, or until the polling window expires.
 */
export function PaymentSuccess() {
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState<PollState>(INITIAL_STATE)

  const view = state.key === retryKey ? state : INITIAL_STATE

  useEffect(() => {
    const controller = new AbortController()
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const response = await api.get<SubscriptionStatus>(
          "/subscriptions/me",
          { signal: controller.signal },
        )
        attempts += 1

        if (controller.signal.aborted) return

        if (response.data.isPremium) {
          setState({
            key: retryKey,
            phase: "active",
            status: response.data,
            message: null,
            attempts,
          })
          return
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          setState({
            key: retryKey,
            phase: "timeout",
            status: response.data,
            message: null,
            attempts,
          })
          return
        }

        timer = setTimeout(() => void poll(), POLL_INTERVAL_MS)
      } catch (reason) {
        if (controller.signal.aborted) return

        setState({
          key: retryKey,
          phase: "error",
          status: null,
          message:
            reason instanceof ApiError
              ? reason.message
              : "We could not verify your payment.",
          attempts,
        })
      }
    }

    void poll()

    return () => {
      controller.abort()
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [retryKey])

  const retry = () => setRetryKey((key) => key + 1)

  return (
    <main className="flex min-h-[70svh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-wedplan-sage/40 bg-card p-8 text-center shadow-sm sm:p-10">
        {view.phase === "activating" ? (
          <div aria-live="polite" aria-busy="true">
            <LoaderCircle
              size={36}
              className="mx-auto animate-spin text-wedplan-primary"
            />
            <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Confirming your payment…
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              We are waiting for Stripe to verify your subscription. Keep this
              page open for a few seconds.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Check {view.attempts || 1} of {MAX_POLL_ATTEMPTS}
            </p>
          </div>
        ) : null}

        {view.phase === "active" ? (
          <div aria-live="polite">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-wedplan-sage/40 text-wedplan-dark">
              <CircleCheck size={30} />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              You&apos;re on Premium!
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your payment is verified and your Premium access is active
              {view.status?.subscriptionExpiresAt
                ? ` until ${formatExpiry(view.status.subscriptionExpiresAt)}`
                : ""}
              . You can now publish unlimited active listings.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/vendor"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-wedplan-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
              >
                Go to dashboard
              </Link>
              <Link
                href="/dashboard/vendor/subscription"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                View your plan
              </Link>
            </div>
          </div>
        ) : null}

        {view.phase === "timeout" ? (
          <div aria-live="polite">
            <CircleAlert
              size={34}
              className="mx-auto text-wedplan-brown"
            />
            <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Still confirming your payment
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              We haven&apos;t received verification yet. If you completed
              checkout, it can take a little longer. Your plan will not change
              until payment is confirmed.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
              >
                <RotateCw size={15} />
                Check again
              </button>
              <Link
                href="/dashboard/vendor/subscription"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                View your plan
              </Link>
            </div>
          </div>
        ) : null}

        {view.phase === "error" ? (
          <div role="alert">
            <CircleAlert size={34} className="mx-auto text-destructive" />
            <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              We could not verify your payment
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {view.message ?? "Please try again in a moment."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
            >
              <RotateCw size={15} />
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </main>
  )
}
