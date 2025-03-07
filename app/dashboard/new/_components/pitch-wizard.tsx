/**
@description
A client component implementing a multi-step wizard for creating a pitch.
It has 12 potential steps:
1. RoleStep
2. ExperienceStep
3. GuidanceStep
4. SituationStep (starExample1)
5. TaskStep (starExample1)
6. ActionStep (starExample1)
7. ResultStep (starExample1)
8. SituationStep (starExample2) [only if pitchWordLimit >= 650]
9. TaskStep (starExample2) [only if pitchWordLimit >= 650]
10. ActionStep (starExample2) [only if pitchWordLimit >= 650]
11. ResultStep (starExample2) [only if pitchWordLimit >= 650]
12. ReviewStep (final)
When the user completes the last relevant STAR step, the wizard automatically
generates the final pitch from Albert, displaying a spinner while generating.
Once generation completes, we move to the review step without a manual "Generate"
button. This aligns with the requirement to remove the "Generate Final Pitch" button
and use auto-generation.
@dependencies
- React Hook Form for form state management
- Shadcn UI components for consistent styling
- fetch for calling routes that upload resumes or generate the pitch
- zod for validation
@notes
We handle uploading the resume automatically when leaving Step 2 -> Step 3.
We store the final pitch in pitchContent, which is edited in the final step.
We skip starExample2 if pitchWordLimit < 650.
*/

"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

// Step components
import RoleStep from "./role-step"
import ExperienceStep from "./experience-step"
import GuidanceStep from "./guidance-step"
import SituationStep from "./situation-step"
import TaskStep from "./task-step"
import ActionStep from "./action-step"
import ResultStep from "./result-step"
import ReviewStep from "./review-step"

// UI / hooks
import { Button } from "@/components/ui/button"
import { RefreshCw, Save } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"

import type { SelectPitch } from "@/db/schema/pitches-schema"

/**
 * STAR sub-schema for a single example:
 * Each field must be at least 5 characters (enforced in sub-steps).
 */
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

/**
 * @description
 * pitchWizardSchema:
 *  - userId (set by server)
 *  - roleName, organisationName, roleLevel, pitchWordLimit, roleDescription
 *  - yearsExperience, relevantExperience
 *  - resumePath (Populated after upload)
 *  - albertGuidance (Auto-filled from Step 3)
 *  - starExample1 (always present)
 *  - starExample2 (optional if pitchWordLimit >= 650)
 *  - pitchContent (AI-generated final text)
 *  - selectedFile (the local File object for potential upload in Step 2)
 */
const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
  organisationName: z.string().optional().nullable(),
  roleLevel: z.enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]),
  pitchWordLimit: z.enum(["<500", "<650", "<750", "<1000"]),
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
  selectedFile: z.any().optional().nullable()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
  pitchData?: SelectPitch
}

/**
 * @function PitchWizard
 * The main multi-step wizard for collecting pitch data. Automatically
 * generates the final pitch after the last relevant STAR step. Displays
 * an animated spinner during final pitch generation, then proceeds
 * to the final review step. No manual "Generate Final Pitch" button is used.
 */
export default function PitchWizard({ userId, pitchData }: PitchWizardProps) {
  const { toast } = useToast()
  const router = useRouter()

  // There can be up to 12 steps in total
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 12

  // Helper function to convert numeric pitch word limit to string format
  const formatPitchWordLimit = (limit: number): "<500" | "<650" | "<750" | "<1000" => {
    if (limit <= 500) return "<500";
    if (limit <= 650) return "<650";
    if (limit <= 750) return "<750";
    return "<1000";
  }

  // Helper function to ensure roleLevel is one of the valid enum values
  const validateRoleLevel = (level: string): "APS1" | "APS2" | "APS3" | "APS4" | "APS5" | "APS6" | "EL1" => {
    const validLevels = ["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"];
    return validLevels.includes(level) ? level as any : "APS1";
  }

  // React Hook Form setup
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    mode: "onChange",
    defaultValues: pitchData ? {
      userId,
      roleName: pitchData.roleName,
      roleLevel: validateRoleLevel(pitchData.roleLevel),
      pitchWordLimit: formatPitchWordLimit(pitchData.pitchWordLimit),
      roleDescription: pitchData.roleDescription || "",
      yearsExperience: pitchData.yearsExperience,
      relevantExperience: pitchData.relevantExperience,
      resumePath: pitchData.resumePath || "",
      albertGuidance: "",
      starExample1: pitchData.starExample1 as any || {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: pitchData.starExample2 as any,
      pitchContent: pitchData.pitchContent || "",
      selectedFile: null
    } : {
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

  // State for final pitch generation UI
  const [isGeneratingFinalPitch, setIsGeneratingFinalPitch] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)

  // Helper: watch pitchWordLimit, convert to a numeric so we can do <650 checks
  const watchWordLimit = methods.watch("pitchWordLimit")

  // A function to parse "<500" -> 500, "<650" -> 650, etc.
  function numericLimit(): number {
    const str = watchWordLimit || "<500"
    return parseInt(str.replace("<", ""), 10)
  }

  // If user chooses a limit < 650, we remove starExample2 from form data
  useEffect(() => {
    if (numericLimit() < 650) {
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  /**
   * @function autoUploadResume
   * If the user selected a file in Step 2, we automatically upload it
   * to Supabase when they proceed to Step 3. On success, we store the
   * returned path in resumePath. Then we clear selectedFile from form data.
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
        throw new Error(errorData.error || "Resume upload failed")
      }

      const data = await res.json()
      if (!data.path) {
        throw new Error("No path returned from server")
      }

      // Store path in resumePath
      methods.setValue("resumePath", data.path, {
        shouldDirty: true,
        shouldTouch: true
      })
      // Clear selectedFile so it doesn't upload again on back-and-forth
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
   * @function generateFinalPitch
   * Automatically called once the user finishes the last relevant STAR step
   * (Step 7 if pitchWordLimit < 650, otherwise Step 11).
   * Calls /api/finalPitch with the user's data. On success, updates
   * pitchContent. On failure, sets finalPitchError.
   */
  const generateFinalPitch = useCallback(async () => {
    setFinalPitchError(null)

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
        // Only include starExample2 if pitchWordLimit >= 650
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

      // Save final pitch text
      methods.setValue("pitchContent", result.data, { shouldDirty: true })
    } catch (error: any) {
      setFinalPitchError(error.message)
    } finally {
      setIsGeneratingFinalPitch(false)
    }
  }, [methods])

  /**
   * @function goNext
   * Moves to the next step in the wizard. Performs any step-specific
   * logic or validation. If finishing Step 2, tries to auto-upload resume.
   * If finishing last STAR step, auto-generates final pitch.
   */
  const goNext = useCallback(async () => {
    type FieldName = keyof PitchWizardFormData

    // Minimal per-step validation
    const fieldsToValidate: Record<number, FieldName[]> = {
      1: ["roleName", "roleLevel", "pitchWordLimit", "roleDescription"],
      2: ["yearsExperience", "relevantExperience"],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: []
    }

    const currentFields = fieldsToValidate[currentStep] || []
    const isValid = await methods.trigger(currentFields)

    if (!isValid) {
      // Gather validation errors for the current step
      const { errors } = methods.formState
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

    // Step 2 -> Step 3: Attempt resume upload if user selected a file
    if (currentStep === 2) {
      await autoUploadResume()
    }

    // If finishing Step 7 with limit < 650, auto-generate final pitch -> jump to step 12
    if (currentStep === 7 && numericLimit() < 650) {
      await generateFinalPitch()
      setCurrentStep(12)
      return
    }

    // If finishing Step 11, auto-generate final pitch -> step 12
    if (currentStep === 11) {
      await generateFinalPitch()
      setCurrentStep(12)
      return
    }

    // Otherwise, just increment
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [currentStep, methods, toast, autoUploadResume, numericLimit, generateFinalPitch])

  /**
   * @function goBack
   * Decrements the step counter unless we're already at the first step.
   * Useful in case the user wants to review or correct previous info.
   */
  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  /**
   * @function onSubmit
   * Called at the final step (step 12) to save the pitch into the DB as either
   * "final" if we have pitch content, or "draft" if for some reason pitchContent
   * was missing. We POST to /api/pitchWizard, then redirect to the dashboard.
   */
  const onSubmit = methods.handleSubmit(async (data) => {
    const pitchStatus = data.pitchContent ? "final" : "draft"
    const numeric = parseInt(data.pitchWordLimit.replace("<", ""), 10) || 500

    const payload = {
      userId,
      roleName: data.roleName,
      organisationName: data.organisationName || null,
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

      // Redirect to dashboard instead of resetting the form
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create pitch",
        variant: "destructive"
      })
    }
  })

  /**
   * @function saveAndClose
   * Saves the current pitch data as a draft and redirects to the dashboard.
   * This allows users to save their progress and continue later.
   */
  const saveAndClose = useCallback(async () => {
    const data = methods.getValues();
    const numeric = parseInt(data.pitchWordLimit.replace("<", ""), 10) || 500;

    const payload = {
      userId,
      roleName: data.roleName || "Untitled Pitch",
      organisationName: data.organisationName || null,
      roleLevel: data.roleLevel,
      pitchWordLimit: numeric,
      roleDescription: data.roleDescription || "",
      yearsExperience: data.yearsExperience || "",
      relevantExperience: data.relevantExperience || "",
      resumePath: data.resumePath || null,
      starExample1: data.starExample1 || { situation: "", task: "", action: "", result: "" },
      starExample2: data.starExample2,
      pitchContent: data.pitchContent || "",
      status: "draft"
    };

    try {
      const res = await fetch("/api/pitchWizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded with: ${text}`);
      }

      toast({
        title: "Draft Saved",
        description: "Your pitch has been saved as a draft. You can resume it later."
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save draft",
        variant: "destructive"
      });
    }
  }, [currentStep, methods, router, toast, userId]);

  /**
   * @function renderStep
   * Renders the appropriate sub-component based on currentStep.
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

  /**
   * If we're currently generating the final pitch automatically, display a
   * spinner and short message, omitting any "Retry" button. If there's an error,
   * show it below the spinner. This matches the approach used in guidance-step.
   */
  if (isGeneratingFinalPitch) {
    return (
      <div className="flex flex-col items-center space-y-2 py-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Generating your final pitch with Albert...
        </p>

        {finalPitchError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700 mt-2">
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
        <h2 className="text-xl font-semibold">
          Create New Pitch (Step {currentStep} of {totalSteps})
        </h2>

        <div>{renderStep()}</div>

        {/* Wizard navigation buttons at the bottom */}
        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          <div className="flex space-x-2 ml-auto">
            <Button variant="outline" onClick={saveAndClose}>
              <Save className="h-4 w-4 mr-2" />
              Save and Close
            </Button>
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
      </div>
    </FormProvider>
  )
}