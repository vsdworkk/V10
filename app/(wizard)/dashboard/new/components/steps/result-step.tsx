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
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="w-full px-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">Result</h2>

          <div className="mb-6">
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
  )
}
