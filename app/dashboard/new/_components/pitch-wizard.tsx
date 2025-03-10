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
 * Matches the StarSchema interface in the database schema.
 */
const starSchema = z.object({
  // Required main STAR fields
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters."),
  
  // Optional detailed sub-fields for each STAR component
  situationDetails: z.object({
    context: z.string().optional(),
    challenge: z.string().optional(),
    background: z.string().optional()
  }).optional(),
  
  taskDetails: z.object({
    objective: z.string().optional(),
    requirements: z.string().optional(),
    constraints: z.string().optional()
  }).optional(),
  
  actionDetails: z.object({
    steps: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    approach: z.string().optional()
  }).optional(),
  
  resultDetails: z.object({
    metrics: z.string().optional(),
    impact: z.string().optional(),
    learnings: z.string().optional()
  }).optional()
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
  organisationName: z.string().optional(),
  roleLevel: z.enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]),
  pitchWordLimit: z.enum(["<500", "<650", "<750", "<1000"]),
  roleDescription: z.string().optional(),
  yearsExperience: z.string().nonempty("Years of experience is required."),
  relevantExperience: z
    .string()
    .min(10, "Please provide a bit more detail on your experience."),
  resumePath: z.string().optional(),
  albertGuidance: z.string().optional(),
  starExample1: starSchema,
  starExample2: z.union([starSchema, z.undefined()]).optional(),
  pitchContent: z.string().optional(),
  selectedFile: z.any().optional()
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
  "Situation",
  "Task",
  "Action",
  "Result",
  "Situation",
  "Task",
  "Action",
  "Result",
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
          albertGuidance: pitchData.albertGuidance || "",
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
          roleLevel: "APS4", // Default role level
          pitchWordLimit: "<650", // Default word limit
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
        },
    mode: "onChange" // Enable validation as fields change
  })

  // Helper: watch pitchWordLimit, convert to a numeric so we can do <650 checks
  const watchWordLimit = methods.watch("pitchWordLimit")
  
  // Convert the string format to a numeric value for comparisons
  const numericLimit = () => {
    switch (watchWordLimit) {
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
  
  // Determine the initial step based on the existing pitch data
  useEffect(() => {
    if (pitchData) {
      // Initialize completed steps based on filled data
      const newCompletedSteps: number[] = []
      
      // Step 1: Role Information
      if (pitchData.roleName && pitchData.roleLevel) {
        newCompletedSteps.push(1)
      }
      
      // Step 2: Experience
      if (pitchData.yearsExperience && pitchData.relevantExperience) {
        newCompletedSteps.push(2)
      }
      
      // Step 3: Guidance
      if (pitchData.albertGuidance) {
        newCompletedSteps.push(3)
      }
      
      // STAR Example 1 steps
      if (pitchData.starExample1) {
        const star1 = pitchData.starExample1 as any
        if (star1.situation) newCompletedSteps.push(4)
        if (star1.task) newCompletedSteps.push(5)
        if (star1.action) newCompletedSteps.push(6)
        if (star1.result) newCompletedSteps.push(7)
      }
      
      // STAR Example 2 steps (if needed)
      if (pitchData.pitchWordLimit >= 650 && pitchData.starExample2) {
        const star2 = pitchData.starExample2 as any
        if (star2.situation) newCompletedSteps.push(8)
        if (star2.task) newCompletedSteps.push(9)
        if (star2.action) newCompletedSteps.push(10)
        if (star2.result) newCompletedSteps.push(11)
      }
      
      // Final step
      if (pitchData.pitchContent) {
        newCompletedSteps.push(12)
      }
      
      setCompletedSteps(newCompletedSteps)
      
      // Determine the appropriate starting step
      // If they have completed all steps, start at the review step
      if (pitchData.pitchContent) {
        setCurrentStepLocal(12)
      } 
      // If they have completed STAR Example 1, but need Example 2
      else if (pitchData.pitchWordLimit >= 650 && 
               pitchData.starExample1 && 
               (pitchData.starExample1 as any).result && 
               (!pitchData.starExample2 || !(pitchData.starExample2 as any).situation)) {
        setCurrentStepLocal(8)
      }
      // If they have started but not completed STAR Example 1
      else if (pitchData.starExample1) {
        const star1 = pitchData.starExample1 as any
        if (!star1.situation) setCurrentStepLocal(4)
        else if (!star1.task) setCurrentStepLocal(5)
        else if (!star1.action) setCurrentStepLocal(6)
        else if (!star1.result) setCurrentStepLocal(7)
      }
      // If they have guidance but haven't started STAR examples
      else if (pitchData.albertGuidance) {
        setCurrentStepLocal(4)
      }
      // If they have experience info but no guidance
      else if (pitchData.yearsExperience && pitchData.relevantExperience) {
        setCurrentStepLocal(3)
      }
      // If they have role info but no experience
      else if (pitchData.roleName && pitchData.roleLevel) {
        setCurrentStepLocal(2)
      }
      // Otherwise start at the beginning
      else {
        setCurrentStepLocal(1)
      }
    }
  }, [pitchData])

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
      const res = await fetch("/api/finalPitch", {
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
      
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to generate pitch")
      }
      
      methods.setValue("pitchContent", data.data)
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
    // Only validate the fields for the current step
    let isValid = false;
    
    if (currentStep === 1) {
      // Validate only Role step fields
      isValid = await methods.trigger(["roleName", "roleLevel", "pitchWordLimit"]);
    } else if (currentStep === 2) {
      // Validate only Experience step fields
      isValid = await methods.trigger(["yearsExperience", "relevantExperience"]);
    } else if (currentStep === 4 || currentStep === 8) {
      // Validate only Situation step fields
      const exampleKey = currentStep === 4 ? "starExample1.situation" : "starExample2.situation";
      isValid = await methods.trigger(exampleKey);
    } else if (currentStep === 5 || currentStep === 9) {
      // Validate only Task step fields
      const exampleKey = currentStep === 5 ? "starExample1.task" : "starExample2.task";
      isValid = await methods.trigger(exampleKey);
    } else if (currentStep === 6 || currentStep === 10) {
      // Validate only Action step fields
      const exampleKey = currentStep === 6 ? "starExample1.action" : "starExample2.action";
      isValid = await methods.trigger(exampleKey);
    } else if (currentStep === 7 || currentStep === 11) {
      // Validate only Result step fields
      const exampleKey = currentStep === 7 ? "starExample1.result" : "starExample2.result";
      isValid = await methods.trigger(exampleKey);
    } else {
      // For other steps, no validation needed
      isValid = true;
    }
    
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
    const payload: any = {
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
      albertGuidance: data.albertGuidance || "",
      pitchContent: data.pitchContent || "",
      status: "draft"
    }

    // If we're editing an existing pitch, include the ID
    if (pitchData?.id) {
      payload.id = pitchData.id
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
  }, [methods, userId, router, toast, numericLimit, pitchData])

  /**
   * @function onSubmit
   * Submits the final pitch.
   */
  const onSubmit = useCallback(async () => {
    const data = methods.getValues()
    const numeric = numericLimit()
    const pitchStatus = "final"

    // Convert the form data to the format expected by the API
    const payload: any = {
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
      albertGuidance: data.albertGuidance || "",
      pitchContent: data.pitchContent || "",
      status: pitchStatus
    }

    // If we're editing an existing pitch, include the ID
    if (pitchData?.id) {
      payload.id = pitchData.id
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
  }, [methods, userId, router, toast, numericLimit, pitchData])

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