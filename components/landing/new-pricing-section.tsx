/*
Pricing section for the landing page showing the same plans as the pricing page.
It redirects unauthenticated users to sign up before reaching Stripe checkout.
*/

"use client"

import Section from "@/components/section"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

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

export default function NewPricingSection({ userId }: NewPricingSectionProps) {
  return (
    <Section
      title="Pricing"
      subtitle="Choose the plan that's right for you"
      id="pricing"
    >
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        <PricingCard
          title="Single Pitch"
          price="1 Credit"
          description="Purchase a single pitch credit"
          buttonText="Buy Now"
          buttonLink={
            process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SINGLEPITCH || "#"
          }
          features={FEATURES}
          userId={userId}
          popular={false}
        />
        <PricingCard
          title="Pitch Pack"
          price="5 Credits"
          description="Bundle of five pitch credits"
          buttonText="Buy Pack"
          buttonLink={
            process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PITCHPACK || "#"
          }
          features={FEATURES}
          userId={userId}
          popular={true}
        />
        <PricingCard
          title="Pro Bundle"
          price="15 Credits"
          description="Best value for power users"
          buttonText="Buy Bundle"
          buttonLink={
            process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PROBUNDLE || "#"
          }
          features={FEATURES}
          userId={userId}
          popular={false}
        />
      </div>
    </Section>
  )
}

interface PricingCardProps {
  title: string
  price: string
  description: string
  buttonText: string
  buttonLink: string
  features: string[]
  userId: string | null
  popular: boolean
}

function PricingCard({
  title,
  price,
  description,
  buttonText,
  buttonLink,
  features,
  userId,
  popular
}: PricingCardProps) {
  const finalButtonLink = userId
    ? `${buttonLink}?client_reference_id=${userId}`
    : `/signup?redirect_url=${encodeURIComponent(
        `/checkout?payment_link=${encodeURIComponent(buttonLink)}`
      )}`

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col",
        popular && "border-primary shadow-lg"
      )}
    >
      {popular && (
        <div className="bg-primary text-primary-foreground absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-medium">
          Most Popular
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grow">
        <div className="mb-6 flex items-baseline justify-center gap-x-2">
          <span className="text-5xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-x-2">
              <Check className="text-primary size-4" />
              <span className="text-muted-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={cn(
            "w-full",
            popular && "bg-primary text-primary-foreground hover:bg-primary/90"
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
            {buttonText}
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
