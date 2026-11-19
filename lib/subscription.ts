/** Billing state returned by the Express subscription API. */

export interface SubscriptionStatus {
  plan: "free" | "premium"
  subscriptionExpiresAt: string | null
  isPremium: boolean
}

export interface CheckoutSessionResponse {
  url: string
  sessionId: string
}

/** Mirrors the server's expiry rule: a stored premium plan alone is not access. */
export const isActivePremium = (
  plan: string | null | undefined,
  expiresAt: string | Date | null | undefined,
  now: Date = new Date(),
): boolean => {
  if (plan !== "premium") return false
  if (!expiresAt) return true

  const expiry =
    expiresAt instanceof Date ? expiresAt : new Date(expiresAt)

  return Number.isFinite(expiry.getTime()) && expiry.getTime() > now.getTime()
}
