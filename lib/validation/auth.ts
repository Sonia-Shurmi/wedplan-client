import { z } from "zod"

export const PASSWORD_HINT =
  "At least 6 characters, with one uppercase and one lowercase letter."

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Please use 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, PASSWORD_HINT)
    .max(128, "Password must be 128 characters or fewer.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter."),
  role: z.enum(["customer", "vendor"]),
  businessName: z
    .string()
    .trim()
    .max(80, "Business name must be 80 characters or fewer.")
    .optional(),
})

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export type SignUpValues = z.infer<typeof signUpSchema>
export type SignInValues = z.infer<typeof signInSchema>

/** Turns a failed `safeParse` into a `{ field: message }` map for the form. */
export const fieldErrorsFrom = (
  error: z.ZodError,
): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")

    if (!errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
}
