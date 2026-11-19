import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { dashboardPathFor, isSafeCallbackUrl } from "@/lib/constants"
import { getServerSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join WedPlan as a couple planning a wedding or as a vendor offering wedding services.",
}

interface SignUpPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[]
    role?: string | string[]
  }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const rawCallbackUrl = params.callbackUrl
  const callbackUrl =
    typeof rawCallbackUrl === "string" && isSafeCallbackUrl(rawCallbackUrl)
      ? rawCallbackUrl
      : undefined
  const defaultRole = params.role === "vendor" ? "vendor" : "customer"

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
      quote="Every great celebration starts with one thoughtful decision."
      title="Create your account"
      description="Tell us how you will use WedPlan. It takes a minute, and you can change the details later."
    >
      <SignUpForm callbackUrl={callbackUrl} defaultRole={defaultRole} />
    </AuthShell>
  )
}
