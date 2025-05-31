/*
Pricing section for the landing page showing the same plans as the pricing page.
It redirects unauthenticated users to sign up before reaching Stripe checkout.
*/

"use client"

import Section from "@/components/section"
import { Button } from "@/components/ui/button"
import useWindowSize from "@/lib/hooks/use-window-size"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { FaStar } from "react-icons/fa"

interface NewPricingSectionProps {
  userId: string | null
}

const FEATURES = [
  "All core features",
  "Priority support",
  "Advanced analytics",
  "Custom integrations",
  "API access",
  "Team collaboration"
]

const PRICING_PLANS = [
  {
    name: "Single Pitch",
    price: "$6.99",
    description: "Purchase a single pitch credit",
    buttonText: "Buy Now",
    href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SINGLEPITCH || "#",
    features: FEATURES,
    isPopular: false,
    credits: "1 credit = 1 pitch",
  },
  {
    name: "Pitch Pack",
    price: "$16.99",
    description: "Bundle of five pitch credits",
    buttonText: "Buy Pack",
    href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PITCHPACK || "#",
    features: FEATURES,
    isPopular: true,
    credits: "5 credits = 5 pitches",
  },
  {
    name: "Pro Bundle",
    price: "$25.99",
    description: "Best value for power users",
    buttonText: "Buy Bundle",
    href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PROBUNDLE || "#",
    features: FEATURES,
    isPopular: false,
    credits: "15 credits = 15 pitches",
  },
]

export default function NewPricingSection({ userId }: NewPricingSectionProps) {
  const { isDesktop } = useWindowSize()

  return (
    <Section
      title="Pricing"
      subtitle="Pay-Per-Use"
      id="pricing"
      className="py-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 sm:2 gap-4 mt-8">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: 0,
                    opacity: 1,
                    x:
                      index === PRICING_PLANS.length - 1
                        ? -30
                        : index === 0
                        ? 30
                        : 0,
                    scale:
                      index === 0 || index === PRICING_PLANS.length - 1
                        ? 0.94
                        : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border-[1px] p-6 bg-background text-center lg:flex lg:flex-col lg:justify-center relative`,
              plan.isPopular ? "border-primary border-[2px]" : "border-border",
              index === 0 || index === PRICING_PLANS.length - 1
                ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                : "z-10",
              index === 0 && "origin-right",
              index === PRICING_PLANS.length - 1 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <FaStar className="text-white" />
                <span className="text-white ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-muted-foreground">
                {plan.name}
              </p>
              <p className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
              </p>

              <p className="text-xs leading-5 text-muted-foreground">
                {plan.credits}
              </p>

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4" />

              <PricingButton 
                plan={plan}
                userId={userId}
              />
              
              <p className="mt-6 text-xs leading-5 text-muted-foreground">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

interface PricingButtonProps {
  plan: typeof PRICING_PLANS[0]
  userId: string | null
}

function PricingButton({ plan, userId }: PricingButtonProps) {
  const finalButtonLink = userId
    ? `${plan.href}?client_reference_id=${userId}`
    : `/signup?redirect_url=${encodeURIComponent(
        `/checkout?payment_link=${encodeURIComponent(plan.href)}`
      )}`

  return (
    <Button
      className={cn(
        "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
        "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-white",
        plan.isPopular
          ? "bg-primary text-white"
          : "bg-white text-black border border-border"
      )}
      asChild
    >
      <a
        href={finalButtonLink}
        className={cn(
          "inline-flex items-center justify-center",
          finalButtonLink === "#" && "pointer-events-none opacity-50"
        )}
      >
        {plan.buttonText}
      </a>
    </Button>
  )
}
