"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  Crown,
  Loader2,
  RotateCw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { ApiError, api } from "@/lib/api"
import { formatExpiry } from "@/lib/dashboard"
import type {
  CheckoutSessionResponse,
  SubscriptionStatus,
} from "@/lib/subscription"

interface StatusState {
  key: number
  data: SubscriptionStatus | null
  error: string | null
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

const FREE_FEATURES = [
  "Up to 3 active service listings",
  "Booking request tracking",
  "A complete vendor profile",
  "Direct enquiries from couples",
]

const PREMIUM_FEATURES = [
  "Unlimited active service listings",
  "Premium badge across WedPlan",
  "Featured placement in browse",
  "Cancel any time",
]

function PanelSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading subscription">
      <div className="h-36 animate-pulse rounded-2xl border border-wedplan-sage/40 bg-card" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-wedplan-sage/40 bg-card" />
        <div className="h-72 animate-pulse rounded-2xl border border-wedplan-sage/40 bg-card" />
      </div>
    </div>
  )
}

export function SubscriptionPanel() {
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState<StatusState>({
    key: -1,
    data: null,
    error: null,
  })
  const [isStarting, setIsStarting] = useState(false)

  const isLoading = state.key !== retryKey
  const status = isLoading ? null : state.data
  const loadError = isLoading ? null : state.error

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<SubscriptionStatus>("/subscriptions/me", {
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return
        setState({ key: retryKey, data: response.data, error: null })
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setState({
          key: retryKey,
          data: null,
          error: errorMessage(reason, "We could not load your subscription."),
        })
      })

    return () => controller.abort()
  }, [retryKey])

  const handleUpgrade = async () => {
    setIsStarting(true)

    try {
      const response = await api.post<CheckoutSessionResponse>(
        "/subscriptions/checkout",
        {},
      )

      toast.success("Opening secure checkout…")
      window.location.href = response.data.url
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Your Premium subscription is already active.")
        setRetryKey((key) => key + 1)
        return
      }

      toast.error(
        errorMessage(error, "We could not start checkout. Please try again."),
      )
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-wedplan-muted uppercase">
          Workspace billing
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Plans &amp; billing
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Choose how many services your studio can publish. Upgrades are handled
          by Stripe and only take effect once payment is verified.
        </p>
      </div>

      {isLoading ? <PanelSkeleton /> : null}

      {loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <CircleAlert
            size={24}
            className="mx-auto text-destructive"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium text-foreground">
            Your subscription could not be loaded.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-wedplan-primary px-5 text-sm font-medium text-white transition-colors hover:bg-wedplan-dark"
          >
            <RotateCw size={14} />
            Try again
          </button>
        </div>
      ) : null}

      {status ? (
        <>
          <section
            aria-labelledby="current-plan-heading"
            className="rounded-2xl border border-wedplan-sage/40 bg-card p-6 shadow-sm sm:p-7"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-wedplan-sage/30 text-wedplan-dark">
                  {status.isPremium ? (
                    <Crown size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </span>
                <div>
                  <p
                    id="current-plan-heading"
                    className="text-[10px] font-semibold tracking-[0.18em] text-wedplan-muted uppercase"
                  >
                    Current plan
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold text-foreground">
                    {status.isPremium ? "WedPlan Premium" : "WedPlan Free"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {status.isPremium
                      ? status.subscriptionExpiresAt
                        ? `Active until ${formatExpiry(status.subscriptionExpiresAt)}.`
                        : "Premium access is active."
                      : "Three active listings included. Upgrade any time."}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  status.isPremium
                    ? "bg-wedplan-sage/40 text-wedplan-dark"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {status.isPremium ? <BadgeCheck size={13} /> : null}
                {status.isPremium ? "Active" : "Free plan"}
              </span>
            </div>

            {status.plan === "premium" && !status.isPremium ? (
              <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Your Premium access has expired. Start a new subscription to
                publish more than three listings.
              </p>
            ) : null}
          </section>

          <section aria-label="Plan comparison" className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-wedplan-sage/40 bg-card p-6 sm:p-7">
              <p className="font-heading text-xl font-semibold text-foreground">
                Free
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                $0
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / forever
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Everything you need to get your studio listed.
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/80">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <BadgeCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-wedplan-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              {status.isPremium ? (
                <p className="mt-7 rounded-lg bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                  Included with Premium
                </p>
              ) : (
                <p className="mt-7 rounded-lg bg-wedplan-sage/20 px-4 py-3 text-center text-sm font-medium text-wedplan-dark">
                  Your current plan
                </p>
              )}
            </div>

            <div className="flex flex-col rounded-2xl border border-wedplan-primary/40 bg-wedplan-sage/10 p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-xl font-semibold text-foreground">
                  Premium
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-wedplan-primary px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                  <Crown size={12} />
                  Most popular
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                $19
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / month
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                For studios ready to grow beyond the free limits.
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/80">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <BadgeCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-wedplan-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {status.isPremium ? (
                <p className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-wedplan-sage/40 px-4 py-3 text-sm font-semibold text-wedplan-dark">
                  <BadgeCheck size={16} />
                  Premium is active
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isStarting}
                  className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isStarting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Opening checkout…
                    </>
                  ) : (
                    <>
                      Upgrade to Premium
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Payments are processed securely by Stripe. You will return here
                after checkout.
              </p>
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <Link
              href="/dashboard/vendor"
              className="font-medium text-wedplan-primary hover:underline"
            >
              Back to your dashboard
            </Link>
          </p>
        </>
      ) : null}
    </div>
  )
}
