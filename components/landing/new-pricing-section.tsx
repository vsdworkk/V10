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
    credits: "1 credit = 1 pitch"
  },
  {
    name: "Pitch Pack",
    price: "$16.99",
    description: "Bundle of five pitch credits",
    buttonText: "Buy Pack",
    href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PITCHPACK || "#",
    features: FEATURES,
    isPopular: true,
    credits: "5 credits = 5 pitches"
  },
  {
    name: "Pro Bundle",
    price: "$25.99",
    description: "Best value for power users",
    buttonText: "Buy Bundle",
    href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PROBUNDLE || "#",
    features: FEATURES,
    isPopular: false,
    credits: "15 credits = 15 pitches"
  }
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
      <div className="sm:2 mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                        : 1.0
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
              opacity: { duration: 0.5 }
            }}
            className={cn(
              `bg-background relative rounded-2xl border-[1px] p-6 text-center lg:flex lg:flex-col lg:justify-center`,
              plan.isPopular ? "border-primary border-[2px]" : "border-border",
              index === 0 || index === PRICING_PLANS.length - 1
                ? "-translate-z-[50px] rotate-y-[10deg] z-0 translate-x-0 translate-y-0"
                : "z-10",
              index === 0 && "origin-right",
              index === PRICING_PLANS.length - 1 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="bg-primary absolute right-0 top-0 flex items-center rounded-bl-xl rounded-tr-xl px-2 py-0.5">
                <FaStar className="text-white" />
                <span className="ml-1 font-sans font-semibold text-white">
                  Popular
                </span>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-base font-semibold">
                {plan.name}
              </p>
              <p className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-foreground text-5xl font-bold tracking-tight">
                  {plan.price}
                </span>
              </p>

              <p className="text-muted-foreground text-xs leading-5">
                {plan.credits}
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className="text-primary mr-2 size-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="my-4 w-full" />

              <PricingButton plan={plan} userId={userId} />

              <p className="text-muted-foreground mt-6 text-xs leading-5">
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
  plan: (typeof PRICING_PLANS)[0]
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
        "hover:ring-primary hover:bg-primary transform-gpu ring-offset-current transition-all duration-300 ease-out hover:text-white hover:ring-2 hover:ring-offset-1",
        plan.isPopular
          ? "bg-primary text-white"
          : "border-border border bg-white text-black"
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
