/**
@description
Client sub-component for the "Result" portion of a STAR example.
Prompts user for:
1) Outcome
2) Impact
3) Quantification
We combine them into a single labeled string, storing it at starExampleX.result.

Key Features:
- React Hook Form context
- Three sub-fields
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
import { Input } from "@/components/ui/input"

interface ResultStepProps {
  exampleKey: "starExample1" | "starExample2"
}

export default function ResultStep({ exampleKey }: ResultStepProps) {
  const { setValue } = useFormContext<PitchWizardFormData>()

  const [outcomeValue, setOutcomeValue] = useState("")
  const [impactValue, setImpactValue] = useState("")
  const [quantValue, setQuantValue] = useState("")

  const buildResultString = (
    outcome: string,
    impact: string,
    quantification: string
  ) => {
    let result = ""
    if (outcome.trim()) {
      result += `Outcome: ${outcome.trim()}\n`
    }
    if (impact.trim()) {
      result += `Impact: ${impact.trim()}\n`
    }
    if (quantification.trim()) {
      result += `Quantification: ${quantification.trim()}`
    }
    return result.trim()
  }

  const handleBlur = () => {
    const finalString = buildResultString(
      outcomeValue,
      impactValue,
      quantValue
    )
    setValue(`${exampleKey}.result`, finalString, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <FormField
        name="dummy-result1"
        render={() => (
          <FormItem>
            <FormLabel>Outcome</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What was the final outcome of your actions?"
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
            <FormLabel>Impact</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the broader impact or significance of your results..."
                value={impactValue}
                onChange={e => setImpactValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="dummy-result3"
        render={() => (
          <FormItem>
            <FormLabel>Quantification</FormLabel>
            <FormControl>
              <Input
                placeholder="If possible, provide measurable details, e.g. 'Increased efficiency by 20%'"
                value={quantValue}
                onChange={e => setQuantValue(e.target.value)}
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