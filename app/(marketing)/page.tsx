/*
This server page is the marketing homepage.
*/

"use server"

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
