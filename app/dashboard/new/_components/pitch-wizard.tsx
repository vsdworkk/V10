/**
 * @description
 * A client component that implements a multi-step wizard for creating a new pitch.
 * It collects:
 *  - Role Information
 *  - Experience Information (including optional resume upload)
 *  - STAR Examples (1 or 2 depending on pitchWordLimit)
 *  - Final Review (submit data to the server as a "draft" pitch)
 *
 * Key Features:
 * - Uses React Hook Form and Zod for validation.
 * - Tracks `currentStep` in local state, conditionally rendering each step.
 * - Submits data to /api/pitchWizard in the final step.
 * - Captures `resumePath` if the user uploads a resume in ExperienceStep.
 *
 * @dependencies
 * - "react-hook-form" and "zod" for form handling and validation.
 * - Child step components: role-step, experience-step, star-step, review-step.
 *
 * @notes
 * - This wizard does NOT perform final AI pitch generation, that happens in Step 9.
 * - We forcibly set "pitchContent" to "" and "status" to "draft".
 * - You can see in ExperienceStep how we upload the file and set `resumePath`.
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

// STAR sub-schema
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

  roleName: z.string().min(2, "Role Name must be at least 2 characters."),
  roleLevel: z.string().nonempty("Please select a role level."),
  pitchWordLimit: z
    .number()
    .min(100, "Minimum 100 words.")
    .max(2000, "Maximum 2000 words for the pitch."),
  roleDescription: z.string().optional().nullable(),
  yearsExperience: z.string().nonempty("Years of experience is required."),
  relevantExperience: z
    .string()
    .min(10, "Please provide a bit more detail on your experience."),

  // resumePath is optional, set after upload
  resumePath: z.string().optional().nullable(),

  // STAR
  starExample1: starSchema,
  starExample2: z.union([starSchema, z.undefined()]).optional()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
}

export default function PitchWizard({ userId }: PitchWizardProps) {
  const { toast } = useToast()

  // Steps: 1=Role Info, 2=Experience, 3=STAR, 4=Review
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Form setup
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    mode: "onTouched",
    defaultValues: {
      userId, // store the userId so the experience step can read it for the upload
      roleName: "",
      roleLevel: "",
      pitchWordLimit: 500,
      roleDescription: "",
      yearsExperience: "",
      relevantExperience: "",
      resumePath: "",
      starExample1: {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: undefined
    }
  })

  // Check pitchWordLimit for starExample2 logic
  const watchWordLimit = methods.watch("pitchWordLimit")
  useEffect(() => {
    if (watchWordLimit < 650) {
      methods.setValue("starExample2", undefined)
    }
  }, [watchWordLimit, methods])

  const goNext = useCallback(async () => {
    const isValid = await methods.trigger()
    if (!isValid) return
    setCurrentStep(s => Math.min(s + 1, totalSteps))
  }, [methods])

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
        <h2 className="text-2xl font-bold">
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