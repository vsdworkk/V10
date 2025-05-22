/*
This client component provides the features section for the landing page.
*/

"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

// Feature item component for each point
const FeatureItem = ({ 
  title, 
  description, 
  index 
}: { 
  title: string; 
  description: string; 
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
      className="mb-10"
    >
      <div className="flex gap-4">
        <div className="mt-1 flex-shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
            <Check className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg md:text-xl mb-2">{title}</h3>
          <p className="text-gray-600 text-base leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

export const FeaturesSection = () => {
  // Features data
  const features = [
    {
      title: "Optimises APS Framework Alignment",
      description: "Systematically considers every possible scenario to perfectly align your experience with APS frameworks—including ILS, WLS, and selection criteria—ensuring maximum fit and impact."
    },
    {
      title: "Optimises Selection Criteria Alignment",
      description: "Intelligently adapts your experience to address the selection criteria, explicitly highlighting your suitability and significantly reducing risk of automatic rejection."
    },
    {
      title: "Structured STAR Responses",
      description: "Automatically organises your experience into persuasive STAR method narratives (Situation, Task, Action, Result) APS recruiters expect."
    },
    {
      title: "Professional APS Tone",
      description: "Uses human sounding, formal, targeted language designed specifically to resonate with APS recruiters, enhancing readability, credibility, and impact."
    },
    {
      title: "Secure and Confidential",
      description: "Employs rigorous encryption and stringent privacy measures, ensuring your personal data remains confidential and secure at all times."
    }
  ]

  return (
    <section className="bg-gray-50 py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 lg:gap-24">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full md:w-5/12 lg:w-2/5 md:sticky md:top-24 md:self-start"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              5X Your Chances of Landing an Interview
            </h2>
          </motion.div>
          
          {/* Right Column - Feature List */}
          <div className="w-full md:w-7/12 lg:w-3/5">
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 