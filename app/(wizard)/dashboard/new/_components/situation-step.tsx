"use client"

// Collects information about the Situation portion of a STAR example
import { useFormContext } from "react-hook-form"
import { useMemo } from "react"
import { PitchWizardFormData, starExampleSchema } from "./pitch-wizard/schema"
import WordCountIndicator from "./word-count-indicator"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

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

function getQualityBorderClass(quality: number): string {
  if (quality === 0) return "border-gray-300"
  if (quality === 1) return "border-yellow-400"
  if (quality === 2) return "border-purple-400"
  return "border-gray-300"
}

interface SituationStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

export default function SituationStep({ exampleIndex }: SituationStepProps) {
  const { control, watch } = useFormContext<PitchWizardFormData>()

  const whereAndWhen =
    watch(
      `starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`
    ) || ""
  const situationOrChallenge =
    watch(
      `starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`
    ) || ""

  const whereAndWhenQuality = useMemo(
    () => evaluateQuality(whereAndWhen),
    [whereAndWhen]
  )
  const situationOrChallengeQuality = useMemo(
    () => evaluateQuality(situationOrChallenge),
    [situationOrChallenge]
  )

  const whereAndWhenWords = whereAndWhen
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const situationOrChallengeWords = situationOrChallenge
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      {/* Card layout with "Situation" heading inside */}
      <div className="w-full px-8">
        {/* Card starts directly with Situation heading */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          {/* Bold "Situation" heading */}
          <h2 className="mb-5 text-xl font-bold text-gray-800">Situation</h2>

          {/* Field 1: Where and when */}
          <div className="mb-6">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    Where and when did this experience occur?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the situation, context, and any challenges you faced..."
                        className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
                        style={
                          {
                            "--focus-ring-color": "#444ec1",
                            "--focus-border-color": "#444ec1"
                          } as React.CSSProperties
                        }
                        onFocus={e => {
                          e.target.style.borderColor = "#444ec1"
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(68, 78, 193, 0.1)"
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </FormControl>
                    <WordCountIndicator
                      schema={
                        starExampleSchema.shape.situation.shape[
                          "where-and-when-did-this-experience-occur"
                        ]
                      }
                      text={whereAndWhen}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Field 2: Situation/Challenge */}
          <div className="mb-2">
            <FormField
              control={control}
              name={`starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-700">
                    Briefly describe the situation or challenge you faced.
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide additional context or background information..."
                        className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
                        style={
                          {
                            "--focus-ring-color": "#444ec1",
                            "--focus-border-color": "#444ec1"
                          } as React.CSSProperties
                        }
                        onFocus={e => {
                          e.target.style.borderColor = "#444ec1"
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(68, 78, 193, 0.1)"
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </FormControl>
                    <WordCountIndicator
                      schema={
                        starExampleSchema.shape.situation.shape[
                          "briefly-describe-the-situation-or-challenge-you-faced"
                        ]
                      }
                      text={situationOrChallenge}
                    />
                    <FormMessage />
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
