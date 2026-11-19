import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Compass, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for is not part of WedPlan.",
}

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100svh-5rem)] items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-xl text-center">
        <p className="font-heading text-7xl text-wedplan-muted/60">404</p>
        <h1 className="mt-4 font-heading text-3xl text-foreground sm:text-4xl">
          This page took a different path
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          The address may have changed, or the link may be incomplete. Explore
          the marketplace instead — your next celebration detail is only a
          click away.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-wedplan-sage bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Search size={16} />
            Browse services
          </Link>
        </div>

        <p className="mt-10 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          <Compass size={14} />
          WedPlan · Wedding marketplace
        </p>
      </div>
    </main>
  )
}
