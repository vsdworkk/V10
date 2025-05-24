/*
This client component renders pricing plans with a billing toggle.
*/
"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Plan {
  name: string
  price: string
  features: string[]
  href: string
}

const plans: Plan[] = [
  {
    name: "Single Pitch",
    price: "$6.99",
    features: ["One APS pitch", "STAR formatted", "Selection criteria alignment"],
    href: "#"
  },
  {
    name: "Pitch Pack",
    price: "$12.99",
    features: ["Five APS pitches", "Edit & save", "Priority support"],
    href: "#"
  },
  {
    name: "Pro Bundle",
    price: "$19.99",
    features: ["Fifteen APS pitches", "Edit & save", "Priority support"],
    href: "#"
  }
]

export default function Pricing() {
  const [billing, setBilling] = useState("pitch")

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[960px] px-6">
        <div className="mb-10 text-center">
          <RadioGroup
            value={billing}
            onValueChange={setBilling}
            className="inline-flex items-center gap-6"
          >
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="pitch" id="pitch" />
              Pay per pitch
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <RadioGroupItem value="sub" id="sub" disabled />
              Subscription (coming soon)
            </label>
          </RadioGroup>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map(plan => (
            <Card
              key={plan.name}
              className="flex flex-col rounded-[var(--radius)] border-2 border-transparent p-10 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)]"
            >
              <CardContent className="flex grow flex-col p-0">
                <h3 className="mb-4 text-xl font-bold">{plan.name}</h3>
                <div className="mb-6 text-4xl font-extrabold">
                  {plan.price}
                  <span className="ml-2 text-base font-semibold text-gray-600">/pitch</span>
                </div>
                <ul className="mb-6 flex-1 space-y-2 text-sm">
                  {plan.features.map(f => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" role="button" asChild>
                  <Link href={plan.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
