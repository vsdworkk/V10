/*
This client component provides the steps section for the landing page.
*/

"use client"

import { motion } from "framer-motion"
import { FileText, Sparkles, Download } from "lucide-react"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ReactNode } from 'react'

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
            aria-hidden
            className="bg-radial to-background absolute inset-0 from-transparent to-75%"
        />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)

export const StepsSection = () => {
  const steps = [
    {
      number: 1,
      icon: <FileText className="size-6" />,
      title: "Share Your Experience",
      description: "Answer straightforward questions about the role you're targeting and your experience."
    },
    {
      number: 2,
      icon: <Sparkles className="size-6" />,
      title: "Let Our AI Do the Work",
      description: "Our intelligent workflow instantly creates a polished pitch—precisely aligned with APS selection criteria, APS values, and structured in the STAR format."
    },
    {
      number: 3,
      icon: <Download className="size-6" />,
      title: "Download & Submit with Confidence",
      description: "Instantly download your professionally tailored APS pitch, fully prepared and ready to submit—no further edits necessary."
    }
  ]

  return (
    <section className="bg-white py-16 md:py-32">
      <div className="@container mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl mb-4">
            Your Pitch in Three Easy Steps
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our streamlined process transforms your experience into a professional APS pitch in minutes.
          </p>
        </motion.div>
        
        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 + (index * 0.15), ease: "easeOut" }}
            >
              <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    {step.icon}
                  </CardDecorator>
                  
                  {/* Step number */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold text-sm mt-4 mx-auto">
                    {step.number}
                  </div>

                  <h3 className="mt-4 font-medium text-center">{step.title}</h3>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 text-center">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 