/**
@description
Client sub-component to capture the "Situation" portion of a STAR example.
Updated to use the new StarSchema structure with detailed sub-fields.
It prompts the user for three smaller pieces of data:
1) Where and when (context)
2) Description of situation/challenge (challenge)
3) Why it mattered (background)
Each field is stored in both the main situation field and in the situationDetails object.

Key Features:
- Uses React Hook Form context
- Stores data in both the main situation field and in the situationDetails sub-object
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
 * 1) Where and when (context)
 * 2) Description of situation/challenge (challenge)
 * 3) Why it mattered (background)
 *
 * Stores data in both the main situation field (for backward compatibility)
 * and in the situationDetails sub-object (for structured data).
 */
export default function SituationStep({ exampleKey }: SituationStepProps) {
  const { watch, setValue, getValues } = useFormContext<PitchWizardFormData>()

  // Local state for the smaller sub-fields
  const [contextValue, setContextValue] = useState("")
  const [challengeValue, setChallengeValue] = useState("")
  const [backgroundValue, setBackgroundValue] = useState("")

  // Watch the current values from the form
  const storedSituation = watch(`${exampleKey}.situation`)
  const storedDetails = watch(`${exampleKey}.situationDetails`)

  /**
   * A helper that builds the final single string with labels
   * e.g. "Where and when: x\nDescription: y\nWhy it mattered: z"
   * This maintains compatibility with existing code
   */
  const buildSituationString = (
    context: string,
    challenge: string,
    background: string
  ): string => {
    let result = ""
    if (context.trim()) {
      result += `Where and when: ${context.trim()}\n`
    }
    if (challenge.trim()) {
      result += `Description: ${challenge.trim()}\n`
    }
    if (background.trim()) {
      result += `Why it mattered: ${background.trim()}`
    }
    return result.trim()
  }

  /**
   * Handler to update the form state with both the combined string
   * and the structured sub-fields
   */
  const handleBlur = () => {
    // Create the combined string for backward compatibility
    const finalString = buildSituationString(
      contextValue,
      challengeValue,
      backgroundValue
    )
    
    // Store both the main situation field and the detailed sub-fields
    setValue(`${exampleKey}.situation`, finalString, { shouldDirty: true })
    setValue(`${exampleKey}.situationDetails`, {
      context: contextValue,
      challenge: challengeValue,
      background: backgroundValue
    }, { shouldDirty: true })
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    // If we have structured details, use those
    if (storedDetails) {
      setContextValue(storedDetails.context || "")
      setChallengeValue(storedDetails.challenge || "")
      setBackgroundValue(storedDetails.background || "")
    } 
    // Otherwise, try to parse from the combined string (legacy support)
    else if (storedSituation) {
      const lines = storedSituation.split('\n')
      lines.forEach(line => {
        if (line.startsWith('Where and when:')) {
          setContextValue(line.replace('Where and when:', '').trim())
        } else if (line.startsWith('Description:')) {
          setChallengeValue(line.replace('Description:', '').trim())
        } else if (line.startsWith('Why it mattered:')) {
          setBackgroundValue(line.replace('Why it mattered:', '').trim())
        }
      })
    }
  }, [storedSituation, storedDetails, exampleKey])

  return (
    <div className="space-y-4">
      {/* Context (Where and when) */}
      <FormField
        name={`${exampleKey}.situationDetails.context`}
        render={() => (
          <FormItem>
            <FormLabel>Where and when did this experience occur?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "In my role at ABC Corp in 2024."
            </div>
            <FormControl>
              <Textarea
                value={contextValue}
                onChange={e => setContextValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Challenge (Description) */}
      <FormField
        name={`${exampleKey}.situationDetails.challenge`}
        render={() => (
          <FormItem>
            <FormLabel>Briefly describe the situation or challenge you faced.</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our team faced a software problem just weeks before launching an important product."
            </div>
            <FormControl>
              <Textarea
                value={challengeValue}
                onChange={e => setChallengeValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Background (Why it mattered) */}
      <FormField
        name={`${exampleKey}.situationDetails.background`}
        render={() => (
          <FormItem>
            <FormLabel>Why was this a problem or why did it matter?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "The issue could delay the launch and significantly increase costs."
            </div>
            <FormControl>
              <Textarea
                value={backgroundValue}
                onChange={e => setBackgroundValue(e.target.value)}
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