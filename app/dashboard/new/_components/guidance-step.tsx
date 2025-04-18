"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export default function GuidanceStep() {
  const { watch, setValue, getValues } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()
  const params = useParams()
  
  // Watch the starExamplesCount from the form; it might be "1", "2", ..., "10"
  const starExamplesCount = watch("starExamplesCount")

  // Watch fields needed to build the request for guidance:
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")

  // The form context also stores "albertGuidance"
  const albertGuidance = watch("albertGuidance")

  // Local states for request feedback
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  // Use a key string to detect changes - only used for manual refresh
  const formDataKey = `${roleName}|${roleLevel}|${pitchWordLimit}|${
    relevantExperience && relevantExperience.slice(0, 50)
  }|${roleDescription && roleDescription.slice(0, 50)}`

  const lastFetchKeyRef = useRef<string>("")

  // Track if we've initialized this component to avoid repeated fetches
  const [hasInitialized, setHasInitialized] = useState(false)

  // Saves guidance to the database (if pitchId is known)
  const saveGuidanceToDatabase = async (guidance: string) => {
    try {
      const pitchId = params?.pitchId
      if (!pitchId) {
        // For new pitches (no ID yet), the guidance is stored in the form
        // and will be saved upon first creation in PitchWizard
        console.log("No pitch ID available yet. Guidance will be saved when the pitch is created.")
        return
      }

      // For existing pitches, update albertGuidance
      const formData = getValues()
      const payload = {
        id: pitchId as string,
        userId: formData.userId,
        albertGuidance: guidance,
        // We parse starExamplesCount from string to number, if needed
        starExamplesCount: parseInt(formData.starExamplesCount, 10)
      }

      // <-- The key line: changed from `/api/pitches/${pitchId}` to `/api/pitchWizard/${pitchId}`
      const response = await fetch(`/api/pitchWizard/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error("Failed to save guidance to database:", await response.text())
      }
    } catch (error) {
      console.error("Error saving guidance to database:", error)
    }
  }

  // Fetches guidance from the AI backend
  const fetchGuidance = useCallback(async () => {
    if (!roleName || !roleLevel || !pitchWordLimit || !relevantExperience) {
      setError("Missing required fields. Please complete Step 2 first.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Set up a 60-second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const response = await fetch("/api/albertGuidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName,
          roleLevel,
          pitchWordLimit,
          relevantExperience,
          roleDescription
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error("The request timed out. Please try again later.")
        }
        const errText = await response.text()
        throw new Error(errText || "Failed to fetch guidance")
      }

      const data = await response.json()
      if (!data.isSuccess) {
        throw new Error(data.message || "Error generating guidance")
      }

      // Store the returned guidance in the form state
      setValue("albertGuidance", data.data, { shouldDirty: true })

      // Save to DB if possible
      await saveGuidanceToDatabase(data.data)

      setRetryCount(0) // reset on success
      lastFetchKeyRef.current = formDataKey
    } catch (err: any) {
      const errorMessage =
        err.name === "AbortError"
          ? "Request timed out. Please try again."
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
  }, [
    roleName,
    roleLevel,
    pitchWordLimit,
    relevantExperience,
    roleDescription,
    setValue,
    formDataKey,
    toast
  ])

  // Only run once at component mount or if albertGuidance is empty
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true)

      // If there's no existing guidance, fetch it
      if (!albertGuidance && !loading) {
        void fetchGuidance()
      }
    }
  }, [hasInitialized, albertGuidance, loading, fetchGuidance])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    void fetchGuidance()
  }

  const handleManualRefresh = () => {
    setValue("albertGuidance", "", { shouldDirty: false })
    setRetryCount(0)
    void fetchGuidance()
  }

  // Updated to handle arbitrary string values, e.g. "1", "2", ... "10"
  const handleStarExamplesCountChange = (value: string) => {
    setValue(
      "starExamplesCount",
      value as
        | "1"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
        | "8"
        | "9"
        | "10",
      { shouldDirty: true }
    )

    const pitchId = params?.pitchId
    if (pitchId) {
      const formData = getValues()
      const payload = {
        id: pitchId as string,
        userId: formData.userId,
        starExamplesCount: parseInt(value, 10) // Convert to number
      }

      // <-- Again, switched from `/api/pitches/${pitchId}` to `/api/pitchWizard/${pitchId}`
      fetch(`/api/pitchWizard/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((error) => {
        console.error("Error saving star examples count:", error)
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Albert's Guidance</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-sm mr-2">Star Examples:</span>
            <Select
              value={starExamplesCount}
              onValueChange={handleStarExamplesCountChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                {["2", "3", "4"].map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {albertGuidance && !loading && (
            <Button onClick={handleManualRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Guidance
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center space-y-2 py-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Retrieving guidance from Albert... This may take a moment.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Success State: Display Guidance */}
      {!loading && !error && albertGuidance && (
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Use these tips while filling out your STAR examples.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{albertGuidance}</div>
          </CardContent>
        </Card>
      )}

      {/* No Guidance Yet */}
      {!loading && !error && !albertGuidance && (
        <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
          <p className="text-muted-foreground text-sm mb-3">
            Guidance is not available. Please ensure you've completed Step 2 
            (Experience) fully, then try again.
          </p>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            disabled={
              loading ||
              !roleName ||
              !roleLevel ||
              !pitchWordLimit ||
              !relevantExperience
            }
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}