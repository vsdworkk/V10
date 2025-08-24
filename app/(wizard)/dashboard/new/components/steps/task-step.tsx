"use client"

// Task step collects responsibility and optional constraints for each STAR example
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData, starExampleSchema } from "../wizard/schema"
import StarFieldComponent from "../utilities/star-field-component"

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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="w-full sm:px-8">
        <div className="mb-8 rounded-2xl bg-white p-3 shadow-sm sm:p-6">
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
        </div>
      </div>
    </div>
  )
}
