"use client"

// Task step collects responsibility and optional constraints for each STAR example

import { useFormContext } from "react-hook-form"
import { useMemo } from "react"
import { PitchWizardFormData, starExampleSchema } from "./pitch-wizard/schema"
import WordCountIndicator from "./word-count-indicator"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface TaskStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function TaskStep
 * Collects:
 * 1) Responsibility in addressing the issue
 * 2) How completing the task helps solve the problem
 * 3) Constraints/requirements
 *
 * Data is stored in starExamples[exampleIndex].task
 */

// Add word count helpers
function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function TaskStep({ exampleIndex }: TaskStepProps) {
  const { control, watch } = useFormContext<PitchWizardFormData>()

  const responsibility =
    watch(
      `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`
    ) || ""
  const constraints =
    watch(
      `starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`
    ) || ""

  const responsibilityWords = countWords(responsibility)
  const constraintsWords = countWords(constraints)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="w-full px-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">Task</h2>

          <div className="mb-6">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    What was your responsibility in addressing this issue?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your specific responsibility and what you needed to accomplish..."
                      className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
                      style={
                        {
                          "--focus-ring-color": "#444ec1",
                          "--focus-border-color": "#444ec1"
                        } as React.CSSProperties
                      }
                      onFocus={e => {
                        e.target.style.borderColor = "#444ec1"
                        e.target.style.boxShadow =
                          "0 0 0 1px rgba(68, 78, 193, 0.1)"
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#e5e7eb"
                        e.target.style.boxShadow = "none"
                      }}
                    />
                  </FormControl>
                  <WordCountIndicator
                    schema={
                      starExampleSchema.shape.task.shape[
                        "what-was-your-responsibility-in-addressing-this-issue"
                      ]
                    }
                    text={responsibility}
                    fieldName={`starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`}
                  />
                </FormItem>
              )}
            />
          </div>

          <div className="mb-2">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    What constraints or requirements did you need to consider?
                    <span className="text-gray-500"> (optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe any constraints, requirements, or challenges you had to consider..."
                      className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
                      style={
                        {
                          "--focus-ring-color": "#444ec1",
                          "--focus-border-color": "#444ec1"
                        } as React.CSSProperties
                      }
                      onFocus={e => {
                        e.target.style.borderColor = "#444ec1"
                        e.target.style.boxShadow =
                          "0 0 0 1px rgba(68, 78, 193, 0.1)"
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#e5e7eb"
                        e.target.style.boxShadow = "none"
                      }}
                    />
                  </FormControl>
                  <WordCountIndicator
                    schema={
                      starExampleSchema.shape.task.shape[
                        "what-constraints-or-requirements-did-you-need-to-consider"
                      ]
                    }
                    text={constraints}
                    fieldName={`starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`}
                  />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
