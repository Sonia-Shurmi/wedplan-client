"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, ImageOff, MapPin, TriangleAlert } from "lucide-react"

import { BookingForm } from "@/components/bookings/booking-form"
import { ApiError, api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { serviceImage, vendorLabel, type Service } from "@/lib/services"

type ViewState =
  | { kind: "loading" }
  | { kind: "notFound" }
  | { kind: "error"; message: string }
  | { kind: "ready"; service: Service }

function Panel({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-wedplan-sage/60 bg-card px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-wedplan-sage/30 text-wedplan-primary">
        {icon}
      </span>
      <h2 className="mt-5 font-heading text-2xl text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  )
}

export function BookService({ id }: { id: string }) {
  const { data: session } = authClient.useSession()
  const role = session?.user?.role
  const [state, setState] = useState<ViewState>({ kind: "loading" })

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<Service>(`/services/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          setState({ kind: "ready", service: response.data })
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return

        if (reason instanceof ApiError && reason.status === 404) {
          setState({ kind: "notFound" })
        } else {
          setState({
            kind: "error",
            message:
              reason instanceof ApiError
                ? reason.message
                : "We could not load this service.",
          })
        }
      })

    return () => controller.abort()
  }, [id])

  const backLink = (href: string, label: string) => (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-wedplan-primary"
    >
      <ArrowLeft size={15} />
      {label}
    </Link>
  )

  if (state.kind === "loading") {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_380px]">
        <div className="h-96 animate-pulse rounded-2xl bg-wedplan-sage/30" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  if (state.kind === "notFound") {
    return (
      <Panel
        icon={<ImageOff size={26} />}
        title="This service is not available"
        description="It may have been removed or is still awaiting approval. Browse the marketplace to find another professional for your day."
        action={backLink("/services", "Back to services")}
      />
    )
  }

  if (state.kind === "error") {
    return (
      <Panel
        icon={<TriangleAlert size={26} />}
        title="We could not load this service"
        description={state.message}
        action={backLink("/services", "Back to services")}
      />
    )
  }

  const { service } = state

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {backLink(`/services/${id}`, "Back to service details")}

      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-wedplan-muted uppercase">
          Booking request
        </p>
        <h1 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
          Enquire about {service.serviceName}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 sm:p-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-wedplan-sage/30">
            <Image
              src={serviceImage(service)}
              alt={service.serviceName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
          <h2 className="mt-6 font-heading text-2xl text-foreground">
            {service.serviceName}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} className="text-wedplan-muted" />
              {service.location}
            </span>
            <span>{service.category}</span>
          </p>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">
            {service.description}
          </p>
          <p className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground">
            Offered by <span className="font-semibold text-foreground">{vendorLabel(service)}</span>
          </p>
        </section>

        <aside>
          {role === "vendor" || role === "admin" ? (
            <div className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 text-sm leading-7 text-muted-foreground">
              <p className="font-heading text-xl text-foreground">
                Booking is for couples
              </p>
              <p className="mt-2">
                Only customers can send booking requests. You are viewing this
                page with a vendor or administrator account.
              </p>
            </div>
          ) : (
            <BookingForm service={service} />
          )}
        </aside>
      </div>
    </div>
  )
}
