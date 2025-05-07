"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Lightbulb } from "lucide-react"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"

/**
 * GuidanceStep
 * -----------
 * 1. Generates a unique 6-digit ID on each new request for guidance.
 * 2. Saves that ID to the form's `agentExecutionId` field and to DB,
 *    so that PromptLayer can call back using this ID in `agentExecutionId`.
 * 3. If you want polling, you can add it (see step 4 in your instructions).
 */
export default function GuidanceStep() {
  const { watch, setValue, getValues } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()
  const params = useParams()

  // Form fields that matter for requesting guidance
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")
  const albertGuidance = watch("albertGuidance") // previously returned guidance, if any
  const starExamplesCount = watch("starExamplesCount")

  // Just for tracking small changes
  const starExampleDescriptions = watch("starExampleDescriptions") || []

  // Local state
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [tipsOpen, setTipsOpen] = useState<string | undefined>("guidance-tips")

  const isRequestInProgressRef = useRef(false)
  const lastFetchKeyRef = useRef<string>("")

  // Build a quick "hash" of the form data to detect changes
  const formDataKey = `${roleName}|${roleLevel}|${pitchWordLimit}|${relevantExperience?.slice(0, 50)}|${roleDescription?.slice(0, 50)}`

  /**
   * Called once if we want auto-fetch on mount
   */
  useEffect(() => {
    if (hasInitialized || isRequestInProgressRef.current) return

    setHasInitialized(true)

    // Optional: if there's no existing guidance, we can auto-fetch
    if (!albertGuidance) {
      void fetchGuidance()
    }
  }, [hasInitialized, albertGuidance])

  /**
   * The main function that triggers new guidance from the AI (PromptLayer).
   */
  const fetchGuidance = useCallback(async () => {
    if (isRequestInProgressRef.current) {
      console.log("Request is already in progress, skipping.")
      return
    }

    // Check required fields
    if (!roleName || !roleLevel || !pitchWordLimit || !relevantExperience) {
      setError("Missing required fields. Please complete Step 2 first.")
      return
    }

    try {
      isRequestInProgressRef.current = true
      setLoading(true)
      setError(null)

      // Generate a unique 6-digit identifier
      const idUnique = Math.floor(100000 + Math.random() * 900000).toString()
      console.log("Fetching guidance with unique ID:", idUnique)

      // 60-second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      // Make request to our local Next.js API
      const response = await fetch("/api/albertGuidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: roleDescription,
          experience: relevantExperience,
          idUnique
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
      if (!data.success) {
        throw new Error(data.error || "Error generating guidance")
      }

      // Save the unique ID in the form's agentExecutionId
      setValue("agentExecutionId", data.data, { shouldDirty: true })

      // Get the pitchId from URL parameters
      const formData = getValues()
      const currentPitchId = params?.pitchId
      
      console.log("Current Pitch ID:", currentPitchId)
      
      // Update DB pitch if we have a pitchId from URL parameters
      if (currentPitchId) {
        // Get current form values for required fields
        const formData = getValues();
        
        // Create a payload that meets the schema requirements
        const payload = {
          id: currentPitchId as string,
          userId: formData.userId,
          roleName: formData.roleName,
          roleLevel: formData.roleLevel,
          pitchWordLimit: formData.pitchWordLimit,
          relevantExperience: formData.relevantExperience || "",
          agentExecutionId: data.data // The execution ID we want to update
        };
        
        console.log("Updating pitch with execution ID:", data.data);
        
        // Patch the pitchWizard so that agentExecutionId is stored
        const updateResponse = await fetch(`/api/pitchWizard/${currentPitchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        if (!updateResponse.ok) {
          console.error("Failed to update pitch with execution ID:", await updateResponse.text());
          
          // If that fails, try the savePitchData approach instead
          try {
            console.log("Trying alternative approach to update execution ID");
            const allFormData = getValues();
            const updatedFormData = {
              ...allFormData,
              agentExecutionId: data.data
            };
            
            // Post to /api/pitchWizard instead of the [pitchId] route
            const fallbackResponse = await fetch("/api/pitchWizard", {
              method: "POST", 
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: currentPitchId,
                userId: formData.userId,
                roleName: formData.roleName,
                roleLevel: formData.roleLevel,
                pitchWordLimit: formData.pitchWordLimit,
                relevantExperience: formData.relevantExperience || "",
                agentExecutionId: data.data,
                currentStep: 4 // Guidance step
              })
            });
            
            if (!fallbackResponse.ok) {
              console.error("Fallback update also failed:", await fallbackResponse.text());
            } else {
              console.log("Successfully updated execution ID using fallback approach");
            }
          } catch (updateErr) {
            console.error("Error in fallback update:", updateErr);
          }
        } else {
          console.log("Successfully updated pitch with execution ID");
        }
      } else {
        console.error("No pitch ID found in URL parameters")
      }

      // We do not actually get the final text right away if the agent
      // uses a callback. If your agent returns text immediately, store it:
      // e.g. setValue("albertGuidance", data.albertText, { shouldDirty: true })

      // If your route does return "AI text" right away, you'd do:
      // setValue("albertGuidance", data.guidance, { shouldDirty: true })

      lastFetchKeyRef.current = formDataKey
    } catch (err: any) {
      console.error("fetchGuidance error:", err)
      const msg = err.name === "AbortError" 
        ? "Request timed out. Please try again."
        : err.message

      setError(msg)
      toast({
        title: "Error",
        description: msg,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      isRequestInProgressRef.current = false
    }
  }, [
    roleName,
    roleLevel,
    pitchWordLimit,
    relevantExperience,
    roleDescription,
    setValue,
    toast,
    params,
    getValues,
    formDataKey
  ])

  /**
   * If the user wants to manually refresh guidance:
   */
  const handleManualRefresh = () => {
    // Optionally clear existing text
    setValue("albertGuidance", "", { shouldDirty: true })
    void fetchGuidance()
  }

  /**
   * Basic UI - e.g. Retry or Loading states.
   */
  const handleRetry = () => {
    void fetchGuidance()
  }

  // This updates starExamplesCount in the form state
  const handleStarExamplesCountChange = (value: string) => {
    setValue("starExamplesCount", value as PitchWizardFormData["starExamplesCount"], {
      shouldDirty: true
    })

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

    // If we have a pitchId, patch the DB
    const formData = getValues()
    const currentPitchId = params?.pitchId
    
    if (currentPitchId) {
      const payload = {
        id: currentPitchId,
        userId: formData.userId,
        starExamplesCount: newCount,
        starExampleDescriptions: finalArr
      }
      void fetch(`/api/pitchWizard/${currentPitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }
  }

  // Keep it to 1..4 for quick UI
  const possibleStarCounts = ["1","2","3","4"]

  const starCount = starExamplesCount || "2"

  return (
    <div className="p-6">
      <div className="h-[500px] overflow-y-auto pr-2 flex flex-col gap-6">

        {/* If loading */}
        {loading && (
          <div className="flex flex-col items-center space-y-2 py-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p>Requesting AI Guidance...</p>
          </div>
        )}

        {/* If error */}
        {error && !loading && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* If there's existing albertGuidance, show it here. 
            For demonstration, we keep the text as is. */}
        {!loading && !error && albertGuidance && (
          <Card className="bg-gray-50 border border-gray-200 rounded-xl">
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-sm">
                {albertGuidance}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show a button to forcibly refresh guidance if user wants */}
        <Button variant="outline" size="sm" onClick={handleManualRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Guidance
        </Button>

        {/* Example: user chooses how many STAR examples to do */}
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            How many STAR examples do you want to include?
          </p>
          <div className="grid grid-cols-4 gap-4">
            {possibleStarCounts.map(val => (
              <button
                key={val}
                onClick={() => handleStarExamplesCountChange(val)}
                className={`h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  starCount === val
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Tips for this step */}
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={tipsOpen}
          onValueChange={setTipsOpen}
        >
          <AccordionItem value="guidance-tips" className="border-none">
            <AccordionTrigger className="py-4 px-4 text-sm font-normal bg-blue-50 hover:bg-blue-100 hover:no-underline text-blue-700 rounded-xl flex gap-2 items-center">
              <Lightbulb className="h-4 w-4" />
              <span>Tips for this step</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4 text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>The AI will analyze your experience and the job requirements to provide guidance.</li>
                <li>This guidance will help you craft effective STAR examples that highlight relevant skills.</li>
                <li>You can request new guidance at any time by clicking the Refresh button.</li>
                <li>Choose how many STAR examples you want to include in your pitch (1-4).</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
