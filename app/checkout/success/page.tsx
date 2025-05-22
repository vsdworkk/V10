"use server"

import { redirect } from "next/navigation"

export default async function CheckoutSuccessPage() {
  redirect("/dashboard")
} 