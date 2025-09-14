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
    <div className="px-2 py-1 sm:p-6">
      {/* Mobile-optimized scrollable container with proper bottom padding for mobile nav */}
      <div className="flex h-[calc(100vh-200px)] flex-col overflow-y-auto pb-20 sm:h-auto sm:pb-2">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
          {/* Mobile-optimized container with proper spacing */}
          <div className="w-full sm:px-8">
            {/* Card with responsive padding and mobile-optimized spacing */}
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:mb-8 sm:rounded-2xl sm:p-6">
              {/* Mobile-optimized "Task" heading */}
              <h2 className="mb-4 text-lg font-bold text-gray-800 sm:mb-5 sm:text-xl">
                Task
              </h2>

              {/* Field - Mobile optimized spacing */}
              <div className="mb-2">
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
      </div>
    </div>
  )
}
