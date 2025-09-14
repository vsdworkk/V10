"use client"

// Result step collects the final outcome and its benefits
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData, starExampleSchema } from "../wizard/schema"
import StarFieldComponent from "../utilities/star-field-component"

interface ResultStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

export default function ResultStep({ exampleIndex }: ResultStepProps) {
  const { watch } = useFormContext<PitchWizardFormData>()

  const benefitToTeam =
    watch(
      `starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`
    ) || ""

  return (
    <div className="px-2 py-1 sm:p-6">
      {/* Mobile-optimized scrollable container with proper bottom padding for mobile nav */}
      <div className="flex h-[calc(100vh-200px)] flex-col overflow-y-auto pb-20 sm:h-auto sm:pb-2">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
          {/* Mobile-optimized container with proper spacing */}
          <div className="w-full sm:px-8">
            {/* Card with responsive padding and mobile-optimized spacing */}
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:mb-8 sm:rounded-2xl sm:p-6">
              {/* Mobile-optimized "Result" heading */}
              <h2 className="mb-4 text-lg font-bold text-gray-800 sm:mb-5 sm:text-xl">
                Result
              </h2>

              {/* Field - Mobile optimized spacing */}
              <div className="mb-2">
                <StarFieldComponent
                  name={`starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`}
                  label="How did this outcome benefit your team, stakeholders, or organisation?"
                  placeholder="Describe how these results impacted your organization or project..."
                  schema={
                    starExampleSchema.shape.result.shape[
                      "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
                    ]
                  }
                  text={benefitToTeam}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
