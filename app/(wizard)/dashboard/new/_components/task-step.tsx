"use client"

// Task step collects responsibility and optional constraints for each STAR example
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData, starExampleSchema } from "./pitch-wizard/schema"
import StarFieldComponent from "./star-field-component"

interface TaskStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

export default function TaskStep({ exampleIndex }: TaskStepProps) {
  const { watch } = useFormContext<PitchWizardFormData>()

  const responsibility =
    watch(
      `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`
    ) || ""
  const constraints =
    watch(
      `starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`
    ) || ""

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="w-full px-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">Task</h2>

          <div className="mb-6">
            <StarFieldComponent
              name={`starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`}
              label="What was your responsibility in addressing this issue?"
              placeholder="Describe your specific responsibility and what you needed to accomplish..."
              schema={
                starExampleSchema.shape.task.shape[
                  "what-was-your-responsibility-in-addressing-this-issue"
                ]
              }
              text={responsibility}
            />
          </div>

          <div className="mb-2">
            <StarFieldComponent
              name={`starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`}
              label={
                <>
                  What constraints or requirements did you need to consider?
                  <span className="text-gray-500"> (optional)</span>
                </>
              }
              placeholder="Describe any constraints, requirements, or challenges you had to consider..."
              schema={
                starExampleSchema.shape.task.shape[
                  "what-constraints-or-requirements-did-you-need-to-consider"
                ]
              }
              text={constraints}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
