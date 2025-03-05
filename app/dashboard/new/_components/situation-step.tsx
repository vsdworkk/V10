/**
@description
Client sub-component to capture the "Situation" portion of a STAR example.
It prompts the user for three smaller pieces of data:
1. Context
2. Challenge
3. Who was involved

Each field is stored temporarily, and onBlur we concatenate them (with labels)
and place the final string into starExampleX.situation in the wizard form state.

Key Features:
- Uses React Hook Form context
- Builds a single string from multiple smaller fields
- Derives the example number (One/Two) from the `exampleKey` prop

@dependencies
- React Hook Form for state management
- Shadcn UI components

@notes
We have added a heading structure with "STAR Example One/Two" as the main h2 heading
and "Situation" as an h3 sub-heading underneath.
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
@interface SituationStepProps
@exampleKey: "starExample1" | "starExample2" indicates which STAR example.
*/
interface SituationStepProps {
  exampleKey: "starExample1" | "starExample2"
}

/**
@function SituationStep
Renders three text fields for the user to fill out:
1. Context
2. Challenge
3. Who was involved

On blur, we combine them into a single labeled string, storing it in:
starExampleX.situation

Additionally:
- We display a heading h2 at the top to identify which STAR example (One or Two).
*/
export default function SituationStep({ exampleKey }: SituationStepProps) {
  const { setValue } = useFormContext()

  // Local state for the sub-fields
  const [contextValue, setContextValue] = useState("")
  const [challengeValue, setChallengeValue] = useState("")
  const [involvedValue, setInvolvedValue] = useState("")

  /**
   * Helper that builds the final single string with labels.
   * e.g. "Context: x\nChallenge: y\nWho was involved: z"
   */
  function buildSituationString(
    context: string,
    challenge: string,
    involved: string
  ): string {
    let result = ""
    if (context.trim()) {
      result += `Context: ${context.trim()}\n`
    }
    if (challenge.trim()) {
      result += `Challenge: ${challenge.trim()}\n`
    }
    if (involved.trim()) {
      result += `Who was involved: ${involved.trim()}`
    }
    return result.trim()
  }

  /**
   * Handler to update the form state whenever a user
   * blurs (i.e., leaves) an input field.
   */
  function handleBlur() {
    const finalString = buildSituationString(
      contextValue,
      challengeValue,
      involvedValue
    )
    // Store in the form
    setValue(`${exampleKey}.situation`, finalString, { shouldDirty: true })
  }

  // Derive "One" or "Two" from exampleKey
  const exampleNumber = exampleKey === "starExample1" ? "One" : "Two"

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          STAR Example {exampleNumber}
        </h2>
        <h3 className="text-md font-medium mt-1">
          Situation
        </h3>
      </div>

      {/* Context */}
      <FormField
        // "dummy" name so Shadcn field structure can wrap these inputs
        name="dummy-situation1"
        render={() => (
          <FormItem>
            <FormLabel>Context</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the overall context or environment..."
                value={contextValue}
                onChange={e => setContextValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Challenge */}
      <FormField
        name="dummy-situation2"
        render={() => (
          <FormItem>
            <FormLabel>Challenge</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What challenge or obstacle did you face?"
                value={challengeValue}
                onChange={e => setChallengeValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Who was involved */}
      <FormField
        name="dummy-situation3"
        render={() => (
          <FormItem>
            <FormLabel>Who was involved?</FormLabel>
            <FormControl>
              <Input
                placeholder="List key participants, stakeholders, or teams..."
                value={involvedValue}
                onChange={e => setInvolvedValue(e.target.value)}
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