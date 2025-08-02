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
    <div className="p-6 flex items-center justify-center min-h-[500px]">
      <div className="max-w-2xl w-full">
        {/* Introduction card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
          {/* Rocket Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="flex items-center justify-center size-16 rounded-full"
              style={{ backgroundColor: "#444ec1" }}
            >
              <Rocket className="size-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Let's Start Building Your Pitch
          </h2>
          
          {/* Body text */}
          <div className="space-y-6 text-left mb-8">
            <p className="text-gray-700 text-base leading-relaxed">
              We hope the AI suggestions helped you recall some impactful experiences to use in your pitch. These suggestions are simply to spark ideas —you're free to choose any examples that best highlight your strengths.
            </p>
            
            <p className="text-gray-700 text-base leading-relaxed">
              Next, you'll answer a few simple questions about each experience you choose to include. Your answers will help us create a professional pitch that reflects your unique journey and abilities.
            </p>
          </div>

          {/* Tips section */}
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: "#F8FAFC" }}>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="flex items-center justify-center size-6 rounded-full"
                style={{ backgroundColor: "#444ec1" }}
              >
                <Lightbulb className="size-4 text-white" />
              </div>
              <h3 className="text-base font-semibold" style={{ color: "#444ec1" }}>
                Important Tips:
              </h3>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: "#444ec1" }}></div>
                <p className="text-base" style={{ color: "#444ec1" }}>
                  Write about your experiences as if you're telling a friend. Don't worry about making it sound formal—we'll polish the wording for you.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: "#444ec1" }}></div>
                <p className="text-base" style={{ color: "#444ec1" }}>
                  In the next section, you'll see labels like "First Example" and "Second Example." These are just there to help you keep track. You can choose any experiences, in any order.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: "#444ec1" }}></div>
                <p className="text-base" style={{ color: "#444ec1" }}>
                  Need a break? Click Save and Close. You can come back and finish later, anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <p className="text-gray-600 text-base">
            When you're ready, click <span className="font-semibold" style={{ color: "#444ec1" }}>Next</span> to begin.
          </p>
        </div>
      </div>
    </div>
  )
} 