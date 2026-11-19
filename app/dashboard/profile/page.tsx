import type { Metadata } from "next"

import ProfileSettings from "@/components/profile/profile-settings"
import { isUserRole } from "@/lib/constants"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Profile settings",
}

export default async function ProfilePage() {
  const session = await requireSession("/dashboard/profile")
  const user = session.user

  return (
    <ProfileSettings
      initialProfile={{
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? null,
        role: isUserRole(user.role) ? user.role : null,
        businessName: user.businessName ?? null,
      }}
    />
  )
}
