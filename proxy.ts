import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

/**
 * Optimistic route protection only.
 *
 * A cookie's presence is enough to pre-filter anonymous visitors from the
 * dashboard. It is deliberately not used to redirect users away from the auth
 * pages: a stale or revoked cookie would otherwise bounce `/sign-in` to
 * `/dashboard`, where the authoritative server check sends them straight back.
 * The sign-in page validates the session itself and redirects only when it is
 * genuinely active.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith("/dashboard") && !getSessionCookie(request)) {
    const signIn = new URL("/sign-in", request.url)
    signIn.searchParams.set("callbackUrl", `${pathname}${search}`)

    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
