/*
This server page is the marketing homepage.
*/

"use server"

import { auth } from "@clerk/nextjs/server"
import { HeroSection } from "@/components/landing/hero"
import { LogoBeltSection } from "@/components/landing/logo-belt"
import { FeaturesSection } from "@/components/landing/features-section"
import { StepsSection } from "@/components/landing/steps-section"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"

export default async function HomePage() {
  const { userId } = await auth()
  
  return (
    <div className="pb-20">
      <HeroSection />
      <LogoBeltSection />
      <FeaturesSection />
      <StepsSection />
      <SocialProofSection />
      <PricingSection userId={userId} />
      <FAQSection />
    </div>
  )
}
