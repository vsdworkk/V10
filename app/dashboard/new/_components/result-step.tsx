/**
@description
Client sub-component for the "Result" portion of a STAR example.
Prompts user for:
1) Positive outcome achieved
2) How the outcome benefited team/stakeholders/organisation (optional)
We combine them into a single labeled string, storing it at starExampleX.result.

Key Features:
- React Hook Form context
- Two sub-fields
- Single string output on blur
*/

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useState } from "react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface ResultStepProps {
  exampleKey: "starExample1" | "starExample2"
}

export default function ResultStep({ exampleKey }: ResultStepProps) {
  const { setValue } = useFormContext<PitchWizardFormData>()

  const [outcomeValue, setOutcomeValue] = useState("")
  const [benefitValue, setBenefitValue] = useState("")

  const buildResultString = (
    outcome: string,
    benefit: string
  ) => {
    let result = ""
    if (outcome.trim()) {
      result += `Outcome: ${outcome.trim()}\n`
    }
    if (benefit.trim()) {
      result += `Benefit: ${benefit.trim()}`
    }
    return result.trim()
  }

  const handleBlur = () => {
    const finalString = buildResultString(
      outcomeValue,
      benefitValue
    )
    setValue(`${exampleKey}.result`, finalString, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <FormField
        name="dummy-result1"
        render={() => (
          <FormItem>
            <FormLabel>What positive outcome did you achieve from your actions?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I completed the project two weeks early, increasing profits by 10%. Include numbers if possible."
            </div>
            <FormControl>
              <Textarea
                value={outcomeValue}
                onChange={e => setOutcomeValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="dummy-result2"
        render={() => (
          <FormItem>
            <FormLabel>How did this outcome benefit your team, stakeholders, or organisation? (optional)</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our early launch resulted in praise from clients and stakeholders."
            </div>
            <FormControl>
              <Textarea
                value={benefitValue}
                onChange={e => setBenefitValue(e.target.value)}
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