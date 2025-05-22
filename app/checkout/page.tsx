"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function CheckoutRedirect({ searchParams }: { searchParams: { payment_link?: string } }) {
  const paymentLink = searchParams.payment_link
  if (!paymentLink) {
    redirect("/")
  }

  const { userId } = await auth()
  const url = userId
    ? `${paymentLink}?client_reference_id=${userId}`
    : paymentLink
  redirect(url)
}
