"use client"

import { Quote } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

const testimonials = [
  {
    quote:
      "We found our photographer and florist in one evening. Seeing prices and sending requests without the back-and-forth made planning feel easy.",
    name: "Nadia & Arif",
    location: "Dhaka",
    date: "March 2026",
  },
  {
    quote:
      "Every vendor we contacted was responsive and clear. Tracking replies in the dashboard kept us organized right up to the day.",
    name: "Maya Rahman",
    location: "Chattogram",
    date: "January 2026",
  },
  {
    quote:
      "The curated categories saved us so much time. We loved knowing the listings were reviewed before we reached out.",
    name: "Samira & Imran",
    location: "Sylhet",
    date: "February 2026",
  },
]

export default function TestimonialsSection() {
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
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-wedplan-brown uppercase">
            Stories From Happy Couples
          </p>
          <h2 className="mt-4 font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Kind words from celebrations we helped shape
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.figure
              key={item.name}
              {...reveal(index * 0.05)}
              className="flex h-full flex-col rounded-2xl border border-wedplan-sage/50 bg-card p-7 shadow-sm"
            >
              <Quote
                size={22}
                className="text-wedplan-sage"
                aria-hidden="true"
              />
              <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground/85">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.location} · {item.date}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
