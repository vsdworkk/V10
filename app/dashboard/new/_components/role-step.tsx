/**
@description
Client sub-component for wizard Step 1: Role Information.
Collects:
 - roleName
 - organisationName
 - roleLevel (now APS1, APS2, APS3, APS4, APS5, APS6, EL1)
 - pitchWordLimit (dropdown with <500, <650, <750, <1000>)
 - roleDescription (optional)

Key Features:
 - Uses React Hook Form context from the wizard
 - Provides basic inputs with label + error display
 - Word limit is no longer a numeric text field; it is a dropdown with discrete strings.

@dependencies
React Hook Form, zod for validation
Shadcn UI components for consistent styling

@notes
We replaced the old numeric text input for pitchWordLimit with a Select.
We replaced old roleLevel items with APS1, APS2, APS3, APS4, APS5, APS6, EL1.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

/**
@function RoleStep
@description
Wizard step to capture role-level info:
 - Role Name
 - Organisation Name
 - Role Level (APS1...EL1)
 - Word Limit (<500...<1000)
 - Optional Role Description
*/
export default function RoleStep() {
  const { control, watch, formState } = useFormContext<PitchWizardFormData>()

  // We'll watch the pitchWordLimit for dynamic logic in the wizard
  const pitchLimitChoice = watch("pitchWordLimit")

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
                {...field}
                placeholder="e.g. Administrative Officer"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Organisation Name */}
      <FormField
        control={control}
        name="organisationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organisation Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Department of Finance"
                value={field.value ?? ""}
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
                  <SelectValue placeholder="Select APS level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APS1">APS1</SelectItem>
                  <SelectItem value="APS2">APS2</SelectItem>
                  <SelectItem value="APS3">APS3</SelectItem>
                  <SelectItem value="APS4">APS4</SelectItem>
                  <SelectItem value="APS5">APS5</SelectItem>
                  <SelectItem value="APS6">APS6</SelectItem>
                  <SelectItem value="EL1">EL1</SelectItem>
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
              <Select
                onValueChange={(val) => {
                  // Explicitly ensure we're working with a string
                  // This is important for the form validation
                  console.log('Select value type:', typeof val, 'value:', val);
                  field.onChange(String(val));
                }}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<500">{"<500"}</SelectItem>
                  <SelectItem value="<650">{"<650"}</SelectItem>
                  <SelectItem value="<750">{"<750"}</SelectItem>
                  <SelectItem value="<1000">{"<1000"}</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />

            {/* Show dynamic text based on selection */}
            {pitchLimitChoice && (
              <p className="text-sm text-muted-foreground mt-1">
                {`You've selected ${pitchLimitChoice}.`}
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