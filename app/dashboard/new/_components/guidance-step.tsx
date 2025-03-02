/**
@description
Client sub-component for wizard Step 3: Automatic Albert Guidance.
Upon loading, this component automatically calls the AI endpoint "/api/albertGuidance"
to get role-specific suggestions that the user can refer to before filling out the STAR
examples. The guidance is displayed in a large Card component. If there is any error,
it is shown to the user.
@notes
- The user now has a "Retry" button if the initial fetch fails
- We store the returned guidance in the form's "albertGuidance" field so it persists if
  the user navigates away and returns to this step.
- The component now tracks changes to input fields and refreshes guidance when needed
*/

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

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
  const [retryCount, setRetryCount] = useState<number>(0)
  
  // Store previous values to detect changes
  const previousValuesRef = useRef({
    roleName,
    roleLevel,
    pitchWordLimit,
    yearsExperience,
    relevantExperience,
    roleDescription
  })

  const fetchGuidance = useCallback(async () => {
    if (!roleName || !roleLevel || !pitchWordLimit || !yearsExperience || !relevantExperience) {
      setError("Missing required fields. Please complete Step 2 first.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Set a timeout for the fetch operation
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

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
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error("The request timed out. Please try again with a shorter description or retry later.")
        }
        const errText = await response.text()
        throw new Error(errText || "Failed to fetch guidance")
      }

      const data = await response.json()
      if (!data.isSuccess) {
        throw new Error(data.message || "Error generating guidance")
      }

      // Store the returned guidance in form state
      setValue("albertGuidance", data.data, { shouldDirty: true })
      setRetryCount(0) // Reset retry count on success
      
      // Update previous values after successful fetch
      previousValuesRef.current = {
        roleName,
        roleLevel,
        pitchWordLimit,
        yearsExperience,
        relevantExperience,
        roleDescription
      }
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' 
        ? "Request timed out. Please try again with a shorter description."
        : err.message
      
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  },
    [roleName, roleLevel, pitchWordLimit, yearsExperience, relevantExperience, roleDescription, setValue, toast]
  )

  // Check if any relevant fields have changed
  const haveFieldsChanged = useCallback(() => {
    const prev = previousValuesRef.current
    return (
      prev.roleName !== roleName ||
      prev.roleLevel !== roleLevel ||
      prev.pitchWordLimit !== pitchWordLimit ||
      prev.yearsExperience !== yearsExperience ||
      prev.relevantExperience !== relevantExperience ||
      prev.roleDescription !== roleDescription
    )
  }, [roleName, roleLevel, pitchWordLimit, yearsExperience, relevantExperience, roleDescription])

  // Initial fetch on component mount if we don't already have guidance
  // OR if any of the relevant fields have changed
  useEffect(() => {
    const fieldsChanged = haveFieldsChanged()
    
    if ((!albertGuidance || fieldsChanged) && !loading && retryCount === 0) {
      void fetchGuidance()
    }
  }, [albertGuidance, fetchGuidance, loading, retryCount, haveFieldsChanged])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    void fetchGuidance()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Albert's Guidance</h2>

      {/* Show loading, error, or the Card with guidance */}
      {loading && (
        <div className="flex flex-col items-center space-y-2 py-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Retrieving guidance from Albert... This may take a moment.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-600 mb-3">
            {error}
          </p>
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
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
        <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
          <p className="text-muted-foreground text-sm mb-3">
            Guidance is not available. Please ensure you have filled out Step 2 (Experience
            details) completely.
          </p>
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            size="sm"
            disabled={loading || !roleName || !roleLevel || !pitchWordLimit || !yearsExperience || !relevantExperience}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}