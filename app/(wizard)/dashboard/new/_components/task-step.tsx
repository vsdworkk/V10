"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import { useState, useEffect } from "react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { isString, parseLegacyTask } from "@/types"

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
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const storedTask = watch(`starExamples.${exampleIndex}.task`)

  const [responsibility, setResponsibility] = useState("")
  const [constraints, setConstraints] = useState("")

  // Word counts
  const responsibilityWords = countWords(responsibility)
  const constraintsWords = countWords(constraints)

  const handleBlur = () => {
    setValue(
      `starExamples.${exampleIndex}.task`,
      {
        "what-was-your-responsibility-in-addressing-this-issue": responsibility,
        "what-constraints-or-requirements-did-you-need-to-consider": constraints
      },
      { shouldDirty: true }
    )
  }

  useEffect(() => {
    if (storedTask) {
      if (typeof storedTask === "object") {
        setResponsibility(
          storedTask["what-was-your-responsibility-in-addressing-this-issue"] || ""
        )
        setConstraints(
          storedTask["what-constraints-or-requirements-did-you-need-to-consider"] || ""
        )
      } else if (isString(storedTask)) {
        // Legacy fallback
        const parsedTask = parseLegacyTask(storedTask)
        setResponsibility(
          parsedTask["what-was-your-responsibility-in-addressing-this-issue"] || ""
        )
        setConstraints(
          parsedTask["what-constraints-or-requirements-did-you-need-to-consider"] || ""
        )
      }
    }
  }, [storedTask])

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Task</h2>

          <div className="mb-6">
            <FormField
              name={`starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`}
              render={() => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    What was your responsibility in addressing this issue?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
                        value={responsibility}
                        onChange={(e) => setResponsibility(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="I was responsible for diagnosing the software errors and implementing fixes before the product launch."
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
              name={`starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`}
              render={() => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    What constraints or requirements did you need to consider?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="We had limited resources and a deadline of three weeks before launch."
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