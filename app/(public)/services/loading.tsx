/** Route-level skeleton for the browse page and its child routes. */
export default function ServicesLoading() {
  return (
    <div
      className="bg-wedplan-dark/95 pb-16"
      aria-busy="true"
      aria-label="Loading wedding services"
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 lg:px-8">
        <div className="space-y-4">
          <div className="h-3 w-44 animate-pulse rounded bg-white/20" />
          <div className="h-10 w-2/3 max-w-lg animate-pulse rounded bg-white/20" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-white/10" />
        </div>

        <div className="mt-10 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg bg-white/15"
            />
          ))}
        </div>

        <div className="mt-6 h-4 w-56 animate-pulse rounded bg-wedplan-sage/25" />

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-wedplan-sage/40 bg-card"
            >
              <div className="aspect-[4/3] animate-pulse bg-wedplan-sage/30" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
