/**
@description
Client sub-component for the "Result" portion of a STAR example.
Updated to use the new StarSchema structure with detailed sub-fields.
Prompts user for:
1) Positive outcome achieved (metrics)
2) How the outcome benefited team/stakeholders/organisation (impact)
Stores data in both the main result field and in the resultDetails sub-object.

Key Features:
- React Hook Form context
- Stores data in both the main result field and in the resultDetails sub-object
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

interface ResultStepProps {
  exampleKey: "starExample1" | "starExample2"
}

export default function ResultStep({ exampleKey }: ResultStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const [outcomeValue, setOutcomeValue] = useState("")
  const [benefitValue, setBenefitValue] = useState("")

  // Watch the current values from the form
  const storedResult = watch(`${exampleKey}.result`)
  const storedDetails = watch(`${exampleKey}.resultDetails`)

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
    // Create the combined string for backward compatibility
    const finalString = buildResultString(
      outcomeValue,
      benefitValue
    )
    
    // Store both the main result field and the detailed sub-fields
    setValue(`${exampleKey}.result`, finalString, { shouldDirty: true })
    setValue(`${exampleKey}.resultDetails`, {
      metrics: outcomeValue,
      impact: benefitValue,
    }, { shouldDirty: true })
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    // If we have structured details, use those
    if (storedDetails) {
      setOutcomeValue(storedDetails.metrics || "")
      setBenefitValue(storedDetails.impact || "")
    } 
    // Otherwise, try to parse from the combined string (legacy support)
    else if (storedResult) {
      const lines = storedResult.split('\n')
      lines.forEach(line => {
        if (line.startsWith('Outcome:')) {
          setOutcomeValue(line.replace('Outcome:', '').trim())
        } else if (line.startsWith('Benefit:')) {
          setBenefitValue(line.replace('Benefit:', '').trim())
        }
      })
    }
  }, [storedResult, storedDetails, exampleKey])

  return (
    <div className="space-y-4">
      <FormField
        name={`${exampleKey}.resultDetails.metrics`}
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
        name={`${exampleKey}.resultDetails.impact`}
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