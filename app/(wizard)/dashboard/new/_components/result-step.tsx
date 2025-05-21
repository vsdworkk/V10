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
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="w-full px-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">Result</h2>

          <div className="mb-6">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.result.what-positive-outcome-did-you-achieve`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    What positive outcome did you achieve from your actions?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className="min-h-24 w-full rounded-2xl border-l-4 border-gray-200 bg-gray-50 p-4 text-gray-700 shadow-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        {...field}
                        placeholder="I completed the project two weeks early, increasing profits by 10%."
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
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    How did this outcome benefit your team, stakeholders, or
                    organisation?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className="min-h-24 w-full rounded-2xl border-l-4 border-gray-200 bg-gray-50 p-4 text-gray-700 shadow-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        {...field}
                        placeholder="Our early launch resulted in praise from clients and stakeholders."
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
