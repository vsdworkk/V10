/**
 * @description
 * A client component that implements a multi-step wizard for creating a new pitch.
 * Steps now include:
 *  1) Role Information
 *  2) Experience Information
 *  3) Albert Guidance (AI suggestions)
 *  4) STAR Examples
 *  5) Review / Confirmation
 *
 * Key Features:
 * - Uses React Hook Form and Zod for validation.
 * - Tracks currentStep in local state, conditionally rendering each step.
 * - Submits data to /api/pitchWizard in the final step (as a "draft" pitch).
 * - Calls /api/albertGuidance for the optional guidance step (step 3).
 *
 * @dependencies
 * - "react-hook-form" and "zod" for form handling and validation
 * - Child step components: role-step, experience-step, guidance-step, star-step, review-step
 *
 * @notes
 * This wizard does NOT perform the final AI pitch generation at submission time (that is step 9 in the plan).
 * For now, we only store the pitch as "draft."
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

// STAR sub-schema (unchanged)
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

// Main wizard schema
const pitchWizardSchema = z.object({
  // We'll optionally store the userId in the form (in case we need it for the resume upload)
  userId: z.string().optional(),

  // Basic role info
  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
  roleLevel: z.string().nonempty("Please select a role level."),
  pitchWordLimit: z
    .number()
    .min(100, "Minimum 100 words.")
    .max(2000, "Maximum 2000 words for the pitch."),
  roleDescription: z.string().optional().nullable(),

  // Experience
  yearsExperience: z.string().nonempty("Years of experience is required."),
  relevantExperience: z
    .string()
    .min(10, "Please provide a bit more detail on your experience."),
  resumePath: z.string().optional().nullable(),

  // The new guidance text from Albert
  albertGuidance: z.string().optional().nullable(),

  // STAR examples
  starExample1: starSchema,
  starExample2: z.union([starSchema, z.undefined()]).optional()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
}

export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // Steps: 1=Role Info, 2=Experience, 3=Guidance, 4=STAR, 5=Review
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Form setup
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    mode: "onChange",
    defaultValues: {
      userId,
      roleName: "",
      roleLevel: "",
      pitchWordLimit: 500,
      roleDescription: "",
      yearsExperience: "",
      relevantExperience: "",
      resumePath: "",
      albertGuidance: "", // new
      starExample1: {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: undefined
    }
  })

  console.log("Form initialized with methods:", { 
    isValid: methods.formState.isValid,
    isDirty: methods.formState.isDirty,
    errors: methods.formState.errors
  })

  // Check pitchWordLimit for starExample2 logic
  const watchWordLimit = methods.watch("pitchWordLimit")
  useEffect(() => {
    if (watchWordLimit < 650) {
      // Only one STAR example is needed
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  // Navigation
  const goNext = useCallback(async () => {
    console.log("Next button clicked")
    
    // Define fields to validate based on current step
    type FieldName = keyof PitchWizardFormData | `starExample2.${keyof (PitchWizardFormData['starExample2'] & {})}`;
    
    const fieldsToValidate: Record<number, FieldName[]> = {
      1: ["roleName", "roleLevel", "pitchWordLimit", "roleDescription"],
      2: ["yearsExperience", "relevantExperience"],
      3: [], // Guidance step has no required fields
      4: watchWordLimit >= 650 
        ? ["starExample1", "starExample2"] 
        : ["starExample1"],
      5: [] // Review step has no additional fields
    }
    
    const currentFields = fieldsToValidate[currentStep] || []

    // Validate only the current step's fields
    const isValid = await methods.trigger(currentFields)
    console.log("Validation result:", isValid)
    console.log("Form values:", methods.getValues())
    console.log("Form errors:", methods.formState.errors)
    
    if (!isValid) {
      const errors = methods.formState.errors
      // Only show errors for the current step's fields
      const currentStepErrors = Object.entries(errors)
        .filter(([key]) => currentFields.includes(key as FieldName))
        .map(([_, error]) => error?.message)
        .filter(Boolean)
      
      console.log("Validation errors:", currentStepErrors)
      if (currentStepErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: currentStepErrors.join(", "),
          variant: "destructive"
        })
        return
      }
    }
    
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [methods, toast, currentStep, watchWordLimit])

  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  // Final submission
  const onSubmit = methods.handleSubmit(async data => {
    // Save pitch as "draft" via POST /api/pitchWizard
    const payload = {
      userId,
      roleName: data.roleName,
      roleLevel: data.roleLevel,
      pitchWordLimit: data.pitchWordLimit,
      roleDescription: data.roleDescription || "",
      yearsExperience: data.yearsExperience,
      relevantExperience: data.relevantExperience,
      resumePath: data.resumePath || null,
      starExample1: data.starExample1,
      starExample2: data.starExample2,
      pitchContent: "",
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
        title: "Pitch Created",
        description: "Your pitch was saved as draft."
      })
      // Reset form and go back to Step 1
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
      <div className="space-y-6">
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
            <Button onClick={goNext}>Next</Button>
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