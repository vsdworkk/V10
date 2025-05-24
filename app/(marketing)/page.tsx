/*
This server page is the marketing homepage.
*/

"use server"

import { auth } from "@clerk/nextjs/server"
import Hero from "@/components/Hero"
import Features from "@/components/features-3"
import { StepsSection } from "@/components/landing/steps-section"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import Pricing from "@/components/pricing"
import FAQsTwo from "@/components/faqs-2"

export default async function HomePage() {
  const { userId } = await auth()
  
  return (
    <div className="pb-20">
      <Hero />
      <Features />
      <StepsSection />
      <SocialProofSection />
      <Pricing />
      <FAQsTwo />
    </div>
  )
}
