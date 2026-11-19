"use client"

import Link from "next/link"
import { ArrowRight, BadgeCheck, Crown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

const points = [
  "Free plan: up to 3 active service listings",
  "Unlimited listings with Premium",
  "Verified Premium badge on your services",
  "Secure Stripe-powered checkout",
]

export default function PremiumVendorCta() {
  const reduceMotion = useReducedMotion()
  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: {
            duration: 0.5,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        }

  return (
    <section className="bg-wedplan-dark py-20 text-white lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        <motion.div {...reveal(0)}>
          <p className="text-xs font-semibold tracking-[0.28em] text-wedplan-sage uppercase">
            For Vendors
          </p>
          <h2 className="mt-4 font-heading text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Grow Your Studio With WedPlan Premium
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            Start on the free plan, then unlock unlimited listings and a Premium
            badge that helps couples find you faster — all with simple,
            Stripe-powered billing.
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-white/85"
              >
                <BadgeCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-wedplan-sage"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sign-up?role=vendor"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-wedplan-sage px-6 py-3.5 text-sm font-semibold text-wedplan-dark transition-colors hover:bg-white"
            >
              Become a Vendor
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard/vendor/subscription"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Crown size={16} />
              View Plans
            </Link>
          </div>
        </motion.div>

        <motion.div
          {...reveal(0.08)}
          className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
                Free
              </p>
              <p className="mt-3 font-heading text-3xl text-white">$0</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Perfect for getting started with up to 3 active listings.
              </p>
            </div>
            <div className="relative rounded-xl border border-wedplan-sage/50 bg-wedplan-sage/10 p-5">
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-wedplan-sage px-2.5 py-1 text-[10px] font-semibold text-wedplan-dark uppercase">
                <Crown size={11} />
                Premium
              </span>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-wedplan-sage uppercase">
                Premium
              </p>
              <p className="mt-3 font-heading text-3xl text-white">
                $19
                <span className="ml-1 text-sm font-normal text-white/60">
                  / month
                </span>
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Unlimited listings, featured placement and a Premium badge.
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-white/55">
            Subscriptions are billed securely through Stripe. You can cancel any
            time from your dashboard.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
