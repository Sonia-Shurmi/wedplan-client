"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Crown,
  ImageOff,
  MapPin,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"

import { BookingForm } from "@/components/bookings/booking-form"
import { ApiError, api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { categoryByName } from "@/lib/constants"
import { serviceImage, vendorLabel, type Service } from "@/lib/services"
import { cn } from "@/lib/utils"

interface ServiceDetailProps {
  id: string
}

type FetchResult =
  | { id: string; service: Service }
  | { id: string; error: ApiError }
  | null

type ViewState =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "notFound" }
  | { kind: "error"; message: string }
  | { kind: "ready"; service: Service }

const signInHref = (id: string) =>
  `/sign-in?callbackUrl=${encodeURIComponent(`/services/${id}`)}`

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="aspect-[4/3] rounded-2xl bg-wedplan-sage/30" />
        <div className="space-y-4">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-12 rounded-lg bg-wedplan-sage/30" />
        </div>
      </div>
      <div className="h-40 rounded-2xl bg-muted/50" />
    </div>
  )
}

function StatePanel({
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

function ServiceGallery({ service }: { service: Service }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const images = service.images?.length ? service.images : [serviceImage(service)]
  const active = images[Math.min(activeIndex, images.length - 1)]

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-wedplan-sage/30">
        <Image
          src={active}
          alt={`${service.serviceName} — photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex
                  ? "border-wedplan-primary"
                  : "border-transparent hover:border-wedplan-sage",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ServiceDetail({ id }: ServiceDetailProps) {
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user?.id
  const role = session?.user?.role
  const [result, setResult] = useState<FetchResult>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    const controller = new AbortController()

    api
      .get<Service>(`/services/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult({ id, service: response.data })
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setResult({
          id,
          error:
            reason instanceof ApiError
              ? reason
              : new ApiError(0, "We could not load this service."),
        })
      })

    return () => controller.abort()
  }, [id, userId, role])

  let view: ViewState

  if (isPending) {
    view = { kind: "loading" }
  } else if (!userId) {
    view = { kind: "signedOut" }
  } else if (!result || result.id !== id) {
    view = { kind: "loading" }
  } else if ("error" in result) {
    if (result.error.status === 401) {
      view = { kind: "signedOut" }
    } else if (result.error.status === 404) {
      view = { kind: "notFound" }
    } else {
      view = { kind: "error", message: result.error.message }
    }
  } else {
    view = { kind: "ready", service: result.service }
  }

  if (view.kind === "loading") {
    return <DetailSkeleton />
  }

  if (view.kind === "signedOut") {
    return (
      <StatePanel
        icon={<ShieldCheck size={26} />}
        title="Sign in to view this service"
        description="Service details are available to WedPlan members. Create a free account or sign in and you will return straight to this page."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={signInHref(id)}
              className="rounded-lg bg-wedplan-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
            >
              Sign in
            </Link>
            <Link
              href={`/sign-up?callbackUrl=${encodeURIComponent(`/services/${id}`)}`}
              className="rounded-lg border border-wedplan-sage bg-background px-5 py-2.5 text-sm font-semibold text-wedplan-primary transition-colors hover:bg-muted"
            >
              Create an account
            </Link>
          </div>
        }
      />
    )
  }

  if (view.kind === "notFound") {
    return (
      <StatePanel
        icon={<ImageOff size={26} />}
        title="This service is not available"
        description="It may have been removed, or it could still be waiting for admin approval. Browse the marketplace to find similar wedding professionals."
        action={
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-lg bg-wedplan-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            <ArrowLeft size={15} />
            Back to services
          </Link>
        }
      />
    )
  }

  if (view.kind === "error") {
    return (
      <StatePanel
        icon={<TriangleAlert size={26} />}
        title="We could not load this service"
        description={view.message}
        action={
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-lg border border-wedplan-sage bg-background px-5 py-2.5 text-sm font-semibold text-wedplan-primary transition-colors hover:bg-muted"
          >
            <ArrowLeft size={15} />
            Back to services
          </Link>
        }
      />
    )
  }

  const { service } = view
  const category = categoryByName(service.category)
  const canBook = role !== "vendor" && role !== "admin"

  return (
    <div className="space-y-10">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-wedplan-primary"
      >
        <ArrowLeft size={15} />
        Back to all services
      </Link>

      {!canBook ? (
        <div className="rounded-xl border border-wedplan-sage bg-wedplan-sage/15 px-5 py-4 text-sm text-wedplan-primary">
          Booking is available to customers. Vendors and administrators can
          preview this listing but cannot send booking requests.
        </div>
      ) : null}

      {service.status !== "approved" || !service.isActive ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-900">
          This listing is not publicly visible yet. You can preview it because
          of your account role.
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-8">
          <ServiceGallery key={service._id} service={service} />

          <section className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 sm:p-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-wedplan-brown uppercase">
              About this service
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
              {service.serviceName}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} className="text-wedplan-muted" />
                {service.location}
              </span>
              <span className="rounded-full bg-wedplan-sage/30 px-3 py-1 text-xs font-medium text-wedplan-primary">
                {category?.name ?? service.category}
              </span>
              {service.isPremiumVendor ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-wedplan-dark px-3 py-1 text-xs font-medium text-wedplan-sage">
                  <Crown size={12} />
                  Featured Partner
                </span>
              ) : null}
            </div>
            <p className="mt-6 whitespace-pre-line text-sm leading-8 text-muted-foreground sm:text-base">
              {service.description}
            </p>
          </section>

          <section className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 sm:p-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-wedplan-brown uppercase">
              Meet the vendor
            </p>
            <div className="mt-5 flex items-center gap-4">
              {service.vendor?.image ? (
                <Image
                  src={service.vendor.image}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-full bg-wedplan-sage/40 font-heading text-xl text-wedplan-primary">
                  {vendorLabel(service).slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-heading text-xl text-foreground">
                  {vendorLabel(service)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck size={14} className="text-wedplan-muted" />
                  Verified WedPlan vendor
                  {service.isPremiumVendor ? " · Premium partner" : ""}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside>
          {canBook ? (
            <BookingForm key={service._id} service={service} />
          ) : (
            <div className="rounded-2xl border border-wedplan-sage/60 bg-card p-6 text-sm leading-7 text-muted-foreground">
              <p className="font-heading text-xl text-foreground">
                Booking is for couples
              </p>
              <p className="mt-2">
                Customers can send an enquiry with an event date, location and
                message. As a vendor or administrator, you are viewing this
                page in preview mode.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
