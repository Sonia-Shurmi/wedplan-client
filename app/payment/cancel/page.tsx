import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Checkout cancelled",
}

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[70svh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-wedplan-sage/40 bg-card p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-wedplan-sage/30 text-wedplan-dark">
          <Heart size={28} />
        </span>
        <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-wedplan-muted uppercase">
          Checkout cancelled
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          No charge was made
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          You stopped before completing payment, so your plan is unchanged. You
          can come back whenever you are ready to grow your studio.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/vendor/subscription"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
          >
            Try again
          </Link>
          <Link
            href="/dashboard/vendor"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
