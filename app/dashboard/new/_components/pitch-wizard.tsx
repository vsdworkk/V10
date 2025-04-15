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
import { RefreshCw, Save, ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"

import type { SelectPitch } from "@/db/schema/pitches-schema"
import { useStepContext } from "./progress-bar-wrapper"

/**
 * A single Action step in the STAR "Action" array.
 */
const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": z.string(),
  "how-did-you-do-it-tools-methods-or-skills": z.string(),
  "what-was-the-outcome-of-this-step-optional": z.string().optional()
})

/**
 * A single STAR Example schema.
 * Updated to remove certain fields (why-was-this-a-problem, how-would-completing, what-did-you-learn).
 */
const starExampleSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z
      .string()
      .min(5, "Please provide where and when this occurred."),
    "briefly-describe-the-situation-or-challenge-you-faced": z
      .string()
      .min(5, "Please describe the situation or challenge.")
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z
      .string()
      .min(5, "Please describe your responsibility."),
    "what-constraints-or-requirements-did-you-need-to-consider": z
      .string()
      .min(5, "Please describe any constraints.")
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1, "Please add at least one action step.")
  }),
  result: z.object({
    "what-positive-outcome-did-you-achieve": z
      .string()
      .min(5, "Please describe the outcome you achieved."),
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z
      .string()
      .min(5, "Please explain the benefits.")
  })
})

/**
 * Main wizard form schema.
 * Removed yearsExperience, resumePath, and selectedFile fields.
 */
const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z.string().min(2, "Role name must be at least 2 characters."),
  organisationName: z.string().optional(),
  roleLevel: z.enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]),
  pitchWordLimit: z.number().min(400, "Word limit must be at least 400 words."),
  roleDescription: z.string().optional(),
  relevantExperience: z.string().min(10, "Please provide more detail on your experience."),
  albertGuidance: z.string().optional(),

  // The user can pick 1..N examples in Guidance
  starExamplesCount: z.enum(["1","2","3","4","5","6","7","8","9","10"]).default("1"),

  // The new approach: an array of examples
  starExamples: z.array(starExampleSchema).min(1, "At least one STAR example is required."),

  // The final text content from the AI
  pitchContent: z.string().optional()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
  pitchData?: SelectPitch
}

export default function PitchWizard({ userId, pitchData }: PitchWizardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { setCurrentStep, setTotalSteps } = useStepContext()

  const [currentStepLocal, setCurrentStepLocal] = useState(1)
  const [isGeneratingFinalPitch, setIsGeneratingFinalPitch] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)

  const [pitchId, setPitchId] = useState<string | undefined>(pitchData?.id)
  
  // Initialize the form
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: mapExistingDataToDefaults(userId, pitchData),
    mode: "onChange"
  })

  // Watch how many STAR examples the user wants
  const watchStarExamplesCount = methods.watch("starExamplesCount")
  const starCount = parseInt(watchStarExamplesCount || "1", 10)

  // We'll compute total steps:
  //  - Steps 1..3: Role, Experience, Guidance
  //  - Then 4 steps (Situation/Task/Action/Result) per STAR example
  //  - Then 1 final review step
  const totalSteps = 3 + (starCount * 4) + 1

  // Update the context with current step / total steps
  useEffect(() => {
    setCurrentStep(currentStepLocal)
    setTotalSteps(totalSteps)
  }, [currentStepLocal, totalSteps, setCurrentStep, setTotalSteps])

  /**
   * Renders the appropriate sub-component for each step.
   */
  function renderStep() {
    // Steps 1..3 are static
    if (currentStepLocal === 1) return <RoleStep />
    if (currentStepLocal === 2) return <ExperienceStep />
    if (currentStepLocal === 3) return <GuidanceStep />

    // Next, the starExamples sub-steps:
    // The first star sub-step is step #4, the last sub-step is step #3 + starCount*4
    const firstStarStep = 4
    const lastStarStep = 3 + (starCount * 4)

    if (currentStepLocal >= firstStarStep && currentStepLocal <= lastStarStep) {
      const stepInStarRegion = currentStepLocal - firstStarStep // zero-based
      const exampleIndex = Math.floor(stepInStarRegion / 4)  // which STAR example
      const subStepIndex = stepInStarRegion % 4             // 0=Situation,1=Task,2=Action,3=Result

      switch (subStepIndex) {
        case 0:
          return <SituationStep exampleIndex={exampleIndex} />
        case 1:
          return <TaskStep exampleIndex={exampleIndex} />
        case 2:
          return <ActionStep exampleIndex={exampleIndex} />
        case 3:
          return <ResultStep exampleIndex={exampleIndex} />
      }
    }

    // If beyond lastStarStep, it's the final review
    if (currentStepLocal === lastStarStep + 1) {
      return <ReviewStep />
    }

    return null
  }

  /**
   * Next / Back navigation
   */
  const goNext = useCallback(async () => {
    // If the user just finished the final STAR sub-step:
    const lastStarStep = 3 + (starCount * 4)
    if (currentStepLocal === lastStarStep) {
      // Automatically generate the final pitch when moving to the review step
      setIsGeneratingFinalPitch(true)
      setFinalPitchError(null)
      
      try {
        const data = methods.getValues()
        // First save the pitch data as a draft
        await savePitchData(data, pitchId, setPitchId, toast)
        
        // Then generate the pitch using the agent
        const res = await fetch("/api/finalPitch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            roleName: data.roleName,
            roleLevel: data.roleLevel,
            pitchWordLimit: data.pitchWordLimit,
            roleDescription: data.roleDescription || "",
            relevantExperience: data.relevantExperience,
            starExamples: data.starExamples
          })
        })
        
        if (!res.ok) {
          const errText = await res.text()
          throw new Error(errText || "Failed to generate final pitch")
        }
        
        const result = await res.json()
        if (!result.isSuccess) {
          throw new Error(result.message || "Failed to generate final pitch")
        }
        
        // Update the pitch content in the form
        methods.setValue("pitchContent", result.data || "", { shouldDirty: true })
        
        // Move to the review step
        setCurrentStepLocal(lastStarStep + 1)
      } catch (error: any) {
        console.error("Error generating pitch:", error)
        setFinalPitchError(error.message || "An error occurred generating your pitch")
        toast({
          title: "Error",
          description: error.message || "Failed to generate pitch",
          variant: "destructive"
        })
      } finally {
        setIsGeneratingFinalPitch(false)
      }
      return
    }

    // Otherwise just move on
    setCurrentStepLocal((s) => Math.min(s + 1, totalSteps))
  }, [currentStepLocal, starCount, totalSteps, methods, pitchId, setPitchId, toast])

  const goBack = useCallback(() => {
    setCurrentStepLocal((s) => Math.max(s - 1, 1))
  }, [])

  /**
   * Saves the form data as a draft (server call). Then closes the wizard or returns to the dashboard.
   */
  const saveAndClose = useCallback(async () => {
    const data = methods.getValues()
    await savePitchData(data, pitchId, setPitchId, toast)
    // Then redirect or do something
    router.push("/dashboard")
  }, [methods, pitchId, setPitchId, toast, router])

  /**
   * Submits the final pitch (status=final).
   */
  const onSubmit = useCallback(async () => {
    const data = methods.getValues()
    await submitFinalPitch(data, pitchId, setPitchId, toast, router)
  }, [methods, pitchId, setPitchId, toast, router])

  // If we're generating the final pitch automatically, show a spinner
  if (isGeneratingFinalPitch) {
    return (
      <div className="flex flex-col items-center space-y-4 py-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h3 className="text-xl font-medium">Creating Your Pitch</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Generating your final pitch based on your inputs...
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
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Optional Step Title (omit if you prefer) */}
          {currentStepLocal < totalSteps && (
            <h3 className="text-lg font-medium mb-6 pb-2 border-b">
              {generateDynamicStepTitle(currentStepLocal, starCount)}
            </h3>
          )}

          <motion.div
            key={currentStepLocal}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          <div className="flex justify-between pt-8 mt-6 border-t">
            {currentStepLocal > 1 ? (
              <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex space-x-3 ml-auto">
              <Button variant="outline" onClick={saveAndClose} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save and Close
              </Button>

              {currentStepLocal < totalSteps ? (
                <Button onClick={goNext} className="flex items-center gap-2">
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

/**
 * Utility function to map existing pitch data (if any) to the wizard defaults.
 * Removed the yearsExperience, resumePath, and selectedFile references.
 */
function mapExistingDataToDefaults(userId: string, pitchData?: SelectPitch) {
  type RoleLevel = "APS1" | "APS2" | "APS3" | "APS4" | "APS5" | "APS6" | "EL1"
  type StarCount = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"

  const defaultRoleLevel: RoleLevel = "APS4"
  const roleLevels: RoleLevel[] = ["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]

  if (!pitchData) {
    return {
      userId,
      roleName: "",
      organisationName: "",
      roleLevel: defaultRoleLevel,
      pitchWordLimit: 650,
      roleDescription: "",
      relevantExperience: "",
      albertGuidance: "",
      starExamples: [createEmptyStarExample()],
      pitchContent: "",
      starExamplesCount: "1" as StarCount
    }
  }

  // Ensure roleLevel is a valid value from our enum
  let safeRoleLevel: RoleLevel = defaultRoleLevel
  if (pitchData.roleLevel && roleLevels.includes(pitchData.roleLevel as any)) {
    safeRoleLevel = pitchData.roleLevel as RoleLevel
  }

  // Ensure starExamplesCount is a valid string from 1-10
  let safeStarCount: StarCount = "1"
  if (pitchData.starExamplesCount) {
    const countStr = String(pitchData.starExamplesCount)
    if (/^([1-9]|10)$/.test(countStr)) {
      safeStarCount = countStr as StarCount
    }
  }

  return {
    userId: pitchData.userId,
    roleName: pitchData.roleName || "",
    organisationName: pitchData.organisationName || "",
    roleLevel: safeRoleLevel,
    pitchWordLimit: pitchData.pitchWordLimit || 650,
    roleDescription: pitchData.roleDescription || "",
    relevantExperience: pitchData.relevantExperience || "",
    albertGuidance: pitchData.albertGuidance || "",
    starExamples:
      pitchData.starExamples && pitchData.starExamples.length > 0
        ? pitchData.starExamples
        : [createEmptyStarExample()],
    pitchContent: pitchData.pitchContent || "",
    starExamplesCount: safeStarCount
  }
}

/**
 * Creates an empty STAR example with a single empty action step.
 * Removed keys for (why-was-this-a-problem, how-would-completing, what-did-you-learn).
 */
function createEmptyStarExample() {
  return {
    situation: {
      "where-and-when-did-this-experience-occur": "",
      "briefly-describe-the-situation-or-challenge-you-faced": ""
    },
    task: {
      "what-was-your-responsibility-in-addressing-this-issue": "",
      "what-constraints-or-requirements-did-you-need-to-consider": ""
    },
    action: {
      steps: [
        {
          stepNumber: 1,
          "what-did-you-specifically-do-in-this-step": "",
          "how-did-you-do-it-tools-methods-or-skills": "",
          "what-was-the-outcome-of-this-step-optional": ""
        }
      ]
    },
    result: {
      "what-positive-outcome-did-you-achieve": "",
      "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": ""
    }
  }
}

/**
 * Dynamically generates a step title based on the current step and starExamples count.
 */
function generateDynamicStepTitle(currentStep: number, starCount: number): string {
  // Steps 1..3 have fixed names
  if (currentStep === 1) return "Role Information"
  if (currentStep === 2) return "Experience"
  if (currentStep === 3) return "Guidance"

  // star steps: 4 -> 3 + (4 * starCount)
  const firstStarStep = 4
  const lastStarStep = 3 + (starCount * 4)

  if (currentStep >= firstStarStep && currentStep <= lastStarStep) {
    const stepInStarRegion = currentStep - firstStarStep
    const exampleIndex = Math.floor(stepInStarRegion / 4)
    const subStepIndex = stepInStarRegion % 4

    const subLabels = ["Situation", "Task", "Action", "Result"]
    return `STAR Example #${exampleIndex + 1}: ${subLabels[subStepIndex]}`
  }

  // Otherwise, final step
  return "Finalise Pitch"
}

/**
 * Saves pitch data as a draft (status = "draft").
 * Removed references to yearsExperience, resumePath, and selectedFile.
 */
async function savePitchData(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any
) {
  const payload: any = {
    userId: data.userId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription || "",
    relevantExperience: data.relevantExperience,
    albertGuidance: data.albertGuidance || "",
    pitchContent: data.pitchContent || "",
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10),
    status: "draft",
    currentStep: 1
  }

  if (pitchId) payload.id = pitchId

  try {
    const res = await fetch("/api/pitchWizard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      throw new Error("Failed to save pitch data.")
    }

    const result = await res.json()
    if (result.data?.id) {
      setPitchId(result.data.id)
    }
    toast({
      title: "Draft Saved",
      description: "Your pitch draft has been saved successfully."
    })
  } catch (error: any) {
    console.error("Error saving pitch data:", error)
    toast({
      title: "Error",
      description: error.message || "Failed to save draft",
      variant: "destructive"
    })
  }
}

/**
 * Submits the final pitch (status = "final").
 * Removed references to yearsExperience, resumePath, and selectedFile.
 */
async function submitFinalPitch(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any,
  router: any
) {
  const payload: any = {
    userId: data.userId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription || "",
    relevantExperience: data.relevantExperience,
    albertGuidance: data.albertGuidance || "",
    pitchContent: data.pitchContent,
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10),
    status: "final",
    currentStep: 999
  }

  if (pitchId) payload.id = pitchId

  try {
    const res = await fetch("/api/pitchWizard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      throw new Error("Failed to submit final pitch.")
    }

    // Clear local storage so user doesn't re-open the same draft
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentPitchId")
    }

    toast({
      title: "Success",
      description: "Your pitch has been finalized."
    })

    router.push("/dashboard")
  } catch (error: any) {
    console.error("Error submitting final pitch:", error)
    toast({
      title: "Error",
      description: error.message || "Failed to submit pitch",
      variant: "destructive"
    })
  }
}