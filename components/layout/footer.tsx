import Link from "next/link"
import { ArrowUpRight, Heart, Mail, MapPin, Phone } from "lucide-react"
import { FaFacebookF, FaInstagram, FaPinterestP } from "react-icons/fa"

import { CATEGORIES, SITE } from "@/lib/constants"

const socialIcons = {
  Instagram: FaInstagram,
  Pinterest: FaPinterestP,
  Facebook: FaFacebookF,
} as const

const navigation = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Create Account", href: "/sign-up" },
  { label: "Dashboard", href: "/dashboard" },
]

const Footer = () => {
  return (
    <footer className="bg-wedplan-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-4">
            <Link href="/" className="inline-block">
              <span className="font-heading text-3xl font-bold">
                WedPlan<span className="text-wedplan-muted">.</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-white/60">
              {SITE.tagline} Discover trusted professionals, compare their
              work and plan every beautiful celebration with confidence.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {SITE.socials.map((social) => {
                const Icon = socialIcons[social.label]

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="rounded-full border border-white/20 p-2.5 text-white/70 transition hover:border-wedplan-muted hover:bg-wedplan-primary hover:text-white"
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-5 lg:col-span-2">
            <h3 className="font-heading text-lg">Navigation</h3>
            <ul className="space-y-3 text-sm text-white/60">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-5 lg:col-span-3">
            <h3 className="font-heading text-lg">Categories</h3>
            <ul className="space-y-3 text-sm text-white/60">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category.name)}`}
                    className="hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5 lg:col-span-3">
            <h3 className="font-heading text-lg">Contact &amp; Connect</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-start gap-2.5 hover:text-white"
                >
                  <Mail size={16} className="mt-0.5 shrink-0" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-start gap-2.5 hover:text-white"
                >
                  <Phone size={16} className="mt-0.5 shrink-0" />
                  {SITE.phone}
                </a>
              </li>
              <li className="inline-flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                {SITE.address}
              </li>
            </ul>

            <Link
              href="/sign-up?role=vendor"
              className="inline-flex items-center gap-2 text-sm font-medium text-wedplan-sage hover:text-white"
            >
              List your business
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/15 pt-7 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            Made with
            <Heart size={13} className="fill-current text-wedplan-muted" />
            for beautiful beginnings.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
