"use client"

import Link from "next/link"
import { RotateCw, TriangleAlert } from "lucide-react"

/**
 * Catches unexpected failures in dashboard pages and offers a retry without
 * throwing the user back to a full-page reload.
 */
export default function DashboardError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-8"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert size={20} />
        </span>
        <div>
          <h2 className="font-heading text-2xl text-foreground">
            This page could not be displayed
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Something unexpected happened while loading your dashboard. You can
            try again, or return to your dashboard overview.
          </p>
          {error.message ? (
            <p className="mt-3 max-w-xl text-xs text-muted-foreground/80">
              {error.message}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-wedplan-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
            >
              <RotateCw size={15} />
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Dashboard overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
