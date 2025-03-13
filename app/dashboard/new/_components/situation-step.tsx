/**
@description
Client sub-component to capture the "Situation" portion of a STAR example.
Updated to use the new nested StarSchema structure with kebab-case question fields.
It prompts the user for three specific questions:
1) Where and when did this experience occur?
2) Briefly describe the situation or challenge you faced.
3) Why was this a problem or why did it matter?

Key Features:
- Uses React Hook Form context
- Stores data directly in nested structure with kebab-case question names
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
import { isString, parseLegacySituation } from "@/types"

interface SituationStepProps {
  /**
   * exampleKey indicates whether we are dealing with starExample1 or starExample2
   * e.g., "starExample1" or "starExample2"
   */
  exampleKey: "starExample1" | "starExample2"
}

/**
 * @function SituationStep
 * Renders three text fields for the user to fill out based on specific questions:
 * 1) Where and when did this experience occur?
 * 2) Briefly describe the situation or challenge you faced.
 * 3) Why was this a problem or why did it matter?
 *
 * Stores data directly in the new nested structure format.
 */
export default function SituationStep({ exampleKey }: SituationStepProps) {
  const { watch, setValue, getValues } = useFormContext<PitchWizardFormData>()

  // Local state for the question fields
  const [whereAndWhen, setWhereAndWhen] = useState("")
  const [situationOrChallenge, setSituationOrChallenge] = useState("")
  const [whyItMattered, setWhyItMattered] = useState("")

  // Watch the current values from the form - this needs to be adapted for the new structure
  const storedSituation = watch(`${exampleKey}.situation`)
  
  /**
   * Handler to update the form state with the new nested structure
   */
  const handleBlur = () => {
    setValue(`${exampleKey}.situation`, {
      "where-and-when-did-this-experience-occur": whereAndWhen,
      "briefly-describe-the-situation-or-challenge-you-faced": situationOrChallenge,
      "why-was-this-a-problem-or-why-did-it-matter": whyItMattered
    }, { shouldDirty: true })
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    if (storedSituation) {
      // For the new structure, extract values from the nested object
      if (typeof storedSituation === 'object') {
        setWhereAndWhen(storedSituation["where-and-when-did-this-experience-occur"] || "")
        setSituationOrChallenge(storedSituation["briefly-describe-the-situation-or-challenge-you-faced"] || "")
        setWhyItMattered(storedSituation["why-was-this-a-problem-or-why-did-it-matter"] || "")
      } 
      // Legacy support for old structure - use our utility function to parse legacy format
      else if (isString(storedSituation)) {
        const parsedSituation = parseLegacySituation(storedSituation);
        setWhereAndWhen(parsedSituation["where-and-when-did-this-experience-occur"] || "");
        setSituationOrChallenge(parsedSituation["briefly-describe-the-situation-or-challenge-you-faced"] || "");
        setWhyItMattered(parsedSituation["why-was-this-a-problem-or-why-did-it-matter"] || "");
      }
    }
  }, [storedSituation, exampleKey])

  return (
    <div className="space-y-4">
      {/* Where and when */}
      <FormField
        name={`${exampleKey}.situation.where-and-when-did-this-experience-occur`}
        render={() => (
          <FormItem>
            <FormLabel>Where and when did this experience occur?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "In my role at ABC Corp in 2024."
            </div>
            <FormControl>
              <Textarea
                value={whereAndWhen}
                onChange={e => setWhereAndWhen(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Situation or Challenge */}
      <FormField
        name={`${exampleKey}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
        render={() => (
          <FormItem>
            <FormLabel>Briefly describe the situation or challenge you faced.</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our team faced a software problem just weeks before launching an important product."
            </div>
            <FormControl>
              <Textarea
                value={situationOrChallenge}
                onChange={e => setSituationOrChallenge(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Why it mattered */}
      <FormField
        name={`${exampleKey}.situation.why-was-this-a-problem-or-why-did-it-matter`}
        render={() => (
          <FormItem>
            <FormLabel>Why was this a problem or why did it matter?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "The issue could delay the launch and significantly increase costs."
            </div>
            <FormControl>
              <Textarea
                value={whyItMattered}
                onChange={e => setWhyItMattered(e.target.value)}
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