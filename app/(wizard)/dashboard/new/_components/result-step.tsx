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

// Add word count helper
function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

interface ResultStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function ResultStep
 * Prompts user for:
 * 1) Positive outcome achieved
 * 2) How it benefited the team/org
 * 3) What you learned
 *
 * Data is stored in starExamples[exampleIndex].result
 */
export default function ResultStep({ exampleIndex }: ResultStepProps) {
  const { control, watch } = useFormContext<PitchWizardFormData>()

  const positiveOutcome =
    watch(
      `starExamples.${exampleIndex}.result.what-positive-outcome-did-you-achieve`
    ) || ""
  const benefitToTeam =
    watch(
      `starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`
    ) || ""

  const positiveOutcomeWords = countWords(positiveOutcome)
  const benefitToTeamWords = countWords(benefitToTeam)

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Result</h2>

          <div className="mb-6">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.result.what-positive-outcome-did-you-achieve`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    What positive outcome did you achieve from your actions?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the specific outcomes and results of your actions..."
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
                      {positiveOutcomeWords}
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mb-2">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    How did this outcome benefit your team, stakeholders, or
                    organisation?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe how these results impacted your organization or project..."
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
                      {benefitToTeamWords}
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
