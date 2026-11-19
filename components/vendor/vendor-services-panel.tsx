"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, Loader2, Plus, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import PlanLimitNotice from "@/components/vendor/plan-limit-notice"
import { ApiError, api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { formatServicePrice, serviceImage, type Service } from "@/lib/services"
import { cn } from "@/lib/utils"

const statusStyles: Record<Service["status"], string> = {
  approved: "bg-emerald-500/10 text-emerald-700",
  pending: "bg-amber-500/15 text-amber-800",
  rejected: "bg-destructive/10 text-destructive",
}

export default function VendorServicesPanel() {
  const { data: session } = authClient.useSession()
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<{
    key: number
    services?: Service[]
    error?: string
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<Service[]>("/services/mine", { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult({ key: reloadKey, services: response.data ?? [] })
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setResult({
          key: reloadKey,
          error:
            reason instanceof ApiError
              ? reason.message
              : "We could not load your listings.",
        })
      })

    return () => controller.abort()
  }, [reloadKey])

  const isLoading = !result || result.key !== reloadKey
  const services = result?.services ?? []
  const activeCount = services.filter((item) => item.status !== "rejected").length
  const isFree = session?.user?.subscriptionPlan !== "premium"

  const toggleAvailability = async (service: Service) => {
    setBusyId(service._id)

    try {
      await api.patch(`/services/${service._id}/availability`, {
        isActive: !service.isActive,
      })
      toast.success(service.isActive ? "Listing paused." : "Listing is live.")
      setReloadKey((value) => value + 1)
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Your availability could not be updated.",
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mt-10 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl text-foreground sm:text-3xl">
            Your services
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading your listings…"
              : `${activeCount} of ${isFree ? "3" : "unlimited"} free-plan listings used.`}
          </p>
        </div>
        <Link
          href="/dashboard/vendor/services/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
        >
          <Plus size={16} />
          Add a service
        </Link>
      </div>

      {isFree && !isLoading && activeCount >= 3 ? <PlanLimitNotice /> : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-wedplan-sage/50 bg-card"
            />
          ))}
        </div>
      ) : result?.error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-6 text-sm text-destructive">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{result.error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-wedplan-sage bg-card px-6 py-14 text-center">
          <h3 className="font-heading text-xl text-foreground">
            No services yet
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Publish your first package and couples will be able to discover it
            once an admin approves the listing.
          </p>
          <Link
            href="/dashboard/vendor/services/new"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-wedplan-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            <Plus size={16} />
            Create your first service
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service._id}
              className="flex gap-4 rounded-2xl border border-wedplan-sage/60 bg-card p-4"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={serviceImage(service)}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      statusStyles[service.status],
                    )}
                  >
                    {service.status}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase",
                      service.isActive ? "text-emerald-700" : "text-muted-foreground",
                    )}
                  >
                    {service.isActive ? "Active" : "Paused"}
                  </span>
                </div>

                <h3 className="mt-1.5 truncate font-heading text-lg text-foreground">
                  {service.serviceName}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {service.category} · {formatServicePrice(service.price)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <Link
                    href={`/dashboard/vendor/services/${service._id}/edit`}
                    className="inline-flex items-center gap-1 text-wedplan-primary hover:underline"
                  >
                    Edit
                    <ArrowUpRight size={12} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(service)}
                    disabled={busyId === service._id}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {busyId === service._id ? (
                      <Loader2 size={12} className="inline animate-spin" />
                    ) : null}
                    {service.isActive ? "Pause" : "Activate"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
