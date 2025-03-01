/**
 * @description
 * Client sub-component for wizard Step 5: Review & Final Pitch Generation.
 * 
 * Key Features:
 * - Shows a summary of all user inputs (Role, Experience, STAR).
 * - "Generate Final Pitch" button calls the new /api/finalPitch route (mode="pitch").
 * - Renders an editable text area for `pitchContent` if AI pitch is generated.
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
import { useState } from "react"
import { useToast } from "@/lib/hooks/use-toast"

export default function ReviewStep() {
  const { getValues, watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  // For local loading state on the "Generate Final Pitch" button
  const [generating, setGenerating] = useState(false)

  const data = getValues()
  const pitchContent = watch("pitchContent")

  // Handler to call the final pitch API
  async function handleGenerateFinalPitch() {
    try {
      setGenerating(true)
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
          {generating ? "Generating..." : "Generate Final Pitch"}
        </Button>
      </div>

      {/* If we have pitchContent, show it in a text area for user editing */}
      {pitchContent && (
        <div className="mt-4 space-y-2">
          <label className="font-semibold text-sm">Final Pitch (Editable):</label>
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