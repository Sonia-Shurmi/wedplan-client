import type { Metadata } from "next"
import Link from "next/link"
import { Mail, ShieldAlert } from "lucide-react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { SITE } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Account unavailable",
  description: "This WedPlan account has been paused by an administrator.",
}

export default function BlockedPage() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="font-heading text-2xl font-bold text-wedplan-primary"
        >
          WedPlan<span className="text-wedplan-brown">.</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert size={26} />
          </span>

          <h1 className="mt-6 font-heading text-3xl text-foreground">
            This account is on hold
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            An administrator has paused access to this account, so the dashboard
            and booking tools are unavailable. If you believe this was a
            mistake, get in touch and our team will take another look.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <SignOutButton className="w-full sm:w-auto" />

            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
            >
              <Mail size={16} />
              Contact support
            </a>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Signed in with the wrong account?{" "}
            <Link href="/sign-in" className="underline hover:text-foreground">
              Use another account
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
