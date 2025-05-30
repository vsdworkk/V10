"use client"

import { useFormContext } from "react-hook-form"
import { useMemo } from "react"
import { PitchWizardFormData } from "./pitch-wizard/schema"
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
              control={control}
              name={`starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    Where and when did this experience occur?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the situation, context, and any challenges you faced..."
                        className="w-full p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 text-gray-700 resize-none min-h-24"
                        style={{
                          '--focus-ring-color': '#444ec1',
                          '--focus-border-color': '#444ec1'
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#444ec1'
                          e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
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
              control={control}
              name={`starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    Briefly describe the situation or challenge you faced.
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide additional context or background information..."
                        className="w-full p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 text-gray-700 resize-none min-h-24"
                        style={{
                          '--focus-ring-color': '#444ec1',
                          '--focus-border-color': '#444ec1'
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#444ec1'
                          e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
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
