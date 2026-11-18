"use client"

/**
 * Typed client for the Express API.
 *
 * The Better Auth session lives on this origin, so we exchange it for a
 * short-lived JWT and send that as a bearer token. The token is kept in
 * memory only — never in localStorage — and refreshed once on a 401.
 */

export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/+$/, "")

const authBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "")

  return `${appUrl}/api/auth`
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
  pagination?: Pagination
  errors?: ApiFieldError[]
}

export class ApiError extends Error {
  readonly status: number
  readonly errors?: ApiFieldError[]

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

let cachedToken: string | null = null

const fetchJwt = async (): Promise<string> => {
  let response: Response

  try {
    response = await fetch(`${authBaseUrl()}/token`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the authentication service. Please check your connection.",
    )
  }

  if (!response.ok) {
    cachedToken = null
    throw new ApiError(
      response.status,
      "Your session has expired. Please sign in again.",
    )
  }

  const payload = (await response.json().catch(() => null)) as {
    token?: string
  } | null

  if (!payload?.token) {
    cachedToken = null
    throw new ApiError(401, "Could not obtain an access token.")
  }

  cachedToken = payload.token

  return payload.token
}

const getToken = async (forceRefresh = false): Promise<string> => {
  if (!forceRefresh && cachedToken) {
    return cachedToken
  }

  return fetchJwt()
}

const sendRequest = async (
  path: string,
  options: RequestOptions,
  token: string,
): Promise<Response> => {
  const url = `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
  const headers = new Headers(options.headers)

  headers.set("Authorization", `Bearer ${token}`)

  const hasBody = options.body !== undefined

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  try {
    return await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
      body: hasBody ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the WedPlan API. Please check that the server is running.",
    )
  }
}

const parseResponse = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed with status ${response.status}.`,
      payload?.errors,
    )
  }

  return payload ?? ({ success: true, data: undefined as T })
}

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> => {
  let token = await getToken()
  let response = await sendRequest(path, options, token)

  // A 401 before the controller ran means nothing was written, so one retry
  // with a fresh token is safe for every method.
  if (response.status === 401) {
    token = await getToken(true)
    response = await sendRequest(path, options, token)
  }

  return parseResponse<T>(response)
}

export const api = {
  get: <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) => apiRequest<T>(path, { ...options, method: "POST", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) => apiRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(
    path: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) => apiRequest<T>(path, { ...options, method: "DELETE" }),
}

/** Clear the in-memory token after sign-out or an account switch. */
export const clearApiToken = () => {
  cachedToken = null
}

/**
 * Exposes the JWT to XMLHttpRequest callers (image uploads need upload
 * progress events, which fetch cannot report).
 */
export const getApiToken = (forceRefresh = false) => getToken(forceRefresh)
