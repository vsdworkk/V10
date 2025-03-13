/**
@description
Client sub-component for the "Result" portion of a STAR example.
Updated to use the new nested StarSchema structure with kebab-case question fields.
Prompts user for:
1) What positive outcome did you achieve?
2) How did this outcome benefit your team, stakeholders, or organization?
3) What did you learn from this experience?

Key Features:
- React Hook Form context
- Stores data directly in nested structure with kebab-case question names
- Example ID (starExample1 or starExample2) is determined by props
*/

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
  exampleKey: "starExample1" | "starExample2"
}

export default function ResultStep({ exampleKey }: ResultStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const [positiveOutcome, setPositiveOutcome] = useState("")
  const [benefitToTeam, setBenefitToTeam] = useState("")
  const [whatYouLearned, setWhatYouLearned] = useState("")

  // Watch the current values from the form
  const storedResult = watch(`${exampleKey}.result`)

  const handleBlur = () => {
    // Store data in the new nested structure
    setValue(`${exampleKey}.result`, {
      "what-positive-outcome-did-you-achieve": positiveOutcome,
      "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": benefitToTeam,
      "what-did-you-learn-from-this-experience": whatYouLearned
    }, { shouldDirty: true })
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    if (storedResult) {
      // For the new structure, extract values from the nested object
      if (typeof storedResult === 'object') {
        setPositiveOutcome(storedResult["what-positive-outcome-did-you-achieve"] || "")
        setBenefitToTeam(storedResult["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "")
        setWhatYouLearned(storedResult["what-did-you-learn-from-this-experience"] || "")
      } 
      // Legacy support for old structure (string)
      else if (isString(storedResult)) {
        const parsedResult = parseLegacyResult(storedResult);
        setPositiveOutcome(parsedResult["what-positive-outcome-did-you-achieve"] || "");
        setBenefitToTeam(parsedResult["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "");
        setWhatYouLearned(parsedResult["what-did-you-learn-from-this-experience"] || "");
      }
    }
  }, [storedResult, exampleKey])

  return (
    <div className="space-y-4">
      <FormField
        name={`${exampleKey}.result.what-positive-outcome-did-you-achieve`}
        render={() => (
          <FormItem>
            <FormLabel>What positive outcome did you achieve from your actions?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I completed the project two weeks early, increasing profits by 10%. Include numbers if possible."
            </div>
            <FormControl>
              <Textarea
                value={positiveOutcome}
                onChange={e => setPositiveOutcome(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${exampleKey}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`}
        render={() => (
          <FormItem>
            <FormLabel>How did this outcome benefit your team, stakeholders, or organisation?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our early launch resulted in praise from clients and stakeholders."
            </div>
            <FormControl>
              <Textarea
                value={benefitToTeam}
                onChange={e => setBenefitToTeam(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${exampleKey}.result.what-did-you-learn-from-this-experience`}
        render={() => (
          <FormItem>
            <FormLabel>What did you learn from this experience?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I learned the importance of thorough testing before major releases."
            </div>
            <FormControl>
              <Textarea
                value={whatYouLearned}
                onChange={e => setWhatYouLearned(e.target.value)}
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