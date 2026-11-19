import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  Camera,
  Flower2,
  Shirt,
  Sparkles,
  Utensils,
} from "lucide-react"

import { CATEGORIES } from "@/lib/constants"

const categoryIcons = [
  Camera,
  Building2,
  Flower2,
  Utensils,
  Sparkles,
  Shirt,
] as const

export default function CategoriesSection() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const Icon = categoryIcons[index] ?? Sparkles

            return (
              <Link
                key={category.slug}
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-2xl border border-wedplan-sage/60 bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-wedplan-muted/70 hover:shadow-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-wedplan-sage/30 text-wedplan-primary transition-colors group-hover:bg-wedplan-primary group-hover:text-white">
                  <Icon size={21} strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 font-heading text-xl text-foreground">
                  {category.name}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-wedplan-primary">
                  Explore category
                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
