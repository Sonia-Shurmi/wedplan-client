import type { Metadata } from "next"
import { Suspense } from "react"

import ServiceDetail from "@/components/services/service-detail"

export const metadata: Metadata = {
  title: "Service details",
  description:
    "Explore a wedding service on WedPlan, meet the vendor and plan your enquiry.",
}

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <Suspense
        fallback={
          <div className="h-[70svh] animate-pulse rounded-2xl bg-wedplan-sage/20" />
        }
      >
        <ServiceDetail id={id} />
      </Suspense>
    </div>
  )
}
