"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CircleAlert, RotateCw } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import ServiceCard from "@/components/services/service-card"
import { api } from "@/lib/api"
import type { Service } from "@/lib/services"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; services: Service[] }

function FeaturedSkeleton() {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading featured services"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-wedplan-sage/40 bg-card"
        >
          <div className="aspect-[4/3] animate-pulse bg-wedplan-sage/30" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FeaturedServices() {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [retryKey, setRetryKey] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const controller = new AbortController()

    api
      .publicGet<Service[]>("/services/featured", { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        setState({ status: "ready", services: response.data ?? [] })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "We could not load featured services.",
        })
      })

    return () => controller.abort()
  }, [retryKey])

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <section className="bg-wedplan-sage/10 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          {...reveal}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-wedplan-brown uppercase">
              Curated Showcase
            </p>
            <h2 className="mt-4 font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Featured Wedding Services
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              A small selection of approved professionals couples are loving
              right now.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-wedplan-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="mt-12">
          {state.status === "loading" ? <FeaturedSkeleton /> : null}

          {state.status === "error" ? (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
            >
              <CircleAlert
                size={22}
                className="mx-auto text-destructive"
                aria-hidden="true"
              />
              <p className="mt-3 font-medium text-foreground">
                Featured services are unavailable right now.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {state.message}
              </p>
              <button
                type="button"
                onClick={() => setRetryKey((key) => key + 1)}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <RotateCw size={14} />
                Try again
              </button>
            </div>
          ) : null}

          {state.status === "ready" && state.services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-wedplan-sage bg-background p-10 text-center">
              <p className="font-heading text-xl text-foreground">
                New services are on the way
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Approved listings will appear here as vendors join WedPlan.
              </p>
              <Link
                href="/services"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-wedplan-primary hover:underline"
              >
                Browse all services <ArrowRight size={15} />
              </Link>
            </div>
          ) : null}

          {state.status === "ready" && state.services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {state.services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
