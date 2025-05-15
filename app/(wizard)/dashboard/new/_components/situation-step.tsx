"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard/schema"
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

// Evaluate answer quality (0-3 scale)
function evaluateQuality(text: string) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  if (wordCount === 0) return 0
  if (wordCount < 30) return 1
  if (wordCount < 75) return 2
  return 3
}

// Get the border color based on quality level
function getBorderColor(quality: number) {
  if (quality === 0) return "border-gray-200"
  if (quality === 1) return "border-gray-300"
  if (quality === 2) return "border-blue-400"
  return "border-green-400"
}

interface SituationStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

export default function SituationStep({ exampleIndex }: SituationStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const storedSituation = watch(`starExamples.${exampleIndex}.situation`)

  // Local states for each field
  const [whereAndWhen, setWhereAndWhen] = useState("")
  const [situationOrChallenge, setSituationOrChallenge] = useState("")
  const [whereAndWhenQuality, setWhereAndWhenQuality] = useState(0)
  const [situationOrChallengeQuality, setSituationOrChallengeQuality] = useState(0)

  // Sync local states with stored data
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
        const parsed = parseLegacySituation(storedSituation)
        setWhereAndWhen(parsed["where-and-when-did-this-experience-occur"] || "")
        setSituationOrChallenge(parsed["briefly-describe-the-situation-or-challenge-you-faced"] || "")
      }
    }
  }, [storedSituation])

  // Update quality whenever text changes
  useEffect(() => {
    setWhereAndWhenQuality(evaluateQuality(whereAndWhen))
  }, [whereAndWhen])

  useEffect(() => {
    setSituationOrChallengeQuality(evaluateQuality(situationOrChallenge))
  }, [situationOrChallenge])

  // On blur, store to form
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

  // Word counts
  const whereAndWhenWords = whereAndWhen.trim().split(/\s+/).filter(Boolean).length
  const situationOrChallengeWords = situationOrChallenge.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Card layout with "Situation" heading inside */}
      <div className="w-full px-8">
        {/* Card starts directly with Situation heading */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          {/* Bold "Situation" heading */}
          <h2 className="text-xl font-bold text-gray-800 mb-5">Situation</h2>

          {/* Field 1: Where and when */}
          <div className="mb-6">
            <FormField
              name={`starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`}
              render={() => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    Where and when did this experience occur?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className={`w-full p-4 border-l-4 ${getBorderColor(whereAndWhenQuality)} rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700`}
                        value={whereAndWhen}
                        onChange={(e) => setWhereAndWhen(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="In my role at ABC Corp in 2024."
                      />
                    </FormControl>
                    <FormMessage />
                    {/* Word count in bottom-right */}
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                      {whereAndWhenWords}
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Field 2: Situation/Challenge */}
          <div className="mb-2">
            <FormField
              name={`starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
              render={() => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    Briefly describe the situation or challenge you faced.
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        className={`w-full p-4 border-l-4 ${getBorderColor(situationOrChallengeQuality)} rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700`}
                        value={situationOrChallenge}
                        onChange={(e) => setSituationOrChallenge(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Our team faced a software problem just weeks before launching an important product."
                      />
                    </FormControl>
                    <FormMessage />
                    {/* Word count in bottom-right */}
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                      {situationOrChallengeWords}
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* No extra bottom border or total words row */}
        </div>
      </div>
    </div>
  )
}