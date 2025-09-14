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
    <div className="flex min-h-[calc(100vh-250px)] items-center justify-center px-3 py-4 sm:min-h-[500px] sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Introduction card - Mobile optimized */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm sm:rounded-2xl sm:p-8">
          {/* Rocket Icon - Responsive sizing */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <div
              className="flex size-12 items-center justify-center rounded-full sm:size-16"
              style={{ backgroundColor: "#444ec1" }}
            >
              <Rocket className="size-6 text-white sm:size-8" />
            </div>
          </div>

          {/* Title - Responsive typography */}
          <h2 className="mb-6 text-xl font-semibold leading-tight text-gray-900 sm:mb-8 sm:text-2xl">
            Let's Start Building Your Pitch
          </h2>

          {/* Body text - Mobile optimized spacing and typography */}
          <div className="mb-6 space-y-4 text-left sm:mb-8 sm:space-y-6">
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              We hope the AI suggestions helped you recall some impactful
              experiences to use in your pitch. These suggestions are simply to
              spark ideas —you're free to choose any examples that best
              highlight your strengths.
            </p>

            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              Next, you'll answer a few simple questions about each experience
              you choose to include. Your answers will help us create a
              professional pitch that reflects your unique journey and
              abilities.
            </p>
          </div>

          {/* Tips section - Mobile optimized */}
          <div
            className="mb-6 rounded-xl p-4 sm:mb-8 sm:rounded-2xl sm:p-6"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
              <div
                className="flex size-5 shrink-0 items-center justify-center rounded-full sm:size-6"
                style={{ backgroundColor: "#444ec1" }}
              >
                <Lightbulb className="size-3 text-white sm:size-4" />
              </div>
              <h3
                className="text-sm font-semibold sm:text-base"
                style={{ color: "#444ec1" }}
              >
                Important Tips:
              </h3>
            </div>

            <div className="space-y-3 text-left sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className="mt-1.5 size-1.5 shrink-0 rounded-full sm:mt-2 sm:size-2"
                  style={{ backgroundColor: "#444ec1" }}
                ></div>
                <p
                  className="text-xs leading-relaxed sm:text-base"
                  style={{ color: "#444ec1" }}
                >
                  Write about your experiences as if you're telling a friend.
                  Don't worry about making it sound formal—we'll polish the
                  wording for you.
                </p>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className="mt-1.5 size-1.5 shrink-0 rounded-full sm:mt-2 sm:size-2"
                  style={{ backgroundColor: "#444ec1" }}
                ></div>
                <p
                  className="text-xs leading-relaxed sm:text-base"
                  style={{ color: "#444ec1" }}
                >
                  In the next section, you'll see labels like "First Example"
                  and "Second Example." These are just there to help you keep
                  track. You can choose any experiences, in any order.
                </p>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className="mt-1.5 size-1.5 shrink-0 rounded-full sm:mt-2 sm:size-2"
                  style={{ backgroundColor: "#444ec1" }}
                ></div>
                <p
                  className="text-xs leading-relaxed sm:text-base"
                  style={{ color: "#444ec1" }}
                >
                  Need a break? Click Save and Close. You can come back and
                  finish later, anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action - Mobile optimized typography */}
          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
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
