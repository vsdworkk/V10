/**
 * @description
 * Client sub-component for wizard Step 5: Review & Final Pitch Generation.
 * 
 * Key Features:
 * - Shows a summary of all user inputs (Role, Experience, STAR).
 * - "Generate Final Pitch" button calls the new /api/finalPitch route (mode="pitch").
 * - Renders an editable text area for `pitchContent` if AI pitch is generated.
 * - Detects changes in form data using a key-hash approach.
 * - Provides manual refresh option for users.
 * 
 * @dependencies
 * - React Hook Form: to get the wizard data and set pitchContent
 * - fetch API: to call /api/finalPitch
 * - Shadcn UI (Button, Textarea) for styling
 * 
 * @notes
 * The actual saving to the DB happens in the wizard's final submit,
 * which includes the `pitchContent` in the payload.
 */

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function ReviewStep() {
  const { getValues, watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  // For local loading state on the "Generate Final Pitch" button
  const [generating, setGenerating] = useState(false)
  const [dataChanged, setDataChanged] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const data = getValues()
  const pitchContent = watch("pitchContent")
  
  // Watch all relevant fields that would affect the pitch
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const roleDescription = watch("roleDescription")
  const yearsExperience = watch("yearsExperience")
  const relevantExperience = watch("relevantExperience")
  const starExample1 = watch("starExample1")
  const starExample2 = watch("starExample2")
  
  // Create a key to represent the current state of all inputs
  const formDataKey = `${roleName}|${roleLevel}|${pitchWordLimit}|${yearsExperience}|${relevantExperience && relevantExperience.slice(0, 50)}|${roleDescription && roleDescription.slice(0, 50)}|${JSON.stringify(starExample1)}|${JSON.stringify(starExample2)}`
  const lastGenerationKeyRef = useRef<string>("")

  // Initialize component
  useEffect(() => {
    setHasInitialized(true)
  }, [])

  // Check for changes in the form data
  useEffect(() => {
    // Skip the first render
    if (!hasInitialized) return
    
    // Only check if we already have a pitch content
    if (pitchContent && lastGenerationKeyRef.current) {
      const currentChanged = lastGenerationKeyRef.current !== formDataKey
      
      if (currentChanged) {
        console.log("Pitch data changed:", {
          oldKey: lastGenerationKeyRef.current.slice(0, 50),
          newKey: formDataKey.slice(0, 50)
        })
        setDataChanged(true)
      }
    }
  }, [pitchContent, formDataKey, hasInitialized])

  // Handler to call the final pitch API
  async function handleGenerateFinalPitch() {
    try {
      setGenerating(true)
      setDataChanged(false)
      
      // build request body from wizard data
      const response = await fetch("/api/finalPitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName: data.roleName,
          roleLevel: data.roleLevel,
          pitchWordLimit: data.pitchWordLimit,
          roleDescription: data.roleDescription,
          yearsExperience: data.yearsExperience,
          relevantExperience: data.relevantExperience,
          starExample1: data.starExample1,
          starExample2: data.starExample2
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || "Failed to fetch final pitch")
      }

      const result = await response.json()
      if (!result.isSuccess) {
        throw new Error(result.message || "Error generating final pitch")
      }

      // The AI pitch text is in result.data
      setValue("pitchContent", result.data, { shouldDirty: true })
      
      // Update last generation key after successful generation
      lastGenerationKeyRef.current = formDataKey
      
      toast({
        title: "Final Pitch Generated",
        description: "Albert has created a complete pitch using your data."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate final pitch",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review Your Data</h2>

      <div className="text-sm space-y-2">
        <p>
          <strong>Role Name:</strong> {data.roleName}
        </p>
        <p>
          <strong>Role Level:</strong> {data.roleLevel}
        </p>
        <p>
          <strong>Word Limit:</strong> {data.pitchWordLimit}
        </p>
        <p>
          <strong>Role Description:</strong> {data.roleDescription}
        </p>
        <p>
          <strong>Years of Experience:</strong> {data.yearsExperience}
        </p>
        <p>
          <strong>Relevant Experience:</strong> {data.relevantExperience}
        </p>
      </div>

      {/* STAR Example 1 */}
      <div className="text-sm space-y-1">
        <p className="font-semibold">STAR Example 1:</p>
        <p>
          <strong>Situation:</strong> {data.starExample1.situation}
        </p>
        <p>
          <strong>Task:</strong> {data.starExample1.task}
        </p>
        <p>
          <strong>Action:</strong> {data.starExample1.action}
        </p>
        <p>
          <strong>Result:</strong> {data.starExample1.result}
        </p>
      </div>

      {/* STAR Example 2 (if present) */}
      {data.starExample2 && (
        <div className="text-sm space-y-1">
          <p className="font-semibold">STAR Example 2:</p>
          <p>
            <strong>Situation:</strong> {data.starExample2.situation}
          </p>
          <p>
            <strong>Task:</strong> {data.starExample2.task}
          </p>
          <p>
            <strong>Action:</strong> {data.starExample2.action}
          </p>
          <p>
            <strong>Result:</strong> {data.starExample2.result}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Click "Generate Final Pitch" to have Albert produce a complete APS pitch
          from the above details. You can then edit the resulting text before saving.
        </p>

        <Button onClick={handleGenerateFinalPitch} disabled={generating}>
          {generating ? "Generating..." : dataChanged && pitchContent ? "Regenerate Final Pitch" : "Generate Final Pitch"}
        </Button>
      </div>

      {/* Warning if data has changed since last generation */}
      {dataChanged && pitchContent && (
        <div className="rounded-md bg-amber-50 p-3 border border-amber-200 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Your information has changed since the pitch was generated. Please regenerate the pitch to reflect your latest information.
          </p>
        </div>
      )}

      {/* If we have pitchContent, show it in a text area for user editing */}
      {pitchContent && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-sm">Final Pitch (Editable):</label>
            {dataChanged && (
              <Button 
                onClick={handleGenerateFinalPitch} 
                variant="outline" 
                size="sm"
                disabled={generating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Pitch
              </Button>
            )}
          </div>
          <Textarea
            value={pitchContent}
            onChange={e => setValue("pitchContent", e.target.value, { shouldDirty: true })}
            className="min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            You can refine any wording before submitting.
          </p>
        </div>
      )}
    </div>
  )
}