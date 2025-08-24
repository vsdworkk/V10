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
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      {/* Card layout with "Situation" heading inside */}
      <div className="w-full sm:px-8">
        {/* Card starts directly with Situation heading */}
        <div className="mb-8 rounded-2xl bg-white p-3 shadow-sm sm:p-6">
          {/* Bold "Situation" heading */}
          <h2 className="mb-5 text-xl font-bold text-gray-800">Situation</h2>

          {/* Field 1: Where and when */}
          <div className="mb-6">
            <StarFieldComponent
              name={`starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`}
              label="Where and when did this experience occur?"
              placeholder="Describe the situation, context, and any challenges you faced..."
              schema={
                starExampleSchema.shape.situation.shape[
                  "where-and-when-did-this-experience-occur"
                ]
              }
              text={whereAndWhen}
            />
          </div>

          {/* Field 2: Situation/Challenge */}
          <div className="mb-2">
            <StarFieldComponent
              name={`starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
              label="What was the problem faced by your team or workplace?"
              placeholder="Provide additional context or background information..."
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
  )
}
