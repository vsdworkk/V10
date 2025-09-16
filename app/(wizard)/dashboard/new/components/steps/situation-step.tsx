"use client"

// Collects information about the Situation portion of a STAR example
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData, starExampleSchema } from "../wizard/schema"
import StarFieldComponent from "../utilities/star-field-component"

interface SituationStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

export default function SituationStep({ exampleIndex }: SituationStepProps) {
  const { watch } = useFormContext<PitchWizardFormData>()

  const whereAndWhen =
    watch(
      `starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`
    ) || ""
  const situationOrChallenge =
    watch(
      `starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`
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
              {/* Mobile-optimized "Situation" heading */}
              <h2 className="mb-4 text-lg font-bold text-gray-800 sm:mb-5 sm:text-xl">
                Situation
              </h2>

              {/* Field 1: Where and when - Mobile optimized spacing */}
              <div className="mb-5 sm:mb-6">
                <StarFieldComponent
                  name={`starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`}
                  label="Context: Where and when did this happen?"
                  placeholder="E.g., At the Department of Finance in 2023, during the budget planning process..."
                  schema={
                    starExampleSchema.shape.situation.shape[
                      "where-and-when-did-this-experience-occur"
                    ]
                  }
                  text={whereAndWhen}
                />
              </div>

              {/* Field 2: Situation/Challenge - Mobile optimized spacing */}
              <div className="mb-2">
                <StarFieldComponent
                  name={`starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
                  label="Problem: What specific issue needed solving?"
                  placeholder="E.g., The team was missing budget deadlines due to unclear processes and poor communication..."
                  schema={
                    starExampleSchema.shape.situation.shape[
                      "briefly-describe-the-situation-or-challenge-you-faced"
                    ]
                  }
                  text={situationOrChallenge}
                />
              </div>

              {/* No extra bottom border or total words row */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
