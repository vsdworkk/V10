/**
 * @description
 * Client sub-component for wizard Step (Albert Guidance).
 * This step calls the AI server action `generatePitchAction` with mode = "guidance"
 * to get role-specific suggestions that the user can copy or reference while
 * filling out the STAR examples.
 *
 * Key Features:
 * - Provides a "Get Guidance" button that triggers the AI call if not done yet.
 * - Displays the returned AI suggestions in a text area or read-only block.
 * - Encourages user to read or copy them before proceeding to the next step.
 *
 * @dependencies
 * - React Hook Form for storing "albertGuidance" in the wizard context.
 * - generatePitchAction from "@/actions/ai-actions" for the AI call (invoked via fetch inside the wizard).
 *
 * @notes
 * The user can skip or re-fetch guidance as needed. In real usage, you might handle
 * multiple attempts or refine prompt inputs.
 */

"use client"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"

export default function GuidanceStep() {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // We watch these fields to build the request for guidance:
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const yearsExperience = watch("yearsExperience")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")

  // We also have a local state "albertGuidance" but we can store it in the form context
  // so that it's included if user navigates away/back. We'll store in the form as "albertGuidance"
  const albertGuidance = watch("albertGuidance")

  const handleGetGuidance = async () => {
    try {
      setLoading(true)
      // We'll call the same endpoint used for pitch generation, but with mode = "guidance"
      const response = await fetch("/api/albertGuidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName,
          roleLevel,
          pitchWordLimit,
          yearsExperience,
          relevantExperience,
          roleDescription,
          mode: "guidance"
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || "Failed to fetch guidance")
      }

      const data = await response.json()
      // data structure: { isSuccess, message, data: string }
      if (!data.isSuccess) {
        throw new Error(data.message || "Error generating guidance")
      }

      // Set the returned guidance text into form state
      setValue("albertGuidance", data.data, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false
      })

      toast({
        title: "Guidance Generated",
        description: "Albert's suggestions have been retrieved."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Before filling out your STAR examples, Albert can suggest relevant experiences
        or angles to emphasize based on your role and experience info. Click the button
        below to get role-specific guidance.
      </p>

      <Button onClick={handleGetGuidance} disabled={loading} variant="outline">
        {loading ? "Loading..." : "Get Guidance"}
      </Button>

      {albertGuidance && (
        <div className="space-y-2">
          <label className="font-semibold text-sm">Albert's Guidance:</label>
          <Textarea
            readOnly
            value={albertGuidance}
            className="min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Feel free to copy from this guidance as you complete your STAR examples.
          </p>
        </div>
      )}
    </div>
  )
}