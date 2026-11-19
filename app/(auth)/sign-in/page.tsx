import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import { dashboardPathFor, isSafeCallbackUrl } from "@/lib/constants"
import { getServerSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your WedPlan bookings, saved vendors and profile.",
}

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const rawCallbackUrl = params.callbackUrl
  const callbackUrl =
    typeof rawCallbackUrl === "string" && isSafeCallbackUrl(rawCallbackUrl)
      ? rawCallbackUrl
      : undefined

  // Authoritative "already signed in" guard. The proxy also redirects on the
  // presence of a cookie; this covers expired or revoked sessions.
  const session = await getServerSession()

  if (session) {
    if (session.user.isBlocked) {
      redirect("/blocked")
    }

    redirect(
      callbackUrl && !/^\/sign-(in|up)(\/|\?|$)/.test(callbackUrl)
        ? callbackUrl
        : dashboardPathFor(session.user.role),
    )
  }

  return (
    <AuthShell
      image="/images/wedding.jpg"
      quote="The details are not the details. They make the design."
      title="Welcome back"
      description="Sign in to pick up where you left off — saved vendors, booking requests and every note you have made."
    >
      <SignInForm callbackUrl={callbackUrl} />
    </AuthShell>
  )
}
