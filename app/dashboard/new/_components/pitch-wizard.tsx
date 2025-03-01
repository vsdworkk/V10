/**
 * @description
 * A client component implementing a multi-step wizard for creating a pitch.
 * 
 * Steps:
 *  1. RoleStep
 *  2. ExperienceStep
 *  3. GuidanceStep
 *  4. StarStep
 *  5. ReviewStep (Now includes final pitch generation & preview)
 *
 * On final Submit, we gather all data (including pitchContent) and send it to
 * /api/pitchWizard to create the pitch record. If pitchContent is present, we
 * mark the pitch as "final"; otherwise, "draft".
 * 
 * @dependencies
 * - React Hook Form for wizard state
 * - fetch for calling /api/pitchWizard
 * - The child steps: role-step, experience-step, guidance-step, star-step,
 *   review-step
 * 
 * @notes
 * The pitchWizardSchema has been updated to include pitchContent.
 * The handleSubmit logic uses the normal create pitch approach.
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

// STAR sub-schema
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

// Main wizard schema
const pitchWizardSchema = z.object({
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

  // Guidance from Albert (not mandatory)
  albertGuidance: z.string().optional().nullable(),

  // STAR examples
  starExample1: starSchema,
  // starExample2 can be omitted if pitchWordLimit < 650
  starExample2: z
    .union([starSchema, z.undefined()])
    .optional(),

  // The final pitch text from GPT-4o, if generated
  pitchContent: z.string().optional().nullable()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
}

export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // Steps
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 5

  // Initialize form
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
      albertGuidance: "",
      starExample1: {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: undefined,
      pitchContent: ""
    }
  })

  // If pitchWordLimit < 650, we don't need starExample2
  const watchWordLimit = methods.watch("pitchWordLimit")
  useEffect(() => {
    if (watchWordLimit < 650) {
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  // Next/back logic
  const goNext = useCallback(async () => {
    // define which fields to validate on each step
    type FieldName = keyof PitchWizardFormData | `starExample2.${keyof (PitchWizardFormData["starExample2"] & {})}`

    const fieldsToValidate: Record<number, FieldName[]> = {
      1: ["roleName", "roleLevel", "pitchWordLimit", "roleDescription"],
      2: ["yearsExperience", "relevantExperience"],
      3: [], // Guidance step has no required fields
      4: watchWordLimit >= 650
        ? ["starExample1", "starExample2"]
        : ["starExample1"],
      5: [] // Review step has no direct required fields
    }

    const currentFields = fieldsToValidate[currentStep] || []
    const isValid = await methods.trigger(currentFields)

    if (!isValid) {
      // gather errors only for the fields of the current step
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

    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [methods, toast, currentStep, watchWordLimit])

  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  // Final submission
  const onSubmit = methods.handleSubmit(async data => {
    // If pitchContent is filled, set pitch status to "final", else "draft"
    const pitchStatus = data.pitchContent
      ? "final"
      : "draft"

    // Build the payload
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
        title: pitchStatus === "final"
          ? "Final Pitch Saved"
          : "Draft Pitch Saved",
        description: `Your pitch is now stored with status: "${pitchStatus}".`
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

  // Render step content
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