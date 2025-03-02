/**
@description
Client sub-component for wizard Step 2: Experience Information.
Collects:
- yearsExperience
- relevantExperience
- optional resume file selection (WITHOUT a manual upload button).
When the user clicks "Next" in the main wizard, the file is automatically
uploaded to Supabase if present.

@dependencies
- React Hook Form context from the wizard
- Shadcn UI form components
@notes
We removed the old "Upload Resume" button and manual upload flow. Instead,
when the user clicks "Next" from Step 2, pitch-wizard.tsx will handle the
actual file upload if a file is present.
*/
"use client"
import { ChangeEvent, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"

export default function ExperienceStep() {
  const { control, setValue, watch } = useFormContext<PitchWizardFormData>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // We'll watch the current resumePath in the form, if any
  const currentResumePath = watch("resumePath", "")
  const selectedFile = watch("selectedFile")

  /**
   * handleFileChange - event callback for selecting a file.
   * Instead of uploading immediately, we simply store it in form state as "selectedFile."
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setValue("selectedFile", e.target.files[0], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false
      })
    } else {
      setValue("selectedFile", null)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Years of Experience */}
      <FormField
        control={control}
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
        control={control}
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

      {/* Optional Resume Upload */}
      <div className="space-y-2">
        <FormLabel className="text-sm text-muted-foreground">Optional Resume Upload</FormLabel>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={triggerFileSelect}
            className="text-xs"
          >
            <Paperclip className="h-3.5 w-3.5 mr-1" />
            Choose file
          </Button>
          <span className="text-xs text-muted-foreground">
            {selectedFile ? selectedFile.name : "No file chosen"}
          </span>
        </div>
        {currentResumePath && (
          <p className="text-xs text-muted-foreground mt-2">
            Current stored resume: <span className="font-semibold">{currentResumePath.split('/').pop()}</span>
          </p>
        )}
      </div>
    </div>
  )
}