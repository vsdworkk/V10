/**
 * @description
 * A client component that implements a multi-step wizard for creating a new pitch.
 * It collects:
 *  - Role Information
 *  - Experience Information
 *  - STAR Examples (1 or 2 depending on pitchWordLimit)
 *  - Final Review (submit data to the server as a "draft" pitch)
 *
 * Key Features:
 * - Uses React Hook Form and Zod for validation.
 * - Tracks `currentStep` in local state, conditionally rendering each step.
 * - Submits data to /api/pitchWizard in the final step.
 *
 * @dependencies
 * - "react-hook-form" and "zod" for form handling and validation.
 * - Next.js fetch API for final submission to the server route.
 * - Child step components: role-step, experience-step, star-step, review-step.
 *
 * @notes
 * - This wizard does NOT perform final AI pitch generation, that happens in Step 9.
 * - We skip resume upload here (that is Step 7).
 * - We forcibly set "pitchContent" to "" and "status" to "draft".
 * - Potential future enhancements: Save partial data on each step, handle resume upload, etc.
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import RoleStep from "@/app/dashboard/new/_components/role-step"
import ExperienceStep from "@/app/dashboard/new/_components/experience-step"
import StarStep from "@/app/dashboard/new/_components/star-step"
import ReviewStep from "@/app/dashboard/new/_components/review-step"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"

// Define a Zod schema for the entire wizard
// We'll store data in a single object:
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

const pitchWizardSchema = z.object({
  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
  roleLevel: z.string().nonempty("Please select a role level."),
  pitchWordLimit: z
    .number()
    .min(100, "Minimum 100 words.")
    .max(2000, "Maximum 2000 words for the pitch."), // just some range for demonstration
  roleDescription: z.string().optional().nullable(),
  yearsExperience: z.string().nonempty("Years of experience is required."),
  relevantExperience: z
    .string()
    .min(10, "Please provide a bit more detail on your experience."),
  // We'll skip resume upload for now
  // starExample1 is always required
  starExample1: starSchema,
  // starExample2 is optional, but we only present it if pitchWordLimit >= 650
  starExample2: z
    .union([starSchema, z.undefined()])
    .optional(), // We'll handle logic in code
})

// We define the TypeScript type of the wizard form data from our Zod schema
export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
}

export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // Steps: 1=Role Info, 2=Experience, 3=STAR, 4=Review
  const [currentStep, setCurrentStep] = useState(1)

  // We'll use React Hook Form's context so that each step can share data.
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    mode: "onTouched",
    defaultValues: {
      roleName: "",
      roleLevel: "",
      pitchWordLimit: 500,
      roleDescription: "",
      yearsExperience: "",
      relevantExperience: "",
      starExample1: {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: undefined,
    }
  })

  // We want to watch pitchWordLimit to conditionally require starExample2 or not
  const watchWordLimit = methods.watch("pitchWordLimit")

  // If pitchWordLimit < 650, we reset starExample2
  useEffect(() => {
    if (watchWordLimit < 650) {
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  // Step logic
  const totalSteps = 4

  const goNext = useCallback(async () => {
    // Validate current step before proceeding
    const isValid = await methods.trigger()
    if (!isValid) return
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [methods])

  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [])

  // Final submission
  const onSubmit = methods.handleSubmit(async data => {
    // We do not handle AI generation here. We'll store a "draft" pitch.
    const payload = {
      userId,
      roleName: data.roleName,
      roleLevel: data.roleLevel,
      pitchWordLimit: data.pitchWordLimit,
      roleDescription: data.roleDescription || "",
      yearsExperience: data.yearsExperience,
      relevantExperience: data.relevantExperience,
      starExample1: data.starExample1,
      starExample2: data.starExample2,
      pitchContent: "", // not generating yet
      status: "draft" // we are just saving as draft
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

      // Success toast, reset form or navigate away
      toast({
        title: "Pitch Created",
        description: "Your pitch was saved as draft."
      })
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

  // Conditionally render the step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RoleStep />
      case 2:
        return <ExperienceStep />
      case 3:
        return <StarStep />
      case 4:
        return <ReviewStep />
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-2xl space-y-6 rounded-md bg-card p-6 shadow">
        <h2 className="text-2xl font-bold">Create New Pitch (Step {currentStep} of {totalSteps})</h2>

        {/* Step Content */}
        <div>{renderStep()}</div>

        {/* Navigation Buttons */}
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