import Link from "next/link"
import { ArrowUpRight, Sparkles } from "lucide-react"

export default function PlanLimitNotice() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-wedplan-brown/30 bg-wedplan-brown/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-wedplan-brown" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            You have reached your free plan limit
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Free vendors can keep three listings. Upgrade to Premium to publish
            more services and be featured across WedPlan.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/vendor/subscription"
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-wedplan-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-wedplan-dark"
      >
        Explore Premium
        <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
