import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"

import ServiceBrowser from "@/components/services/service-browser"

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Explore wedding venues, photographers, florists, caterers, stylists and fashion designers on WedPlan.",
}

function BrowserFallback() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-32 rounded-2xl bg-wedplan-sage/20" />
      <div className="h-4 w-56 rounded bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-96 rounded-2xl border border-wedplan-sage/50 bg-card"
          />
        ))}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-wedplan-dark">
        <Image
          src="/images/wedding.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-wedplan-dark/80 via-wedplan-dark/75 to-wedplan-dark/90" />

        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-24">
          <p className="text-xs font-semibold tracking-[0.3em] text-wedplan-sage uppercase">
            Curated Wedding Marketplace
          </p>
          <h1 className="mt-5 font-heading text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Browse Wedding Services
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            From the first photograph to the last dance, find the people who
            will make your day feel entirely your own. Every listing is reviewed
            before it goes live.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <Suspense fallback={<BrowserFallback />}>
          <ServiceBrowser />
        </Suspense>
      </div>
    </>
  )
}
