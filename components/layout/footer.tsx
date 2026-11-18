
import Link from "next/link"
import { Heart, Mail, ArrowUpRight } from "lucide-react"
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="bg-wedplan-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-heading text-3xl font-bold">
                WedPlan<span className="text-wedplan-muted">.</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-white/60">
              Your dream wedding deserves extraordinary details.
              Discover trusted professionals and bring every beautiful
              celebration to life with WedPlan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {[
                {
                    label: "Instagram",
                    icon: FaInstagram,
                    href: "https://instagram.com",
                },
                {
                    label: "Facebook",
                    icon: FaFacebookF,
                    href: "https://facebook.com",
                },
                {
                    label: "LinkedIn",
                    icon: FaLinkedinIn,
                    href: "https://linkedin.com",
                },
                ].map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="rounded-full border border-white/20 p-2.5 text-white/70 transition hover:border-wedplan-muted hover:bg-wedplan-primary hover:text-white"
                  >
                    <Icon size={17} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="font-heading text-lg">Explore</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/services" className="hover:text-white">Browse Services</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link href="/#why-wedplan" className="hover:text-white">About WedPlan</Link></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div className="space-y-5">
            <h3 className="font-heading text-lg">Marketplace</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/services" className="hover:text-white">Find Wedding Vendors</Link></li>
              <li><Link href="/sign-up" className="hover:text-white">Become a Vendor</Link></li>
              <li><Link href="/sign-in" className="hover:text-white">Vendor Sign In</Link></li>
              <li><Link href="/sign-up" className="hover:text-white">Explore Membership</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="font-heading text-lg">Get in Touch</h3>
            <p className="text-sm leading-7 text-white/60">
              Have a question or need assistance? We'd love to hear from you.
            </p>

            <a
              href="mailto:hello@wedplan.com"
              className="inline-flex items-center gap-2 text-sm text-wedplan-sage transition hover:text-white"
            >
              <Mail size={16} />
              hello@wedplan.com
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 flex flex-col justify-between gap-6 rounded-xl border border-white/15 bg-white/5 p-7 md:flex-row md:items-center md:p-9">
          <div className="max-w-lg">
            <h3 className="font-heading text-2xl">
              A little inspiration for your big day.
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Stay inspired with wedding ideas, planning tips, and
              the latest trends.
            </p>
          </div>

          <Link
            href="/sign-up"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-wedplan-sage px-6 py-3 text-sm font-semibold text-wedplan-dark transition hover:bg-white"
          >
            Join WedPlan
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Legal and copyright */}
        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/15 pt-7 text-xs text-white/50 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} WedPlan. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>

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
