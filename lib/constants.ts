export type UserRole = "customer" | "vendor" | "admin"

export const USER_ROLES: readonly UserRole[] = ["customer", "vendor", "admin"]

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.includes(value as UserRole)

/** Where each role's own dashboard lives. */
export const dashboardPathFor = (role: string | null | undefined): string => {
  switch (role) {
    case "admin":
      return "/dashboard/admin"
    case "vendor":
      return "/dashboard/vendor"
    default:
      return "/dashboard/customer"
  }
}

export const roleLabel = (role: string | null | undefined): string => {
  switch (role) {
    case "admin":
      return "Administrator"
    case "vendor":
      return "Vendor"
    default:
      return "Customer"
  }
}

export interface CategoryDefinition {
  /** Stored in MongoDB as the service category. */
  name: string
  /** Stable key for links and filters. */
  slug: string
  description: string
  /** Homepage card photo, served from /public/images. */
  image: string
}

/**
 * The six marketplace categories. The display `name` is the value stored on
 * every service document, so it must stay in sync with the server seeds.
 */
export const CATEGORIES: readonly CategoryDefinition[] = [
  {
    name: "Photography & Videography",
    slug: "photography-videography",
    description:
      "Photographers and filmmakers who capture the day exactly as it felt.",
    image: "/images/nathan-dumlao-duNBz_LBaEc-unsplash.jpg",
  },
  {
    name: "Wedding Venues",
    slug: "wedding-venues",
    description:
      "Gardens, ballrooms and heritage halls for ceremonies of every size.",
    image: "/images/jeremy-wong-weddings-K41SGnGKxVk-unsplash.jpg",
  },
  {
    name: "Decoration & Florist",
    slug: "decoration-florist",
    description:
      "Styling, florals and lighting that turn an empty room into your story.",
    image: "/images/katrien-sterckx-fn0xXL9szcU-unsplash.jpg",
  },
  {
    name: "Catering Services",
    slug: "catering-services",
    description:
      "Menus, tastings and service teams planned around every guest list.",
    image: "/images/jennifer-kalenberg-Rkj0ms67lio-unsplash.jpg",
  },
  {
    name: "Makeup & Styling",
    slug: "makeup-styling",
    description:
      "Bridal looks and hair styling that hold from first look to last dance.",
    image: "/images/pexels-bride-1837148.jpg",
  },
  {
    name: "Wedding Fashion",
    slug: "wedding-fashion",
    description:
      "Bridal wear, groomswear and tailoring for the whole wedding party.",
    image: "/images/sfetfedyhghj-wedding-dress-1486260.jpg",
  },
] as const

export const categoryByName = (name: string) =>
  CATEGORIES.find((category) => category.name === name)

export const SITE = {
  name: "WedPlan",
  tagline: "The wedding marketplace for thoughtful celebrations.",
  email: "hello@wedplan.com",
  phone: "+880 1711 000 000",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
} as const

/** Accepts only in-app absolute paths, never protocol-relative or external URLs. */
export const isSafeCallbackUrl = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")

/**
 * Where to send someone after a successful sign-in or sign-up: the page they
 * were trying to reach when possible, otherwise their own dashboard.
 * Auth pages are excluded so a stale `callbackUrl` cannot loop.
 */
export const postAuthPath = (
  callbackUrl: unknown,
  role?: string | null,
): string => {
  if (
    isSafeCallbackUrl(callbackUrl) &&
    !/^\/sign-(in|up)(\/|\?|$)/.test(callbackUrl)
  ) {
    return callbackUrl
  }

  return dashboardPathFor(role)
}

/** Google sign-in is optional; the button stays hidden until it is enabled. */
export const googleSignInEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true"
