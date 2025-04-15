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

export default function ExperienceStep() {
  const { control } = useFormContext<PitchWizardFormData>()

  return (
    <div className="space-y-6">

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
    </div>
  )
}