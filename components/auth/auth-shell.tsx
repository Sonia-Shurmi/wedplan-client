import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AuthShellProps {
  image: string
  imageAlt?: string
  quote: string
  title: string
  description: string
  children: React.ReactNode
}

/**
 * Split-screen frame shared by `/sign-in` and `/sign-up`. The artwork panel is
 * decorative and hidden on small screens so the form keeps the full width.
 */
export function AuthShell({
  image,
  imageAlt = "",
  quote,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-wedplan-dark lg:block">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="52vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wedplan-dark via-wedplan-dark/70 to-wedplan-dark/10" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white xl:p-16">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-heading text-3xl font-bold">
              WedPlan<span className="text-wedplan-sage">.</span>
            </span>
            <span className="mt-2 text-[10px] font-medium tracking-[0.3em] text-white/60 uppercase">
              Wedding marketplace
            </span>
          </Link>

          <div className="max-w-md">
            <p className="font-heading text-3xl leading-snug xl:text-4xl">
              &ldquo;{quote}&rdquo;
            </p>
            <p className="mt-6 text-sm leading-7 text-white/60">
              Trusted venues, photographers, florists and stylists — reviewed
              by couples who have been exactly where you are.
            </p>
          </div>

          <p className="text-xs tracking-wide text-white/40">
            © {new Date().getFullYear()} WedPlan. Every detail, thoughtfully
            planned.
          </p>
        </div>
      </aside>

      <main className="flex min-h-svh flex-col">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/"
            className="font-heading text-2xl font-bold text-wedplan-primary lg:hidden"
          >
            WedPlan<span className="text-wedplan-brown">.</span>
          </Link>

          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center px-6 pb-16 sm:px-10 lg:items-center">
          <div className="w-full max-w-md">
            <header className="mb-8">
              <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </header>

            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
