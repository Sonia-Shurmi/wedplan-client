import { redirect } from "next/navigation"

import { dashboardPathFor, isSafeCallbackUrl } from "@/lib/constants"
import { getServerSession } from "@/lib/session"

interface DashboardResolverProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}

/**
 * Single entry point for every "Dashboard" link. It sends each signed-in user
 * to the dashboard for their role, and honours an in-app callback target.
 */
export default async function DashboardResolver({
  searchParams,
}: DashboardResolverProps) {
  const params = await searchParams
  const rawCallbackUrl = params.callbackUrl
  const callbackUrl =
    typeof rawCallbackUrl === "string" && isSafeCallbackUrl(rawCallbackUrl)
      ? rawCallbackUrl
      : null

  const session = await getServerSession()

  if (!session) {
    const target = callbackUrl ?? "/dashboard"
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(target)}`)
  }

  if (session.user.isBlocked) {
    redirect("/blocked")
  }

  if (
    callbackUrl &&
    callbackUrl !== "/dashboard" &&
    callbackUrl.startsWith("/dashboard")
  ) {
    redirect(callbackUrl)
  }

  redirect(dashboardPathFor(session.user.role))
}
