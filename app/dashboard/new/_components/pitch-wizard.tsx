/**
@description
A client component implementing a multi-step wizard for creating a pitch.
It dynamically computes how many steps are necessary:
If pitchWordLimit < 650, we only use one STAR example (8 total steps).
If pitchWordLimit >= 650, we use two STAR examples (12 total steps).

It displays the correct "(current step) of (total steps)" header in the UI.

Key Features:
1. Step-by-step forms for role info, experience, AI guidance, 1 or 2 STAR examples, and review.
2. Automatically uploads resume (if selected) on leaving Experience step.
3. Automatically generates the final pitch once the last STAR example is completed (step 7
   or step 11).
4. Dynamic final step count is either 8 (<650) or 12 (>=650).
5. The final step is a ReviewStep where the user can edit the pitch text and then Submit it
   to the DB.

@dependencies
React Hook Form for form state management.
Shadcn UI components for consistent styling.
Server routes (/api/resume-upload, /api/albertGuidance, /api/finalPitch, /api/pitchWizard).
Framer Motion for potential animations (not heavily used here).

@notes
This implements Step 1 from the enhancement plan: "Dynamically Compute Wizard
Steps & Show Correct Header."
If the user is on step 7 and pitchWordLimit < 650, we auto-generate the pitch, then
proceed to step 8, which becomes the review step (total steps = 8).
If pitchWordLimit >= 650, we go from step 7 to step 8..11 for the second STAR example,
then step 12 is the review.
*/
"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
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
import { RefreshCw } from "lucide-react"

/*
STAR sub-schema for a single example:
Each field must be at least 5 characters (enforced in sub-steps).
*/
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

/**
@description
pitchWizardSchema:
- userId (set by the server layout)
- roleName, roleLevel, pitchWordLimit, roleDescription
- yearsExperience, relevantExperience
- resumePath (populated after upload)
- albertGuidance (auto-filled from Step 3)
- starExample1 (always present)
- starExample2 (only if pitchWordLimit >= 650)
- pitchContent (AI-generated final text)
- selectedFile (the local File object for potential upload in Step 2)
*/
const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
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
}

/*
Helper to convert the string value of pitchWordLimit to a numeric for logic.
*/
function parseLimitValue(limitStr: string): number {
  // e.g. "<500" => 500
  // e.g. "<650" => 650
  // e.g. "<750" => 750
  // e.g. "<1000" => 1000
  return parseInt(limitStr.replace("<", ""), 10) || 500
}

/**
Helper to compute total steps.
If pitchWordLimit < 650 => 8 steps total
Otherwise => 12 steps total
*/
function getTotalSteps(numericLimit: number): number {
  if (numericLimit < 650) {
    return 8
  } else {
    return 12
  }
}

/**
@function PitchWizard
The main multi-step wizard for collecting pitch data. We:
1. Gather role info (Step 1).
2. Gather experience + optional resume (Step 2).
3. Show AI Guidance (Step 3).
4. STAR Example 1: situation (Step 4).
5. STAR Example 1: task (Step 5).
6. STAR Example 1: action (Step 6).
7. STAR Example 1: result (Step 7).

   If pitchWordLimit < 650, auto-generate final pitch, then go to step 8 (review).
8-11. STAR Example 2 (if pitchWordLimit >= 650).
12. Final Review step.

We display "Create New Pitch (Step X of Y)" at the top, where Y is dynamic (8 or 12).
*/
export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()
  const router = useRouter()

  // React Hook Form setup
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
  const numericLimit = parseLimitValue(watchWordLimit)

  const [currentStep, setCurrentStep] = useState(1)

  // Dynamically compute totalSteps whenever the user changes pitchWordLimit
  const [totalSteps, setTotalSteps] = useState(getTotalSteps(numericLimit))
  useEffect(() => {
    setTotalSteps(getTotalSteps(numericLimit))
    // If the user has changed word limit mid-wizard and the currentStep is
    // beyond the new totalSteps, reset to the last valid step.
    setCurrentStep(oldStep =>
      oldStep > getTotalSteps(numericLimit) ? getTotalSteps(numericLimit) : oldStep
    )
  }, [watchWordLimit, numericLimit])

  // State for final pitch generation UI
  const [isGeneratingFinalPitch, setIsGeneratingFinalPitch] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)

  /**
  @function autoUploadResume
  If the user selected a file in Step 2, we automatically upload it
  to Supabase when they proceed from Step 2 -> Step 3. On success, we store the
  returned path in resumePath, then clear selectedFile from form data.
  We also append the parsedText to relevantExperience.
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

      methods.setValue("resumePath", data.path, {
        shouldDirty: true,
        shouldTouch: true
      })
      methods.setValue("selectedFile", null)

      // STEP 4: Append parsedText to relevantExperience
      const parsedText = data.parsedText || ""
      if (parsedText) {
        const existingExp = methods.getValues("relevantExperience") || ""
        methods.setValue("relevantExperience", existingExp + "\n\n" + parsedText, {
          shouldDirty: true,
          shouldTouch: true
        })
      }

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
  @function generateFinalPitch
  Automatically called once the user finishes the last STAR step needed:
  - If numericLimit < 650, after step 7.
  - If numericLimit >= 650, after step 11.

  Calls /api/finalPitch with the user's data. On success, updates pitchContent.
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
        starExample2: parseLimitValue(pitchWordLimit) >= 650 ? starExample2 : undefined
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

      methods.setValue("pitchContent", result.data, { shouldDirty: true })
    } catch (error: any) {
      setFinalPitchError(error.message)
    } finally {
      setIsGeneratingFinalPitch(false)
    }
  }, [methods])

  /**
  @function goNext
  Moves to the next step in the wizard, performing per-step validation or logic.
  - Step 2 -> Step 3: try to upload resume if the user selected one.
  - Step 7 (<650): auto-generate final pitch, then jump to step 8 (review).
  - Step 11 (>=650): auto-generate final pitch, then jump to step 12 (review).
  */
  const goNext = useCallback(async () => {
    // Minimal per-step validation
    type FieldName = keyof PitchWizardFormData
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

    // Step 2 -> Step 3
    if (currentStep === 2) {
      await autoUploadResume()
    }

    // If finishing Step 7 and limit < 650 => generate pitch, go to step 8 (final review)
    if (currentStep === 7 && numericLimit < 650) {
      await generateFinalPitch()
      setCurrentStep(8)
      return
    }

    // If finishing Step 11 => auto-generate final pitch -> step 12
    if (currentStep === 11) {
      // This only truly applies if numericLimit >= 650 anyway
      await generateFinalPitch()
      setCurrentStep(12)
      return
    }

    // Otherwise, just increment normally (unless we are already at totalSteps)
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [
    currentStep,
    methods,
    toast,
    autoUploadResume,
    generateFinalPitch,
    numericLimit,
    totalSteps
  ])

  /*
  @function goBack
  Moves the user back to the previous step, unless already at step 1.
  */
  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  /*
  @function onSubmit
  Called at the final step (step = totalSteps) to save the pitch into the DB.
  We do a POST to /api/pitchWizard with status "final" (if pitchContent exists)
  or "draft" otherwise. Then we redirect the user back to the dashboard.
  */
  const onSubmit = methods.handleSubmit(async data => {
    const pitchStatus = data.pitchContent ? "final" : "draft"
    const numeric = parseLimitValue(data.pitchWordLimit)

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
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create pitch",
        variant: "destructive"
      })
    }
  })

  /*
  Renders the correct sub-component based on the currentStep.
  We skip starExample2 steps if numericLimit < 650, but they remain in the switch
  so we can handle numericLimit >= 650 scenarios.
  */
  const renderStep = () => {
    // If we're currently generating final pitch automatically, show spinner
    if (isGeneratingFinalPitch) {
      return (
        <div className="py-4 text-center">
          <RefreshCw className="mb-2 inline-block h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Generating your final pitch with Albert...
          </p>
          {finalPitchError && (
            <div className="mt-2 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-600">
              <strong>Error:</strong> {finalPitchError}
            </div>
          )}
        </div>
      )
    }

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
        // If numericLimit < 650, this is the final Review step
        // If numericLimit >= 650, this is starExample2 -> situation
        if (numericLimit < 650) {
          return <ReviewStep />
        } else {
          return <SituationStep exampleKey="starExample2" />
        }
      case 9:
        return <TaskStep exampleKey="starExample2" />
      case 10:
        return <ActionStep exampleKey="starExample2" />
      case 11:
        return <ResultStep exampleKey="starExample2" />
      case 12:
        return <ReviewStep />
      default:
        return <div className="text-sm text-red-500">Invalid Step</div>
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">
          Create New Pitch (Step {currentStep} of {totalSteps})
        </h1>

        <div>{renderStep()}</div>

        {/* Wizard navigation buttons */}
        <div className="mt-6 flex justify-between">
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

          {/* If we are at the final step, show "Submit" */}
          {currentStep === totalSteps && (
            <Button type="button" onClick={() => void onSubmit()}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  )
}