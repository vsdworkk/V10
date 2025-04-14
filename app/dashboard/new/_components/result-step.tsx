"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
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
  const [whatYouLearned, setWhatYouLearned] = useState("")

  const handleBlur = () => {
    setValue(
      `starExamples.${exampleIndex}.result`,
      {
        "what-positive-outcome-did-you-achieve": positiveOutcome,
        "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
          benefitToTeam,
        "what-did-you-learn-from-this-experience": whatYouLearned
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
        setWhatYouLearned(
          storedResult["what-did-you-learn-from-this-experience"] || ""
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
        setWhatYouLearned(
          parsedResult["what-did-you-learn-from-this-experience"] || ""
        )
      }
    }
  }, [storedResult])

  return (
    <div className="space-y-4">
      <FormField
        name={`starExamples.${exampleIndex}.result.what-positive-outcome-did-you-achieve`}
        render={() => (
          <FormItem>
            <FormLabel>
              What positive outcome did you achieve from your actions?
            </FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I completed the project two weeks early, increasing profits by 10%."
            </div>
            <FormControl>
              <Textarea
                value={positiveOutcome}
                onChange={(e) => setPositiveOutcome(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`}
        render={() => (
          <FormItem>
            <FormLabel>
              How did this outcome benefit your team, stakeholders, or organisation?
            </FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our early launch resulted in praise from clients and stakeholders."
            </div>
            <FormControl>
              <Textarea
                value={benefitToTeam}
                onChange={(e) => setBenefitToTeam(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`starExamples.${exampleIndex}.result.what-did-you-learn-from-this-experience`}
        render={() => (
          <FormItem>
            <FormLabel>What did you learn from this experience?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I learned the importance of thorough testing before major releases."
            </div>
            <FormControl>
              <Textarea
                value={whatYouLearned}
                onChange={(e) => setWhatYouLearned(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}