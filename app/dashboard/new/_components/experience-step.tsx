/**
 * @description
 * Client sub-component for wizard Step 2: Experience Information.
 * Collects:
 *  - yearsExperience
 *  - relevantExperience
 *  - optional resume upload (file input + upload button)
 *
 * Key Features:
 * - Uses React Hook Form context from the wizard
 * - Optionally uploads the resume to Supabase (via /api/resume-upload) if user selects a file
 * - On successful upload, sets the "resumePath" in the form state
 *
 * @dependencies
 * - React Hook Form
 * - Shadcn UI form components
 * - fetch API for the upload route
 *
 * @notes
 * - If the user doesn't want to upload, they can skip the file input entirely
 * - We do not finalize the pitch here; this is just step 2 of the wizard
 */

"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ExperienceStep() {
  const { control, setValue, watch } = useFormContext<PitchWizardFormData>()

  /**
   * Local state for handling file input and upload feedback
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // We'll watch the current resumePath in the form, if any
  const currentResumePath = watch("resumePath", "")

  /**
   * handleFileChange - event callback for selecting a file
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setUploadError(null)
      setUploadSuccess(null)
    } else {
      setSelectedFile(null)
    }
  }

  /**
   * handleUpload - uploads the selected file (if any) to our /api/resume-upload route
   */
  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        return
      }
      setUploading(true)
      setUploadError(null)
      setUploadSuccess(null)

      const formData = new FormData()
      // We also need the user's ID for path organization
      // That is stored in the parent wizard but we do not have direct userId in this step
      // Typically you'd also pass userId from wizard or from a higher scope
      // For demonstration, let's do a simple approach:
      // We'll store userId in the wizard form too, or skip if not available
      // But let's do it properly if we had the userId from the wizard:
      // In real usage, the wizard might store userId, or we can do a separate prop. 
      // We'll do a safe fallback:
      const wizardUserId = watch("userId") || "unknown-user"
      formData.append("userId", wizardUserId)
      formData.append("file", selectedFile)

      const res = await fetch("/api/resume-upload", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await res.json()
      if (!data.path) {
        throw new Error("No path returned from server")
      }

      // store path in the wizard form
      setValue("resumePath", data.path)
      setUploadSuccess(`Successfully uploaded: ${selectedFile.name}`)
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Years Experience */}
      <FormField
        control={control}
        name="yearsExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Less than 1 year">
                    Less than 1 year
                  </SelectItem>
                  <SelectItem value="1-2 years">1-2 years</SelectItem>
                  <SelectItem value="2-5 years">2-5 years</SelectItem>
                  <SelectItem value="5-10 years">5-10 years</SelectItem>
                  <SelectItem value="10+ years">10+ years</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Resume Upload (Optional) */}
      <div className="space-y-2">
        <FormLabel>Optional Resume Upload</FormLabel>

        <Input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            variant="outline"
          >
            {uploading ? "Uploading..." : "Upload Resume"}
          </Button>

          {uploadSuccess && (
            <p className="text-sm text-green-600">{uploadSuccess}</p>
          )}
          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        </div>

        {currentResumePath && (
          <p className="text-sm text-muted-foreground">
            Current stored resume path: <span className="font-semibold">{currentResumePath}</span>
          </p>
        )}
      </div>
    </div>
  )
}