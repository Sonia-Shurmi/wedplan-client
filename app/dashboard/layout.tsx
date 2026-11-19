import type { Metadata } from "next"

import DashboardShell from "@/components/dashboard/dashboard-shell"
import { isUserRole } from "@/lib/constants"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Server-side gate: role and blocked state come from the database, not from
  // the optimistic cookie check in `proxy.ts`. The shell receives only the
  // fields it needs so every link is generated from the verified role.
  const session = await requireSession()
  const user = session.user

  return (
    <DashboardShell
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? null,
        role: isUserRole(user.role) ? user.role : "customer",
        subscriptionPlan: user.subscriptionPlan ?? "free",
      }}
    >
      {children}
    </DashboardShell>
  )
}
