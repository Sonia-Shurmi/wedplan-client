import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "./auth"
import { dashboardPathFor, isUserRole, type UserRole } from "./constants"

/**
 * Reads the session from the database on every call. `cookieCache` is
 * disabled in the auth config, so role and blocked-state changes apply
 * immediately instead of waiting for a cookie to expire.
 */
export const getServerSession = async () =>
  auth.api.getSession({ headers: await headers() })

/** Gate for any page that needs a signed-in, unblocked user. */
export const requireSession = async (callbackUrl = "/dashboard") => {
  const session = await getServerSession()

  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  if (session.user.isBlocked) {
    redirect("/blocked")
  }

  return session
}

/** Gate for a role-specific dashboard section. */
export const requireRole = async (role: UserRole) => {
  const session = await requireSession()
  const actualRole: UserRole = isUserRole(session.user.role)
    ? session.user.role
    : "customer"

  if (actualRole !== role) {
    redirect(dashboardPathFor(actualRole))
  }

  return session
}

export const sessionUserRole = (role: unknown): UserRole =>
  isUserRole(role) ? role : "customer"
