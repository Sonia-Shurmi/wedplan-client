"use client"

import { clearApiToken } from "./api"
import { authClient } from "./auth-client"

/**
 * Ends the Better Auth session and clears the cached API token.
 * Navigation is left to the caller so each screen can choose where to land.
 */
export const signOut = async () => {
  try {
    await authClient.signOut()
  } finally {
    clearApiToken()
  }
}
