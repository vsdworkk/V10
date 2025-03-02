/**
@description
A client component implementing a multi-step wizard for creating a pitch.
Steps:
1. RoleStep
2. ExperienceStep
3. GuidanceStep
4. StarStep
5. ReviewStep

On final Submit, we gather all data (including pitchContent) and send it to
/api/pitchWizard to create the pitch record. If pitchContent is present,
we mark the pitch as "final"; otherwise, "draft".

@dependencies
- React Hook Form for wizard state
- fetch for calling /api/pitchWizard
- The child steps: role-step, experience-step, guidance-step, star-step, review-step
@notes
We updated Step 2 so that if a user selected a file, we automatically upload
it on "Next". The file is stored in form state as "selectedFile". The
actual upload occurs in the wizard's `goNext()` method if currentStep === 2.
*/
"use client"
import { useCallback, useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import RoleStep from "./role-step"
import ExperienceStep from "./experience-step"
import GuidanceStep from "./guidance-step"
import StarStep from "./star-step"
import ReviewStep from "./review-step"

import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"

// STAR sub-schema for situation, task, action, result
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

/**
@constant pitchWizardSchema
Defines validation for all wizard steps.
- roleLevel is APS1..APS6, EL1
- pitchWordLimit is <500,<650,<750,<1000
- selectedFile is optional (no strict validation)
*/
const pitchWizardSchema = z.object({
  userId: z.string().optional(),

  // Basic role info
  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
  roleLevel: z.enum(["APS1","APS2","APS3","APS4","APS5","APS6","EL1"]),
  pitchWordLimit: z.enum(["<500","<650","<750","<1000"]),
  roleDescription: z.string().optional().nullable(),

  // Experience
  yearsExperience: z.string().nonempty("Years of experience is required."),
  relevantExperience: z
    .string()
    .min(10, "Please provide a bit more detail on your experience."),
  resumePath: z.string().optional().nullable(),

  // Guidance from Albert (not mandatory)
  albertGuidance: z.string().optional().nullable(),

  // STAR examples
  starExample1: starSchema,
  starExample2: z.union([starSchema, z.undefined()]).optional(),

  // The final pitch text from GPT-4o, if generated
  pitchContent: z.string().optional().nullable(),

  /**
   * NEW FIELD:
   * selectedFile: holds the user-selected File object from Step 2.
   * We do not store this in the DB. This is for local usage to upload the file.
   */
  selectedFile: z.any().optional().nullable()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
}

export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // Steps
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Initialize form
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    mode: "onChange",
    defaultValues: {
      userId,
      roleName: "",
      roleLevel: "APS1", // default
      pitchWordLimit: "<500", // Ensure this is a string value
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

  // Clean up starExample2 if user picks <650
  useEffect(() => {
    if (typeof watchWordLimit === "string") {
      const numericLimit = parseInt(watchWordLimit.substring(1), 10)
      if (numericLimit < 650) {
        methods.setValue("starExample2", undefined)
      }
    }
  }, [watchWordLimit, methods])

  /**
   * @function autoUploadResume
   * Called when user is moving from Step 2 -> Step 3, if a file is selected.
   * We'll POST to /api/resume-upload with the userId & file, then store
   * the returned path in "resumePath" if successful.
   */
  const autoUploadResume = async () => {
    const file = methods.getValues("selectedFile")
    const currentUserId = methods.getValues("userId") || "unknown"

    if (!file) {
      return // no file, do nothing
    }

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

      // Save the path into our form
      methods.setValue("resumePath", data.path, {
        shouldDirty: true,
        shouldTouch: true
      })

      // Clear the selectedFile to avoid re-uploading if user goes back
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
   * @function goNext
   * Advances the wizard to the next step, performing step-specific validations
   * and handling resume upload if the user is leaving Step 2.
   */
  const goNext = useCallback(async () => {
    type FieldName = keyof PitchWizardFormData
    // define which fields to validate on each step
    const fieldsToValidate: Record<number, FieldName[]> = {
      1: ["roleName", "roleLevel", "pitchWordLimit", "roleDescription"],
      2: ["yearsExperience", "relevantExperience"],
      3: [], // Guidance step has no required fields
      4: ["starExample1", "starExample2"],
      5: [] // Review step
    }

    const currentFields = fieldsToValidate[currentStep] || []
    const isValid = await methods.trigger(currentFields)
    if (!isValid) {
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

    // If we are just finishing Step 2, auto-upload resume if present
    if (currentStep === 2) {
      await autoUploadResume()
    }

    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [methods, toast, currentStep])

  /**
   * @function goBack
   * Moves to the previous step, if possible.
   */
  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  /**
   * @function onSubmit
   * Final submission logic. Sends all wizard data to /api/pitchWizard.
   * If pitchContent is filled, we mark status "final"; otherwise "draft".
   * Also parse the string pitchWordLimit to a numeric integer.
   */
  const onSubmit = methods.handleSubmit(async data => {
    const pitchStatus = data.pitchContent ? "final" : "draft"
    const numericLimit =
      typeof data.pitchWordLimit === "string"
        ? parseInt(data.pitchWordLimit.substring(1), 10)
        : 500 // fallback

    const payload = {
      userId,
      roleName: data.roleName,
      roleLevel: data.roleLevel,
      pitchWordLimit: numericLimit,
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

      // Reset form & wizard
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
   * Renders the appropriate step component
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
        return <StarStep />
      case 5:
        return <ReviewStep />
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Create New Pitch (Step {currentStep} of {totalSteps})
        </h2>

        <div>{renderStep()}</div>

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          {currentStep < totalSteps && (
            <Button onClick={goNext}>
              Next
            </Button>
          )}
          {currentStep === totalSteps && (
            <Button type="button" onClick={onSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  )
}