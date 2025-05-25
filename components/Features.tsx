import {
  Shield,
  Settings2,
  Sparkles,
  Target,
  FileText,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

interface Feature {
  title: string
  description: string
  icon: React.ElementType
}

const features: Feature[] = [
  {
    icon: Target,
    title: "APS Framework Alignment",
    description:
      "Systematically considers every possible scenario to perfectly align your experience with APS frameworks—including ILS, WLS, and selection criteria."
  },
  {
    icon: Zap,
    title: "Selection Criteria Optimization",
    description:
      "Intelligently adapts your experience to address selection criteria, explicitly highlighting your suitability and reducing risk of automatic rejection."
  },
  {
    icon: FileText,
    title: "Structured STAR Responses",
    description:
      "Automatically organises your experience into persuasive STAR method narratives (Situation, Task, Action, Result) that APS recruiters expect."
  },
  {
    icon: Sparkles,
    title: "Professional APS Tone",
    description:
      "Uses human sounding, formal, targeted language designed specifically to resonate with APS recruiters, enhancing readability and credibility."
  },
  {
    icon: Shield,
    title: "Secure & Confidential",
    description:
      "Employs rigorous encryption and stringent privacy measures, ensuring your personal data remains confidential and secure at all times."
  },
  {
    icon: Settings2,
    title: "AI-Powered Optimization",
    description:
      "Advanced AI technology analyzes and optimizes your content for maximum impact, ensuring every word contributes to your success."
  }
]

export default function Features() {
  return (
    <section className="bg-[#F9FAFB] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="rounded-[0.75rem] bg-white p-8"
                  style={{ boxShadow: "0 4px 24px rgba(17,24,39,.08)" }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(0,87,183,.1)" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: "#0057B7" }} />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-[#4B5563]">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
