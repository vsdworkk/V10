/**
@description
A client component implementing a multi-step wizard for creating a pitch.
Now extended to handle a second STAR example (starExample2) if pitchWordLimit >= 650.
Steps (total of 12 potential steps):
 1) RoleStep
 2) ExperienceStep
 3) GuidanceStep
 4) SituationStep (starExample1)
 5) TaskStep (starExample1)
 6) ActionStep (starExample1)
 7) ResultStep (starExample1)
 8) SituationStep (starExample2)     [only if pitchWordLimit >= 650]
 9) TaskStep (starExample2)         [only if pitchWordLimit >= 650]
10) ActionStep (starExample2)       [only if pitchWordLimit >= 650]
11) ResultStep (starExample2)       [only if pitchWordLimit >= 650]
12) ReviewStep (final)
If pitchWordLimit < 650, we skip steps 8–11 and go directly from step 7 to step 12.
On final Submit, we gather all data and call /api/pitchWizard. If pitchContent is
present, we mark status "final", otherwise "draft".
@notes
We reuse the same sub-step components (SituationStep, TaskStep, etc.) for starExample2
by passing exampleKey="starExample2". 
We keep the existing logic for auto-upload of resumes (Step 2).
*/

"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import RoleStep from "./role-step"
import ExperienceStep from "./experience-step"
import GuidanceStep from "./guidance-step"
import SituationStep from "./situation-step"
import TaskStep from "./task-step"
import ActionStep from "./action-step"
import ResultStep from "./result-step"
import ReviewStep from "./review-step"

import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"

/**
 * STAR sub-schema for one STAR example:
 * Contains situation, task, action, result, each requiring at least 5 chars.
 */
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

/**
 * pitchWizardSchema
 * - roleName, roleLevel, pitchWordLimit, roleDescription (optional)
 * - yearsExperience, relevantExperience, optional resumePath
 * - albertGuidance for guidance text
 * - starExample1 always present
 * - starExample2 is optional, only used for pitchWordLimit >= 650
 * - pitchContent is the final AI-generated text
 * - selectedFile is a File object for local usage to upload the resume
 */
const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
  roleLevel: z.enum(["APS1","APS2","APS3","APS4","APS5","APS6","EL1"]),
  pitchWordLimit: z.enum(["<500","<650","<750","<1000"]),
  roleDescription: z.string().optional().nullable(),

  yearsExperience: z.string().nonempty("Years of experience is required."),
  relevantExperience: z
    .string()
    .min(10, "Please provide a bit more detail on your experience."),
  resumePath: z.string().optional().nullable(),
  albertGuidance: z.string().optional().nullable(),

  starExample1: starSchema,
  starExample2: z.union([starSchema, z.undefined()]).optional(),

  pitchContent: z.string().optional().nullable(),
  // The user-supplied file, if they uploaded one in Step 2
  selectedFile: z.any().optional().nullable()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
}

export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // We define up to 12 steps (the second STAR example adds 4 steps: 8-11).
  // The final step is step 12.

  const [currentStep, setCurrentStep] = useState(1)

  // For simplicity, let's define the maximum step as 12, but we may skip steps 8–11
  // if the pitchWordLimit < 650.
  const totalSteps = 12

  // Initialize the form
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    mode: "onChange",
    defaultValues: {
      userId,
      roleName: "",
      roleLevel: "APS1",
      pitchWordLimit: "<500",
      roleDescription: "",
      yearsExperience: "",
      relevantExperience: "",
      resumePath: "",
      albertGuidance: "",
      starExample1: {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: undefined,
      pitchContent: "",
      selectedFile: null
    }
  })

  const watchWordLimit = methods.watch("pitchWordLimit")

  // Convert string limit to a numeric for easier checks.
  function numericLimit(): number {
    // example: "<650" -> 650
    const str = watchWordLimit || "<500"
    return parseInt(str.replace("<", ""), 10)
  }

  // If the numeric limit is < 650, we don't need starExample2. So we set starExample2 to undefined.
  // This ensures we don't show those fields in the final data.
  useEffect(() => {
    if (numericLimit() < 650) {
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  /**
   * autoUploadResume:
   * Called when leaving Step 2 -> Step 3. If there's a file in "selectedFile",
   * we POST it to /api/resume-upload, get the path, store in "resumePath".
   */
  const autoUploadResume = async () => {
    const file = methods.getValues("selectedFile")
    const currentUserId = methods.getValues("userId") || "unknown"
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("userId", currentUserId)
      formData.append("file", file)

      const res = await fetch("/api/resume-upload", {
        method: "POST",
        body: formData
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Upload failed")
      }
      const data = await res.json()
      if (!data.path) {
        throw new Error("No path returned from server")
      }

      // Store the path
      methods.setValue("resumePath", data.path, {
        shouldDirty: true,
        shouldTouch: true
      })
      // Clear selectedFile so we don't re-upload if user goes back and forth
      methods.setValue("selectedFile", null)

      toast({
        title: "Resume Uploaded",
        description: "We have stored your resume in Supabase."
      })
    } catch (error: any) {
      toast({
        title: "Error Uploading Resume",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  /**
   * goNext: Advances the wizard to the next step. We do step-specific validations,
   * and if finishing Step 2, we upload the resume if present.
   * Also, if we are finishing step 7 and the numeric limit < 650, skip steps 8–11
   * and jump to step 12. If finishing step 11, go to step 12.
   */
  const goNext = useCallback(async () => {
    type FieldName = keyof PitchWizardFormData

    // We'll define which fields to validate at each step.
    // We have up to 12 steps, but we skip some if needed.
    const fieldsToValidate: Record<number, FieldName[]> = {
      1: ["roleName", "roleLevel", "pitchWordLimit", "roleDescription"],
      2: ["yearsExperience", "relevantExperience"],
      3: [], // Guidance step has no required fields
      4: [], // Because the user is filling "Situation" for starExample1 via sub-component
      5: [],
      6: [],
      7: [], // We'll consider validating starExample1 more thoroughly if needed
      8: [], // starExample2 situation
      9: [],
      10: [],
      11: [], // By the time we get to step 11, starExample2 is nearly done
      12: [] // The final review step doesn't force required fields
    }

    // Validate only the fields in the current step
    const currentFields = fieldsToValidate[currentStep] || []
    const isValid = await methods.trigger(currentFields)
    if (!isValid) {
      // gather errors
      const errors = methods.formState.errors
      const currentStepErrors = Object.entries(errors)
        .filter(([key]) => currentFields.includes(key as FieldName))
        .map(([_, error]) => error?.message)
        .filter(Boolean)

      if (currentStepErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: currentStepErrors.join(", "),
          variant: "destructive"
        })
        return
      }
    }

    // If finishing Step 2, attempt resume upload
    if (currentStep === 2) {
      await autoUploadResume()
    }

    // Now handle skipping logic for second example:
    // If finishing Step 7 (the first STAR example result),
    // and pitchWordLimit < 650, jump directly to step 12 (review).
    if (currentStep === 7 && numericLimit() < 650) {
      setCurrentStep(12)
      return
    }

    // If finishing Step 11 (the last step of starExample2),
    // we jump to step 12 (the review).
    if (currentStep === 11) {
      setCurrentStep(12)
      return
    }

    // Otherwise go next
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [currentStep, methods, toast])

  /**
   * goBack: Moves to the previous step if possible. We do not do advanced skip-back logic
   * to jump from step 12 to step 7, etc. The user can just manually step back if they'd like.
   */
  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  /**
   * onSubmit: Called once the user is at step 12 and clicks "Submit".
   * We parse pitchWordLimit, build a payload, and call /api/pitchWizard.
   * If pitchContent is present, we mark as "final"; otherwise "draft".
   */
  const onSubmit = methods.handleSubmit(async data => {
    const pitchStatus = data.pitchContent ? "final" : "draft"
    const strLimit = data.pitchWordLimit || "<500"
    const numeric = parseInt(strLimit.replace("<", ""), 10) || 500

    const payload = {
      userId,
      roleName: data.roleName,
      roleLevel: data.roleLevel,
      pitchWordLimit: numeric,
      roleDescription: data.roleDescription || "",
      yearsExperience: data.yearsExperience,
      relevantExperience: data.relevantExperience,
      resumePath: data.resumePath || null,
      starExample1: data.starExample1,
      starExample2: data.starExample2,
      pitchContent: data.pitchContent || "",
      status: pitchStatus
    }

    try {
      const res = await fetch("/api/pitchWizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server responded with: ${text}`)
      }

      toast({
        title: pitchStatus === "final" ? "Final Pitch Saved" : "Draft Pitch Saved",
        description: `Your pitch is now stored with status "${pitchStatus}".`
      })

      // reset wizard
      methods.reset()
      setCurrentStep(1)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create pitch",
        variant: "destructive"
      })
    }
  })

  /**
   * Renders the correct step sub-component.
   * We always show steps 1-7. Steps 8-11 are only relevant if pitchWordLimit >= 650,
   * but we won't forcibly hide them; we do skip them in the goNext logic though.
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RoleStep />
      case 2:
        return <ExperienceStep />
      case 3:
        return <GuidanceStep />
      case 4:
        return <SituationStep exampleKey="starExample1" />
      case 5:
        return <TaskStep exampleKey="starExample1" />
      case 6:
        return <ActionStep exampleKey="starExample1" />
      case 7:
        return <ResultStep exampleKey="starExample1" />
      case 8:
        return <SituationStep exampleKey="starExample2" />
      case 9:
        return <TaskStep exampleKey="starExample2" />
      case 10:
        return <ActionStep exampleKey="starExample2" />
      case 11:
        return <ResultStep exampleKey="starExample2" />
      case 12:
        return <ReviewStep />
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">
          Create New Pitch (Step {currentStep} of {totalSteps})
        </h1>

        <div>{renderStep()}</div>

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={goBack}>
              Back
            </Button>
          )}

          {currentStep < 12 && (
            <Button onClick={goNext}>
              Next
            </Button>
          )}

          {currentStep === 12 && (
            <Button type="button" onClick={onSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  )
}