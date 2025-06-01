/*
Problem section component highlighting the key challenges users face when applying for APS positions.
*/

"use server"

import BlurFade from "@/components/ui/blur-fade"
import Section from "@/components/utilities/section"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, FileX, Target } from "lucide-react"
import { ProblemItem } from "@/types"

const problems: ProblemItem[] = [
  {
    title: "Complex APS Requirements",
    description:
      "Navigating required APS frameworks like ILS, WLS, STAR feels overwhelming, and often requires weeks/months of practice.",
    icon: Target
  },
  {
    title: "Time-Intensive Writing Process",
    description:
      "Crafting responses for multiple selection criteria often takes hours, if not days, leading to rushed, last-minute submissions and overlooked opportunities.",
    icon: Clock
  },
  {
    title: "Critical Components Often Missed",
    description:
      "Without specialist knowledge, it's easy to overlook key details and selection criteria, reducing your chances of making the shortlist.",
    icon: FileX
  }
]

export async function ProblemSection() {
  return (
    <Section
      title="The Challenge"
      subtitle="Writing APS Pitches Shouldn't Be This Hard"
      description="Each year, thousands of qualified candidates struggle with the complexities of writing an APS Pitch, also known as the statement of claims."
    >
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background h-full border-none shadow-none">
              <CardContent className="space-y-4 p-6">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                  <problem.icon className="text-primary size-6" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  )
}
