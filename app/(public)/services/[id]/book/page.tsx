import type { Metadata } from "next"

import { BookService } from "@/components/bookings/book-service"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Request a booking",
  description: "Send an enquiry to a wedding vendor on WedPlan.",
}

interface BookingPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params

  // The form is a customer action, so gate before rendering anything. Returning
  // here preserves the intended destination through the sign-in redirect.
  await requireSession(`/services/${id}/book`)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <BookService id={id} />
    </div>
  )
}
