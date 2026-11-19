"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import { toast } from "sonner"

import { signOut } from "@/lib/sign-out"
import { cn } from "@/lib/utils"

interface SignOutButtonProps {
  label?: string
  className?: string
}

export function SignOutButton({
  label = "Log out",
  className,
}: SignOutButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleSignOut = async () => {
    setIsPending(true)

    try {
      await signOut()
      toast.success("You have been signed out.")
      router.replace("/")
      router.refresh()
    } catch {
      toast.error("We could not sign you out. Please try again.")
      setIsPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      {isPending ? "Signing out…" : label}
    </button>
  )
}
