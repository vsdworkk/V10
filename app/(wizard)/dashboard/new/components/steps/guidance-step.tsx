/**
 * Client component for wizard step 4 of the pitch builder.
 * Fetches AI guidance automatically and manages STAR example inputs.
 * Field changes are stored locally and persisted by the wizard when the
 * user clicks Next or Close.
 */
"use client"

import { useFormContext } from "react-hook-form"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { useAiGuidance } from "@/lib/hooks/use-ai-guidance"
import { debugLog } from "@/lib/debug"
import { PitchWizardFormData } from "../wizard/schema"
import { useParams } from "next/navigation"

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
  const pitchWordLimit = watch("pitchWordLimit")

  // Determine the definitive pitch ID to use
  // Prioritize the ID from props (coming from useWizard state)
  // Fallback to URL params if necessary (though less ideal now)
  const definitivePitchId = pitchIdFromProp || (params?.pitchId as string)

  // Use our custom hook
  const { isLoading, guidance, error, requestId, fetchGuidance } =
    useAiGuidance()

  // Initialize - request guidance if needed
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    debugLog(
      "[GuidanceStep] Initial guidance check - albertGuidance:",
      albertGuidance ? "present" : "not present",
      "definitivePitchId:",
      definitivePitchId
    )

    if (
      !albertGuidance &&
      roleDescription &&
      relevantExperience &&
      userId &&
      definitivePitchId &&
      !hasRequestedRef.current
    ) {
      debugLog(
        "[GuidanceStep] Conditions met for initial guidance request, calling fetchGuidance"
      )
      hasRequestedRef.current = true
      fetchGuidance(
        roleDescription,
        relevantExperience,
        userId,
        definitivePitchId
      )
    } else if (albertGuidance) {
      debugLog(
        "[GuidanceStep] Not fetching guidance as it already exists in form state"
      )
    }
  }, [
    albertGuidance,
    roleDescription,
    relevantExperience,
    userId,
    definitivePitchId
  ])

  // Update form when guidance is received
  useEffect(() => {
    debugLog(
      "[GuidanceStep] useEffect for guidance update triggered. Hook guidance:",
      guidance,
      "isLoading:",
      isLoading
    )

    // When guidance exists, update the form and ensure loading is stopped
    if (guidance) {
      debugLog("[GuidanceStep] Setting albertGuidance in form with:", guidance)
      setValue("albertGuidance", guidance, { shouldDirty: true })
      if (requestId) {
        debugLog(
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

    // Values will be persisted when the user moves away from this step
  }

  const possibleStarCounts = ["2", "3", "4"]
  const starCount = starExamplesCount || "2"
  const recommendedCount =
    pitchWordLimit < 550 ? "2" : pitchWordLimit <= 700 ? "3" : "4"
  const [tipsOpen, setTipsOpen] = useState<string | undefined>(undefined)

  // Log form state of albertGuidance before rendering
  debugLog(
    "[GuidanceStep] Rendering with albertGuidance (from form watch):",
    albertGuidance
  )

  return (
    <div className="p-1 sm:p-6">
      <div className="flex h-[500px] flex-col gap-6 overflow-y-auto pr-2">
        {/* AI suggestions header */}
        {!isLoading && !error && albertGuidance && (
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              AI Suggestions
            </h3>

            {/* Note about guidance being recommendations */}
            <div
              className="mb-4 rounded-xl border p-4"
              style={{
                backgroundColor: "#eef2ff",
                borderColor: "#c7d2fe"
              }}
            >
              <p className="text-sm" style={{ color: "#444ec1" }}>
                <strong>Note:</strong> The suggestions below were generated by
                AI analyzing your experience and job description to spark ideas
                and help you recall impactful moments. These examples won't
                carry forward automatically—you choose what to use in upcoming
                sections. If you have experiences that better highlight your
                capabilities, you're encouraged to draw on those instead.
              </p>
            </div>
          </div>
        )}

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
      </div>
    </div>
  )
}
