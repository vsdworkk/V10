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
import { motion } from "framer-motion"

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
import { RefreshCw, Save, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import { cn } from "@/lib/utils"

import type { SelectPitch } from "@/db/schema/pitches-schema"
import { useStepContext } from "./progress-bar-wrapper"

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

// Step titles for the progress indicator
const stepTitles = [
  "Role Information",
  "Experience",
  "Guidance",
  "Situation (Example 1)",
  "Task (Example 1)",
  "Action (Example 1)",
  "Result (Example 1)",
  "Situation (Example 2)",
  "Task (Example 2)",
  "Action (Example 2)",
  "Result (Example 2)",
  "Review & Submit"
]

export default function PitchWizard({ userId, pitchData }: PitchWizardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { setCurrentStep, setTotalSteps } = useStepContext()
  const [currentStepLocal, setCurrentStepLocal] = useState(1)
  const [isGeneratingFinalPitch, setIsGeneratingFinalPitch] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Helper function to convert numeric pitch word limit to string format
  const formatPitchWordLimit = (limit: number): "<500" | "<650" | "<750" | "<1000" => {
    if (limit < 500) return "<500"
    if (limit < 650) return "<650"
    if (limit < 750) return "<750"
    return "<1000"
  }

  // Helper function to ensure roleLevel is one of the valid enum values
  const validateRoleLevel = (level: string): "APS1" | "APS2" | "APS3" | "APS4" | "APS5" | "APS6" | "EL1" => {
    const validLevels = ["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]
    return validLevels.includes(level) ? (level as any) : "APS4"
  }

  // Initialize form with default values or existing pitch data
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: pitchData
      ? {
          userId: pitchData.userId,
          roleName: pitchData.roleName,
          organisationName: pitchData.organisationName || "",
          roleLevel: validateRoleLevel(pitchData.roleLevel),
          pitchWordLimit: formatPitchWordLimit(pitchData.pitchWordLimit),
          roleDescription: pitchData.roleDescription || "",
          yearsExperience: pitchData.yearsExperience,
          relevantExperience: pitchData.relevantExperience,
          resumePath: pitchData.resumePath || "",
          albertGuidance: pitchData.pitchContent || "", // Using pitchContent as albertGuidance
          starExample1: pitchData.starExample1 as any || {
            situation: "",
            task: "",
            action: "",
            result: ""
          },
          starExample2: pitchData.starExample2 ? (pitchData.starExample2 as any) : undefined,
          pitchContent: pitchData.pitchContent || "",
          selectedFile: null
        }
      : {
          userId,
          roleName: "",
          organisationName: "",
          roleLevel: "APS4",
          pitchWordLimit: "<650",
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

  // Helper: watch pitchWordLimit, convert to a numeric so we can do <650 checks
  const watchWordLimit = methods.watch("pitchWordLimit")
  
  // A function to parse "<500" -> 500, "<650" -> 650, etc.
  const numericLimit = () => {
    const limit = watchWordLimit || "<500"
    switch (limit) {
      case "<500":
        return 500
      case "<650":
        return 650
      case "<750":
        return 750
      case "<1000":
        return 1000
      default:
        return 650
    }
  }

  // Calculate total steps based on word limit
  const totalSteps = numericLimit() >= 650 ? 12 : 8
  
  // For convenience, alias the local state to the name used throughout the component
  const currentStep = currentStepLocal
  
  // Update the context whenever local state changes
  useEffect(() => {
    setCurrentStep(currentStep)
    setTotalSteps(totalSteps)
  }, [currentStep, totalSteps, setCurrentStep, setTotalSteps])

  // If user chooses a limit < 650, we remove starExample2 from form data
  useEffect(() => {
    if (numericLimit() < 650) {
      const currentData = methods.getValues()
      if (currentData.starExample2) {
        methods.setValue("starExample2", undefined)
      }
    }
  }, [watchWordLimit, methods])

  /**
   * @function autoUploadResume
   * Automatically uploads the resume when moving from Step 2 -> Step 3.
   * This is called in the goNext function.
   */
  const autoUploadResume = async () => {
    const selectedFile = methods.getValues("selectedFile")
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("userId", userId)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        throw new Error("Failed to upload resume")
      }

      const data = await res.json()
      methods.setValue("resumePath", data.path)
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully."
      })
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive"
      })
    }
  }

  /**
   * @function generateFinalPitch
   * Generates the final pitch using Albert AI.
   * This is called automatically after completing the last STAR step.
   */
  const generateFinalPitch = async () => {
    setIsGeneratingFinalPitch(true)
    setFinalPitchError(null)

    try {
      const formData = methods.getValues()
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roleName: formData.roleName,
          organisationName: formData.organisationName,
          roleLevel: formData.roleLevel,
          pitchWordLimit: numericLimit(),
          roleDescription: formData.roleDescription,
          yearsExperience: formData.yearsExperience,
          relevantExperience: formData.relevantExperience,
          resumePath: formData.resumePath,
          starExample1: formData.starExample1,
          starExample2: formData.starExample2
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to generate pitch: ${errorText}`)
      }

      const data = await res.json()
      methods.setValue("pitchContent", data.pitch)
    } catch (error: any) {
      setFinalPitchError(error.message || "Failed to generate pitch")
      console.error("Error generating pitch:", error)
    } finally {
      setIsGeneratingFinalPitch(false)
    }
  }

  // Mark current step as completed when moving to next step
  const markStepCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  /**
   * @function goNext
   * Advances to the next step in the wizard.
   * Handles special cases:
   * - Uploading resume when leaving Step 2
   * - Generating final pitch after last STAR step
   * - Skipping starExample2 steps if pitchWordLimit < 650
   */
  const goNext = useCallback(async () => {
    const isValid = await methods.trigger()
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive"
      })
      return
    }

    // Special case: Upload resume when leaving Step 2
    if (currentStep === 2) {
      await autoUploadResume()
    }

    // Special case: Generate final pitch after last STAR step for Example 1
    // if the word limit is < 650
    if (currentStep === 7 && numericLimit() < 650) {
      await generateFinalPitch()
      setCurrentStepLocal(12)
      return
    }

    // Special case: Generate final pitch after last STAR step for Example 2
    if (currentStep === 11) {
      await generateFinalPitch()
      setCurrentStepLocal(12)
      return
    }

    // Otherwise, just increment
    setCurrentStepLocal(s => Math.min(s + 1, totalSteps))
    markStepCompleted(currentStep)
  }, [currentStep, methods, toast, autoUploadResume, numericLimit, generateFinalPitch, totalSteps])

  /**
   * @function goBack
   * Goes back to the previous step in the wizard.
   */
  const goBack = useCallback(() => {
    setCurrentStepLocal(s => Math.max(s - 1, 1))
  }, [])

  /**
   * @function saveAndClose
   * Saves the current state as a draft and redirects to the dashboard.
   */
  const saveAndClose = useCallback(async () => {
    const data = methods.getValues()
    const numeric = numericLimit()

    // Convert the form data to the format expected by the API
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
      status: "draft"
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
        title: "Draft Saved",
        description: "Your pitch draft has been saved."
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save draft",
        variant: "destructive"
      })
    }
  }, [methods, userId, router, toast, numericLimit])

  /**
   * @function onSubmit
   * Submits the final pitch.
   */
  const onSubmit = useCallback(async () => {
    const data = methods.getValues()
    const numeric = numericLimit()
    const pitchStatus = "final"

    // Convert the form data to the format expected by the API
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
  }, [methods, userId, router, toast, numericLimit])

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
      <div className="flex flex-col items-center space-y-4 py-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h3 className="text-xl font-medium">Creating Your Pitch</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Albert is generating your final pitch based on your inputs. This may take a moment...
        </p>

        {finalPitchError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive mt-4 w-full max-w-md">
            <p className="text-sm font-semibold">Error Occurred:</p>
            <p className="text-sm">{finalPitchError}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        {/* Current step title */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium mb-6 pb-2 border-b">
            {stepTitles[currentStep - 1]}
          </h3>

          {/* Step content with animation */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          {/* Wizard navigation buttons at the bottom */}
          <div className="flex justify-between pt-8 mt-6 border-t">
            {currentStep > 1 ? (
              <Button 
                variant="outline" 
                onClick={goBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div></div> // Empty div to maintain flex spacing
            )}
            
            <div className="flex space-x-3 ml-auto">
              <Button 
                variant="outline" 
                onClick={saveAndClose}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save and Close
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={goNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={onSubmit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Pitch
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}