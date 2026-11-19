/**
 * Better Auth returns `{ data, error }`; the `error` object is a
 * `BetterFetchError` whose API details live under `.error`, while `.message`
 * carries a readable fallback. These helpers read both shapes safely.
 */

export const authErrorCode = (error: unknown): string => {
  const value = error as
    | { code?: string; error?: { code?: string } | string }
    | null
    | undefined

  if (!value) {
    return ""
  }

  if (typeof value.error === "object" && value.error?.code) {
    return value.error.code
  }

  return value.code ?? ""
}

export const authErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) {
    return fallback
  }

  if (typeof error === "string") {
    return error || fallback
  }

  const value = error as {
    message?: string
    error?: { message?: string } | string
  }

  if (typeof value.error === "object" && value.error?.message) {
    return value.error.message
  }

  if (typeof value.error === "string" && value.error) {
    return value.error
  }

  return value.message?.trim() || fallback
}
