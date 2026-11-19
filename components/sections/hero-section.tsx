"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ArrowRight, Heart, Store } from "lucide-react"
import { useRef } from "react"


const HeroSection = () => {
  const heroRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <section
  ref={heroRef}
  className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden bg-wedplan-dark text-white"
> {/* Background image */}
      <motion.div
        style={reduceMotion ? undefined : { y: backgroundY, scale: 1.15 }}
        className="absolute inset-0"
      >
  <Image
    src="/images/wedding.jpg"
    alt=""
    fill
    priority
    sizes="100vw"
    className="object-cover object-center"
  />
</motion.div>

      {/* Image overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-wedplan-dark/65 via-wedplan-dark/55 to-wedplan-dark/75" />

      {/* Hero content */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 80, scale: 0.96 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center"
      >
        {/* Eyebrow */}
        <div className="mb-7 flex items-center gap-3">
          <span className="h-px w-9 bg-wedplan-sage" />
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-wedplan-sage sm:text-sm">
            Your Dream Day Starts Here
          </p>
          <span className="h-px w-9 bg-wedplan-sage" />
        </div>

        {/* Decorative icon */}
        <Heart
          size={25}
          strokeWidth={1.2}
          className="mb-5 text-wedplan-sage"
        />

        {/* Main heading */}
        <h1 className="max-w-4xl font-heading text-5xl leading-[1.12] font-medium tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Where Your
          <br />
          <span className="font-normal italic text-wedplan-sage">
            Forever
          </span>{" "}
          Begins.
        </h1>

        {/* Description */}
        <p className="mt-7 max-w-2xl text-sm leading-7 text-white/85 sm:text-base md:text-lg">
          Discover trusted wedding professionals, plan every detail,
          and create unforgettable memories with WedPlan.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link
            href="/services"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-md bg-wedplan-primary px-8 py-4 text-sm font-semibold text-white shadow-lg transition duration-300 hover:bg-wedplan-dark sm:w-auto"
          >
            Explore Services
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/sign-up?role=vendor"
            className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-white/75 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:bg-white hover:text-wedplan-dark sm:w-auto"
          >
            Become a Vendor
            <Store size={17} />
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "6+", label: "Curated Categories" },
            { value: "100%", label: "Vetted Listings" },
            { value: "Direct", label: "Booking Tracking" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm"
            >
              <p className="font-heading text-2xl font-semibold text-wedplan-sage">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-medium tracking-wide text-white/80 uppercase">
                {item.label}
              </p>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20">
              <Image
                src="/images/wedding.jpg"
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Verified Wedding Pros
              </p>
              <p className="text-xs leading-snug text-white/70">
                Reviewed before going live
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-14 flex flex-col items-center gap-3">
          <span className="h-10 w-px bg-gradient-to-b from-wedplan-sage to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">
            Discover Your Possibilities
          </span>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
