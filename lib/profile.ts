import { z } from "zod"

import type { UserRole } from "./constants"

/** The subset of the profile API used by the settings form. */
export interface Profile {
  name: string
  email: string
  image: string | null
  role: UserRole | null
  businessName: string | null
}

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Please use 80 characters or fewer."),
  businessName: z
    .string()
    .trim()
    .max(80, "Business name must be 80 characters or fewer."),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
