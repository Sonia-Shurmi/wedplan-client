import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Crown, MapPin, Sparkles } from "lucide-react"

import {
  formatServicePrice,
  serviceImage,
  vendorLabel,
  type Service,
} from "@/lib/services"

interface ServiceCardProps {
  service: Service
  /** Signed-out visitors are sent to sign-in with this page as callbackUrl. */
  href?: string
}

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  return parts.length
    ? parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "WV"
}

export default function ServiceCard({ service, href }: ServiceCardProps) {
  const vendor = service.vendor
  const detailHref = href ?? `/services/${service._id}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-wedplan-sage/60 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-wedplan-muted/70 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-wedplan-sage/30">
        <Image
          src={serviceImage(service)}
          alt={service.serviceName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {service.isPremiumVendor && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-wedplan-dark/90 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-wedplan-sage uppercase backdrop-blur-sm">
            <Sparkles size={12} />
            Featured Partner
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-wedplan-brown uppercase">
          {service.category}
        </span>

        <h3 className="mt-2 line-clamp-2 font-heading text-xl leading-snug text-foreground">
          {service.serviceName}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} className="shrink-0 text-wedplan-muted" />
          <span className="truncate">{service.location}</span>
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-3 border-t border-border pt-4">
            {vendor?.image ? (
              <Image
                src={vendor.image}
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wedplan-sage/50 text-xs font-semibold text-wedplan-primary">
                {initialsOf(vendorLabel(service))}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {vendorLabel(service)}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {service.isPremiumVendor && (
                  <Crown size={11} className="text-wedplan-brown" />
                )}
                {service.isPremiumVendor ? "Premium Vendor" : "Wedding Vendor"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Starting at
              </p>
              <p className="font-heading text-xl text-wedplan-primary">
                {formatServicePrice(service.price, service.currency)}
              </p>
            </div>
            <Link
              href={detailHref}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-wedplan-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
            >
              View Details
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
