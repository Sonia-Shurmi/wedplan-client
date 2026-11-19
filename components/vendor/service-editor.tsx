"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import ServiceForm from "@/components/vendor/service-form"
import { ApiError, api } from "@/lib/api"
import type { Service } from "@/lib/services"

interface ServiceEditorProps {
  id: string
}

type EditorState =
  | { kind: "loading" }
  | { kind: "error"; message: string; missing: boolean }
  | { kind: "ready"; service: Service }

export default function ServiceEditor({ id }: ServiceEditorProps) {
  const [result, setResult] = useState<{
    id: string
    service?: Service
    error?: ApiError
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    // `/services/mine` is the vendor endpoint that includes pending and
    // rejected listings; the public detail endpoint hides unpublished ones.
    api
      .get<Service[]>("/services/mine", { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          const service = response.data?.find((item) => item._id === id)

          setResult(
            service
              ? { id, service }
              : { id, error: new ApiError(404, "Service not found.") },
          )
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
  }, [id])

  let state: EditorState

  if (!result || result.id !== id) {
    state = { kind: "loading" }
  } else if (result.error) {
    state = {
      kind: "error",
      message: result.error.message,
      missing: result.error.status === 404 || result.error.status === 403,
    }
  } else {
    state = { kind: "ready", service: result.service! }
  }

  if (state.kind === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    )
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-wedplan-sage/60 bg-card px-6 py-14 text-center">
        <TriangleAlert size={28} className="text-wedplan-muted" />
        <h2 className="mt-4 font-heading text-2xl text-foreground">
          {state.missing ? "Service not found" : "We could not load this service"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        <Link
          href="/dashboard/vendor"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-wedplan-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <Link
        href="/dashboard/vendor"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-wedplan-primary"
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </Link>

      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-wedplan-brown uppercase">
          Edit listing
        </p>
        <h1 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
          {state.service.serviceName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Update the details below. Changes to an approved listing stay live;
          resubmitted listings wait for admin approval again.
        </p>
      </header>

      <ServiceForm mode="edit" service={state.service} />
    </div>
  )
}
