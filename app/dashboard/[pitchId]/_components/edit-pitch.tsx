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

// STAR validation schema
const starSchema = z.object({
  situation: z.string().min(5, "Situation must be at least 5 characters."),
  task: z.string().min(5, "Task must be at least 5 characters."),
  action: z.string().min(5, "Action must be at least 5 characters."),
  result: z.string().min(5, "Result must be at least 5 characters.")
})

// Main form schema for editing the pitch
const editPitchSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  roleName: z.string().min(2),
  organisationName: z.string().optional().nullable(),
  roleLevel: z.string().nonempty(),
  pitchWordLimit: z.number().min(100).max(2000),
  roleDescription: z.string().optional().nullable(),
  yearsExperience: z.string().nonempty(),
  relevantExperience: z.string().min(10),
  resumePath: z.string().optional().nullable(),
  starExample1: starSchema,
  starExample2: z.union([starSchema, z.undefined()]).optional(),
  pitchContent: z.string().optional().nullable()
})
type EditPitchFormData = z.infer<typeof editPitchSchema>

interface EditPitchProps {
  pitch: SelectPitch
  userId: string
}

export default function EditPitch({ pitch, userId }: EditPitchProps) {
  const router = useRouter()
  const { toast } = useToast()

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
      starExample1: (pitch.starExample1 as any) || {
        situation: "",
        task: "",
        action: "",
        result: ""
      },
      starExample2: (pitch.starExample2 as any) || undefined,
      pitchContent: pitch.pitchContent ?? ""
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
          starExample1: values.starExample1,
          starExample2: watchWordLimit >= 650 ? values.starExample2 : undefined
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
      starExample2: watchWordLimit < 650 ? undefined : data.starExample2
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Word Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
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
            <div className="my-6 border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold">STAR Examples</h2>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">STAR Example 1</h3>
              {/* Situation */}
              <FormField
                control={methods.control}
                name="starExample1.situation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situation</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the context or situation..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Task */}
              <FormField
                control={methods.control}
                name="starExample1.task"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What was your responsibility or goal?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Action */}
              <FormField
                control={methods.control}
                name="starExample1.action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What action(s) did you take?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Result */}
              <FormField
                control={methods.control}
                name="starExample1.result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What were the outcomes or results?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* STAR Example 2 (only shown if pitchWordLimit >= 650) */}
            {watchWordLimit >= 650 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">STAR Example 2</h3>
                {/* Situation */}
                <FormField
                  control={methods.control}
                  name="starExample2.situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situation</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the context or situation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Task */}
                <FormField
                  control={methods.control}
                  name="starExample2.task"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What was your responsibility or goal?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Action */}
                <FormField
                  control={methods.control}
                  name="starExample2.action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What action(s) did you take?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Result */}
                <FormField
                  control={methods.control}
                  name="starExample2.result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What were the outcomes or results?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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