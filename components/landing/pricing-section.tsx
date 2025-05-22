/*
This client component provides the pricing section for the landing page.
*/

"use client"

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
import { motion } from "framer-motion"

interface PricingCardProps {
  title: string
  price: string
  description: string
  buttonText: string
  buttonLink: string
  features: string[]
  userId: string | null
  popular: boolean
  index: number
}

const PricingCard = ({
  title,
  price,
  description,
  buttonText,
  buttonLink,
  features,
  userId,
  popular,
  index
}: PricingCardProps) => {
  const finalButtonLink = userId
    ? `${buttonLink}?client_reference_id=${userId}`
    : buttonLink

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
    >
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
            {features.map((feature, i) => (
              <motion.li 
                key={i} 
                className="flex items-center gap-x-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) + (i * 0.05), ease: "easeOut" }}
              >
                <Check className="text-primary size-4" />
                <span className="text-muted-foreground text-sm">{feature}</span>
              </motion.li>
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
    </motion.div>
  )
}

export const PricingSection = ({ userId }: { userId: string | null }) => {
  const features = [
    "All core features",
    "Priority support",
    "Advanced analytics",
    "Custom integrations",
    "API access",
    "Team collaboration"
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-64 h-64 rounded-full bg-[#7FE7E7]/20 blur-3xl"></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-32 right-10 w-6 h-6 rounded border-2 border-gray-200 rotate-45"></div>
        <div className="absolute bottom-40 left-20 w-4 h-16 bg-[#7FE7E7]/20 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-black/10 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-black text-white text-sm rounded-full font-medium">
              Pricing
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that best fits your needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <PricingCard
            title="Monthly Plan"
            price="$10"
            description="Perfect for individuals and small teams"
            buttonText="Subscribe Monthly"
            buttonLink={
              process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY || "#"
            }
            features={features}
            userId={userId}
            popular={false}
            index={0}
          />
          <PricingCard
            title="Yearly Plan"
            price="$100"
            description="Save 17% with annual billing"
            buttonText="Subscribe Yearly"
            buttonLink={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY || "#"}
            features={features}
            userId={userId}
            popular={true}
            index={1}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          className="text-muted-foreground mt-8 text-center text-sm"
        >
          All prices are in USD. Need a custom plan?{" "}
          <a href="/contact" className="font-medium underline underline-offset-4">
            Contact us
          </a>
        </motion.p>
      </div>
    </section>
  )
} 