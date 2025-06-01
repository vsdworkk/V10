"use client"

import FlickeringGrid from "@/components/magicui/flickering-grid"
import Ripple from "@/components/magicui/ripple"
import Safari from "@/components/safari"
import Section from "@/components/utilities/section"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const features = [
  {
    title: "Personal, Unique Pitches",
    description:
      "This isn't cookie-cutter AI output. Each pitch is tailored specifically to your experiences, achievements, and strengths, making every application distinctly yours.",
    className: "hover:bg-red-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Safari
          src={`/personal-pitches.png`}
          url="https://apsinterviewpro.com"
          className="-mb-32 mt-4 max-h-64 w-full select-none px-4 drop-shadow-[0_0_28px_rgba(0,0,0,.1)] transition-all duration-300 group-hover:translate-y-[-10px]"
        />
      </>
    )
  },
  {
    title: "Powerful AI Built for APS Pitch Writing",
    description:
      "Fine-tuned on over 1,000+ professional APS pitches, our custom-trained AI precisely understands APS-specific requirements, language, and expectations.",
    className:
      "order-3 xl:order-none hover:bg-blue-500/10 transition-all duration-500 ease-out",
    content: (
      <Safari
        src={`/power-pitches.png`}
        url="https://apsinterviewpro.com"
        className="-mb-32 mt-4 max-h-64 w-full select-none px-4 drop-shadow-[0_0_28px_rgba(0,0,0,.1)] transition-all duration-300 group-hover:translate-y-[-10px]"
      />
    )
  },
  {
    title: "Every APS Selection Criteria & Framework, Guaranteed",
    description:
      "Our intelligent system ensures you never miss an APS selection criterion and automatically aligns your pitch with all relevant APS frameworks, providing absolute confidence and compliance.",
    className:
      "md:row-span-2 hover:bg-purple-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <FlickeringGrid
          className="absolute inset-0 z-0 [mask:radial-gradient(circle_at_center,#fff_400px,transparent_0)]"
          squareSize={4}
          gridGap={6}
          color="#000"
          maxOpacity={0.1}
          flickerChance={0.1}
          height={800}
          width={800}
        />
        <Safari
          src={`/selection-criteria.png`}
          url="https://apsinterviewpro.com"
          className="-mb-48 ml-auto mr-0 mt-16 h-full select-none px-4 drop-shadow-[0_0_28px_rgba(0,0,0,.1)] transition-all duration-300 group-hover:translate-x-[10px]"
        />
      </>
    )
  },
  {
    title: "Effortless, Lightning-Fast Pitch Creation",
    description:
      "Stop spending days writing pitches. Our AI analyzes your resume against the job description, asks simple questions about your best experiences, and instantly creates a complete, professional pitch.",
    className:
      "order-4 xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Ripple className="absolute -bottom-full" />
        <Safari
          src={`/time-saver.png`}
          url="https://apsinterviewpro.com"
          className="-mb-32 mt-4 max-h-64 w-full select-none px-4 drop-shadow-[0_0_28px_rgba(0,0,0,.1)] transition-all duration-300 group-hover:translate-y-[-10px]"
        />
      </>
    )
  },
  {
    title: "Built for Every Level & Role",
    description:
      "From APS1 to EL1, across data, marketing, policy, and more. One intuitive platform effortlessly adapts to your unique role and classification.",
    className:
      "order-5 hover:bg-orange-500/10 transition-all duration-500 ease-out",
    content: (
      <Safari
        src={`/any-role.png`}
        url="https://apsinterviewpro.com"
        className="-mb-32 mt-10 max-h-64 w-full select-none px-4 drop-shadow-[0_0_28px_rgba(0,0,0,.1)] transition-all duration-300 group-hover:translate-y-[-10px]"
      />
    )
  }
]

export function SolutionSection() {
  return (
    <Section
      title="The Solution"
      subtitle="APSPitchPro Transforms Your Experience Into a Winning APS Pitch"
      description="Stop struggling with complex selection criteria. Our AI-powered platform turns your experience into interview-winning pitches that evaluators love to read."
      className="bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 items-stretch gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3 xl:grid-rows-2">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={cn(
              "group relative flex h-full flex-col items-start overflow-hidden rounded-2xl bg-neutral-50 p-6 dark:bg-neutral-800",
              feature.className
            )}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: index * 0.1
            }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-primary mb-2 font-semibold">
                {feature.title}
              </h3>
              <p className="text-foreground">{feature.description}</p>
            </div>
            {feature.content}
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900"></div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
