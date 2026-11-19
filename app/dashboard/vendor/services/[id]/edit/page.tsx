import type { Metadata } from "next"
import { Suspense } from "react"

import ServiceEditor from "@/components/vendor/service-editor"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Edit service",
  description: "Update one of your WedPlan service listings.",
}

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  await requireRole("vendor")
  const { id } = await params

  return (
    <div className="mx-auto max-w-4xl">
      <Suspense
        fallback={
          <div className="h-[70svh] animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        <ServiceEditor id={id} />
      </Suspense>
    </div>
  )
}
