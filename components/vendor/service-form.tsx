"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import {
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PlanLimitNotice from "@/components/vendor/plan-limit-notice"
import { ApiError, api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { CATEGORIES } from "@/lib/constants"
import type { Service } from "@/lib/services"
import {
  IMAGE_ACCEPT_ATTRIBUTE,
  MAX_UPLOAD_MEGABYTES,
  uploadImage,
} from "@/lib/upload"
import { cn } from "@/lib/utils"
import {
  serviceFieldErrorsFrom,
  serviceFormSchema,
} from "@/lib/validation/service"

interface ServiceFormProps {
  mode: "create" | "edit"
  service?: Service
}

const MAX_IMAGES = 5

const emptyFields = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  location: "",
}

const inputClass = "h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-wedplan-muted focus-visible:ring-3 focus-visible:ring-wedplan-sage/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15"

export default function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const [fields, setFields] = useState({
    ...emptyFields,
    serviceName: service?.serviceName ?? "",
    category: service?.category ?? "",
    description: service?.description ?? "",
    price: service ? String(service.price) : "",
    location: service?.location ?? "",
  })
  const [images, setImages] = useState<string[]>(service?.images ?? [])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [atLimit, setAtLimit] = useState(false)

  // Warn up front when a free vendor has no listing slots left.
  useEffect(() => {
    if (mode !== "create" || session?.user?.subscriptionPlan === "premium") {
      return
    }

    api
      .get<Service[]>("/services/mine")
      .then((response) => {
        const active = response.data.filter((item) => item.status !== "rejected")

        setAtLimit(active.length >= 3)
      })
      .catch(() => {
        // The server is authoritative; the 409 response still handles limits.
      })
  }, [mode, session?.user?.subscriptionPlan])

  const updateField =
    (key: keyof typeof emptyFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value

      setFields((current) => ({ ...current, [key]: value }))
      setFieldErrors((current) => {
        if (!current[key]) {
          return current
        }

        return { ...current, [key]: "" }
      })
    }

  const handleImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""

    if (!files.length) {
      return
    }

    const slots = MAX_IMAGES - images.length

    if (slots <= 0) {
      toast.error(`You can add up to ${MAX_IMAGES} images.`)
      return
    }

    if (files.length > slots) {
      toast.error(`Only ${slots} more image${slots === 1 ? "" : "s"} can be added.`)
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploaded = await Promise.all(
        files.slice(0, slots).map((file) => uploadImage(file)),
      )

      setImages((current) =>
        [...current, ...uploaded.map((image) => image.url)].slice(0, MAX_IMAGES),
      )
      setFieldErrors((current) => ({ ...current, images: "" }))
      toast.success(
        uploaded.length === 1 ? "Image uploaded." : `${uploaded.length} images uploaded.`,
      )
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "That image could not be uploaded. Please try another one.",
      )
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setLimitReached(false)

    const parsed = serviceFormSchema.safeParse({ ...fields, images })

    if (!parsed.success) {
      setFieldErrors(serviceFieldErrorsFrom(parsed.error.issues))
      setFormError("Please fix the highlighted fields and try again.")
      return
    }

    setSubmitting(true)

    try {
      if (mode === "create") {
        await api.post<Service>("/services", parsed.data)
      } else {
        await api.patch<Service>(`/services/${service!._id}`, parsed.data)
      }

      const wasRejected = service?.status === "rejected"

      toast.success(
        wasRejected
          ? "Service resubmitted for review."
          : mode === "create"
            ? "Service submitted for review. We will email you once it is approved."
            : "Service updated successfully.",
      )

      router.push("/dashboard/vendor")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      )

      if (error instanceof ApiError) {
        if (error.errors?.length) {
          setFieldErrors(
            serviceFieldErrorsFrom(
              error.errors.map((item) => ({
                path: [item.field],
                message: item.message,
              })),
            ),
          )
          setFormError("Please fix the highlighted fields and try again.")
        } else {
          if (error.status === 409) {
            setLimitReached(true)
          }
          setFormError(error.message)
        }
      } else {
        setFormError("Something went wrong. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!service) {
      return
    }

    setDeleting(true)

    try {
      await api.delete(`/services/${service._id}`)
      toast.success("Service deleted.")
      router.push("/dashboard/vendor")
      router.refresh()
    } catch (error) {
      setConfirmDelete(false)
      toast.error(
        error instanceof ApiError
          ? error.message
          : "The service could not be deleted. Please try again.",
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {mode === "edit" && service?.status === "rejected" ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm leading-6 text-amber-900">
          <strong className="font-semibold">This listing needs attention.</strong>{" "}
          It was not approved in its last review. Saving your changes will
          resubmit it for review.
        </div>
      ) : null}

      {(atLimit && mode === "create") || limitReached ? (
        <PlanLimitNotice />
      ) : null}

      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <TriangleAlert size={17} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <section className="space-y-5 rounded-2xl border border-wedplan-sage/60 bg-card p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="font-heading text-xl text-foreground">The essentials</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Couples see this information first, so make it clear and specific.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serviceName">Service name</Label>
          <Input
            id="serviceName"
            value={fields.serviceName}
            onChange={updateField("serviceName")}
            placeholder="Elegant Wedding Photography"
            aria-invalid={Boolean(fieldErrors.serviceName)}
            aria-describedby={fieldErrors.serviceName ? "serviceName-error" : undefined}
          />
          {fieldErrors.serviceName ? (
            <p id="serviceName-error" className="text-xs text-destructive">
              {fieldErrors.serviceName}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={fields.category}
              onChange={updateField("category")}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? "category-error" : undefined}
              className={inputClass}
            >
              <option value="">Choose a category</option>
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.category ? (
              <p id="category-error" className="text-xs text-destructive">
                {fieldErrors.category}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Starting price (USD)</Label>
            <Input
              id="price"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={fields.price}
              onChange={updateField("price")}
              placeholder="1200"
              aria-invalid={Boolean(fieldErrors.price)}
              aria-describedby={fieldErrors.price ? "price-error" : undefined}
            />
            {fieldErrors.price ? (
              <p id="price-error" className="text-xs text-destructive">
                {fieldErrors.price}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={fields.location}
            onChange={updateField("location")}
            placeholder="Dhaka, Bangladesh"
            aria-invalid={Boolean(fieldErrors.location)}
            aria-describedby={fieldErrors.location ? "location-error" : undefined}
          />
          {fieldErrors.location ? (
            <p id="location-error" className="text-xs text-destructive">
              {fieldErrors.location}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={6}
            value={fields.description}
            onChange={updateField("description")}
            placeholder="Describe what is included, your approach and what makes your work personal…"
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? "description-error" : undefined}
            className={cn(inputClass, "h-auto resize-y py-3 leading-6")}
          />
          <div className="flex items-start justify-between gap-3">
            {fieldErrors.description ? (
              <p id="description-error" className="text-xs text-destructive">
                {fieldErrors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="shrink-0 text-xs text-muted-foreground">
              {fields.description.trim().length}/2000
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-wedplan-sage/60 bg-card p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="font-heading text-xl text-foreground">Photos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one to five images. The first photo is used as your listing cover.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-wedplan-sage/60 bg-muted"
            >
              <Image
                src={image}
                alt={`Listing photo ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 250px"
                className="object-cover"
              />
              {index === 0 ? (
                <span className="absolute bottom-2 left-2 rounded-full bg-wedplan-dark/85 px-2 py-1 text-[10px] font-semibold text-white">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setImages((current) => current.filter((_, i) => i !== index))
                }
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES ? (
            <button
              type="button"
              onClick={() => document.getElementById("service-images")?.click()}
              disabled={uploading || submitting}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-wedplan-muted/60 bg-wedplan-sage/10 text-wedplan-primary transition-colors hover:bg-wedplan-sage/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <ImagePlus size={22} />
              )}
              <span className="text-xs font-medium">
                {uploading ? `${uploadProgress}%` : "Add image"}
              </span>
            </button>
          ) : null}
        </div>

        <input
          id="service-images"
          type="file"
          accept={IMAGE_ACCEPT_ATTRIBUTE}
          multiple
          onChange={handleImages}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {uploading ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-wedplan-primary transition-all"
              style={{ width: `${Math.max(uploadProgress, 5)}%` }}
            />
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          JPEG, PNG or WebP up to {MAX_UPLOAD_MEGABYTES} MB each. Uploads are
          hosted securely and appear on your public listing after approval.
        </p>
        {fieldErrors.images ? (
          <p className="text-xs text-destructive">{fieldErrors.images}</p>
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {mode === "edit" && service ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 size={15} />
            Delete service
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save size={16} />
              {mode === "create" ? "Submit for review" : "Save changes"}
            </>
          )}
        </button>
      </div>

      {confirmDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-wedplan-dark/60 p-4"
          role="presentation"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <h2 id="delete-title" className="font-heading text-xl text-foreground">
              Delete this service?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This permanently removes the listing and its photos from WedPlan.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
              >
                Keep service
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}
