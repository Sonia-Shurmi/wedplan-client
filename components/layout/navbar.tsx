"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { roleLabel } from "@/lib/constants"
import { signOut } from "@/lib/sign-out"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
]

const initialsOf = (name?: string | null) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "WP"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  const closeAll = () => {
    setIsMenuOpen(false)
    setIsAccountOpen(false)
  }

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!isAccountOpen) {
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isAccountOpen])

  // Every navigation link below calls `closeAll`, so the panels collapse on
  // route change without an effect that would trigger cascading renders.

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
      closeAll()
      toast.success("You have been signed out.")
      router.replace("/")
      router.refresh()
    } catch {
      toast.error("We could not sign you out. Please try again.")
    } finally {
      setIsSigningOut(false)
    }
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const accountLinks = (
    <>
      <Link
        href="/dashboard"
        onClick={closeAll}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
      >
        <LayoutDashboard size={16} />
        Dashboard
      </Link>

      {user?.role === "customer" ? (
        <Link
          href="/dashboard/customer/bookings"
          onClick={closeAll}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
        >
          <CalendarCheck size={16} />
          My bookings
        </Link>
      ) : null}

      <Link
        href="/dashboard/profile"
        onClick={closeAll}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
      >
        <Settings size={16} />
        Profile Settings
      </Link>

      <div className="my-1 h-px bg-border" />

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
      >
        <LogOut size={16} />
        {isSigningOut ? "Signing out…" : "Logout"}
      </button>
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-wedplan-sage/40 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" onClick={closeAll} className="flex flex-col leading-none">
          <span className="flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold tracking-tight text-wedplan-primary sm:text-3xl">
              WedPlan
            </span>
            <span className="text-xs text-wedplan-brown">✦</span>
          </span>
          <span className="mt-1 hidden text-[9px] font-medium tracking-[0.28em] text-wedplan-muted uppercase sm:block">
            Wedding Marketplace
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-wedplan-primary",
                isActive(link.href)
                  ? "text-wedplan-primary after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-wedplan-primary"
                  : "text-foreground/70",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="size-9 animate-pulse rounded-full bg-wedplan-sage/50" />
          ) : user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setIsAccountOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                className="flex items-center gap-2 rounded-full border border-wedplan-sage/60 py-1 pr-3 pl-1 transition-colors hover:border-wedplan-muted hover:bg-muted/60"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-wedplan-primary text-xs font-semibold text-white">
                    {initialsOf(user.name)}
                  </span>
                )}
                <span className="max-w-28 truncate text-sm font-medium text-foreground/80">
                  {user.name}
                </span>
                <ChevronDown
                  size={15}
                  className={cn(
                    "text-muted-foreground transition-transform",
                    isAccountOpen && "rotate-180",
                  )}
                />
              </button>

              {isAccountOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 mt-3 w-64 rounded-xl border border-border bg-popover p-2 shadow-xl"
                >
                  <div className="border-b border-border px-3 pt-2 pb-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-wedplan-sage/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-wedplan-primary uppercase">
                      {roleLabel(user.role)}
                    </span>
                  </div>
                  {accountLinks}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-wedplan-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-md p-2 text-wedplan-primary transition-colors hover:bg-wedplan-sage/30 md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile panel */}
      {isMenuOpen && (
        <div className="border-t border-wedplan-sage/40 bg-background px-6 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeAll}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                  isActive(link.href)
                    ? "bg-muted text-wedplan-primary"
                    : "text-foreground/80",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-wedplan-sage/40 pt-4">
            {isPending ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-wedplan-sage/40" />
            ) : user ? (
              <div className="flex flex-col gap-1">
                <div className="mb-2 flex items-center gap-3 px-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-wedplan-primary text-sm font-semibold text-white">
                      {initialsOf(user.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                {accountLinks}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/sign-in"
                  onClick={closeAll}
                  className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeAll}
                  className="rounded-lg bg-wedplan-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
