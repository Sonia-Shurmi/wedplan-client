
export default function Page() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Brand introduction */}
        <section className="space-y-4 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-wedplan-muted">
            Your Perfect Day Begins Here
          </p>

          <h1 className="font-heading text-5xl font-semibold text-wedplan-dark md:text-7xl">
            Every Love Story
            <br />
            Deserves a Beautiful Beginning.
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            Discover trusted wedding professionals and bring your dream
            celebration to life with WedPlan.
          </p>

          <button className="rounded-md bg-wedplan-primary px-8 py-3 text-sm font-medium text-white transition hover:bg-wedplan-dark">
            Explore Services
          </button>
        </section>

        {/* Color palette */}
        <section className="space-y-5">
          <h2 className="text-center font-heading text-3xl">
            Our Signature Palette
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { name: "Dark", color: "#161912" },
              { name: "Primary", color: "#444b39" },
              { name: "Muted", color: "#8f9780" },
              { name: "Brown", color: "#7a6341" },
              { name: "Sage", color: "#c5cbbf" },
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div
                  className="h-24 rounded-lg shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.color}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography preview */}
        <section className="rounded-xl border bg-card p-8 md:p-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-wedplan-muted">
            Typography Preview
          </p>

          <h2 className="font-heading text-4xl text-wedplan-primary">
            Moments Made
            <br />
            to Remember
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            Montserrat brings clarity and elegance to everyday content,
            while Playfair Display adds a timeless editorial touch to
            WedPlan headings.
          </p>
        </section>
      </div>
    </main>
  )
}
