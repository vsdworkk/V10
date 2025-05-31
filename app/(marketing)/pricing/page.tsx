/*
This server page displays pricing options for the product, integrating Stripe payment links.
*/

"use server"

import { auth } from "@clerk/nextjs/server"
import NewPricingSection from "@/components/landing/new-pricing-section"

export default async function PricingPage() {
  const { userId } = await auth()

  return (
    <div className="pb-20">
      <NewPricingSection userId={userId} />
      
      <p className="text-muted-foreground mt-8 text-center text-sm">
        All prices are in USD. Need a custom plan?{" "}
        <a href="/contact" className="font-medium underline underline-offset-4">
          Contact us
        </a>
      </p>
    </div>
  )
}
