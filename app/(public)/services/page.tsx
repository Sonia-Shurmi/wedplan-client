import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { CATEGORIES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Explore wedding venues, photographers, florists, caterers, stylists and fashion designers on WedPlan.",
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-wedplan-muted uppercase">
          Marketplace
        </p>
        <h1 className="mt-3 font-heading text-4xl text-foreground sm:text-5xl">
          Browse wedding professionals
        </h1>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          Six categories, one shortlist. Start with the part of the day you can
          picture most clearly and WedPlan will keep the rest within reach.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/services?category=${encodeURIComponent(category.name)}`}
            className="group flex flex-col rounded-2xl border border-wedplan-sage/70 bg-card p-6 transition-colors hover:border-wedplan-muted hover:bg-wedplan-sage/10"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-wedplan-sage/30 text-wedplan-primary">
              <Sparkles size={18} />
            </span>
            <h2 className="mt-4 font-heading text-xl text-foreground">
              {category.name}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {category.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-wedplan-primary">
              Explore category
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-dashed border-wedplan-sage bg-wedplan-sage/10 p-8 sm:p-10">
        <h2 className="font-heading text-2xl text-foreground">
          The full directory opens here next
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          Filterable listings, vendor profiles and booking requests are being
          connected right now. In the meantime, create an account so your
          shortlist is ready the moment the directory goes live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-wedplan-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            Create an account
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/sign-up?role=vendor"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            List your business
          </Link>
        </div>
      </div>
    </div>
  )
}
