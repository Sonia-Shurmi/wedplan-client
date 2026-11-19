"use client"

import Link from "next/link"
import { ArrowLeft, RotateCw, TriangleAlert } from "lucide-react"

export default function AppError({
  error,
  retry,
}: Readonly<{
  error: Error & { digest?: string }
  retry: () => void
}>) {
  return (
    <main className="flex min-h-[calc(100svh-5rem)] items-center justify-center bg-background px-6 py-20">
      <div
        role="alert"
        className="w-full max-w-xl rounded-2xl border border-destructive/25 bg-card p-8 text-center shadow-sm sm:p-10"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert size={22} />
        </span>
        <h1 className="mt-6 font-heading text-3xl text-foreground">
          We hit an unexpected snag
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          Something went wrong while rendering this page. Try again — if it
          keeps happening, return home and start from there.
        </p>
        {error.message ? (
          <p className="mt-4 text-xs text-muted-foreground/80">
            {error.message}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            <RotateCw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
