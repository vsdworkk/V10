"use client"

// Result step collects the final outcome and its benefits

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

interface ResultStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function ResultStep
 * Prompts user for how the outcome benefited the organisation
 *
 * Data is stored in starExamples[exampleIndex].result
 */
export default function ResultStep({ exampleIndex }: ResultStepProps) {
  const { control, watch } = useFormContext<PitchWizardFormData>()

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
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    How did this outcome benefit your team, stakeholders, or
                    organisation?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe how these results impacted your organization or project..."
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
                        starExampleSchema.shape.result.shape[
                          "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
                        ]
                      }
                      text={benefitToTeam}
                    />
                    <FormMessage />
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
