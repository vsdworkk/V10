import { motion } from "framer-motion"

const steps = [
  {
    title: "Share Your Experience",
    description:
      "Answer straightforward questions about the role you're targeting and your experience."
  },
  {
    title: "Let Our AI Do the Work",
    description:
      "Our intelligent workflow instantly creates a polished pitch—precisely aligned with APS selection criteria, APS values, and structured in the STAR format."
  },
  {
    title: "Download & Submit with Confidence",
    description:
      "Instantly download your professionally tailored APS pitch, fully prepared and ready to submit—no further edits necessary."
  }
]

export default function HowItWorks() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative">
          <svg
            aria-hidden
            className="absolute left-0 right-0 top-5 hidden h-px w-full md:block"
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </svg>
          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: "#0057B7" }}
                >
                  {index + 1}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-[#4B5563]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
