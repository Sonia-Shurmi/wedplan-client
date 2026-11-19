"use client"

import type { LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

interface StatCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

const numericValue = (value: string): number | null => {
  const normalized = value.replace(/,/g, "")

  return /^\d+$/.test(normalized) ? Number(normalized) : null
}

/**
 * Stat card with a subtle entrance and a short count-up for numeric values.
 * The initial state matches the server render, so hydration stays stable.
 */
export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  const target = numericValue(value)
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    // With reduced motion (or a non-numeric value) the initial state already
    // shows the final value, so there is nothing to animate.
    if (target === null || reduceMotion) {
      return
    }

    let frame = 0
    const started = performance.now()
    const duration = 650

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)

      setDisplay(Math.round(target * eased))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [target, reduceMotion])

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-wedplan-sage/30 text-wedplan-primary">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-4 font-heading text-3xl text-foreground">
        {target === null || reduceMotion
          ? value
          : String(display ?? target)}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
    </motion.div>
  )
}
