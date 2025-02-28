/**
 * @description
 * Client sub-component for wizard Step 1: Role Information.
 * Collects:
 *  - roleName
 *  - roleLevel
 *  - pitchWordLimit
 *  - roleDescription (optional)
 *
 * Key Features:
 * - Uses React Hook Form context from the wizard
 * - Provides basic inputs with label + error display
 *
 * @dependencies
 * - React Hook Form, zod for validation
 * - Shadcn UI components for consistent styling
 *
 * @notes
 * - Next step is collecting experience info
 */

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function RoleStep() {
  const { control, register, watch } = useFormContext<PitchWizardFormData>()

  // We'll watch the pitchWordLimit for dynamic logic in next steps
  const pitchLimitValue = watch("pitchWordLimit")

  return (
    <div className="space-y-6">
      {/* Role Name */}
      <FormField
        control={control}
        name="roleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Administrative Officer"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Role Level */}
      <FormField
        control={control}
        name="roleLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role Level</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
        control={control}
        name="pitchWordLimit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pitch Word Limit</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 500"
                {...field}
              />
            </FormControl>
            <FormMessage />
            {pitchLimitValue < 650 ? (
              <p className="text-sm text-muted-foreground mt-1">
                You will only need 1 STAR example.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                You will need 2 STAR examples.
              </p>
            )}
          </FormItem>
        )}
      />

      {/* Optional Role Description */}
      <FormField
        control={control}
        name="roleDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Optional Role Description</FormLabel>
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
  )
}