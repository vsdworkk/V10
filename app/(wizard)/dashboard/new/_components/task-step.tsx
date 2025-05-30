"use client"

import { useFormContext } from "react-hook-form"
import { useMemo } from "react"
import { PitchWizardFormData } from "./pitch-wizard/schema"
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Task</h2>

          <div className="mb-6">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    What was your responsibility in addressing this issue?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your specific responsibility and what you needed to accomplish..."
                        className="w-full p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 text-gray-700 resize-none min-h-24"
                        style={{
                          '--focus-ring-color': '#444ec1',
                          '--focus-border-color': '#444ec1'
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#444ec1'
                          e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                      {responsibilityWords}
                    </div>
                  </div>
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
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    What constraints or requirements did you need to consider?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe any constraints, requirements, or challenges you had to consider..."
                        className="w-full p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 text-gray-700 resize-none min-h-24"
                        style={{
                          '--focus-ring-color': '#444ec1',
                          '--focus-border-color': '#444ec1'
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#444ec1'
                          e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                      {constraintsWords}
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
