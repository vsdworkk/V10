/**
@description
Client sub-component for wizard Step 3: Automatic Albert Guidance.
Modified to only generate guidance once and store it in the database.
The guidance is displayed in a large Card component. If there is any error,
it is shown to the user.
@notes
- The user can manually refresh the guidance using the "Refresh" button
- We store the returned guidance in both the form's "albertGuidance" field and the database
- We don't automatically regenerate guidance if it's already available
*/

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
  
  // Get the star examples count from the form
  const starExamplesCount = watch("starExamplesCount")

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
  
  // Use a key string to detect changes - only used for manual refresh
  const formDataKey = `${roleName}|${roleLevel}|${pitchWordLimit}|${yearsExperience}|${relevantExperience && relevantExperience.slice(0, 50)}|${roleDescription && roleDescription.slice(0, 50)}`
  const lastFetchKeyRef = useRef<string>("")
  
  // Flag to track if we've initialized this component
  const [hasInitialized, setHasInitialized] = useState(false)

  // Function to save the guidance to the database
  const saveGuidanceToDatabase = async (guidance: string) => {
    try {
      const pitchId = params?.pitchId
      if (!pitchId) {
        // For new pitches (no ID yet), we'll store the guidance in the form
        // and it will be saved when the pitch is first created
        console.log("No pitch ID available yet. Guidance will be saved with the new pitch.")
        return
      }
  
      // For existing pitches, update the albertGuidance field
      const formData = getValues()
      const payload = {
        id: pitchId as string,
        userId: formData.userId,
        albertGuidance: guidance,
        starExamplesCount: parseInt(formData.starExamplesCount)
      }
  
      const response = await fetch(`/api/pitches/${pitchId}`, {
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
      
      // Save to database
      await saveGuidanceToDatabase(data.data)
      
      setRetryCount(0) // Reset retry count on success
      
      // Update the last fetch key
      lastFetchKeyRef.current = formDataKey
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
  }, [roleName, roleLevel, pitchWordLimit, yearsExperience, relevantExperience, roleDescription, setValue, formDataKey, toast])

  // Run once when the component mounts
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true)
      
      // Only fetch guidance if we don't already have it
      if (!albertGuidance && !loading) {
        void fetchGuidance()
      }
    }
  }, [hasInitialized, albertGuidance, loading, fetchGuidance])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    void fetchGuidance()
  }

  // Add a manual refresh button for users
  const handleManualRefresh = () => {
    // Clear any existing guidance
    setValue("albertGuidance", "", { shouldDirty: false })
    // Reset retry count
    setRetryCount(0)
    // Fetch new guidance
    void fetchGuidance()
  }

  // Handle star examples count change
  const handleStarExamplesCountChange = (value: "2" | "3") => {
    // Update the form context
    setValue("starExamplesCount", value, { shouldDirty: true })
    
    // If we have a pitch ID, update the database
    const pitchId = params?.pitchId
    if (pitchId) {
      const formData = getValues()
      const payload = {
        id: pitchId as string,
        userId: formData.userId,
        starExamplesCount: parseInt(value)
      }
      
      fetch(`/api/pitches/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(error => {
        console.error("Error saving star examples count:", error)
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Albert's Guidance</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-sm mr-2">Star examples:</span>
            <Select
              value={starExamplesCount}
              onValueChange={handleStarExamplesCountChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {albertGuidance && !loading && (
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Guidance
            </Button>
          )}
        </div>
      </div>

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