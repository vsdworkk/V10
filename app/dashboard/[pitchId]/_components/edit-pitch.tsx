"use client"

/**
 * @description
 * This client component displays and manages the pitch details in a form, allowing users
 * to edit. It also provides an option to re-run AI to regenerate pitch text.
 * 
 * Key features:
 * - Form-based editing for pitch fields
 * - "Re-run AI" button calls /api/finalPitch
 * - "Save Changes" button updates the pitch in the DB
 * - Includes <ExportPitch /> for PDF/Word export
 *
 * @dependencies
 * - React Hook Form for form state
 * - Shadcn UI components (Input, Textarea, Button)
 * - fetch for server route calls
 * - ExportPitch for PDF/Word generation
 *
 * @notes
 * - If pitchWordLimit < 650, starExample2 is hidden. 
 * - pitchContent is stored in the DB on "Save Changes".
 * - The user can export the final pitch using PDF/Word buttons at the bottom.
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
import ExportPitch from "./export-pitch" // <-- NEW IMPORT
import { cn } from "@/lib/utils"
import { useStepContext } from "@/app/dashboard/new/_components/progress-bar-wrapper"

// STAR validation schema
const starSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z.string().optional(),
    "briefly-describe-the-situation-or-challenge-you-faced": z.string().optional(),
    "why-was-this-a-problem-or-why-did-it-matter": z.string().optional()
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z.string().optional(),
    "how-would-completing-this-task-help-solve-the-problem": z.string().optional(),
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
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z.string().optional(),
    "what-did-you-learn-from-this-experience": z.string().optional()
  })
})

// Main form schema for editing the pitch
const editPitchSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1, "User ID is required"),
  roleName: z.string().min(1, "Role name is required"),
  organisationName: z.string().optional(),
  roleLevel: z.string().min(1, "Role level is required"),
  pitchWordLimit: z.number().min(400, "Word limit must be at least 400 words"),
  roleDescription: z.string().optional(),
  yearsExperience: z.string().min(1, "Years of experience is required"),
  relevantExperience: z.string().min(1, "Relevant experience is required"),
  resumePath: z.string().optional(),
  albertGuidance: z.string().optional(),
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
  const { markStepCompleted } = useStepContext()

  // Initialize react-hook-form
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
      yearsExperience: pitch.yearsExperience,
      relevantExperience: pitch.relevantExperience,
      resumePath: pitch.resumePath ?? "",
      starExamples: pitch.starExamples || [{
        situation: {
          "where-and-when-did-this-experience-occur": "",
          "briefly-describe-the-situation-or-challenge-you-faced": "",
          "why-was-this-a-problem-or-why-did-it-matter": ""
        },
        task: {
          "what-was-your-responsibility-in-addressing-this-issue": "",
          "how-would-completing-this-task-help-solve-the-problem": "",
          "what-constraints-or-requirements-did-you-need-to-consider": ""
        },
        action: {
          steps: [{
            stepNumber: 1,
            "what-did-you-specifically-do-in-this-step": "",
            "how-did-you-do-it-tools-methods-or-skills": "",
            "what-was-the-outcome-of-this-step-optional": ""
          }]
        },
        result: {
          "what-positive-outcome-did-you-achieve": "",
          "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": "",
          "what-did-you-learn-from-this-experience": ""
        }
      }],
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
          yearsExperience: values.yearsExperience,
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

  // For saving changes to DB
  async function handleSaveChanges(data: EditPitchFormData) {
    // If pitchWordLimit < 650, remove starExample2
    const patchBody = {
      ...data,
      starExamples: data.starExamples.map(example => {
        if (watchWordLimit < 650) {
          return {
            ...example,
            situation: {
              "where-and-when-did-this-experience-occur": "",
              "briefly-describe-the-situation-or-challenge-you-faced": "",
              "why-was-this-a-problem-or-why-did-it-matter": ""
            },
            task: {
              "what-was-your-responsibility-in-addressing-this-issue": "",
              "how-would-completing-this-task-help-solve-the-problem": "",
              "what-constraints-or-requirements-did-you-need-to-consider": ""
            },
            action: {
              steps: [{
                stepNumber: 1,
                "what-did-you-specifically-do-in-this-step": "",
                "how-did-you-do-it-tools-methods-or-skills": "",
                "what-was-the-outcome-of-this-step-optional": ""
              }]
            },
            result: {
              "what-positive-outcome-did-you-achieve": "",
              "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": "",
              "what-did-you-learn-from-this-experience": ""
            }
          }
        } else {
          return example
        }
      }),
      // Store current step based on the user's progress to allow proper resuming
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
      
      // Mark this step as completed in the progress bar
      markStepCompleted(1) // Basic info
      
      if (data.yearsExperience && data.relevantExperience) {
        markStepCompleted(2) // Experience
      }
      
      if (data.starExamples && data.starExamples.length > 0) {
        // Mark each completed example
        data.starExamples.forEach((example, index) => {
          const baseStep = 4 + (index * 4); // Starting step for this example
          
          if (example.situation && 
              example.situation["where-and-when-did-this-experience-occur"] &&
              example.situation["briefly-describe-the-situation-or-challenge-you-faced"] &&
              example.situation["why-was-this-a-problem-or-why-did-it-matter"]) {
            markStepCompleted(baseStep); // Situation
          }
          
          if (example.task && 
              example.task["what-was-your-responsibility-in-addressing-this-issue"] &&
              example.task["how-would-completing-this-task-help-solve-the-problem"] &&
              example.task["what-constraints-or-requirements-did-you-need-to-consider"]) {
            markStepCompleted(baseStep + 1); // Task
          }
          
          if (example.action && example.action.steps.length > 0) {
            markStepCompleted(baseStep + 2); // Action
          }
          
          if (example.result && 
              example.result["what-positive-outcome-did-you-achieve"] &&
              example.result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] &&
              example.result["what-did-you-learn-from-this-experience"]) {
            markStepCompleted(baseStep + 3); // Result
          }
        });
      }
      
      if (data.pitchContent) {
        markStepCompleted(12) // Review
      }
      
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
      return 12; // Review step
    }
    
    // Check if we have complete STAR examples based on the count
    const requiredExamplesCount = data.starExamplesCount;
    
    // Check if we have all required STAR examples filled out
    if (data.starExamples && data.starExamples.length >= requiredExamplesCount) {
      // Check the last required example
      const lastRequiredExample = data.starExamples[requiredExamplesCount - 1];
      
      if (lastRequiredExample && 
          lastRequiredExample.result && 
          lastRequiredExample.result["what-positive-outcome-did-you-achieve"]) {
        return 12; // Ready for review
      }
      
      // Check which part of the last example is filled
      if (lastRequiredExample.action && lastRequiredExample.action.steps.length > 0) {
        return 3 + (requiredExamplesCount * 4) - 1; // Result step for last example
      }
      
      if (lastRequiredExample.task && 
          lastRequiredExample.task["what-was-your-responsibility-in-addressing-this-issue"]) {
        return 3 + (requiredExamplesCount * 4) - 2; // Action step for last example
      }
      
      if (lastRequiredExample.situation && 
          lastRequiredExample.situation["where-and-when-did-this-experience-occur"]) {
        return 3 + (requiredExamplesCount * 4) - 3; // Task step for last example
      }
      
      return 3 + (requiredExamplesCount * 4) - 4; // Situation step for last example
    }
    
    // If we have some examples but not all required ones
    if (data.starExamples && data.starExamples.length > 0) {
      const lastExampleIndex = data.starExamples.length - 1;
      const lastExample = data.starExamples[lastExampleIndex];
      
      if (lastExample.result && 
          lastExample.result["what-positive-outcome-did-you-achieve"]) {
        // Completed this example, ready for next one
        return 3 + ((lastExampleIndex + 1) * 4) + 1;
      }
      
      if (lastExample.action && lastExample.action.steps.length > 0) {
        return 3 + (lastExampleIndex * 4) + 3; // Result step
      }
      
      if (lastExample.task && 
          lastExample.task["what-was-your-responsibility-in-addressing-this-issue"]) {
        return 3 + (lastExampleIndex * 4) + 2; // Action step
      }
      
      if (lastExample.situation && 
          lastExample.situation["where-and-when-did-this-experience-occur"]) {
        return 3 + (lastExampleIndex * 4) + 1; // Task step
      }
      
      return 3 + (lastExampleIndex * 4) + 0; // Situation step
    }
    
    if (data.relevantExperience) {
      return 3; // Guidance step
    }
    
    if (data.roleName) {
      return 2; // Experience step
    }
    
    return 1; // Role information step
  }

  // Dynamically render STAR example fields based on starExamplesCount
  const renderStarExamples = () => {
    const count = methods.watch("starExamplesCount");
    const examples = [];
    
    for (let i = 0; i < count; i++) {
      examples.push(
        <div key={`star-example-${i}`} className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium text-lg">STAR Example {i + 1}</h3>
          
          <div className="space-y-4">
            <FormField
              control={methods.control}
              name={`starExamples.${i}.situation.where-and-when-did-this-experience-occur`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe where and when this experience occurred..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={methods.control}
              name={`starExamples.${i}.task.what-was-your-responsibility-in-addressing-this-issue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was your responsibility in addressing this issue..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={methods.control}
              name={`starExamples.${i}.action.steps.0.what-did-you-specifically-do-in-this-step`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you specifically do in this step..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={methods.control}
              name={`starExamples.${i}.result.what-positive-outcome-did-you-achieve`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What positive outcome did you achieve..."
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
      );
    }
    
    return examples;
  };

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
                      <Input placeholder="e.g. Department of Finance" {...field} value={field.value || ""} />
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
                render={({ field, fieldState }) => (
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
                        2 STAR examples are required.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Star Examples Count */}
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
                        const numValue = parseInt(value, 10);
                        field.onChange(numValue);
                        
                        // Make sure we have the right number of examples in the form
                        const currentExamples = methods.getValues("starExamples") || [];
                        const newExamples = [...currentExamples];
                        
                        // Add examples if needed
                        while (newExamples.length < numValue) {
                          newExamples.push({
                            situation: {
                              "where-and-when-did-this-experience-occur": "",
                              "briefly-describe-the-situation-or-challenge-you-faced": "",
                              "why-was-this-a-problem-or-why-did-it-matter": ""
                            },
                            task: {
                              "what-was-your-responsibility-in-addressing-this-issue": "",
                              "how-would-completing-this-task-help-solve-the-problem": "",
                              "what-constraints-or-requirements-did-you-need-to-consider": ""
                            },
                            action: {
                              steps: [{
                                stepNumber: 1,
                                "what-did-you-specifically-do-in-this-step": "",
                                "how-did-you-do-it-tools-methods-or-skills": "",
                                "what-was-the-outcome-of-this-step-optional": ""
                              }]
                            },
                            result: {
                              "what-positive-outcome-did-you-achieve": "",
                              "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": "",
                              "what-did-you-learn-from-this-experience": ""
                            }
                          });
                        }
                        
                        // Remove examples if needed
                        if (newExamples.length > numValue) {
                          newExamples.length = numValue;
                        }
                        
                        methods.setValue("starExamples", newExamples);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select # of examples" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Description */}
              <FormField
                control={methods.control}
                name="roleDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Description (Optional)</FormLabel>
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
            </div>

            {/* Experience */}
            <div className="my-6 border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold">Experience</h2>
            </div>
            <div className="space-y-4">
              {/* Years of Experience */}
              <FormField
                control={methods.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2-5 years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Resume path (read-only) */}
              {pitch.resumePath && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Resume Path:</span> {pitch.resumePath}
                </div>
              )}
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
                        const numValue = parseInt(value, 10);
                        field.onChange(numValue);
                        
                        // Make sure we have the right number of examples in the form
                        const currentExamples = methods.getValues("starExamples") || [];
                        const newExamples = [...currentExamples];
                        
                        // Add examples if needed
                        while (newExamples.length < numValue) {
                          newExamples.push({
                            situation: {
                              "where-and-when-did-this-experience-occur": "",
                              "briefly-describe-the-situation-or-challenge-you-faced": "",
                              "why-was-this-a-problem-or-why-did-it-matter": ""
                            },
                            task: {
                              "what-was-your-responsibility-in-addressing-this-issue": "",
                              "how-would-completing-this-task-help-solve-the-problem": "",
                              "what-constraints-or-requirements-did-you-need-to-consider": ""
                            },
                            action: {
                              steps: [{
                                stepNumber: 1,
                                "what-did-you-specifically-do-in-this-step": "",
                                "how-did-you-do-it-tools-methods-or-skills": "",
                                "what-was-the-outcome-of-this-step-optional": ""
                              }]
                            },
                            result: {
                              "what-positive-outcome-did-you-achieve": "",
                              "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": "",
                              "what-did-you-learn-from-this-experience": ""
                            }
                          });
                        }
                        
                        // Remove examples if needed
                        if (newExamples.length > numValue) {
                          newExamples.length = numValue;
                        }
                        
                        methods.setValue("starExamples", newExamples);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select # of examples" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-6">
                {renderStarExamples()}
              </div>
            </div>

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
      <ExportPitch
        pitchContent={pitchContent}
        pitchTitle={pitch.roleName}
        pitchId={pitch.id}
      />
    </div>
  )
}