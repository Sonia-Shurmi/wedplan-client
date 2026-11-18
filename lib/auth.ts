import "server-only"

import { APIError, createAuthMiddleware } from "better-auth/api"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { nextCookies } from "better-auth/next-js"
import { jwt } from "better-auth/plugins"
import { betterAuth } from "better-auth"

import { db, mongoClient } from "./mongo"

const secret = process.env.BETTER_AUTH_SECRET

if (!secret) {
  throw new Error(
    "BETTER_AUTH_SECRET is missing. Generate one with: openssl rand -base64 32",
  )
}

const baseURL = (
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "")

const appURL = (process.env.NEXT_PUBLIC_APP_URL ?? baseURL).replace(
  /\/+$/,
  "",
)

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const googleEnabled = Boolean(googleClientId && googleClientSecret)

const trustedOrigins = Array.from(new Set([appURL, baseURL]))

if (process.env.NODE_ENV !== "production") {
  trustedOrigins.push("http://localhost:3000")
}

/**
 * Password rule required by the brief: 6+ characters, at least one uppercase
 * and one lowercase letter. Enforced on the server, not just in the form.
 */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/

const normalizeRole = (value: unknown) =>
  value === "vendor" ? "vendor" : "customer"

/**
 * Fields that must never be written through a client-facing auth endpoint.
 * Registration and account updates may not grant roles, unblock an account,
 * or change a subscription.
 */
const PROTECTED_USER_FIELDS = [
  "role",
  "isBlocked",
  "subscriptionPlan",
  "subscriptionExpiresAt",
] as const

export const auth = betterAuth({
  appName: "WedPlan",
  baseURL,
  secret,
  trustedOrigins,

  database: mongodbAdapter(db, {
    client: mongoClient,
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  socialProviders: googleEnabled
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
          prompt: "select_account",
        },
      }
    : {},

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const data = user as Record<string, unknown>

          return {
            data: {
              ...data,
              // Public registration may only produce vendors or customers.
              role: normalizeRole(data.role),
              isBlocked: false,
              subscriptionPlan: "free",
              subscriptionExpiresAt: null,
            },
          }
        },
      },
      update: {
        before: async (user) => {
          const data = user as Record<string, unknown>

          // Better Auth merges a hook's return value into the original update
          // payload, so deleting a key here does NOT remove it. Reject the
          // request instead — these fields are only written by trusted server
          // code (admin tooling and the verified Stripe webhook).
          const attempted = PROTECTED_USER_FIELDS.filter((field) =>
            Object.hasOwn(data, field),
          )

          if (attempted.length > 0) {
            throw new APIError("FORBIDDEN", {
              message: `These fields can only be changed by WedPlan administrators: ${attempted.join(", ")}.`,
            })
          }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email" || ctx.method !== "POST") {
        return
      }

      const body = ctx.body as { password?: unknown } | undefined
      const password = typeof body?.password === "string" ? body.password : ""

      if (!PASSWORD_PATTERN.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be at least 6 characters and contain at least one uppercase and one lowercase letter.",
        })
      }
    }),
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // Always read the session from the database so role and blocked-state
    // changes are visible without waiting for a cookie to expire.
    cookieCache: { enabled: false },
  },

  plugins: [
    jwt({
      jwt: {
        issuer: baseURL,
        audience: baseURL,
        expirationTime: "15m",
        definePayload: ({ user }) => ({
          role: user.role ?? "customer",
          isBlocked: user.isBlocked === true,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        }),
      },
    }),
    // Must be the last plugin.
    nextCookies(),
  ],
})

export type Auth = typeof auth
export { googleEnabled }
