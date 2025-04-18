"use client"

/**
 * @description
 * This client component displays and manages the pitch details in a form, allowing users
 * to edit. It also provides an option to re-run AI to regenerate pitch text.
 *
 * @notes
 * - Removed: yearsExperience, resumePath fields.
 * - Removed from STAR schema: why-was-this-a-problem-or-why-did-it-matter, how-would-completing-this-task-help-solve-the-problem, what-did-you-learn-from-this-experience.
 */

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { useState } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import ExportPitch from "./export-pitch"
import { cn } from "@/lib/utils"

// Updated STAR schema: removed "why-was-this-a-problem-or-why-did-it-matter",
// "how-would-completing-this-task-help-solve-the-problem", and
// "what-did-you-learn-from-this-experience".
const starSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z.string().optional(),
    "briefly-describe-the-situation-or-challenge-you-faced": z.string().optional()
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z.string().optional(),
    "what-constraints-or-requirements-did-you-need-to-consider": z.string().optional()
  }),
  action: z.object({
    steps: z.array(z.object({
      stepNumber: z.number(),
      "what-did-you-specifically-do-in-this-step": z.string(),
      "how-did-you-do-it-tools-methods-or-skills": z.string(),
      "what-was-the-outcome-of-this-step-optional": z.string().optional()
    }))
  }),
  result: z.object({
    "what-positive-outcome-did-you-achieve": z.string().optional(),
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z.string().optional()
  })
})

// Main form schema: removed "yearsExperience" and "resumePath".
const editPitchSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1, "User ID is required"),
  roleName: z.string().min(1, "Role name is required"),
  organisationName: z.string().optional(),
  roleLevel: z.string().min(1, "Role level is required"),
  pitchWordLimit: z.number().min(400, "Word limit must be at least 400 words"),
  roleDescription: z.string().optional(),
  relevantExperience: z.string().min(1, "Relevant experience is required"),
  albertGuidance: z.string().optional(),

  // Updated starExamples: uses the new starSchema (without the removed fields).
  starExamples: z.array(starSchema).min(1, "At least one STAR example is required"),

  pitchContent: z.string().optional(),
  starExamplesCount: z.number().min(1).max(10).default(1)
})
type EditPitchFormData = z.infer<typeof editPitchSchema>

interface EditPitchProps {
  pitch: SelectPitch
  userId: string
}

export default function EditPitch({ pitch, userId }: EditPitchProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isStarCountLocked, setIsStarCountLocked] = useState(false)

  // Initialize react-hook-form with updated default values
  const methods = useForm<EditPitchFormData>({
    resolver: zodResolver(editPitchSchema),
    defaultValues: {
      id: pitch.id,
      userId: pitch.userId,
      roleName: pitch.roleName,
      organisationName: pitch.organisationName ?? "",
      roleLevel: pitch.roleLevel,
      pitchWordLimit: pitch.pitchWordLimit,
      roleDescription: pitch.roleDescription ?? "",
      relevantExperience: pitch.relevantExperience,
      albertGuidance: pitch.albertGuidance ?? "",
      starExamples: pitch.starExamples && pitch.starExamples.length > 0
        ? pitch.starExamples
        : [
            {
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
          ],
      pitchContent: pitch.pitchContent ?? "",
      starExamplesCount: pitch.starExamplesCount || 1
    }
  })

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting }
  } = methods

  const watchWordLimit = watch("pitchWordLimit")
  const pitchContent = watch("pitchContent") || ""

  // For re-run AI usage
  const [generating, setGenerating] = useState(false)
  async function handleGenerateAi() {
    try {
      setGenerating(true)
      const values = methods.getValues()
      const res = await fetch("/api/finalPitch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          roleName: values.roleName,
          roleLevel: values.roleLevel,
          pitchWordLimit: values.pitchWordLimit,
          roleDescription: values.roleDescription,
          relevantExperience: values.relevantExperience,
          starExamples: values.starExamples
        })
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Failed to generate final pitch")
      }
      const data = await res.json()
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to generate final pitch")
      }
      setValue("pitchContent", data.data || "", { shouldDirty: true })
      toast({
        title: "Pitch Regenerated",
        description: "AI pitch has been updated."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  // For saving changes to DB (PATCH)
  async function handleSaveChanges(data: EditPitchFormData) {
    // If pitchWordLimit < 650, keep only 1 simplified example
    const patchBody = {
      ...data,
      starExamples: data.starExamples.map(example => {
        if (watchWordLimit < 650) {
          // Minimal example if under 650
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
        } else {
          return example
        }
      }),
      currentStep: getCurrentStepFromData(data)
    }

    try {
      const res = await fetch(`/api/pitchWizard/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update pitch")
      }

      // Lock the star examples count after saving
      setIsStarCountLocked(true)

      toast({
        title: "Pitch Updated",
        description: "Your changes have been saved."
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Helper function to determine the current step based on data in the form
  function getCurrentStepFromData(data: EditPitchFormData): number {
    if (data.pitchContent) {
      return 12 // Review step
    }

    const requiredExamplesCount = data.starExamplesCount
    if (data.starExamples && data.starExamples.length >= requiredExamplesCount) {
      const lastRequiredExample = data.starExamples[requiredExamplesCount - 1]
      // If that example's result is filled, likely we are at review
      if (
        lastRequiredExample &&
        lastRequiredExample.result &&
        lastRequiredExample.result["what-positive-outcome-did-you-achieve"]
      ) {
        return 12
      }
      // Check partial fill
      if (lastRequiredExample.action && lastRequiredExample.action.steps.length > 0) {
        return 3 + requiredExamplesCount * 4 - 1 // result step
      }
      if (lastRequiredExample.task && lastRequiredExample.task["what-was-your-responsibility-in-addressing-this-issue"]) {
        return 3 + requiredExamplesCount * 4 - 2 // action step
      }
      if (lastRequiredExample.situation && lastRequiredExample.situation["where-and-when-did-this-experience-occur"]) {
        return 3 + requiredExamplesCount * 4 - 3 // task step
      }
      return 3 + requiredExamplesCount * 4 - 4 // situation step
    }

    // If we have some examples but not all
    if (data.starExamples && data.starExamples.length > 0) {
      const lastExampleIndex = data.starExamples.length - 1
      const lastExample = data.starExamples[lastExampleIndex]

      if (lastExample.result && lastExample.result["what-positive-outcome-did-you-achieve"]) {
        // Completed this example, next example or review
        return 3 + (lastExampleIndex + 1) * 4 + 1
      }
      if (lastExample.action && lastExample.action.steps.length > 0) {
        return 3 + lastExampleIndex * 4 + 3 // result step
      }
      if (
        lastExample.task &&
        lastExample.task["what-was-your-responsibility-in-addressing-this-issue"]
      ) {
        return 3 + lastExampleIndex * 4 + 2 // action step
      }
      if (
        lastExample.situation &&
        lastExample.situation["where-and-when-did-this-experience-occur"]
      ) {
        return 3 + lastExampleIndex * 4 + 1 // task step
      }
      return 3 + lastExampleIndex * 4 // situation step
    }

    if (data.relevantExperience) {
      return 3 // Guidance step
    }
    if (data.roleName) {
      return 2 // Experience step
    }
    return 1 // Role information step
  }

  // Dynamically render STAR example fields
  const renderStarExamples = () => {
    const count = methods.watch("starExamplesCount")
    const examples = []

    for (let i = 0; i < count; i++) {
      examples.push(
        <div key={`star-example-${i}`} className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium text-lg">STAR Example {i + 1}</h3>

          <div className="space-y-4">
            {/* Situation */}
            <FormField
              control={methods.control}
              name={`starExamples.${i}.situation.where-and-when-did-this-experience-occur`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situation (Where/When)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Where and when did this experience occur?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task */}
            <FormField
              control={methods.control}
              name={`starExamples.${i}.task.what-was-your-responsibility-in-addressing-this-issue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task (Responsibility)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was your responsibility in addressing this issue?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action (Just the first step for simplicity) */}
            <FormField
              control={methods.control}
              name={`starExamples.${i}.action.steps.0.what-did-you-specifically-do-in-this-step`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action (Step 1)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you specifically do in this step?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Result */}
            <FormField
              control={methods.control}
              name={`starExamples.${i}.result.what-positive-outcome-did-you-achieve`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result (Positive Outcome)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What positive outcome did you achieve?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )
    }
    return examples
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Edit Pitch</h1>
      <FormProvider {...methods}>
        <Form {...methods}>
          <form onSubmit={handleSubmit(handleSaveChanges)}>
            {/* Basic role info */}
            <div className="space-y-4">
              {/* Role Name */}
              <FormField
                control={methods.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Administrative Officer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organisation Name */}
              <FormField
                control={methods.control}
                name="organisationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Department of Finance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Level */}
              <FormField
                control={methods.control}
                name="roleLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Level</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Mid-level">Mid-level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pitch Word Limit */}
              <FormField
                control={methods.control}
                name="pitchWordLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Word Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="400"
                        placeholder="Minimum 400 words"
                        className={cn(
                          (field.value !== undefined && field.value < 400) ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    {field.value !== undefined && field.value < 400 ? (
                      <p className="text-red-500 text-sm mt-1">Word limit must be at least 400 words</p>
                    ) : (
                      <FormMessage />
                    )}
                    {watchWordLimit < 650 ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Only 1 STAR example is needed.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        2 (or more) STAR examples are recommended.
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Experience */}
            <div className="my-6 border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold">Experience</h2>
            </div>
            <div className="space-y-4">
              {/* Relevant Experience */}
              <FormField
                control={methods.control}
                name="relevantExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe achievements, responsibilities, and skills relevant to this role..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* STAR Examples */}
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-medium border-b pb-2">STAR Examples</h3>

              <FormField
                control={methods.control}
                name="starExamplesCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of STAR Examples</FormLabel>
                    <Select
                      disabled={isStarCountLocked}
                      value={String(field.value)}
                      onValueChange={(value) => {
                        const numValue = parseInt(value, 10)
                        field.onChange(numValue)

                        // Adjust starExamples array length
                        const currentExamples = methods.getValues("starExamples") || []
                        const newExamples = [...currentExamples]

                        while (newExamples.length < numValue) {
                          newExamples.push({
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
                          })
                        }
                        if (newExamples.length > numValue) {
                          newExamples.length = numValue
                        }
                        methods.setValue("starExamples", newExamples)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select # of examples" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, i) => {
                          const val = i + 1
                          return (
                            <SelectItem key={val} value={String(val)}>
                              {val}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">{renderStarExamples()}</div>
            </div>

            {/* Role Description (optional) */}
            <div className="my-6 border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold">Role Description (Optional)</h2>
            </div>
            <FormField
              control={methods.control}
              name="roleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste or type the official role description here..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Final Pitch Content */}
            <div className="my-6 border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold">Final Pitch Content</h2>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              Optionally regenerate your pitch using updated info:
            </p>
            <Button type="button" onClick={handleGenerateAi} disabled={generating}>
              {generating ? "Generating AI..." : "Re-run AI Pitch Generation"}
            </Button>
            <div className="mt-4 space-y-2">
              <FormField
                control={methods.control}
                name="pitchContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Text (Editable)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="AI generated pitch will appear here"
                        className="min-h-[200px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Save Changes */}
            <div className="mt-8 flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>

      {/* ExportPitch component to allow PDF/Word export */}
      <ExportPitch pitchContent={pitchContent} pitchTitle={pitch.roleName} pitchId={pitch.id} />
    </div>
  )
}