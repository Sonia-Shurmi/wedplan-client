"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import {
  Building2,
  Camera,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { ApiError, api } from "@/lib/api"
import { roleLabel } from "@/lib/constants"
import {
  profileFormSchema,
  type Profile,
  type ProfileFormValues,
} from "@/lib/profile"
import {
  IMAGE_ACCEPT_ATTRIBUTE,
  MAX_UPLOAD_MEGABYTES,
  isAcceptedImageType,
  uploadImage,
} from "@/lib/upload"

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

export function ProfileSettings({
  initialProfile,
}: Readonly<{ initialProfile: Profile }>) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refetch: refreshSession } = authClient.useSession()

  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [fields, setFields] = useState<ProfileFormValues>({
    name: initialProfile.name,
    businessName: initialProfile.businessName ?? "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [imageUrl, setImageUrl] = useState<string | null>(initialProfile.image)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    const response = await api.get<Profile>("/profile", { signal })
    return response.data
  }, [])

  const applyProfile = useCallback((data: Profile) => {
    setProfile(data)
    setFields({
      name: data.name,
      businessName: data.businessName ?? "",
    })
    setImageUrl(data.image)
    setLoadError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetchProfile(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          applyProfile(data)
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(errorMessage(reason, "We could not load your profile."))
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [applyProfile, fetchProfile])

  const handleRetry = () => {
    setIsLoading(true)
    setLoadError(null)

    fetchProfile()
      .then(applyProfile)
      .catch((reason: unknown) => {
        setLoadError(errorMessage(reason, "We could not load your profile."))
        setIsLoading(false)
      })
  }

  const handleFieldChange = (key: keyof ProfileFormValues, value: string) => {
    setFields((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: "" }))
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    // Reset so choosing the same file twice still fires onChange.
    event.target.value = ""

    if (!file) {
      return
    }

    if (!isAcceptedImageType(file.type)) {
      toast.error("Please choose a JPEG, PNG or WebP image.")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploaded = await uploadImage(file, {
        onProgress: setUploadProgress,
      })

      setImageUrl(uploaded.displayUrl ?? uploaded.url)
      toast.success("Photo uploaded. Save your changes to apply it.")
    } catch (error) {
      toast.error(errorMessage(error, "That photo could not be uploaded."))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = profileFormSchema.safeParse(fields)

    if (!parsed.success) {
      const errors: Record<string, string> = {}

      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "")
        if (key && !errors[key]) {
          errors[key] = issue.message
        }
      }

      setFieldErrors(errors)
      toast.error("Please check the highlighted fields.")
      return
    }

    setFieldErrors({})
    setIsSaving(true)

    try {
      const body: Record<string, unknown> = {
        name: parsed.data.name,
        image: imageUrl,
      }

      if (profile?.role === "vendor") {
        body.businessName = parsed.data.businessName || null
      }

      const response = await api.patch<Profile>("/profile", body)

      setProfile(response.data)
      await refreshSession().catch(() => undefined)
      router.refresh()
      toast.success("Your profile has been updated.")
    } catch (error) {
      toast.error(errorMessage(error, "We could not save your profile."))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
        <div>
          <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl border border-wedplan-sage/40 bg-card" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Profile settings
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {loadError ?? "We could not load your profile."}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-wedplan-primary px-5 text-sm font-medium text-white transition-colors hover:bg-wedplan-dark"
        >
          Try again
        </button>
      </div>
    )
  }

  const isVendor = profile.role === "vendor"

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-wedplan-muted uppercase">
          Account settings
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Profile settings
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Update how your name and photo appear across WedPlan. Your email and
          account role are managed separately for security.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-2xl border border-wedplan-sage/40 bg-card p-6 shadow-sm sm:p-8"
      >
        <section aria-labelledby="photo-heading">
          <h2
            id="photo-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Profile photo
          </h2>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-wedplan-sage/70 bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Your profile photo"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-wedplan-muted">
                  <UserRound size={30} />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSaving}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Camera size={14} />
                      {imageUrl ? "Change photo" : "Add a photo"}
                    </>
                  )}
                </button>

                {imageUrl && !isUploading ? (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-70"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                ) : null}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                JPEG, PNG or WebP up to {MAX_UPLOAD_MEGABYTES} MB. Uploads are
                saved when you select Save changes.
              </p>

              {isUploading ? (
                <div
                  className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted"
                  aria-label="Upload progress"
                >
                  <div
                    className="h-full rounded-full bg-wedplan-primary transition-all"
                    style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT_ATTRIBUTE}
            onChange={handleAvatarChange}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a profile photo"
          />
        </section>

        <div className="border-t border-wedplan-sage/40 pt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Personal details
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fields.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-wedplan-primary"
              />
              {fieldErrors.name ? (
                <p id="name-error" className="mt-1 text-xs text-destructive">
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            {isVendor ? (
              <div>
                <label
                  htmlFor="profile-business-name"
                  className="block text-sm font-medium text-foreground"
                >
                  Business name
                </label>
                <input
                  id="profile-business-name"
                  type="text"
                  value={fields.businessName}
                  onChange={(event) =>
                    handleFieldChange("businessName", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.businessName)}
                  aria-describedby={
                    fieldErrors.businessName ? "business-name-error" : undefined
                  }
                  placeholder="Your studio or brand"
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-wedplan-primary"
                />
                {fieldErrors.businessName ? (
                  <p
                    id="business-name-error"
                    className="mt-1 text-xs text-destructive"
                  >
                    {fieldErrors.businessName}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-wedplan-sage/40 pt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Account information
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            These details are read only.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-wedplan-sage/20 p-4">
              <Mail size={16} className="mt-0.5 shrink-0 text-wedplan-primary" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-wedplan-muted uppercase">
                  Email address
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-wedplan-sage/20 p-4">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-wedplan-primary"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-wedplan-muted uppercase">
                  Account role
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {roleLabel(profile.role)}
                </p>
              </div>
            </div>

            {isVendor ? (
              <div className="flex items-start gap-3 rounded-xl bg-wedplan-sage/20 p-4 sm:col-span-2">
                <Building2
                  size={16}
                  className="mt-0.5 shrink-0 text-wedplan-primary"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-wedplan-muted uppercase">
                    Current business name
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    {fields.businessName || "Not set"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-wedplan-sage/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Changes are applied to WedPlan immediately after saving.
          </p>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileSettings
