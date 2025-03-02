/**
@description
Client sub-component for wizard Step 3: Automatic Albert Guidance.
Upon loading, this component automatically calls the AI endpoint "/api/albertGuidance"
to get role-specific suggestions that the user can refer to before filling out the STAR
examples. The guidance is displayed in a large Card component. If there is any error,
it is shown to the user.
@notes
- The user no longer has a "Get Guidance" button; guidance is fetched as soon as the step
  is rendered and required data is present.
- We store the returned guidance in the form's "albertGuidance" field so it persists if
  the user navigates away and returns to this step.
*/

"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GuidanceStep() {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  // We watch these fields to build the request for guidance:
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const yearsExperience = watch("yearsExperience")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")

  // The form context also stores "albertGuidance"
  const albertGuidance = watch("albertGuidance")

  // Local states for request feedback
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we already have guidance or we're missing required fields, don't fetch again
    if (
      albertGuidance ||
      !roleName ||
      !roleLevel ||
      !pitchWordLimit ||
      !yearsExperience ||
      !relevantExperience
    ) {
      return
    }

    const fetchGuidance = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/albertGuidance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleName,
            roleLevel,
            pitchWordLimit,
            yearsExperience,
            relevantExperience,
            roleDescription
          })
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(errText || "Failed to fetch guidance")
        }

        const data = await response.json()
        if (!data.isSuccess) {
          throw new Error(data.message || "Error generating guidance")
        }

        // Store the returned guidance in form state
        setValue("albertGuidance", data.data, { shouldDirty: true })
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchGuidance()
  }, [
    albertGuidance,
    roleName,
    roleLevel,
    pitchWordLimit,
    yearsExperience,
    relevantExperience,
    roleDescription,
    setValue,
    toast
  ])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Albert's Guidance</h2>

      {/* Show loading, error, or the Card with guidance */}
      {loading && (
        <p className="text-sm text-muted-foreground">
          Retrieving guidance from Albert...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          Failed to load guidance: {error}
        </p>
      )}

      {!loading && !error && albertGuidance && (
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Use these tips while filling out your STAR examples.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">
              {albertGuidance}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 
        If there's no guidance yet (and not loading), we either haven't fetched or
        we are missing required data from Step 2. 
      */}
      {!loading && !error && !albertGuidance && (
        <p className="text-muted-foreground text-sm">
          Guidance is not available. Please ensure you have filled out Step 2 (Experience
          details). 
        </p>
      )}
    </div>
  )
}