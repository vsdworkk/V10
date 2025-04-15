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

// Import the minimal answer quality meter
import { AnswerQualityMeter } from "./answer-quality-meter"

interface SituationStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function SituationStep
 * Renders two text fields:
 *   1) Where and when did this experience occur?
 *   2) Briefly describe the situation or challenge you faced.
 *
 * The component displays a minimal quality meter (three dots) under each field.
 */
export default function SituationStep({ exampleIndex }: SituationStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const storedSituation = watch(`starExamples.${exampleIndex}.situation`)

  // Local state for each field
  const [whereAndWhen, setWhereAndWhen] = useState("")
  const [situationOrChallenge, setSituationOrChallenge] = useState("")

  /**
   * Handler to update the form state when the user leaves a field (onBlur).
   * Data is stored in starExamples[exampleIndex].situation.
   */
  const handleBlur = () => {
    setValue(
      `starExamples.${exampleIndex}.situation`,
      {
        "where-and-when-did-this-experience-occur": whereAndWhen,
        "briefly-describe-the-situation-or-challenge-you-faced": situationOrChallenge
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
      } else if (isString(storedSituation)) {
        // Legacy fallback
        const parsedSituation = parseLegacySituation(storedSituation)
        setWhereAndWhen(
          parsedSituation["where-and-when-did-this-experience-occur"] || ""
        )
        setSituationOrChallenge(
          parsedSituation["briefly-describe-the-situation-or-challenge-you-faced"] || ""
        )
      }
    }
  }, [storedSituation])

  return (
    <div className="space-y-4">
      {/* Field 1: Where and when */}
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
            {/* Minimal answer quality meter below the first field */}
            <AnswerQualityMeter text={whereAndWhen} />
          </FormItem>
        )}
      />

      {/* Field 2: Situation or Challenge */}
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
            {/* Minimal answer quality meter below the second field */}
            <AnswerQualityMeter text={situationOrChallenge} />
          </FormItem>
        )}
      />
    </div>
  )
}