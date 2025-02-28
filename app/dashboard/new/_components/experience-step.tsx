/**
 * @description
 * Client sub-component for wizard Step 2: Experience Information.
 * Collects:
 *  - yearsExperience
 *  - relevantExperience
 *
 * Key Features:
 * - Uses React Hook Form context from the wizard
 * - Skips resume upload (handled in step 7)
 *
 * @dependencies
 * - React Hook Form
 * - Shadcn UI form components
 *
 * @notes
 * - Next step is STAR examples
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ExperienceStep() {
  const { control } = useFormContext<PitchWizardFormData>()

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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
    </div>
  )
}