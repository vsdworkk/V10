/*
This client component renders testimonials in a two column layout.
*/
"use client"

import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Testimonial {
  quote: string
  author: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "This platform transformed my APS application. The AI perfectly aligned my experience with selection criteria.",
    author: "Sarah Johnson",
    role: "Senior Policy Advisor"
  },
  {
    quote:
      "After months of rejections, I landed a role at Services Australia within weeks using these pitches.",
    author: "Michael Thompson",
    role: "Program Manager"
  },
  {
    quote:
      "The AI understood exactly how to present my private sector background for government roles.",
    author: "Jessica Lee",
    role: "Communications Officer"
  },
  {
    quote:
      "Finally, a tool that speaks APS language. The structured STAR responses were exactly what I needed.",
    author: "Robert Anderson",
    role: "Executive Officer"
  }
]

export default function Testimonials() {
  return (
    <section className="bg-[linear-gradient(180deg,#F9FAFB_0%,#FFFFFF_100%)] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-3xl font-semibold md:text-4xl">
          Trusted by APS Professionals Australia-wide
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map(t => (
            <Card
              key={t.author}
              className="relative rounded-[var(--radius)] bg-white p-7 shadow-[var(--shadow-card)]"
            >
              <Quote className="absolute right-4 top-4 size-8 text-[rgba(0,87,183,0.05)]" />
              <CardContent className="p-0">
                <p className="mb-6 text-gray-800">{`\"${t.quote}\"`}</p>
                <div>
                  <p className="font-medium">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
