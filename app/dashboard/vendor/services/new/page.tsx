import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import ServiceForm from "@/components/vendor/service-form"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Add a service",
  description: "Publish a new wedding service on WedPlan.",
}

export default async function NewServicePage() {
  await requireRole("vendor")

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link
        href="/dashboard/vendor"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-wedplan-primary"
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </Link>

      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-wedplan-brown uppercase">
          New listing
        </p>
        <h1 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
          Add a service
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tell couples what you offer. Every new listing is reviewed by WedPlan
          before it appears in the marketplace.
        </p>
      </header>

      <ServiceForm mode="create" />
    </div>
  )
}
