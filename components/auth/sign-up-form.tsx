"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import {
  AlertCircle,
  Check,
  Heart,
  Loader2,
  Store,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { ApiError } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { authErrorCode, authErrorMessage } from "@/lib/auth-errors"
import {
  googleSignInEnabled,
  postAuthPath,
  type UserRole,
} from "@/lib/constants"
import {
  IMAGE_ACCEPT_ATTRIBUTE,
  MAX_UPLOAD_MEGABYTES,
  uploadPublicImage,
} from "@/lib/upload"
import { cn } from "@/lib/utils"
import {
  PASSWORD_HINT,
  fieldErrorsFrom,
  signUpSchema,
} from "@/lib/validation/auth"

import { AuthDivider, GoogleButton } from "./google-button"

type SignUpRole = Extract<UserRole, "customer" | "vendor">

interface SignUpFormProps {
  callbackUrl?: string
  defaultRole?: SignUpRole
}

const roleOptions = [
  {
    value: "customer",
    title: "I'm planning a wedding",
    description: "Save vendors, compare options and manage your bookings.",
    icon: Heart,
  },
  {
    value: "vendor",
    title: "I offer wedding services",
    description: "Publish your services and answer booking enquiries.",
    icon: Store,
  },
] as const

const emptyFields = {
  name: "",
  email: "",
  password: "",
  businessName: "",
}

export function SignUpForm({
  callbackUrl,
  defaultRole = "customer",
}: SignUpFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [role, setRole] = useState<SignUpRole>(defaultRole)
  const [fields, setFields] = useState(emptyFields)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarProgress, setAvatarProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField =
    (key: keyof typeof emptyFields) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value

      setFields((current) => ({ ...current, [key]: value }))
      setFieldErrors((current) => {
        if (!current[key]) {
          return current
        }

        return { ...current, [key]: "" }
      })
    }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    // Reset so choosing the same file twice still fires onChange.
    event.target.value = ""

    if (!file) {
      return
    }

    setIsUploading(true)
    setAvatarProgress(0)

    try {
      const uploaded = await uploadPublicImage(file, {
        onProgress: setAvatarProgress,
      })

      setAvatarUrl(uploaded.displayUrl ?? uploaded.url)
      toast.success("Profile photo added.")
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "That photo could not be uploaded. Please try another one.",
      )
    } finally {
      setIsUploading(false)
      setAvatarProgress(0)
    }
  }

  const applyAuthError = (error: unknown) => {
    const code = authErrorCode(error)
    const message = authErrorMessage(
      error,
      "We could not create your account. Please try again.",
    )

    toast.error(message)

    if (code === "USER_ALREADY_EXISTS" || /already exists/i.test(message)) {
      setFieldErrors((current) => ({
        ...current,
        email: "An account with this email already exists. Try signing in instead.",
      }))
      return
    }

    if (code === "INVALID_EMAIL") {
      setFieldErrors((current) => ({
        ...current,
        email: "Enter a valid email address.",
      }))
      return
    }

    if (code.startsWith("PASSWORD") || code === "INVALID_PASSWORD") {
      setFieldErrors((current) => ({ ...current, password: message }))
      return
    }

    setFormError(message)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = signUpSchema.safeParse({ ...fields, role })

    if (!parsed.success) {
      setFieldErrors(fieldErrorsFrom(parsed.error))
      setFormError("Please fix the highlighted fields and try again.")
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: parsed.data.role,
        businessName:
          parsed.data.role === "vendor"
            ? parsed.data.businessName || undefined
            : undefined,
        image: avatarUrl ?? undefined,
      })

      if (error) {
        applyAuthError(error)
        return
      }

      const createdRole: SignUpRole =
        data?.user?.role === "vendor" ? "vendor" : "customer"
      const firstName = data?.user?.name?.trim().split(/\s+/)[0]

      toast.success(
        firstName ? `Welcome to WedPlan, ${firstName}!` : "Welcome to WedPlan!",
      )

      router.replace(postAuthPath(callbackUrl, createdRole))
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while creating your account. Please try again."

      toast.error(message)
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const signInHref = callbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-in"

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-wedplan-sage/70 bg-muted">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Your profile photo"
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-wedplan-muted">
                <UserRound size={24} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSubmitting}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading {avatarProgress}%
                  </>
                ) : (
                  <>{avatarUrl ? "Change photo" : "Add a photo"}</>
                )}
              </button>

              {avatarUrl && !isUploading ? (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X size={13} />
                  Remove
                </button>
              ) : null}
            </div>

            <p className="mt-1.5 text-xs text-muted-foreground">
              Optional · JPEG, PNG or WebP up to {MAX_UPLOAD_MEGABYTES} MB
            </p>

            {isUploading ? (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-wedplan-primary transition-all"
                  style={{ width: `${Math.max(avatarProgress, 5)}%` }}
                />
              </div>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT_ATTRIBUTE}
            onChange={handleAvatarChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Ayesha Rahman"
            value={fields.name}
            onChange={updateField("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p id="name-error" className="text-xs text-destructive">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={updateField("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email ? (
            <p id="email-error" className="text-xs text-destructive">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={fields.password}
            onChange={updateField("password")}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby="password-hint"
          />
          <p
            id="password-hint"
            className={cn(
              "text-xs",
              fieldErrors.password ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {fieldErrors.password ?? PASSWORD_HINT}
          </p>
        </div>

        {/* Role */}
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium text-foreground/80">
            How will you use WedPlan?
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const Icon = option.icon
              const isSelected = role === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative rounded-xl border p-4 text-left transition-colors",
                    isSelected
                      ? "border-wedplan-primary bg-wedplan-sage/20 ring-1 ring-wedplan-primary/30"
                      : "border-border bg-card hover:border-wedplan-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      isSelected
                        ? "bg-wedplan-primary text-white"
                        : "bg-muted text-wedplan-primary",
                    )}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="mt-3 block text-sm font-semibold text-foreground">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </span>

                  {isSelected ? (
                    <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-wedplan-primary text-white">
                      <Check size={12} />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </fieldset>

        {role === "vendor" ? (
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business name (optional)</Label>
            <Input
              id="businessName"
              name="businessName"
              autoComplete="organization"
              placeholder="Rosewood Events"
              value={fields.businessName}
              onChange={updateField("businessName")}
              aria-invalid={Boolean(fieldErrors.businessName)}
            />
            {fieldErrors.businessName ? (
              <p className="text-xs text-destructive">
                {fieldErrors.businessName}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              You can add or change this later from your profile.
            </p>
          </div>
        ) : null}

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
          disabled={isSubmitting || isUploading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-wedplan-primary text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating your account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {googleSignInEnabled ? (
        <div className="space-y-4">
          <AuthDivider />
          <GoogleButton
            label="Sign up with Google (Customer)"
            callbackUrl={callbackUrl}
          />
          <p className="text-center text-xs text-muted-foreground">
            Google sign-up creates a customer account. Vendor accounts need a
            business profile, so please use the form above.
          </p>
        </div>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="font-semibold text-wedplan-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
