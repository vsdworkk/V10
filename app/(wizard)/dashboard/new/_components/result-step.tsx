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
import { isString, parseLegacyResult } from "@/types"

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
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const storedResult = watch(`starExamples.${exampleIndex}.result`)

  const [positiveOutcome, setPositiveOutcome] = useState("")
  const [benefitToTeam, setBenefitToTeam] = useState("")

  // Word counts
  const positiveOutcomeWords = countWords(positiveOutcome)
  const benefitToTeamWords = countWords(benefitToTeam)

  const handleBlur = () => {
    setValue(
      `starExamples.${exampleIndex}.result`,
      {
        "what-positive-outcome-did-you-achieve": positiveOutcome,
        "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
          benefitToTeam
      },
      { shouldDirty: true }
    )
  }

  useEffect(() => {
    if (storedResult) {
      if (typeof storedResult === "object") {
        setPositiveOutcome(
          storedResult["what-positive-outcome-did-you-achieve"] || ""
        )
        setBenefitToTeam(
          storedResult[
            "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
          ] || ""
        )
      } else if (isString(storedResult)) {
        // Legacy fallback
        const parsedResult = parseLegacyResult(storedResult)
        setPositiveOutcome(
          parsedResult["what-positive-outcome-did-you-achieve"] || ""
        )
        setBenefitToTeam(
          parsedResult[
            "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
          ] || ""
        )
      }
    }
  }, [storedResult])

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Result</h2>

          <div className="mb-6">
            <FormField
              name={`starExamples.${exampleIndex}.result.what-positive-outcome-did-you-achieve`}
              render={() => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    What positive outcome did you achieve from your actions?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
                        value={positiveOutcome}
                        onChange={(e) => setPositiveOutcome(e.target.value)}
                        onBlur={handleBlur}
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
              name={`starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`}
              render={() => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    How did this outcome benefit your team, stakeholders, or organisation?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
                        value={benefitToTeam}
                        onChange={(e) => setBenefitToTeam(e.target.value)}
                        onBlur={handleBlur}
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