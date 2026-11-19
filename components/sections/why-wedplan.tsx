"use client"

import {
  BadgeCheck,
  LayoutDashboard,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

const benefits = [
  {
    title: "Admin-vetted vendors",
    description:
      "Every listing is reviewed before it goes live, so you browse real professionals you can trust.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent pricing & instant requests",
    description:
      "See starting prices up front and send a booking request in a few clear steps.",
    icon: WalletCards,
  },
  {
    title: "Role dashboards",
    description:
      "Couples track bookings while vendors manage services and enquiries from one place.",
    icon: LayoutDashboard,
  },
  {
    title: "Verified Premium badges",
    description:
      "Premium studios earn a visible badge so standout partners are easy to spot.",
    icon: BadgeCheck,
  },
]

export default function WhyWedPlan() {
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
    <section
      id="why-wedplan"
      className="scroll-mt-24 bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-wedplan-brown uppercase">
            The WedPlan Promise
          </p>
          <h2 className="mt-4 font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Planning that feels considered
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            A calmer way to find, compare and book the people who will bring
            your celebration to life.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon

            return (
              <motion.article
                key={benefit.title}
                {...reveal(index * 0.05)}
                className="rounded-2xl border border-wedplan-sage/50 bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-wedplan-sage/30 text-wedplan-primary">
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 font-heading text-xl text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
