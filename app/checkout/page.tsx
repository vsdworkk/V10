import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function CheckoutRedirect({
  searchParams
}: {
  searchParams: Promise<{ payment_link?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const paymentLink = resolvedSearchParams.payment_link

  if (!paymentLink) {
    redirect("/")
  }

  const { userId } = await auth()
  const url = userId
    ? `${paymentLink}?client_reference_id=${userId}`
    : paymentLink
  redirect(url)
}
