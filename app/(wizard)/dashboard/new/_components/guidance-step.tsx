"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Lightbulb } from "lucide-react"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"

export default function GuidanceStep() {
  const { watch, setValue, getValues } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()
  const params = useParams()
  
  // Watch the starExamplesCount from the form
  const starExamplesCount = watch("starExamplesCount")

  // Watch fields needed to build the request for guidance:
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")

  // The form context also stores "albertGuidance"
  const albertGuidance = watch("albertGuidance")
  
  // Watch star example descriptions
  const starExampleDescriptions = watch("starExampleDescriptions") || []

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
        console.log("No pitch ID available yet. Guidance will be saved when the pitch is created.")
        return
      }

      // For existing pitches, update albertGuidance
      const formData = getValues()
      const payload = {
        id: pitchId as string,
        userId: formData.userId,
        albertGuidance: guidance,
        starExamplesCount: parseInt(formData.starExamplesCount, 10),
        starExampleDescriptions: formData.starExampleDescriptions || []
      }

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

  // Button-based selection for STAR examples count
  const handleStarExamplesCountChange = (value: string) => {
    setValue(
      "starExamplesCount",
      value as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10",
      { shouldDirty: true }
    )

    // Initialize or resize the starExampleDescriptions array
    const currentDescriptions = getValues("starExampleDescriptions") || []
    const newCount = parseInt(value, 10)
    
    // Make sure the array has the right number of slots
    const newDescriptions = [...currentDescriptions]
    while (newDescriptions.length < newCount) {
      newDescriptions.push("")
    }
    
    setValue("starExampleDescriptions", newDescriptions.slice(0, newCount), { shouldDirty: true })

    const pitchId = params?.pitchId
    if (pitchId) {
      const formData = getValues()
      const payload = {
        id: pitchId as string,
        userId: formData.userId,
        starExamplesCount: parseInt(value, 10),
        starExampleDescriptions: newDescriptions.slice(0, newCount)
      }

      fetch(`/api/pitchWizard/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((error) => {
        console.error("Error saving star examples count:", error)
      })
    }
  }

  // Handle STAR example description changes
  const handleDescriptionChange = (index: number, value: string) => {
    const descriptions = getValues("starExampleDescriptions") || []
    const newDescriptions = [...descriptions]
    newDescriptions[index] = value
    setValue("starExampleDescriptions", newDescriptions, { shouldDirty: true })
  }

  // Get the number of STAR examples to display
  const examplesCount = parseInt(starExamplesCount, 10) || 2 // Default to 2 if not set

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Albert's Guidance</h2>
      </div>
  
      {/* Fixed height container with overflow */}
      <div className="h-[500px] overflow-y-auto pr-2 flex flex-col gap-6">
       
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center space-y-2 py-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p>Loading...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-600 mb-3">{error}</p>
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

        {/* AI Suggestion Panel */}
        {!loading && !error && albertGuidance && (
          <>
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-6">
              <Lightbulb className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-gray-800">
                Our AI Albert has analysed your experience against the job description and suggests the below STAR examples. Feel free to use your own.
              </p>
            </div>

            {/* AI Suggestions Card */}
            <Card className="bg-gray-50 border border-gray-200 rounded-xl">
              <CardContent className="pt-6">
                <div className="whitespace-pre-wrap text-sm">{albertGuidance}</div>
              </CardContent>
            </Card>

            {/* STAR Example Selection */}
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">How many STAR examples would you like to include in your pitch?</p>
              <div className="grid grid-cols-4 gap-4">
                {["1", "2", "3", "4"].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleStarExamplesCountChange(val)}
                    className={`h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                      starExamplesCount === val
                        ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* STAR Example Descriptions */}
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">In one short sentence, describe each STAR example (max 50 chars):</p>
              
              <div className="space-y-4">
                {Array.from({ length: examplesCount }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 flex-shrink-0">
                      STAR Example {index + 1}:
                    </label>
                    <Input
                      className="flex-1 p-3 bg-white shadow-sm border border-gray-200 rounded-xl"
                      placeholder={`Enter example ${index + 1}`}
                      maxLength={50}
                      value={getValues("starExampleDescriptions")?.[index] || ""}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* No Guidance Yet */}
        {!loading && !error && !albertGuidance && (
          <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mb-6">
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
    </div>
  )
}