"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { authClient } from "@/lib/auth-client"
import { authErrorCode, authErrorMessage } from "@/lib/auth-errors"
import { googleSignInEnabled, postAuthPath } from "@/lib/constants"
import {
  fieldErrorsFrom,
  signInSchema,
} from "@/lib/validation/auth"

import { AuthDivider, GoogleButton } from "./google-button"

interface SignInFormProps {
  callbackUrl?: string
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const router = useRouter()

  const [fields, setFields] = useState({ email: "", password: "" })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField =
    (key: keyof typeof fields) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value

      setFields((current) => ({ ...current, [key]: value }))
      setFieldErrors((current) => {
        if (!current[key]) {
          return current
        }

        return { ...current, [key]: "" }
      })
      setFormError(null)
    }

  const applyAuthError = (error: unknown) => {
    const code = authErrorCode(error)
    const message = authErrorMessage(
      error,
      "We could not sign you in. Please try again.",
    )

    if (code === "INVALID_EMAIL_OR_PASSWORD" || /invalid/i.test(message)) {
      setFormError("Incorrect email or password. Please try again.")
      return
    }

    if (code === "EMAIL_NOT_VERIFIED") {
      setFormError("Please verify your email address before signing in.")
      return
    }

    setFormError(message)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = signInSchema.safeParse(fields)

    if (!parsed.success) {
      setFieldErrors(fieldErrorsFrom(parsed.error))
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe: true,
      })

      if (error) {
        applyAuthError(error)
        return
      }

      if (data?.user?.isBlocked) {
        router.replace("/blocked")
        return
      }

      toast.success("Welcome back!")
      router.replace(postAuthPath(callbackUrl, data?.user?.role))
      router.refresh()
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const signUpHref = callbackUrl
    ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-up"

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="sign-in-email">Email address</Label>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={updateField("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "sign-in-email-error" : undefined
            }
          />
          {fieldErrors.email ? (
            <p id="sign-in-email-error" className="text-xs text-destructive">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sign-in-password">Password</Label>
          <PasswordInput
            id="sign-in-password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={fields.password}
            onChange={updateField("password")}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "sign-in-password-error" : undefined
            }
          />
          {fieldErrors.password ? (
            <p
              id="sign-in-password-error"
              className="text-xs text-destructive"
            >
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {formError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-wedplan-primary text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {googleSignInEnabled ? (
        <div className="space-y-4">
          <AuthDivider />
          <GoogleButton
            label="Continue with Google"
            callbackUrl={callbackUrl}
          />
        </div>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        New to WedPlan?{" "}
        <Link
          href={signUpHref}
          className="font-semibold text-wedplan-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
