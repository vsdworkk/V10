/**
@description
Client sub-component to capture the "Situation" portion of a STAR example.
It prompts the user for three smaller pieces of data:
1) Where and when
2) Description of situation/challenge
3) Why it mattered
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
 * 1) Where and when
 * 2) Description of situation/challenge
 * 3) Why it mattered
 *
 * On blur, we combine them into a single labeled string, storing it at:
 *   starExampleX.situation
 */
export default function SituationStep({ exampleKey }: SituationStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  // Local state for the smaller sub-fields
  const [whereWhenValue, setWhereWhenValue] = useState("")
  const [descriptionValue, setDescriptionValue] = useState("")
  const [whyMatteredValue, setWhyMatteredValue] = useState("")

  // Watch the current combined situation from the form
  // so that if we come back to this step, we can parse it out (optional).
  // But for now, we are focusing on combining data from local sub-fields.
  const storedSituation = watch(`${exampleKey}.situation`)

  /**
   * A helper that builds the final single string with labels
   * e.g. "Where and when: x\nDescription: y\nWhy it mattered: z"
   */
  const buildSituationString = (
    whereWhen: string,
    description: string,
    whyMattered: string
  ): string => {
    let result = ""
    if (whereWhen.trim()) {
      result += `Where and when: ${whereWhen.trim()}\n`
    }
    if (description.trim()) {
      result += `Description: ${description.trim()}\n`
    }
    if (whyMattered.trim()) {
      result += `Why it mattered: ${whyMattered.trim()}`
    }
    return result.trim()
  }

  /**
   * Handler to update the form state whenever a user
   * blurs (i.e., leaves) an input field.
   */
  const handleBlur = () => {
    const finalString = buildSituationString(
      whereWhenValue,
      descriptionValue,
      whyMatteredValue
    )
    // Store in form
    setValue(`${exampleKey}.situation`, finalString, { shouldDirty: true })
  }

  // If you'd like to parse the existing form data back into local states
  // you could do so in a useEffect, but it's optional. For now, we just start blank.

  return (
    <div className="space-y-4">
      {/* Where and when */}
      <FormField
        name="dummy" // a placeholder to keep Shadcn form structure
        render={() => (
          <FormItem>
            <FormLabel>Where and when did this experience occur?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "In my role at ABC Corp in 2024."
            </div>
            <FormControl>
              <Textarea
                value={whereWhenValue}
                onChange={e => setWhereWhenValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        name="dummy2"
        render={() => (
          <FormItem>
            <FormLabel>Briefly describe the situation or challenge you faced.</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our team faced a software problem just weeks before launching an important product."
            </div>
            <FormControl>
              <Textarea
                value={descriptionValue}
                onChange={e => setDescriptionValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Why it mattered */}
      <FormField
        name="dummy3"
        render={() => (
          <FormItem>
            <FormLabel>Why was this a problem or why did it matter?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "The issue could delay the launch and significantly increase costs."
            </div>
            <FormControl>
              <Textarea
                value={whyMatteredValue}
                onChange={e => setWhyMatteredValue(e.target.value)}
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