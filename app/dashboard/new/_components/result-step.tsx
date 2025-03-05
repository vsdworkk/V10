/**
@description
Client sub-component for the "Result" portion of a STAR example.
Prompts user for:
1. Outcome
2. Impact
3. Quantification

We combine them into a single labeled string, storing it at starExampleX.result.

Key Features:
- React Hook Form context
- Three sub-fields
- Single string output on blur
- Now includes a heading structure with "STAR Example One/Two" as the main h2 heading
  and "Result" as an h3 sub-heading underneath.

@notes
*/

"use client"

import { useFormContext } from "react-hook-form"
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

/**
@interface ResultStepProps
@exampleKey: "starExample1" | "starExample2"
*/
interface ResultStepProps {
  exampleKey: "starExample1" | "starExample2"
}

/**
@function ResultStep
Collects the user's inputs for the final "Result" portion:
1. Outcome
2. Impact
3. Quantification

Then merges them into a single labeled text block for starExampleX.result.
We include a heading structure with "STAR Example One/Two" as the main h2 heading
and "Result" as an h3 sub-heading underneath.
*/
export default function ResultStep({ exampleKey }: ResultStepProps) {
  const { setValue } = useFormContext()

  const [outcomeValue, setOutcomeValue] = useState("")
  const [impactValue, setImpactValue] = useState("")
  const [quantValue, setQuantValue] = useState("")

  function buildResultString(
    outcome: string,
    impact: string,
    quantification: string
  ): string {
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

  function handleBlur() {
    const finalString = buildResultString(
      outcomeValue,
      impactValue,
      quantValue
    )
    setValue(`${exampleKey}.result`, finalString, { shouldDirty: true })
  }

  // "One" or "Two"
  const exampleNumber = exampleKey === "starExample1" ? "One" : "Two"

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          STAR Example {exampleNumber}
        </h2>
        <h3 className="text-md font-medium mt-1">
          Result
        </h3>
      </div>

      {/* Outcome */}
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

      {/* Impact */}
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

      {/* Quantification */}
      <FormField
        name="dummy-result3"
        render={() => (
          <FormItem>
            <FormLabel>Quantification</FormLabel>
            <FormControl>
              <Input
                placeholder="If possible, provide measurable details (e.g. 'Increased efficiency by 20%')"
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