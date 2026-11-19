import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

import { isSafeCallbackUrl } from "@/lib/constants"

const AUTH_PAGES = new Set(["/sign-in", "/sign-up"])

/**
 * Optimistic route protection.
 *
 * The presence of the session cookie is enough to decide where to send
 * someone; real authorization (role, blocked state) happens in server
 * components, where the database is authoritative.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = Boolean(getSessionCookie(request))

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const signIn = new URL("/sign-in", request.url)
    signIn.searchParams.set("callbackUrl", `${pathname}${search}`)

    return NextResponse.redirect(signIn)
  }

  if (AUTH_PAGES.has(pathname) && hasSession) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
    const target = isSafeCallbackUrl(callbackUrl) ? callbackUrl : "/dashboard"

    return NextResponse.redirect(new URL(target, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
}
