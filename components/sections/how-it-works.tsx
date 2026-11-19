"use client"

import Image from "next/image"
import { CalendarCheck, MessageSquareHeart, Search } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Browse curated categories and compare trusted vendors by style, location and starting price.",
    icon: Search,
    image: "/images/micheile-henderson-gnm2op0m2pw-unsplash.jpg",
  },
  {
    number: "02",
    title: "Send a Booking Request",
    description:
      "Share your event date, venue and vision in a short request so vendors know exactly what you need.",
    icon: MessageSquareHeart,
    image: "/images/jonathan-borba-g3oEF_BNXwE-unsplash.jpg",
  },
  {
    number: "03",
    title: "Track & Celebrate",
    description:
      "Follow every response from your dashboard and confirm the partners who will bring your day together.",
    icon: CalendarCheck,
    image: "/images/jakob-owens-lR--zjgQRY0-unsplash.jpg",
  },
]

export default function HowItWorks() {
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
      id="how-it-works"
      className="scroll-mt-24 bg-wedplan-sage/10 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-wedplan-brown uppercase">
            For Couples
          </p>
          <h2 className="mt-4 font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl">
            How WedPlan works
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Three simple steps from inspiration to a team of vendors you can
            rely on.
          </p>
        </motion.div>

        <div className="mt-14 space-y-10 lg:space-y-14">
          {steps.map((step, index) => {
            const Icon = step.icon
            const reverse = index % 2 === 1

            return (
              <motion.div
                key={step.number}
                {...reveal(index * 0.06)}
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-wedplan-sage/50 bg-muted">
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-wedplan-dark/30 to-transparent" />
                  <span className="absolute top-4 left-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 font-heading text-lg font-semibold text-wedplan-primary shadow-sm backdrop-blur-sm">
                    {step.number}
                  </span>
                </div>

                <div>
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-wedplan-primary/10 text-wedplan-primary">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-wedplan-brown uppercase">
                    Step {step.number}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl text-foreground sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
