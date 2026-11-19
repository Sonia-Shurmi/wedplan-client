/** Route-level fallback shown while a dashboard segment streams in. */
export default function DashboardLoading() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="space-y-3">
        <div className="h-3 w-36 animate-pulse rounded bg-muted" />
        <div className="h-10 w-2/3 max-w-md animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-border bg-card/60"
          />
        ))}
      </div>
    </div>
  )
}
