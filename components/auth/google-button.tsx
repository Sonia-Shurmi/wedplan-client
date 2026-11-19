"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { googleSignInEnabled, isSafeCallbackUrl } from "@/lib/constants"

interface GoogleButtonProps {
  label: string
  callbackUrl?: string
}

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.88Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
    />
  </svg>
)

/**
 * Starts the Google OAuth flow. Without Google credentials in the server env
 * and `NEXT_PUBLIC_GOOGLE_ENABLED=true` in the client, the button is hidden.
 */
export function GoogleButton({ label, callbackUrl }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!googleSignInEnabled) {
    return null
  }

  const handleClick = async () => {
    setIsLoading(true)

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        // The role resolver at /dashboard sends existing vendors and admins
        // to the right place, while new Google accounts become customers.
        callbackURL: isSafeCallbackUrl(callbackUrl) ? callbackUrl : "/dashboard",
      })

      if (error) {
        toast.error(
          error.message || "Google sign-in could not be started. Please try again.",
        )
        setIsLoading(false)
      }
      // On success the browser navigates to Google, so the spinner stays on.
    } catch {
      toast.error("Google sign-in could not be started. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Connecting to Google…
        </>
      ) : (
        <>
          <GoogleMark />
          {label}
        </>
      )}
    </button>
  )
}

/** "or" rule shown between the email form and the Google button. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        or
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
