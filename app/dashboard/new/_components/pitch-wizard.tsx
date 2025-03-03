/**
@description
A client component implementing a multi-step wizard for creating a pitch.
Now we remove the "Generate Final Pitch" button from the final step and
automatically generate the pitch after the last STAR sub-step. During the
generation, we display a spinner. Once the pitch is fetched, we navigate
the user to the final review step (step 12).
Steps (total of 12 potential steps):
1.  RoleStep
2.  ExperienceStep
3.  GuidanceStep
4.  SituationStep (starExample1)
5.  TaskStep (starExample1)
6.  ActionStep (starExample1)
7.  ResultStep (starExample1)
8.  SituationStep (starExample2) [only if pitchWordLimit >= 650]
9.  TaskStep (starExample2) [only if pitchWordLimit >= 650]
10. ActionStep (starExample2) [only if pitchWordLimit >= 650]
11. ResultStep (starExample2) [only if pitchWordLimit >= 650]
12. ReviewStep (final)

On completing step 7 (if pitchWordLimit < 650) or step 11 (if >= 650),
we auto-generate the final pitch by calling /api/finalPitch before
moving to step 12.

@notes
We follow the project rule of returning the complete file.

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
 * roleName, roleLevel, pitchWordLimit, roleDescription (optional)
 * yearsExperience, relevantExperience, optional resumePath
 * albertGuidance for guidance text
 * starExample1 always present
 * starExample2 is optional, only used for pitchWordLimit >= 650
 * pitchContent is the final AI-generated text
 * selectedFile is a File object for local usage to upload the resume
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

/**
 * @function PitchWizard
 * The main multi-step wizard for collecting pitch data.
 * We handle:
 *   - steps 1-3 for role & experience
 *   - up to 2 STAR examples (1 or 2 depending on pitchWordLimit)
 *   - final pitch generation is now automatic after the last STAR step
 *   - final step 12: review & editing
 */
export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // We define up to 12 steps. The second STAR example is conditionally shown.
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 12

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

  // Additional states for auto-generation
  const [isGeneratingFinalPitch, setIsGeneratingFinalPitch] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)

  // Watch pitchWordLimit
  const watchWordLimit = methods.watch("pitchWordLimit")

  // Convert string limit to numeric
  function numericLimit(): number {
    const str = watchWordLimit || "<500"
    // e.g. "<650" => parseInt("650", 10)
    return parseInt(str.replace("<", ""), 10)
  }

  // If user picks a limit < 650, we do not use starExample2
  useEffect(() => {
    if (numericLimit() < 650) {
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  /**
   * autoUploadResume
   * Called when leaving Step 2 -> Step 3. If there's a file in "selectedFile",
   * we POST it to /api/resume-upload, get the path, and store in "resumePath".
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
      methods.setValue("resumePath", data.path, {
        shouldDirty: true,
        shouldTouch: true
      })

      // Clear selectedFile so we don't re-upload if user toggles back/next
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
   * generateFinalPitch
   * Helper that calls /api/finalPitch with the user’s data.
   * On success, it sets pitchContent in form state. On failure, sets an error.
   */
  const generateFinalPitch = useCallback(async () => {
    setFinalPitchError(null)
    // Gather wizard data
    const {
      roleName,
      roleLevel,
      pitchWordLimit,
      roleDescription,
      yearsExperience,
      relevantExperience,
      starExample1,
      starExample2
    } = methods.getValues()

    try {
      setIsGeneratingFinalPitch(true)

      const bodyData = {
        roleName,
        roleLevel,
        pitchWordLimit,
        roleDescription: roleDescription || "",
        yearsExperience,
        relevantExperience,
        starExample1,
        // starExample2 only if user provided it (pitchWordLimit >= 650)
        starExample2: numericLimit() >= 650 ? starExample2 : undefined
      }

      const res = await fetch("/api/finalPitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to fetch final pitch")
      }
      const result = await res.json()
      if (!result.isSuccess) {
        throw new Error(result.message || "Error generating final pitch")
      }

      // Insert final text
      methods.setValue("pitchContent", result.data, { shouldDirty: true })
    } catch (error: any) {
      setFinalPitchError(error.message)
    } finally {
      setIsGeneratingFinalPitch(false)
    }
  }, [methods, numericLimit])

  /**
   * goNext
   * The main "Next" button logic. We do step-specific validation and tasks (upload resume,
   * auto-generate final pitch if this is the last STAR sub-step), then move on.
   */
  const goNext = useCallback(async () => {
    type FieldName = keyof PitchWizardFormData
    // Minimal validation for each step:
    const fieldsToValidate: Record<number, FieldName[]> = {
      1: ["roleName", "roleLevel", "pitchWordLimit", "roleDescription"],
      2: ["yearsExperience", "relevantExperience"],
      3: [], // Guidance step has no required fields
      4: [], // situationStep for starExample1
      5: [], // taskStep for starExample1
      6: [], // actionStep for starExample1
      7: [], // resultStep for starExample1
      8: [], // situationStep for starExample2
      9: [], // taskStep for starExample2
      10: [], // actionStep for starExample2
      11: [], // resultStep for starExample2
      12: [] // final review step
    }

    const currentFields = fieldsToValidate[currentStep] || []
    const isValid = await methods.trigger(currentFields)
    if (!isValid) {
      const errors = methods.formState.errors
      const currentStepErrors = Object.entries(errors)
        .filter(([key]) => currentFields.includes(key as FieldName))
        .map(([_, err]) => err?.message)
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

    // If finishing Step 7 with limit < 650, auto-generate final pitch, then jump to step 12
    if (currentStep === 7 && numericLimit() < 650) {
      await generateFinalPitch()
      setCurrentStep(12)
      return
    }

    // If finishing Step 11, auto-generate final pitch, then step 12
    if (currentStep === 11) {
      await generateFinalPitch()
      setCurrentStep(12)
      return
    }

    // Otherwise just proceed
    setCurrentStep((s) => Math.min(s + 1, totalSteps))
  }, [
    currentStep,
    methods,
    toast,
    autoUploadResume,
    numericLimit,
    generateFinalPitch
  ])

  /**
   * goBack
   * Move to the previous step if possible. We do not skip logic here, user can backtrack
   * to review or fix fields.
   */
  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }, [])

  /**
   * onSubmit
   * Called once the user is at the final step (step 12) and clicks "Submit".
   * We post all data to /api/pitchWizard to store the pitch. If pitchContent is present, we
   * mark it final; otherwise "draft".
   */
  const onSubmit = methods.handleSubmit(async (data) => {
    const pitchStatus = data.pitchContent ? "final" : "draft"
    const numeric = parseInt(data.pitchWordLimit.replace("<", ""), 10) || 500

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
      // Reset wizard
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

  // Renders the correct sub-step
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

  // If we’re generating the final pitch, show a spinner / loading UI
  // similar to guidance-step
  if (isGeneratingFinalPitch) {
    return (
      <div className="flex flex-col items-center space-y-2 py-10">
        <svg
          className="h-8 w-8 animate-spin text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>

        <p className="text-sm text-muted-foreground">
          Retrieving your final pitch from Albert...
        </p>

        {finalPitchError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            <p className="text-sm font-semibold">Error:</p>
            <p className="text-sm">{finalPitchError}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">
          Create New Pitch (Step {currentStep} of {totalSteps})
        </h1>

        <div>{renderStep()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={goBack}>
              Back
            </Button>
          )}

          {currentStep < 12 && (
            <Button onClick={goNext}>Next</Button>
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