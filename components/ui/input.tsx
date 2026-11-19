import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground shadow-xs transition outline-none",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-wedplan-muted focus-visible:ring-3 focus-visible:ring-wedplan-sage/50",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  )
}
