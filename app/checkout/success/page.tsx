/*
Redirect page used by Stripe's success_url. After a customer
completes payment they land here and are immediately sent to
the dashboard.
*/

import { redirect } from "next/navigation"

export default async function CheckoutSuccessPage() {
  redirect("/dashboard")
}
