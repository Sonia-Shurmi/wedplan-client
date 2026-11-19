import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"

export interface OverviewStat {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

interface OverviewAction {
  label: string
  href: string
}

interface DashboardOverviewProps {
  eyebrow: string
  title: string
  description: string
  stats: OverviewStat[]
  actions?: OverviewAction[]
  note?: string
}

/**
 * Shared header and stat grid for the three role dashboards. The real metrics
 * arrive with the stats APIs; until then the cards explain what will live here.
 */
export function DashboardOverview({
  eyebrow,
  title,
  description,
  stats,
  actions,
  note,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-wedplan-muted uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex h-10 items-center gap-2 rounded-lg bg-wedplan-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
                    : "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                }
              >
                {action.label}
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <span className="flex size-9 items-center justify-center rounded-lg bg-wedplan-sage/30 text-wedplan-primary">
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-4 font-heading text-3xl text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {stat.hint}
              </p>
            </div>
          )
        })}
      </div>

      {note ? (
        <p className="rounded-xl border border-dashed border-wedplan-sage bg-wedplan-sage/10 px-4 py-3 text-sm leading-6 text-foreground/70">
          {note}
        </p>
      ) : null}
    </div>
  )
}
