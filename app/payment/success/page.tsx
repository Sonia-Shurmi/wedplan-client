import type { Metadata } from "next"

import { PaymentSuccess } from "@/components/payment/payment-success"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Confirming your subscription",
}

export default async function PaymentSuccessPage() {
  await requireSession("/payment/success")

  return <PaymentSuccess />
}
