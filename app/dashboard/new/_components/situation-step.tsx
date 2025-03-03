/**
@description
Client sub-component to capture the "Situation" portion of a STAR example.
It prompts the user for three smaller pieces of data:
1) Context
2) Challenge
3) Who was involved
Each field is stored temporarily, and onBlur we concatenate them (with labels)
and place the final string into starExampleX.situation in the wizard form state.

Key Features:
- Uses React Hook Form context
- Builds a single string from multiple smaller fields
- Example ID (starExample1 or starExample2) is determined by props

@dependencies
- React Hook Form for state management
- Shadcn UI components
@notes
We do not handle step navigation in this component; that occurs in pitch-wizard or higher-level logic.
*/

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useEffect, useState } from "react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface SituationStepProps {
  /**
   * exampleKey indicates whether we are dealing with starExample1 or starExample2
   * e.g., "starExample1" or "starExample2"
   */
  exampleKey: "starExample1" | "starExample2"
}

/**
 * @function SituationStep
 * Renders three text fields for the user to fill out:
 * 1) Context
 * 2) Challenge
 * 3) Who was involved
 *
 * On blur, we combine them into a single labeled string, storing it at:
 *   starExampleX.situation
 */
export default function SituationStep({ exampleKey }: SituationStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  // Local state for the smaller sub-fields
  const [contextValue, setContextValue] = useState("")
  const [challengeValue, setChallengeValue] = useState("")
  const [involvedValue, setInvolvedValue] = useState("")

  // Watch the current combined situation from the form
  // so that if we come back to this step, we can parse it out (optional).
  // But for now, we are focusing on combining data from local sub-fields.
  const storedSituation = watch(`${exampleKey}.situation`)

  /**
   * A helper that builds the final single string with labels
   * e.g. "Context: x\nChallenge: y\nWho was involved: z"
   */
  const buildSituationString = (
    context: string,
    challenge: string,
    involved: string
  ): string => {
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
  const handleBlur = () => {
    const finalString = buildSituationString(
      contextValue,
      challengeValue,
      involvedValue
    )
    // Store in form
    setValue(`${exampleKey}.situation`, finalString, { shouldDirty: true })
  }

  // If you'd like to parse the existing form data back into local states
  // you could do so in a useEffect, but it's optional. For now, we just start blank.

  return (
    <div className="space-y-4">
      {/* Context */}
      <FormField
        name="dummy" // a placeholder to keep Shadcn form structure
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
        name="dummy2"
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
        name="dummy3"
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