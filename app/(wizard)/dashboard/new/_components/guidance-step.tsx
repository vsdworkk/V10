/**
 * Client component for wizard step 4 of the pitch builder.
 * Fetches AI guidance automatically and manages STAR example inputs.
 * Field changes are stored locally and persisted by the wizard when the
 * user clicks Next or Close.
 */
"use client"

import { useFormContext } from "react-hook-form"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Lightbulb } from "lucide-react"
import { useAiGuidance } from "@/lib/hooks/use-ai-guidance"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import { useParams } from "next/navigation"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GuidanceStepProps {
  pitchId?: string // Accept pitchId as an optional prop
}

export default function GuidanceStep({
  pitchId: pitchIdFromProp
}: GuidanceStepProps) {
  // Destructure and rename prop
  const { watch, setValue, getValues, control, formState } =
    useFormContext<PitchWizardFormData>()
  const { errors } = formState
  const params = useParams() // Keep for other potential uses or fallback

  // Form fields that matter for requesting guidance
  const userId = watch("userId")
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")
  const albertGuidance = watch("albertGuidance") // existing guidance
  const starExamplesCount = watch("starExamplesCount")
  const starExampleDescriptions = watch("starExampleDescriptions") || []
  const pitchWordLimit = watch("pitchWordLimit")

  // Determine the definitive pitch ID to use
  // Prioritize the ID from props (coming from useWizard state)
  // Fallback to URL params if necessary (though less ideal now)
  const definitivePitchId = pitchIdFromProp || (params?.pitchId as string)

  // Use our custom hook
  const { isLoading, guidance, error, requestId, fetchGuidance } =
    useAiGuidance()

  // Initialize - request guidance if needed
  useEffect(() => {
    console.log(
      "[GuidanceStep] Initial guidance check - albertGuidance:",
      albertGuidance ? "present" : "not present",
      "isLoading:",
      isLoading,
      "definitivePitchId:",
      definitivePitchId
    )

    // Ensure definitivePitchId is available before fetching
    if (
      !albertGuidance &&
      roleDescription &&
      relevantExperience &&
      !isLoading &&
      userId &&
      definitivePitchId
    ) {
      console.log(
        "[GuidanceStep] Conditions met for initial guidance request, calling fetchGuidance"
      )
      fetchGuidance(
        roleDescription,
        relevantExperience,
        userId,
        definitivePitchId // Use the definitivePitchId
      )
    } else if (albertGuidance) {
      console.log(
        "[GuidanceStep] Not fetching guidance as it already exists in form state"
      )
    }
    // Add definitivePitchId to dependency array if it can change and trigger re-fetch
  }, [
    albertGuidance,
    roleDescription,
    relevantExperience,
    isLoading,
    userId,
    fetchGuidance,
    definitivePitchId
  ])

  // Update form when guidance is received
  useEffect(() => {
    console.log(
      "[GuidanceStep] useEffect for guidance update triggered. Hook guidance:",
      guidance,
      "isLoading:",
      isLoading
    )

    // When guidance exists, update the form and ensure loading is stopped
    if (guidance) {
      console.log(
        "[GuidanceStep] Setting albertGuidance in form with:",
        guidance
      )
      setValue("albertGuidance", guidance, { shouldDirty: true })
      if (requestId) {
        console.log(
          "[GuidanceStep] Setting agentExecutionId in form with:",
          requestId
        )
        setValue("agentExecutionId", requestId, { shouldDirty: true })
      }
    }
  }, [guidance, requestId, setValue, isLoading])

  // Handle STAR example count change
  const handleStarExamplesCountChange = (value: string) => {
    setValue(
      "starExamplesCount",
      value as PitchWizardFormData["starExamplesCount"],
      {
        shouldDirty: true
      }
    )

    // Keep starExampleDescriptions array in sync
    const currentDescriptions = getValues("starExampleDescriptions") || []
    const newCount = parseInt(value, 10)
    const newArr = [...currentDescriptions]
    while (newArr.length < newCount) {
      newArr.push("")
    }
    // slice any extras
    const finalArr = newArr.slice(0, newCount)
    setValue("starExampleDescriptions", finalArr, { shouldDirty: true })

    // Values will be persisted when the user moves away from this step
  }

  // Handle STAR example description change
  const handleDescriptionChange = (index: number, value: string) => {
    const updatedDescriptions = [...starExampleDescriptions]
    updatedDescriptions[index] = value
    setValue("starExampleDescriptions", updatedDescriptions, {
      shouldDirty: true
    })

    // Values will be persisted when the user moves away from this step
  }

  const possibleStarCounts = ["2", "3", "4"]
  const starCount = starExamplesCount || "2"
  const recommendedCount =
    pitchWordLimit < 550 ? "2" : pitchWordLimit <= 700 ? "3" : "4"
  const [tipsOpen, setTipsOpen] = useState<string | undefined>(undefined)

  // Log form state of albertGuidance before rendering
  console.log(
    "[GuidanceStep] Rendering with albertGuidance (from form watch):",
    albertGuidance
  )

  return (
    <div className="p-6">
      <div className="flex h-[500px] flex-col gap-6 overflow-y-auto pr-2">
        {/* Tips accordion - moved to top */}
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={tipsOpen}
          onValueChange={setTipsOpen}
        >
          <AccordionItem value="guidance-tips" className="border-none">
            <AccordionTrigger
              className="flex items-center gap-2 rounded-xl p-4 text-sm font-normal transition-colors hover:no-underline"
              style={{
                backgroundColor: "#eef2ff",
                color: "#444ec1"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "#ddd6fe"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "#eef2ff"
              }}
            >
              <Lightbulb className="size-4" />
              <span>Tips for this step</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 text-sm text-gray-700">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  The AI will analyze your experience and job requirements to
                  provide guidance.
                </li>
                <li>
                  This guidance helps you craft effective STAR examples that
                  highlight relevant skills.
                </li>
                <li>
                  Choose how many STAR examples you want to include in your
                  pitch (1-4).
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* If loading */}
        {isLoading && (
          <div className="flex flex-col items-center space-y-2 py-4">
            <RefreshCw
              className="size-8 animate-spin"
              style={{ color: "#444ec1" }}
            />
            <p>Generating AI Guidance...</p>
          </div>
        )}

        {/* If error */}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="mb-3 text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* If there's existing guidance, show it */}
        {!isLoading && !error && albertGuidance && (
          <Card className="rounded-xl border border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-sm">
                {albertGuidance}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STAR examples count selector */}
        <div className="space-y-4">
          <p className="font-medium text-gray-700">
            How many STAR examples do you want to include?
          </p>
          <div className="grid grid-cols-3 gap-4">
            {possibleStarCounts.map(val => (
              <div key={val} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleStarExamplesCountChange(val)}
                  className={`flex h-16 w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                    starCount === val
                      ? "font-medium"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  style={
                    starCount === val
                      ? {
                          backgroundColor: "#eef2ff",
                          color: "#444ec1"
                        }
                      : {}
                  }
                >
                  <span className="text-lg font-semibold">{val}</span>
                  {recommendedCount === val && (
                    <span
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: "#444ec1" }}
                    >
                      <span>✨</span>
                      Recommended by Recruiters
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
          {errors.starExamplesCount && (
            <p className="text-sm text-red-500">
              {errors.starExamplesCount.message as string}
            </p>
          )}
        </div>

        {/* STAR example descriptions */}
        {parseInt(starCount, 10) > 0 && (
          <div className="space-y-4">
            <p className="font-medium text-gray-700">
              In one sentence describe each STAR example you'll include:
            </p>
            <div className="space-y-4">
              {Array.from({ length: parseInt(starCount, 10) }).map(
                (_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`star-example-${index}`}>
                      STAR Example {index + 1}
                    </Label>
                    <Input
                      id={`star-example-${index}`}
                      placeholder={`Brief description of STAR example ${index + 1}`}
                      value={starExampleDescriptions[index] || ""}
                      onChange={e =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      className="bg-white/80 backdrop-blur-sm"
                    />
                    {Array.isArray(errors.starExampleDescriptions) &&
                      errors.starExampleDescriptions[index] && (
                        <p className="text-sm text-red-500">
                          {
                            errors.starExampleDescriptions[index]
                              ?.message as string
                          }
                        </p>
                      )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
