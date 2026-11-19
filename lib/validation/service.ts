import { z } from "zod"

import { CATEGORIES } from "@/lib/constants"

const categoryNames = CATEGORIES.map((category) => category.name)

/**
 * Mirrors the server's create/update schema. Image URLs may also be relative
 * paths because older seeded listings use `/images/wedding.jpg`.
 */
const imageSource = z.string().refine(
  (value) => value.startsWith("/") || z.url().safeParse(value).success,
  "Enter a valid image URL.",
)

export const serviceFormSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(3, "Service name must be at least 3 characters.")
    .max(120, "Service name must be 120 characters or fewer."),
  category: z
    .string()
    .refine((value) => categoryNames.includes(value), {
      message: "Choose one of the six WedPlan categories.",
    }),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(2000, "Description must be 2000 characters or fewer."),
  price: z.coerce
    .number()
    .positive("Price must be greater than zero.")
    .max(1_000_000, "Price must be 1,000,000 or less."),
  location: z
    .string()
    .trim()
    .min(2, "Location is required.")
    .max(120, "Location must be 120 characters or fewer."),
  images: z
    .array(imageSource)
    .min(1, "Add at least one image.")
    .max(5, "You can add up to five images."),
})

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

/** Maps both local Zod errors and API field errors to one `{ field: message }` map. */
export const serviceFieldErrorsFrom = (
  issues: readonly { path: PropertyKey[]; message: string }[],
): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form")

    if (!errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
}
