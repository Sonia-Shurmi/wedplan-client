"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { CATEGORIES } from "@/lib/constants"

export default function CategoriesSection() {
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
        <motion.div
          {...reveal(0)}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-wedplan-brown uppercase">
              Explore By Specialty
            </p>
            <h2 className="mt-4 font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Everything your day needs
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Six considered categories, filled with vendors who care about the
              details as much as you do.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-wedplan-primary transition-colors hover:text-wedplan-dark"
          >
            View all services
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => (
            <motion.div key={category.slug} {...reveal(index * 0.04)}>
              <Link
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-2xl border border-wedplan-sage/60 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wedplan-dark/85 via-wedplan-dark/35 to-wedplan-dark/10" />
                <div className="relative z-10">
                  <h3 className="font-heading text-xl text-white">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-wedplan-sage">
                    Explore category
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
