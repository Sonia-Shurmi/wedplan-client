"use client"

import { ApiError, apiBaseUrl, getApiToken } from "./api"

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_UPLOAD_MEGABYTES = MAX_UPLOAD_BYTES / (1024 * 1024)

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number]

/** Ready to drop into an `<input type="file" accept={...} />`. */
export const IMAGE_ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",")

/**
 * Vercel rejects serverless request bodies above 4.5 MB, and base64 inflates
 * a file by about a third, so a file of roughly 3 MB is the practical
 * ceiling. Anything larger is downscaled in the browser before upload.
 */
const MAX_REQUEST_BYTES = 4 * 1024 * 1024
const COMPRESSIBLE_MAX_BYTES = 25 * 1024 * 1024
const MAX_DIMENSION = 2000
const UPLOAD_TIMEOUT_MS = 60_000

/** Exact byte length of the base64 representation (plus data-URL prefix). */
const encodedLength = (bytes: number) => Math.ceil(bytes / 3) * 4 + 64

export interface UploadedImage {
  id: string
  url: string
  displayUrl?: string
  width: number
  height: number
  size: number
  mimeType: AcceptedImageType
  bytes: number
}

export interface UploadOptions {
  /** Use the public endpoint (sign-up avatar) instead of the authenticated one. */
  public?: boolean
  /** Receives 0-100 while the request body is being sent. */
  onProgress?: (percent: number) => void
  /** Skip browser-side downscaling. */
  compress?: boolean
}

interface UploadEnvelope {
  success?: boolean
  message?: string
  data?: UploadedImage
  errors?: { field: string; message: string }[]
}

const extensionFor = (type: AcceptedImageType) =>
  type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg"

export const isAcceptedImageType = (
  type: string,
): type is AcceptedImageType =>
  ACCEPTED_IMAGE_TYPES.includes(type as AcceptedImageType)

/**
 * Re-encodes large photos in the browser so a phone snapshot does not hit
 * the 5 MB server limit (and stays under Vercel's 4.5 MB request cap).
 * Failure is never fatal: the original file is uploaded instead.
 */
const compressImage = async (file: File): Promise<File> => {
  try {
    const bitmap = await createImageBitmap(file)

    try {
      const scale = Math.min(
        1,
        MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
      )
      const width = Math.max(1, Math.round(bitmap.width * scale))
      const height = Math.max(1, Math.round(bitmap.height * scale))

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext("2d")

      if (!context) {
        return file
      }

      context.drawImage(bitmap, 0, 0, width, height)

      const type = isAcceptedImageType(file.type) ? file.type : "image/jpeg"
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          resolve,
          type,
          type === "image/png" ? undefined : 0.85,
        )
      })

      if (!blob || blob.size >= file.size) {
        return file
      }

      const baseName = file.name.replace(/\.[^.]+$/, "") || "wedplan-image"

      return new File([blob], `${baseName}.${extensionFor(type)}`, {
        type,
        lastModified: Date.now(),
      })
    } finally {
      bitmap.close?.()
    }
  } catch {
    return file
  }
}

const prepareImage = async (file: File, shouldCompress: boolean) => {
  if (!isAcceptedImageType(file.type)) {
    throw new ApiError(
      415,
      "Please choose a JPEG, PNG or WebP image.",
    )
  }

  if (file.size === 0) {
    throw new ApiError(400, "That file is empty. Please choose another image.")
  }

  const canCompress = shouldCompress && file.size <= COMPRESSIBLE_MAX_BYTES

  if (file.size > MAX_UPLOAD_BYTES) {
    const compressed = canCompress ? await compressImage(file) : file

    if (compressed.size > MAX_UPLOAD_BYTES) {
      throw new ApiError(
        413,
        `Image is too large. Maximum size is ${MAX_UPLOAD_MEGABYTES} MB.`,
      )
    }

    return compressed
  }

  if (encodedLength(file.size) > MAX_REQUEST_BYTES) {
    const compressed = canCompress ? await compressImage(file) : file

    if (encodedLength(compressed.size) > MAX_REQUEST_BYTES) {
      throw new ApiError(
        413,
        "This image is still too large after resizing. Please choose a smaller photo.",
      )
    }

    return compressed
  }

  return file
}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new ApiError(0, "That image could not be read."))
      }
    }

    reader.onerror = () =>
      reject(new ApiError(0, "That image could not be read."))

    reader.readAsDataURL(file)
  })

interface RawResponse {
  status: number
  body: string
}

const send = (
  endpoint: string,
  body: string,
  token: string | null,
  onProgress?: (percent: number) => void,
) =>
  new Promise<RawResponse>((resolve, reject) => {
    const request = new XMLHttpRequest()

    request.open("POST", endpoint)
    request.timeout = UPLOAD_TIMEOUT_MS
    request.setRequestHeader("Content-Type", "application/json")

    if (token) {
      request.setRequestHeader("Authorization", `Bearer ${token}`)
    }

    request.upload.onprogress = (event) => {
      if (!onProgress) {
        return
      }

      const total = event.lengthComputable ? event.total : body.length

      onProgress(
        Math.min(100, Math.round((event.loaded / Math.max(total, 1)) * 100)),
      )
    }

    request.onload = () =>
      resolve({ status: request.status, body: request.responseText })

    request.onerror = () =>
      reject(
        new ApiError(
          0,
          "Cannot reach the WedPlan API. Please check your connection.",
        ),
      )

    request.ontimeout = () =>
      reject(
        new ApiError(0, "The upload timed out. Please try again."),
      )

    request.send(body)
  })

const parseResponse = (response: RawResponse): UploadedImage => {
  let payload: UploadEnvelope | null = null

  try {
    payload = response.body ? (JSON.parse(response.body) as UploadEnvelope) : null
  } catch {
    payload = null
  }

  if (response.status < 200 || response.status >= 300 || !payload?.data?.url) {
    throw new ApiError(
      response.status || 0,
      payload?.message ?? "The image could not be uploaded.",
      payload?.errors,
    )
  }

  return payload.data
}

/**
 * Uploads an image through the WedPlan API and returns its hosted URL.
 * Throws `ApiError` with a message that is safe to show in a toast.
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions = {},
): Promise<UploadedImage> => {
  const prepared = await prepareImage(file, options.compress !== false)
  const dataUrl = await readAsDataUrl(prepared)
  const endpoint = `${apiBaseUrl}/uploads${options.public ? "/public" : ""}`
  const body = JSON.stringify({
    image: dataUrl,
    name: prepared.name.slice(0, 80),
  })

  let token: string | null = null

  if (!options.public) {
    token = await getApiToken()
  }

  let response = await send(endpoint, body, token, options.onProgress)

  if (!options.public && response.status === 401) {
    token = await getApiToken(true)
    response = await send(endpoint, body, token, options.onProgress)
  }

  return parseResponse(response)
}

/** Sign-up avatar: works before the account exists. */
export const uploadPublicImage = (
  file: File,
  options: Omit<UploadOptions, "public"> = {},
) => uploadImage(file, { ...options, public: true })
