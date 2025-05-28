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
    description: "Navigating ILS, WLS, STAR frameworks and selection criteria feels overwhelming, especially when you're unclear on what evaluators actually want to see.",
    icon: Target
  },
  {
    title: "Time-Consuming Process",
    description: "Crafting compelling responses for each criterion takes hours or days, often leading to rushed submissions and missed opportunities.",
    icon: Clock
  },
  {
    title: "Missing Key Elements",
    description: "Without APS experience, it's easy to miss critical components or fail to adequately address selection criteria, reducing your chances of being shortlisted.",
    icon: FileX
  }
]

export async function ProblemSection() {
  return (
    <Section
      title="The Challenge"
      subtitle="APS Applications Shouldn't Feel This Hard"
      description="Every year, thousands of qualified candidates struggle with the APS application process. You're not alone in feeling overwhelmed."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none h-full">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  )
} 