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
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function SituationStep
 * Renders three text fields for the user to fill out based on specific questions:
 * 1) Where and when did this experience occur?
 * 2) Briefly describe the situation or challenge you faced.
 * 3) Why was this a problem or why did it matter?
 *
 * Data is stored in starExamples[exampleIndex].situation
 */
export default function SituationStep({ exampleIndex }: SituationStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  // Watch the current values from the form at this index
  const storedSituation = watch(`starExamples.${exampleIndex}.situation`)

  // Local state for each field
  const [whereAndWhen, setWhereAndWhen] = useState("")
  const [situationOrChallenge, setSituationOrChallenge] = useState("")
  const [whyItMattered, setWhyItMattered] = useState("")

  /**
   * Handler to update the form state when the user leaves a field (onBlur).
   * We store data in `starExamples[exampleIndex].situation` with kebab-case keys.
   */
  const handleBlur = () => {
    setValue(
      `starExamples.${exampleIndex}.situation`,
      {
        "where-and-when-did-this-experience-occur": whereAndWhen,
        "briefly-describe-the-situation-or-challenge-you-faced": situationOrChallenge,
        "why-was-this-a-problem-or-why-did-it-matter": whyItMattered
      },
      { shouldDirty: true }
    )
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    if (storedSituation) {
      if (typeof storedSituation === "object") {
        setWhereAndWhen(
          storedSituation["where-and-when-did-this-experience-occur"] || ""
        )
        setSituationOrChallenge(
          storedSituation["briefly-describe-the-situation-or-challenge-you-faced"] || ""
        )
        setWhyItMattered(
          storedSituation["why-was-this-a-problem-or-why-did-it-matter"] || ""
        )
      } else if (isString(storedSituation)) {
        // Legacy support for old string-based storage
        const parsedSituation = parseLegacySituation(storedSituation)
        setWhereAndWhen(
          parsedSituation["where-and-when-did-this-experience-occur"] || ""
        )
        setSituationOrChallenge(
          parsedSituation["briefly-describe-the-situation-or-challenge-you-faced"] || ""
        )
        setWhyItMattered(
          parsedSituation["why-was-this-a-problem-or-why-did-it-matter"] || ""
        )
      }
    }
  }, [storedSituation])

  return (
    <div className="space-y-4">
      {/* Where and when */}
      <FormField
        name={`starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`}
        render={() => (
          <FormItem>
            <FormLabel>Where and when did this experience occur?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "In my role at ABC Corp in 2024."
            </div>
            <FormControl>
              <Textarea
                value={whereAndWhen}
                onChange={(e) => setWhereAndWhen(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Situation or Challenge */}
      <FormField
        name={`starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
        render={() => (
          <FormItem>
            <FormLabel>Briefly describe the situation or challenge you faced.</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Our team faced a software problem just weeks before launching an important product."
            </div>
            <FormControl>
              <Textarea
                value={situationOrChallenge}
                onChange={(e) => setSituationOrChallenge(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Why it mattered */}
      <FormField
        name={`starExamples.${exampleIndex}.situation.why-was-this-a-problem-or-why-did-it-matter`}
        render={() => (
          <FormItem>
            <FormLabel>Why was this a problem or why did it matter?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "The issue could delay the launch and significantly increase costs."
            </div>
            <FormControl>
              <Textarea
                value={whyItMattered}
                onChange={(e) => setWhyItMattered(e.target.value)}
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