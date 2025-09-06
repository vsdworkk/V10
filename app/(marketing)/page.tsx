/*
This server page is the marketing homepage.
*/

import { auth } from "@clerk/nextjs/server"
import { HeroSection } from "@/components/landing/hero"
import { LogoBeltSection } from "@/components/landing/logo-belt"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { StepsSection } from "@/components/landing/steps-section"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import NewPricingSection from "@/components/landing/new-pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import BlogSection from "@/components/landing/blog-section"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "APSPitchPro: AI APS Pitch Writer | Australian Public Service Jobs",
  description:
    "Stop struggling with APS selection criteria. Our AI creates personalised, compliant job pitches in minutes. Covers APS1-EL1 levels with guaranteed framework alignment and STAR structure."
}

export default async function HomePage() {
  const { userId } = await auth()

  return (
    <div className="pb-20">
      <HeroSection />
      <LogoBeltSection />
      <ProblemSection />
      <SolutionSection />
      <StepsSection />
      <SocialProofSection />
      <NewPricingSection userId={userId} />
      <FAQSection />
      <BlogSection />
    </div>
  )
}
