"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About Us", href: "#why-wedplan" },
]

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-wedplan-sage/40 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="font-heading text-3xl font-bold tracking-tight text-wedplan-primary">
            WedPlan
          </span>
          <span className="mt-1 text-xs text-wedplan-brown">✦</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-wedplan-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        
        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
        <Button variant="ghost">
            <Link href="/sign-in">Sign In</Link>
        </Button>

        <Button className="bg-wedplan-primary px-6 text-white hover:bg-wedplan-dark">
            <Link href="/sign-up">Get Started</Link>
        </Button>
        </div>


        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-md p-2 text-wedplan-primary transition-colors hover:bg-wedplan-sage/30 md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="border-t border-wedplan-sage/40 bg-background px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-wedplan-primary"
              >
                {link.label}
              </Link>
            ))}

            
        <div className="flex flex-col gap-3 border-t border-wedplan-sage/40 pt-4">
        <Button variant="outline">
            <Link href="/sign-in" onClick={closeMenu}>
            Sign In
            </Link>
        </Button>

        <Button className="bg-wedplan-primary text-white hover:bg-wedplan-dark">
            <Link href="/sign-up" onClick={closeMenu}>
            Get Started
            </Link>
        </Button>
        </div>

          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
