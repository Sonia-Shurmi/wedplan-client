"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BadgeDollarSign,
  CalendarCheck,
  ChevronDown,
  Compass,
  Crown,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { roleLabel, type UserRole } from "@/lib/constants"
import { signOut } from "@/lib/sign-out"
import { cn } from "@/lib/utils"

interface ShellUser {
  name: string
  email: string
  image: string | null
  role: UserRole
  /** Derived server-side from the plan and its expiry. */
  isPremium: boolean
}

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Overview links should not stay highlighted on their child pages. */
  exact?: boolean
}

/** Navigation is built from the role read from the database, never from a link list sent by the client. */
const navForRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case "customer":
      return [
        {
          label: "Overview",
          href: "/dashboard/customer",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "My bookings",
          href: "/dashboard/customer/bookings",
          icon: CalendarCheck,
        },
        { label: "Browse services", href: "/services", icon: Compass },
        {
          label: "Profile settings",
          href: "/dashboard/profile",
          icon: Settings,
        },
      ]
    case "vendor":
      return [
        {
          label: "Overview",
          href: "/dashboard/vendor",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Booking requests",
          href: "/dashboard/vendor/bookings",
          icon: CalendarCheck,
        },
        {
          label: "Add a service",
          href: "/dashboard/vendor/services/new",
          icon: PlusCircle,
        },
        {
          label: "Subscription",
          href: "/dashboard/vendor/subscription",
          icon: Crown,
        },
        { label: "Browse marketplace", href: "/services", icon: Compass },
        {
          label: "Profile settings",
          href: "/dashboard/profile",
          icon: Settings,
        },
      ]
    case "admin":
      return [
        {
          label: "Overview",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Users",
          href: "/dashboard/admin/users",
          icon: Users,
        },
        {
          label: "Service moderation",
          href: "/dashboard/admin/services",
          icon: ListChecks,
        },
        {
          label: "Transactions",
          href: "/dashboard/admin/transactions",
          icon: BadgeDollarSign,
        },
        { label: "Browse services", href: "/services", icon: Store },
        {
          label: "Profile settings",
          href: "/dashboard/profile",
          icon: Settings,
        },
      ]
  }
}

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  return parts.length === 0
    ? "WP"
    : parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
}

export function DashboardShell({
  user,
  children,
}: Readonly<{ user: ShellUser; children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const items = navForRole(user.role)

  // A panel only counts as open while the pathname that opened it is still
  // active. Navigation (including back/forward) therefore closes it without
  // an effect that would trigger a cascading render.
  const [sidebarPath, setSidebarPath] = useState<string | null>(null)
  const [accountPath, setAccountPath] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  const isSidebarOpen = sidebarPath === pathname
  const isAccountOpen = accountPath === pathname

  const closePanels = () => {
    setSidebarPath(null)
    setAccountPath(null)
  }

  useEffect(() => {
    if (!isAccountOpen && !isSidebarOpen) {
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (isAccountOpen && !accountRef.current?.contains(event.target as Node)) {
        setAccountPath(null)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarPath(null)
        setAccountPath(null)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isAccountOpen, isSidebarOpen])

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
      closePanels()
      toast.success("You have been signed out.")
      router.replace("/")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "We could not sign you out. Please try again.",
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  const sidebarContent = (
    <>
      <Link
        href="/"
        onClick={closePanels}
        className="flex flex-col px-2 leading-none"
      >
        <span className="flex items-baseline gap-1.5">
          <span className="font-heading text-2xl font-bold tracking-tight text-wedplan-primary">
            WedPlan
          </span>
          <span className="text-xs text-wedplan-brown">✦</span>
        </span>
        <span className="mt-1 text-[9px] font-medium tracking-[0.28em] text-wedplan-muted uppercase">
          Wedding Marketplace
        </span>
      </Link>

      <div className="mt-10 flex-1">
        <p className="px-2 text-[10px] font-semibold tracking-[0.2em] text-wedplan-muted uppercase">
          Workspace
        </p>
        <nav aria-label="Dashboard navigation" className="mt-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closePanels}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-wedplan-sage/40 text-wedplan-dark"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-wedplan-sage/40 pt-5">
        <div className="rounded-xl bg-wedplan-sage/20 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-wedplan-muted uppercase">
            Signed in as
          </p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {user.name || "WedPlan user"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {roleLabel(user.role)}
            </p>
            {user.role === "vendor" && user.isPremium ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-wedplan-primary/10 px-2 py-0.5 text-[10px] font-semibold text-wedplan-primary">
                <Crown size={11} />
                Premium
              </span>
            ) : null}
          </div>
        </div>
        <Link
          href="/"
          onClick={closePanels}
          className="mt-3 flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-wedplan-primary"
        >
          <Compass size={15} />
          Back to website
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-wedplan-sage/40 bg-background px-5 py-7 lg:flex">
        {sidebarContent}
      </aside>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closePanels}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
          />
          <aside
            id="dashboard-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-wedplan-sage/40 bg-background px-5 py-7 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close navigation"
              onClick={closePanels}
              className="absolute top-5 right-5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-wedplan-sage/40 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={isSidebarOpen}
                aria-controls="dashboard-sidebar"
                onClick={() => setSidebarPath(pathname)}
                className="rounded-md p-2 text-wedplan-primary transition-colors hover:bg-wedplan-sage/30 lg:hidden"
              >
                <Menu size={22} />
              </button>
              <span className="text-sm font-medium text-muted-foreground lg:hidden">
                Dashboard
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user.role === "vendor" && user.isPremium ? (
                <span className="hidden items-center gap-1.5 rounded-full bg-wedplan-sage/40 px-3 py-1 text-xs font-semibold text-wedplan-dark sm:inline-flex">
                  <Sparkles size={13} />
                  Premium
                </span>
              ) : null}

              {user.role === "admin" ? (
                <span className="hidden items-center gap-1.5 rounded-full bg-wedplan-sage/40 px-3 py-1 text-xs font-semibold text-wedplan-dark sm:inline-flex">
                  <ShieldCheck size={13} />
                  Admin
                </span>
              ) : null}

              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isAccountOpen}
                  onClick={() =>
                    setAccountPath((current) =>
                      current === pathname ? null : pathname,
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-wedplan-sage/60 py-1 pr-3 pl-1 transition-colors hover:border-wedplan-muted hover:bg-muted/60"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      width={30}
                      height={30}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-wedplan-primary text-xs font-semibold text-white">
                      {initialsOf(user.name)}
                    </span>
                  )}
                  <span className="hidden max-w-32 truncate text-sm font-medium text-foreground/80 sm:block">
                    {user.name || "Account"}
                  </span>
                  <ChevronDown
                    size={15}
                    className={cn(
                      "text-muted-foreground transition-transform",
                      isAccountOpen && "rotate-180",
                    )}
                  />
                </button>

                {isAccountOpen ? (
                  <div
                    role="menu"
                    className="absolute top-full right-0 mt-3 w-60 rounded-xl border border-border bg-popover p-2 shadow-xl"
                  >
                    <div className="border-b border-border px-3 pt-2 pb-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.name || "WedPlan user"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={closePanels}
                      role="menuitem"
                      className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={closePanels}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Settings size={16} />
                      Profile Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                    >
                      <LogOut size={16} />
                      {isSigningOut ? "Signing out…" : "Logout"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardShell
