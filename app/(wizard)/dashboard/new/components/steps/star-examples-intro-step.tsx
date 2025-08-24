/**
 * Informational step that introduces users to the STAR examples section.
 * This step requires no user input and explains what's coming next.
 */
"use client"

import { Rocket, Lightbulb } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "../wizard/schema"

export default function StarExamplesIntroStep() {
  const { watch } = useFormContext<PitchWizardFormData>()
  const starExamplesCount = watch("starExamplesCount") || "2"

  return (
    <div className="flex min-h-[500px] items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Introduction card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          {/* Rocket Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex size-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#444ec1" }}
            >
              <Rocket className="size-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-8 text-2xl font-semibold text-gray-900">
            Let's Start Building Your Pitch
          </h2>

          {/* Body text */}
          <div className="mb-8 space-y-6 text-left">
            <p className="text-base leading-relaxed text-gray-700">
              We hope the AI suggestions helped you recall some impactful
              experiences to use in your pitch. These suggestions are simply to
              spark ideas —you're free to choose any examples that best
              highlight your strengths.
            </p>

            <p className="text-base leading-relaxed text-gray-700">
              Next, you'll answer a few simple questions about each experience
              you choose to include. Your answers will help us create a
              professional pitch that reflects your unique journey and
              abilities.
            </p>
          </div>

          {/* Tips section */}
          <div
            className="mb-8 rounded-2xl p-6"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex size-6 items-center justify-center rounded-full"
                style={{ backgroundColor: "#444ec1" }}
              >
                <Lightbulb className="size-4 text-white" />
              </div>
              <h3
                className="text-base font-semibold"
                style={{ color: "#444ec1" }}
              >
                Important Tips:
              </h3>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div
                  className="mt-2 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#444ec1" }}
                ></div>
                <p className="text-base" style={{ color: "#444ec1" }}>
                  Write about your experiences as if you're telling a friend.
                  Don't worry about making it sound formal—we'll polish the
                  wording for you.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="mt-2 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#444ec1" }}
                ></div>
                <p className="text-base" style={{ color: "#444ec1" }}>
                  In the next section, you'll see labels like "First Example"
                  and "Second Example." These are just there to help you keep
                  track. You can choose any experiences, in any order.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="mt-2 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "#444ec1" }}
                ></div>
                <p className="text-base" style={{ color: "#444ec1" }}>
                  Need a break? Click Save and Close. You can come back and
                  finish later, anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <p className="text-base text-gray-600">
            When you're ready, click{" "}
            <span className="font-semibold" style={{ color: "#444ec1" }}>
              Next
            </span>{" "}
            to begin.
          </p>
        </div>
      </div>
    </div>
  )
}
